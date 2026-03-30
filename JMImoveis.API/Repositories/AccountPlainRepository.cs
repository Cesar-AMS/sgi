using Dapper;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using MySqlConnector;

namespace JMImoveisAPI.Repositories
{
    public class AccountPlainRepository : IAccountPlainRepository
    {
        private readonly string _cs;
        public AccountPlainRepository(IConfiguration cfg) => _cs = cfg.GetConnectionString("DefaultConnection")!;
        private async Task<MySqlConnection> Open() { var c = new MySqlConnection(_cs); await c.OpenAsync(); return c; }

        public async Task<IEnumerable<AccountPlain>> GetAllAsync()
        {
            const string sql = "SELECT id, account, description, idcategory AS IdCategory, typeaccount AS TypeAccount FROM account_plain ORDER BY account;";
            await using var con = await Open();
            return await con.QueryAsync<AccountPlain>(sql);
        }

        public async Task<AccountPlain?> GetAsync(int id)
        {
            const string sql = "SELECT id, account, description, idcategory AS IdCategory, typeaccount AS TypeAccount FROM account_plain WHERE id=@id;";
            await using var con = await Open();
            return await con.QuerySingleOrDefaultAsync<AccountPlain>(sql, new { id });
        }

        public async Task<int> CreateAsync(AccountPlain a)
        {
            const string sql = @"
INSERT INTO account_plain (account, description, idcategory, typeaccount)
VALUES (@Account, @Description, @IdCategory, @TypeAccount);
SELECT LAST_INSERT_ID();";
            await using var con = await Open();
            return await con.ExecuteScalarAsync<int>(sql, a);
        }

        public async Task<bool> UpdateAsync(int id, AccountPlain a)
        {
            const string sql = @"
UPDATE account_plain
SET account=@Account, description=@Description, idcategory=@IdCategory, typeaccount=@TypeAccount
WHERE id=@Id;";
            a.Id = id;
            await using var con = await Open();
            return await con.ExecuteAsync(sql, a) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            const string sql = "DELETE FROM account_plain WHERE id=@id;";
            await using var con = await Open();
            return await con.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
