using Dapper;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using MySqlConnector;

namespace JMImoveisAPI.Repositories
{
    public class ExtractRepository : IExtractRepository
    {
        private readonly string _cs;
        public ExtractRepository(IConfiguration cfg) => _cs = cfg.GetConnectionString("DefaultConnection")!;
        private async Task<MySqlConnection> Open() { var c = new MySqlConnection(_cs); await c.OpenAsync(); return c; }

        public async Task<IEnumerable<ExtractAccountBank>> GetByAccountAsync(int accountId, DateTime? from = null, DateTime? to = null)
        {
            var sql = @"
SELECT id, idaccount AS IdAccount, description, value, createdate AS CreateDate, userid AS UserId, status
FROM extract_account_bank
WHERE idaccount=@accountId
  AND (@from IS NULL OR createdate >= @from)
  AND (@to   IS NULL OR createdate <  @to)
ORDER BY createdate DESC, id DESC;";
            await using var con = await Open();
            return await con.QueryAsync<ExtractAccountBank>(sql, new { accountId, from, to });
        }

        public async Task<ExtractAccountBank?> GetAsync(int id)
        {
            const string sql = @"
SELECT id, idaccount AS IdAccount, description, value, createdate AS CreateDate, userid AS UserId, status
FROM extract_account_bank WHERE id=@id;";
            await using var con = await Open();
            return await con.QuerySingleOrDefaultAsync<ExtractAccountBank>(sql, new { id });
        }

        public async Task<int> CreateAsync(ExtractAccountBank e)
        {
            const string ins = @"
INSERT INTO extract_account_bank (idaccount, description, value, createdate, userid, status)
VALUES (@IdAccount, @Description, @Value, @CreateDate, @UserId, @Status);
SELECT LAST_INSERT_ID();";
            const string updSaldo = @"UPDATE account_bank SET amountactual = amountactual + @Value WHERE id=@IdAccount;";

            await using var con = await Open();
            using var tx = await con.BeginTransactionAsync();
            try
            {
                var id = await con.ExecuteScalarAsync<int>(ins, e, tx);
                await con.ExecuteAsync(updSaldo, new { e.Value, e.IdAccount }, tx);
                await tx.CommitAsync();
                return id;
            }
            catch { await tx.RollbackAsync(); throw; }
        }

        public async Task<bool> UpdateAsync(int id, ExtractAccountBank e)
        {
            // pegar valor antigo p/ ajustar delta
            const string get = @"SELECT idaccount, value FROM extract_account_bank WHERE id=@id FOR UPDATE;";
            const string updExtract = @"
UPDATE extract_account_bank
SET idaccount=@IdAccount, description=@Description, value=@Value, createdate=@CreateDate, userid=@UserId, status=@Status
WHERE id=@Id;";
            const string adjSaldoOld = @"UPDATE account_bank SET amountactual = amountactual - @OldValue WHERE id=@OldAccount;";
            const string adjSaldoNew = @"UPDATE account_bank SET amountactual = amountactual + @NewValue WHERE id=@NewAccount;";

            await using var con = await Open();
            using var tx = await con.BeginTransactionAsync();
            try
            {
                var prev = await con.QuerySingleOrDefaultAsync<(int OldAccount, decimal OldValue)>(get, new { id }, tx);
                if (prev.Equals(default((int, decimal)))) return false;

                e.Id = id;
                await con.ExecuteAsync(updExtract, e, tx);

                // desfaz o antigo e aplica o novo
                await con.ExecuteAsync(adjSaldoOld, new { prev.OldValue, OldAccount = prev.OldAccount }, tx);
                await con.ExecuteAsync(adjSaldoNew, new { NewValue = e.Value, NewAccount = e.IdAccount }, tx);

                await tx.CommitAsync();
                return true;
            }
            catch { await tx.RollbackAsync(); throw; }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            const string get = @"SELECT idaccount, value FROM extract_account_bank WHERE id=@id FOR UPDATE;";
            const string del = @"DELETE FROM extract_account_bank WHERE id=@id;";
            const string adj = @"UPDATE account_bank SET amountactual = amountactual - @Value WHERE id=@Account;";

            await using var con = await Open();
            using var tx = await con.BeginTransactionAsync();
            try
            {
                var row = await con.QuerySingleOrDefaultAsync<(int Account, decimal Value)>(get, new { id }, tx);
                if (row.Equals(default((int, decimal)))) return false;

                await con.ExecuteAsync(del, new { id }, tx);
                await con.ExecuteAsync(adj, new { row.Value, Account = row.Account }, tx);

                await tx.CommitAsync();
                return true;
            }
            catch { await tx.RollbackAsync(); throw; }
        }
    }

}
