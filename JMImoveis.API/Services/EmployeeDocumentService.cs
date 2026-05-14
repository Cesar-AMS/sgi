using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace JMImoveisAPI.Services
{
    public class EmployeeDocumentService : IEmployeeDocumentService
    {
        private const long MaxFileSize = 10 * 1024 * 1024;

        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "application/pdf",
            "image/jpeg",
            "image/png"
        };

        private static readonly HashSet<string> AllowedDocumentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "RG_CPF",
            "CTPS",
            "COMPROVANTE_RESIDENCIA",
            "ATESTADO_ADMISSIONAL",
            "FOTO_3X4",
            "PIS_PASEP",
            "TITULO_ELEITOR",
            "RESERVISTA",
            "CERTIDAO",
            "DEPENDENTE",
            "OUTRO"
        };

        private readonly IEmployeeDocumentRepository _repository;
        private readonly IWebHostEnvironment _environment;

        public EmployeeDocumentService(
            IEmployeeDocumentRepository repository,
            IWebHostEnvironment environment)
        {
            _repository = repository;
            _environment = environment;
        }

        public async Task<IEnumerable<EmployeeDocument>> GetByUserIdAsync(long userId)
        {
            ValidateUserId(userId);
            await EnsureUserExistsAsync(userId);
            return await _repository.GetByUserIdAsync(userId);
        }

        public async Task<EmployeeDocument> UploadAsync(long userId, IFormFile file, string? documentType, string? documentLabel, string? notes)
        {
            ValidateUserId(userId);
            await EnsureUserExistsAsync(userId);
            ValidateFile(file);

            var normalizedDocumentType = NormalizeDocumentType(documentType);
            var uploadDirectory = Path.Combine(_environment.ContentRootPath, "uploads", "employees", userId.ToString(), "documents");
            Directory.CreateDirectory(uploadDirectory);

            var extension = Path.GetExtension(file.FileName);
            var storedFileName = $"{normalizedDocumentType}_{DateTime.UtcNow:yyyyMMddHHmmssfff}{extension}";
            var absolutePath = Path.Combine(uploadDirectory, storedFileName);

            await using (var stream = File.Create(absolutePath))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = Path.Combine("uploads", "employees", userId.ToString(), "documents", storedFileName)
                .Replace('\\', '/');

            var entity = new EmployeeDocument
            {
                UserId = userId,
                DocumentType = normalizedDocumentType,
                DocumentLabel = NormalizeText(documentLabel),
                FileName = Path.GetFileName(file.FileName),
                FilePath = relativePath,
                ContentType = file.ContentType,
                FileSize = file.Length,
                Notes = NormalizeText(notes)
            };

            var id = await _repository.CreateAsync(entity);
            var saved = await _repository.GetByIdAsync(id);
            if (saved is null)
            {
                throw new InvalidOperationException("Nao foi possivel carregar o documento salvo.");
            }

            return saved;
        }

        public async Task<(byte[] Content, string ContentType, string FileName)?> DownloadAsync(long id)
        {
            ValidateId(id);
            var document = await _repository.GetByIdAsync(id);
            if (document is null || string.IsNullOrWhiteSpace(document.FilePath))
            {
                return null;
            }

            var relativePath = document.FilePath.Replace('/', Path.DirectorySeparatorChar);
            var absolutePath = Path.Combine(_environment.ContentRootPath, relativePath);
            if (!File.Exists(absolutePath))
            {
                return null;
            }

            var content = await File.ReadAllBytesAsync(absolutePath);
            return (
                content,
                document.ContentType ?? "application/octet-stream",
                document.FileName ?? Path.GetFileName(absolutePath)
            );
        }

        public async Task<bool> DeleteAsync(long id)
        {
            ValidateId(id);
            var document = await _repository.GetByIdAsync(id);
            if (document is null)
            {
                return false;
            }

            var deleted = await _repository.DeleteAsync(id);
            if (!deleted)
            {
                return false;
            }

            TryDeletePhysicalFile(document.FilePath);
            return true;
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

        private static void ValidateId(long id)
        {
            if (id <= 0)
            {
                throw new ArgumentException("id invalido.");
            }
        }

        private static void ValidateFile(IFormFile file)
        {
            if (file is null || file.Length == 0)
            {
                throw new ArgumentException("Arquivo obrigatorio.");
            }

            if (file.Length > MaxFileSize)
            {
                throw new ArgumentException("Arquivo deve ter no maximo 10 MB.");
            }

            if (!AllowedContentTypes.Contains(file.ContentType))
            {
                throw new ArgumentException("Tipo de arquivo invalido. Envie PDF, JPG ou PNG.");
            }
        }

        private static string NormalizeDocumentType(string? documentType)
        {
            if (string.IsNullOrWhiteSpace(documentType))
            {
                throw new ArgumentException("Tipo de documento obrigatorio.");
            }

            var normalized = documentType.Trim().ToUpperInvariant();
            if (!AllowedDocumentTypes.Contains(normalized))
            {
                throw new ArgumentException("Tipo de documento invalido.");
            }

            return normalized;
        }

        private static string? NormalizeText(string? value)
            => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

        private void TryDeletePhysicalFile(string? relativeFilePath)
        {
            if (string.IsNullOrWhiteSpace(relativeFilePath))
            {
                return;
            }

            try
            {
                var relativePath = relativeFilePath.Replace('/', Path.DirectorySeparatorChar);
                var absolutePath = Path.Combine(_environment.ContentRootPath, relativePath);
                if (File.Exists(absolutePath))
                {
                    File.Delete(absolutePath);
                }
            }
            catch
            {
                // Physical-file cleanup must not rollback metadata deletion.
            }
        }
    }
}
