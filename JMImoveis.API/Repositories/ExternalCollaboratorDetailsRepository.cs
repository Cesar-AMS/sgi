using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class ExternalCollaboratorDetailsRepository : IExternalCollaboratorDetailsRepository
    {
        private readonly DapperContext _context;

        public ExternalCollaboratorDetailsRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<ExternalCollaboratorDetails?> GetByUserIdAsync(long userId)
        {
            const string sql = @"
                SELECT id AS Id,
                       user_id AS UserId,
                       start_date AS StartDate,
                       end_date AS EndDate,
                       contract_file_name AS ContractFileName,
                       contract_file_path AS ContractFilePath,
                       contract_content_type AS ContractContentType,
                       contract_size AS ContractSize,
                       notes AS Notes,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt
                  FROM jmoficial.external_collaborator_details
                 WHERE user_id = @UserId
                 LIMIT 1;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QuerySingleOrDefaultAsync<ExternalCollaboratorDetails>(sql, new { UserId = userId });
        }

        public async Task<ExternalCollaboratorDetails> UpsertByUserIdAsync(long userId, ExternalCollaboratorDetails entity)
        {
            const string sql = @"
                INSERT INTO jmoficial.external_collaborator_details
                    (user_id, start_date, end_date, notes, created_at, updated_at)
                VALUES
                    (@UserId, @StartDate, @EndDate, @Notes, NOW(), NULL)
                ON DUPLICATE KEY UPDATE
                    start_date = VALUES(start_date),
                    end_date = VALUES(end_date),
                    notes = VALUES(notes),
                    updated_at = NOW();";

            await using var conn = await _context.OpenConnectionAsync();
            await conn.ExecuteAsync(sql, new
            {
                UserId = userId,
                entity.StartDate,
                entity.EndDate,
                Notes = NormalizeText(entity.Notes)
            });

            var saved = await GetByUserIdAsync(userId);
            if (saved is null)
            {
                throw new InvalidOperationException("Nao foi possivel carregar os dados do colaborador externo.");
            }

            return saved;
        }

        public async Task<bool> UpdateContractAsync(long userId, string fileName, string relativePath, string contentType, long size)
        {
            const string sql = @"
                INSERT INTO jmoficial.external_collaborator_details
                    (user_id, contract_file_name, contract_file_path, contract_content_type, contract_size, created_at, updated_at)
                VALUES
                    (@UserId, @FileName, @RelativePath, @ContentType, @Size, NOW(), NULL)
                ON DUPLICATE KEY UPDATE
                    contract_file_name = VALUES(contract_file_name),
                    contract_file_path = VALUES(contract_file_path),
                    contract_content_type = VALUES(contract_content_type),
                    contract_size = VALUES(contract_size),
                    updated_at = NOW();";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new
            {
                UserId = userId,
                FileName = fileName,
                RelativePath = relativePath,
                ContentType = contentType,
                Size = size
            }) > 0;
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

        private static string? NormalizeText(string? value)
            => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
