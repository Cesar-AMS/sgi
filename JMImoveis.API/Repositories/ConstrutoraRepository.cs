using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class ConstrutoraRepository : IConstrutoraRepository
    {
        private readonly DapperContext _ctx;
        public ConstrutoraRepository(DapperContext ctx) => _ctx = ctx;

        public async Task<int> CreateAsync(Constructor entity)
        {
            const string ins = @"INSERT INTO constructors
                                (name, address, phone, cellphone, email, site, cnpj,
                                 state_registration, municipal_registration,
                                 bank, agency, account, pix, responsible, observations,
                                 created_at, updated_at)
                                 VALUES
                                (@Name, @Address, @Phone, @Cellphone, @Email, @Site, @Cnpj,
                                 @StateRegistration, @MunicipalRegistration,
                                 @Bank, @Agency, @Account, @Pix, @Responsible, @Observations,
                                 UTC_TIMESTAMP(), UTC_TIMESTAMP());";

            const string lastId = "SELECT LAST_INSERT_ID();";

            await using var con = await _ctx.OpenConnectionAsync();
            await con.ExecuteAsync(ins, entity);
            var id = await con.ExecuteScalarAsync<int>(lastId);
            return id;
        }

        public async Task<IEnumerable<Constructor>> GetAllAsync(bool includeDeleted = false)
        {
            const string sql = @"SELECT id,
                                      name,
                                      address AS ""Address"",
                                      phone AS ""Phone"",
                                      cellphone AS ""Cellphone"",
                                      email AS ""Email"",
                                      site AS ""Site"",
                                      cnpj AS ""Cnpj"",
                                      state_registration AS ""StateRegistration"",
                                      municipal_registration AS ""MunicipalRegistration"",
                                      bank AS ""Bank"",
                                      agency AS ""Agency"",
                                      account AS ""Account"",
                                      pix AS ""Pix"",
                                      responsible AS ""Responsible"",
                                      observations AS ""Observations"",
                                    (SELECT COUNT(1) FROM jmoficial.enterprises T0 WHERE T0.constructor_id = T1.id) AS ""empreendimentos"",
                                    (SELECT COUNT(1) FROM jmoficial.units T2
                                     INNER JOIN jmoficial.enterprises T3 ON T2.enterprise_id = T3.id 
                                     WHERE T3.constructor_id = T1.id ) AS ""unidades"",
                                    (SELECT COUNT(1) FROM jmoficial.units T2
                                     INNER JOIN jmoficial.enterprises T3 ON T2.enterprise_id = T3.id 
                                     WHERE T3.constructor_id = T1.id AND T2.status = 'SELL') AS ""vendidos"",
                                     (SELECT COUNT(1) FROM jmoficial.units T2
                                     INNER JOIN jmoficial.enterprises T3 ON T2.enterprise_id = T3.id 
                                     WHERE T3.constructor_id = T1.id AND T2.status = 'RESERVED') AS ""reservados"",
                                     (SELECT COUNT(1) FROM jmoficial.units T2
                                     INNER JOIN jmoficial.enterprises T3 ON T2.enterprise_id = T3.id 
                                     WHERE T3.constructor_id = T1.id AND T2.status = 'OPEN') AS ""disponiveis"",
                                      created_at as ""CreatedAt"", updated_at as ""UpdateAt"" , deleted_at 

                                    FROM jmoficial.constructors T1;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QueryAsync<Constructor>(sql);
        }

        public async Task<Constructor?> GetByIdAsync(int id)
        {
            const string sql = @"SELECT id,
                                      name,
                                      address AS ""Address"",
                                      phone AS ""Phone"",
                                      cellphone AS ""Cellphone"",
                                      email AS ""Email"",
                                      site AS ""Site"",
                                      cnpj AS ""Cnpj"",
                                      state_registration AS ""StateRegistration"",
                                      municipal_registration AS ""MunicipalRegistration"",
                                      bank AS ""Bank"",
                                      agency AS ""Agency"",
                                      account AS ""Account"",
                                      pix AS ""Pix"",
                                      responsible AS ""Responsible"",
                                      observations AS ""Observations"",
                                    (SELECT COUNT(1) FROM jmoficial.enterprises T0 WHERE T0.constructor_id = T1.id) AS ""empreendimentos"",
                                    (SELECT COUNT(1) FROM jmoficial.units T2
                                     INNER JOIN jmoficial.enterprises T3 ON T2.enterprise_id = T3.id 
                                     WHERE T3.constructor_id = T1.id ) AS ""unidades"",
                                    (SELECT COUNT(1) FROM jmoficial.units T2
                                     INNER JOIN jmoficial.enterprises T3 ON T2.enterprise_id = T3.id 
                                     WHERE T3.constructor_id = T1.id AND T2.status = 'SELL') AS ""vendidos"",
                                     (SELECT COUNT(1) FROM jmoficial.units T2
                                     INNER JOIN jmoficial.enterprises T3 ON T2.enterprise_id = T3.id 
                                     WHERE T3.constructor_id = T1.id AND T2.status = 'RESERVED') AS ""reservados"",
                                     (SELECT COUNT(1) FROM jmoficial.units T2
                                     INNER JOIN jmoficial.enterprises T3 ON T2.enterprise_id = T3.id 
                                     WHERE T3.constructor_id = T1.id AND T2.status = 'OPEN') AS ""disponiveis"",
                                      created_at AS ""CreatedAt"",
                                      updated_at AS ""UpdatedAt"",
                                      deleted_at AS ""DeletedAt""

                                    FROM jmoficial.constructors T1                                     
                                    WHERE T1.id = @id;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QuerySingleOrDefaultAsync<Constructor>(sql, new { id });
        }

        public Task<bool> HardDeleteAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> SoftDeleteAsync(int id)
        {
            const string del = @"UPDATE jmoficial.constructors
                                    SET deleted_at = UTC_TIMESTAMP(), updated_at = UTC_TIMESTAMP()
                                    WHERE id = @id AND deleted_at IS NULL;";

            await using var con = await _ctx.OpenConnectionAsync();
            var rows = await con.ExecuteAsync(del, new { id });
            return rows > 0;
        }

        public async Task<bool> HasEmpreendimentosAsync(int id)
        {
            const string sql = @"SELECT COUNT(1)
                                 FROM jmoficial.enterprises
                                 WHERE constructor_id = @id
                                   AND deleted_at IS NULL
                                   AND hidden = 0;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.ExecuteScalarAsync<int>(sql, new { id }) > 0;
        }

        public async Task<bool> UpdateAsync(int id, Constructor entity)
        {
            const string upd = @"UPDATE jmoficial.constructors
                                SET name = @Name,
                                    address = @Address,
                                    phone = @Phone,
                                    cellphone = @Cellphone,
                                    email = @Email,
                                    site = @Site,
                                    cnpj = @Cnpj,
                                    state_registration = @StateRegistration,
                                    municipal_registration = @MunicipalRegistration,
                                    bank = @Bank,
                                    agency = @Agency,
                                    account = @Account,
                                    pix = @Pix,
                                    responsible = @Responsible,
                                    observations = @Observations,
                                    updated_at = UTC_TIMESTAMP()
                                WHERE id = @id AND deleted_at IS NULL;";

            await using var con = await _ctx.OpenConnectionAsync();
            var rows = await con.ExecuteAsync(upd, new
            {
                id,
                entity.Name,
                entity.Address,
                entity.Phone,
                entity.Cellphone,
                entity.Email,
                entity.Site,
                entity.Cnpj,
                entity.StateRegistration,
                entity.MunicipalRegistration,
                entity.Bank,
                entity.Agency,
                entity.Account,
                entity.Pix,
                entity.Responsible,
                entity.Observations
            });
            return rows > 0;
        }
    }
}
