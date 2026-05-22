using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class LeadDocumentRepository : ILeadDocumentRepository
    {
        private readonly DapperContext _context;

        public LeadDocumentRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<bool> LeadExistsAsync(int leadId)
        {
            const string sql = @"
                SELECT COUNT(1)
                  FROM jmoficial.leads
                 WHERE Id = @LeadId;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, new { LeadId = leadId }) > 0;
        }

        public async Task<IEnumerable<LeadDocument>> GetByLeadIdAsync(int leadId)
        {
            const string sql = @"
                SELECT id AS Id,
                       lead_id AS LeadId,
                       original_file_name AS OriginalFileName,
                       display_name AS DisplayName,
                       description AS Description,
                       content_type AS ContentType,
                       file_size AS FileSize,
                       file_path AS FilePath,
                       uploaded_by_user_id AS UploadedByUserId,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt,
                       deleted_at AS DeletedAt
                  FROM jmoficial.lead_documents
                 WHERE lead_id = @LeadId
                   AND deleted_at IS NULL
                 ORDER BY created_at DESC, id DESC;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<LeadDocument>(sql, new { LeadId = leadId });
        }

        public async Task<LeadDocument?> GetByIdAsync(int leadId, long documentId)
        {
            const string sql = @"
                SELECT id AS Id,
                       lead_id AS LeadId,
                       original_file_name AS OriginalFileName,
                       display_name AS DisplayName,
                       description AS Description,
                       content_type AS ContentType,
                       file_size AS FileSize,
                       file_path AS FilePath,
                       uploaded_by_user_id AS UploadedByUserId,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt,
                       deleted_at AS DeletedAt
                  FROM jmoficial.lead_documents
                 WHERE id = @DocumentId
                   AND lead_id = @LeadId
                   AND deleted_at IS NULL
                 LIMIT 1;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QuerySingleOrDefaultAsync<LeadDocument>(sql, new { LeadId = leadId, DocumentId = documentId });
        }

        public async Task<long> CreateAsync(LeadDocument document)
        {
            const string sql = @"
                INSERT INTO jmoficial.lead_documents
                    (lead_id, original_file_name, display_name, description, content_type,
                     file_size, file_path, uploaded_by_user_id, created_at, updated_at, deleted_at)
                VALUES
                    (@LeadId, @OriginalFileName, @DisplayName, @Description, @ContentType,
                     @FileSize, @FilePath, @UploadedByUserId, NOW(), NULL, NULL);
                SELECT LAST_INSERT_ID();";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<long>(sql, document);
        }

        public async Task<bool> UpdateAsync(int leadId, long documentId, string displayName, string? description)
        {
            const string sql = @"
                UPDATE jmoficial.lead_documents
                   SET display_name = @DisplayName,
                       description = @Description,
                       updated_at = NOW()
                 WHERE id = @DocumentId
                   AND lead_id = @LeadId
                   AND deleted_at IS NULL;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { LeadId = leadId, DocumentId = documentId, DisplayName = displayName, Description = description }) > 0;
        }

        public async Task<bool> SoftDeleteAsync(int leadId, long documentId)
        {
            const string sql = @"
                UPDATE jmoficial.lead_documents
                   SET deleted_at = NOW(),
                       updated_at = NOW()
                 WHERE id = @DocumentId
                   AND lead_id = @LeadId
                   AND deleted_at IS NULL;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { LeadId = leadId, DocumentId = documentId }) > 0;
        }
    }
}
