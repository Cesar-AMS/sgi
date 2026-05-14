using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;

namespace JMImoveisAPI.Services
{
    public class ExternalCollaboratorDetailsService : IExternalCollaboratorDetailsService
    {
        private const long MaxContractSize = 10 * 1024 * 1024;
        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "application/pdf",
            "image/jpeg",
            "image/png"
        };

        private readonly IExternalCollaboratorDetailsRepository _repository;
        private readonly IWebHostEnvironment _environment;

        public ExternalCollaboratorDetailsService(
            IExternalCollaboratorDetailsRepository repository,
            IWebHostEnvironment environment)
        {
            _repository = repository;
            _environment = environment;
        }

        public async Task<ExternalCollaboratorDetails?> GetByUserIdAsync(long userId)
        {
            ValidateUserId(userId);
            return await _repository.GetByUserIdAsync(userId);
        }

        public async Task<ExternalCollaboratorDetails> UpsertByUserIdAsync(long userId, ExternalCollaboratorDetails entity)
        {
            if (entity is null)
            {
                throw new ArgumentException("Payload invalido.");
            }

            ValidateUserId(userId);
            await EnsureUserExistsAsync(userId);
            ValidateDates(entity);
            entity.UserId = userId;
            return await _repository.UpsertByUserIdAsync(userId, entity);
        }

        public async Task<ExternalCollaboratorDetails> SaveContractAsync(long userId, IFormFile file)
        {
            ValidateUserId(userId);
            await EnsureUserExistsAsync(userId);
            ValidateContract(file);

            var uploadDirectory = Path.Combine(_environment.ContentRootPath, "uploads", "external-collaborators", userId.ToString());
            Directory.CreateDirectory(uploadDirectory);

            var extension = Path.GetExtension(file.FileName);
            var storedFileName = $"contract_{DateTime.UtcNow:yyyyMMddHHmmssfff}{extension}";
            var absolutePath = Path.Combine(uploadDirectory, storedFileName);

            await using (var stream = File.Create(absolutePath))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = Path.Combine("uploads", "external-collaborators", userId.ToString(), storedFileName)
                .Replace('\\', '/');

            await _repository.UpdateContractAsync(
                userId,
                Path.GetFileName(file.FileName),
                relativePath,
                file.ContentType,
                file.Length);

            var saved = await _repository.GetByUserIdAsync(userId);
            if (saved is null)
            {
                throw new InvalidOperationException("Nao foi possivel carregar os metadados do contrato.");
            }

            return saved;
        }

        public async Task<(byte[] Content, string ContentType, string FileName)?> GetContractAsync(long userId)
        {
            ValidateUserId(userId);
            var details = await _repository.GetByUserIdAsync(userId);
            if (details is null || string.IsNullOrWhiteSpace(details.ContractFilePath))
            {
                return null;
            }

            var relativePath = details.ContractFilePath.Replace('/', Path.DirectorySeparatorChar);
            var absolutePath = Path.Combine(_environment.ContentRootPath, relativePath);
            if (!File.Exists(absolutePath))
            {
                return null;
            }

            var content = await File.ReadAllBytesAsync(absolutePath);
            return (
                content,
                details.ContractContentType ?? "application/octet-stream",
                details.ContractFileName ?? Path.GetFileName(absolutePath)
            );
        }

        private async Task EnsureUserExistsAsync(long userId)
        {
            if (!await _repository.UserExistsAsync(userId))
            {
                throw new KeyNotFoundException("Usuario nao encontrado.");
            }
        }

        private static void ValidateUserId(long userId)
        {
            if (userId <= 0)
            {
                throw new ArgumentException("userId invalido.");
            }
        }

        private static void ValidateDates(ExternalCollaboratorDetails entity)
        {
            entity.StartDate = NormalizeDate(entity.StartDate);
            entity.EndDate = NormalizeDate(entity.EndDate);

            if (entity.StartDate.HasValue && entity.EndDate.HasValue && entity.EndDate.Value < entity.StartDate.Value)
            {
                throw new ArgumentException("Data final nao pode ser menor que data de entrada.");
            }
        }

        private static DateTime? NormalizeDate(DateTime? value)
        {
            if (!value.HasValue || value.Value == default)
            {
                return null;
            }

            return value;
        }

        private static void ValidateContract(IFormFile file)
        {
            if (file is null || file.Length == 0)
            {
                throw new ArgumentException("Arquivo de contrato obrigatorio.");
            }

            if (file.Length > MaxContractSize)
            {
                throw new ArgumentException("Arquivo de contrato deve ter no maximo 10 MB.");
            }

            if (!AllowedContentTypes.Contains(file.ContentType))
            {
                throw new ArgumentException("Tipo de arquivo invalido. Envie PDF, JPG ou PNG.");
            }
        }
    }
}
