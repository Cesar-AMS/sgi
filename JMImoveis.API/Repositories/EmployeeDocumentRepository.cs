using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class EmployeeDocumentRepository : IEmployeeDocumentRepository
    {
        private readonly DapperContext _context;

        public EmployeeDocumentRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EmployeeDocument>> GetByUserIdAsync(long userId)
        {
            const string sql = @"
                SELECT id AS Id,
                       user_id AS UserId,
                       document_type AS DocumentType,
                       document_label AS DocumentLabel,
                       file_name AS FileName,
                       file_path AS FilePath,
                       content_type AS ContentType,
                       file_size AS FileSize,
                       notes AS Notes,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt
                  FROM jmoficial.employee_documents
                 WHERE user_id = @UserId
                 ORDER BY created_at DESC, id DESC;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<EmployeeDocument>(sql, new { UserId = userId });
        }

        public async Task<EmployeeDocument?> GetByIdAsync(long id)
        {
            const string sql = @"
                SELECT id AS Id,
                       user_id AS UserId,
                       document_type AS DocumentType,
                       document_label AS DocumentLabel,
                       file_name AS FileName,
                       file_path AS FilePath,
                       content_type AS ContentType,
                       file_size AS FileSize,
                       notes AS Notes,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt
                  FROM jmoficial.employee_documents
                 WHERE id = @Id
                 LIMIT 1;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QuerySingleOrDefaultAsync<EmployeeDocument>(sql, new { Id = id });
        }

        public async Task<long> CreateAsync(EmployeeDocument entity)
        {
            const string sql = @"
                INSERT INTO jmoficial.employee_documents
                    (user_id, document_type, document_label, file_name, file_path,
                     content_type, file_size, notes, created_at, updated_at)
                VALUES
                    (@UserId, @DocumentType, @DocumentLabel, @FileName, @FilePath,
                     @ContentType, @FileSize, @Notes, NOW(), NULL);
                SELECT LAST_INSERT_ID();";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<long>(sql, entity);
        }

        public async Task<bool> DeleteAsync(long id)
        {
            const string sql = @"
                DELETE FROM jmoficial.employee_documents
                 WHERE id = @Id;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { Id = id }) > 0;
        }

        public async Task<bool> UserExistsAsync(long userId)
        {
            const string sql = @"
                SELECT COUNT(1)
                  FROM jmoficial.users
                 WHERE id = @UserId;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, new { UserId = userId }) > 0;
        }
    }
}
