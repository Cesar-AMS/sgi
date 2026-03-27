using Dapper;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using MySqlConnector;

namespace JMImoveisAPI.Repositories
{
    public class AccountBankRepository : IAccountBankRepository
    {
        private readonly string _cs;
        public AccountBankRepository(IConfiguration cfg)
        {
            _cs = cfg.GetConnectionString("DefaultConnection")!;
            Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
        }

        private async Task<MySqlConnection> OpenAsync()
        {
            var c = new MySqlConnection(_cs);
            await c.OpenAsync();
            return c;
        }

        public async Task<IEnumerable<AccountBank>> GetAllAsync(bool onlyActive = true)
        {
            const string sql = @"SELECT id, description, amount, active, account, agency, amountactual, createat, userid
                                FROM account_bank
                                WHERE (@only = 0 OR active = 1)
                                ORDER BY id;";
            await using var con = await OpenAsync();
            return await con.QueryAsync<AccountBank>(sql, new { only = onlyActive ? 1 : 0 });
        }

        public async Task<AccountBank?> GetByIdAsync(int id)
        {
            const string sql = "SELECT * FROM account_bank WHERE id=@id;";
            await using var con = await OpenAsync();
            return await con.QuerySingleOrDefaultAsync<AccountBank>(sql, new { id });
        }

        public async Task<int> CreateAsync(AccountBank a)
        {
            // se AmountActual vier zerado, inicia com Amount (saldo inicial)
            if (a.AmountActual == 0) a.AmountActual = a.Amount ?? 0m;

            const string sql = @"INSERT INTO account_bank
                                (description, amount, active, account, agency, amountactual, createat, userid)
                                VALUES (@Description, @Amount, @Active, @Account, @Agency, @AmountActual, UTC_TIMESTAMP(), @UserId);
                                SELECT LAST_INSERT_ID();";
            await using var con = await OpenAsync();
            return await con.ExecuteScalarAsync<int>(sql, a);
        }

        public async Task<bool> UpdateAsync(int id, AccountBank a)
        {
            const string sql = @"UPDATE account_bank
                                SET description=@Description, amount=@Amount, active=@Active,
                                    account=@Account, agency=@Agency, amountactual=@AmountActual, userid=@UserId
                                WHERE id=@Id;";

            a.Id = id;
            await using var con = await OpenAsync();
            return await con.ExecuteAsync(sql, a) > 0;
        }

        public async Task<bool> SetActiveAsync(int id, bool active)
        {
            const string sql = "UPDATE account_bank SET active=@active WHERE id=@id;";
            await using var con = await OpenAsync();
            return await con.ExecuteAsync(sql, new { id, active }) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            const string sql = "DELETE FROM account_bank WHERE id=@id;";
            await using var con = await OpenAsync();
            return await con.ExecuteAsync(sql, new { id }) > 0;
        }

        public async Task<bool> CreditAsync(int id, decimal value)
        {
            const string sql = @"UPDATE account_bank
                                SET amountactual = amountactual + @value
                                WHERE id=@id;";

            await using var con = await OpenAsync();
            return await con.ExecuteAsync(sql, new { id, value }) > 0;
        }

        public async Task<bool> DebitAsync(int id, decimal value)
        {
            // evita ficar negativo (checa no WHERE)
            const string sql = @"UPDATE account_bank
                            SET amountactual = amountactual - @value
                            WHERE id=@id AND amountactual >= @value;";
            await using var con = await OpenAsync();
            return await con.ExecuteAsync(sql, new { id, value }) > 0;
        }
    }
}
