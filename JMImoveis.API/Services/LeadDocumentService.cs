using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace JMImoveisAPI.Services
{
    public class LeadDocumentService : ILeadDocumentService
    {
        private const long MaxFileSize = 10 * 1024 * 1024;

        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp"
        };

        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };

        private readonly ILeadDocumentRepository _repository;
        private readonly IWebHostEnvironment _environment;

        public LeadDocumentService(ILeadDocumentRepository repository, IWebHostEnvironment environment)
        {
            _repository = repository;
            _environment = environment;
        }

        public async Task<IEnumerable<LeadDocument>> GetByLeadIdAsync(int leadId)
        {
            await EnsureLeadExistsAsync(leadId);
            return await _repository.GetByLeadIdAsync(leadId);
        }

        public async Task<IEnumerable<LeadDocument>> UploadAsync(int leadId, IEnumerable<IFormFile> files, long? uploadedByUserId)
        {
            await EnsureLeadExistsAsync(leadId);

            var fileList = files?.Where(file => file != null).ToList() ?? new List<IFormFile>();
            if (fileList.Count == 0)
            {
                throw new ArgumentException("Arquivo obrigatorio.");
            }

            var savedDocuments = new List<LeadDocument>();
            foreach (var file in fileList)
            {
                ValidateFile(file);
                var savedDocument = await SaveFileAsync(leadId, file, uploadedByUserId);
                savedDocuments.Add(savedDocument);
            }

            return savedDocuments;
        }

        public async Task<LeadDocument> UpdateAsync(int leadId, long documentId, UpdateLeadDocumentRequest request)
        {
            await EnsureLeadExistsAsync(leadId);
            var document = await _repository.GetByIdAsync(leadId, documentId);
            if (document is null)
            {
                throw new KeyNotFoundException("Documento nao encontrado.");
            }

            var displayName = NormalizeRequiredText(request.DisplayName, document.DisplayName);
            var description = NormalizeOptionalText(request.Description);
            var updated = await _repository.UpdateAsync(leadId, documentId, displayName, description);
            if (!updated)
            {
                throw new KeyNotFoundException("Documento nao encontrado.");
            }

            var saved = await _repository.GetByIdAsync(leadId, documentId);
            if (saved is null)
            {
                throw new KeyNotFoundException("Documento nao encontrado.");
            }

            return saved;
        }

        public async Task<(byte[] Content, string ContentType, string FileName)?> DownloadAsync(int leadId, long documentId)
        {
            await EnsureLeadExistsAsync(leadId);
            var document = await _repository.GetByIdAsync(leadId, documentId);
            if (document is null || string.IsNullOrWhiteSpace(document.FilePath))
            {
                return null;
            }

            var absolutePath = ResolveLeadDocumentPath(leadId, document.FilePath);
            if (absolutePath is null)
            {
                return null;
            }

            if (!File.Exists(absolutePath))
            {
                return null;
            }

            return (
                await File.ReadAllBytesAsync(absolutePath),
                string.IsNullOrWhiteSpace(document.ContentType) ? "application/octet-stream" : document.ContentType,
                string.IsNullOrWhiteSpace(document.OriginalFileName) ? Path.GetFileName(absolutePath) : Path.GetFileName(document.OriginalFileName)
            );
        }

        public async Task<bool> DeleteAsync(int leadId, long documentId)
        {
            await EnsureLeadExistsAsync(leadId);
            return await _repository.SoftDeleteAsync(leadId, documentId);
        }

        private async Task<LeadDocument> SaveFileAsync(int leadId, IFormFile file, long? uploadedByUserId)
        {
            var uploadDirectory = Path.Combine(_environment.ContentRootPath, "uploads", "leads", leadId.ToString());
            Directory.CreateDirectory(uploadDirectory);

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var storedFileName = $"{Guid.NewGuid():N}{extension}";
            var absolutePath = Path.Combine(uploadDirectory, storedFileName);

            await using (var stream = File.Create(absolutePath))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = Path.Combine("uploads", "leads", leadId.ToString(), storedFileName).Replace('\\', '/');
            var document = new LeadDocument
            {
                LeadId = leadId,
                OriginalFileName = Path.GetFileName(file.FileName),
                DisplayName = Path.GetFileNameWithoutExtension(file.FileName),
                Description = null,
                ContentType = file.ContentType,
                FileSize = file.Length,
                FilePath = relativePath,
                UploadedByUserId = uploadedByUserId
            };

            var id = await _repository.CreateAsync(document);
            var saved = await _repository.GetByIdAsync(leadId, id);
            if (saved is null)
            {
                throw new InvalidOperationException("Nao foi possivel carregar o documento salvo.");
            }

            return saved;
        }

        private async Task EnsureLeadExistsAsync(int leadId)
        {
            if (leadId <= 0)
            {
                throw new ArgumentException("leadId invalido.");
            }

            if (!await _repository.LeadExistsAsync(leadId))
            {
                throw new KeyNotFoundException("Lead nao encontrado.");
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

            var extension = Path.GetExtension(file.FileName);
            if (!AllowedExtensions.Contains(extension) || !AllowedContentTypes.Contains(file.ContentType))
            {
                throw new ArgumentException("Tipo de arquivo invalido. Envie PDF, JPG, JPEG, PNG ou WEBP.");
            }
        }

        private static string NormalizeRequiredText(string? value, string fallback)
        {
            var normalized = NormalizeOptionalText(value);
            return string.IsNullOrWhiteSpace(normalized) ? fallback : normalized;
        }

        private static string? NormalizeOptionalText(string? value)
            => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

        private string? ResolveLeadDocumentPath(int leadId, string storedFilePath)
        {
            var leadUploadDirectory = Path.GetFullPath(
                Path.Combine(_environment.ContentRootPath, "uploads", "leads", leadId.ToString())
            );

            var normalizedStoredPath = storedFilePath
                .Replace('/', Path.DirectorySeparatorChar)
                .TrimStart(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

            var absolutePath = Path.GetFullPath(Path.Combine(_environment.ContentRootPath, normalizedStoredPath));
            var allowedPrefix = leadUploadDirectory.EndsWith(Path.DirectorySeparatorChar)
                ? leadUploadDirectory
                : leadUploadDirectory + Path.DirectorySeparatorChar;

            if (!absolutePath.StartsWith(allowedPrefix, StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            return absolutePath;
        }
    }
}
