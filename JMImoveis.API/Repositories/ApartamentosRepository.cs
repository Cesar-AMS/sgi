using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class ApartamentosRepository : IApartamentosRepository
    {
        private readonly DapperContext _ctx;
        public ApartamentosRepository(DapperContext ctx) => _ctx = ctx;

        public async Task<int> CreateAsync(ApartmentUnit u)
        {
            const string ins = @"INSERT INTO jmoficial.units (floor, block, number, value, income, size, dormitories, status,
                                   enterprise_id, created_at, updated_at, active)
                                VALUES
                                  (@Floor, @Block, @Number, @Value, @Income, @Size, @Dormitories, @Status,
                                   @EnterpriseId, UTC_TIMESTAMP(), UTC_TIMESTAMP(), @Active);
                                SELECT LAST_INSERT_ID();";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.ExecuteScalarAsync<int>(ins, u);
        }

        public async Task<IEnumerable<UnidadeDto>> GetEspelhoAsync(int enterpriseId)
        {
            string sql = $@"select id, enterprise_id as  idEmpreendimento,
                                        floor as andar, block as bloco,
                                        number as numero, size as mt2,
                                        dormitories as dormitorios, value as valor, '' perfilRenda,
                                        status
                                        from jmoficial.units T0 where enterprise_id= {enterpriseId}  ;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QueryAsync<UnidadeDto>(sql, new { enterpriseId });
        }
        public async Task<IEnumerable<ApartmentUnit>> GetAllAsync(int enterpriseId)
        {
            const string sql = @"SELECT id, floor, block, number, value, income, size, dormitories,
                                    status, enterprise_id, created_at, updated_at, deleted_at, active
                                    FROM jmoficial.units
                                    WHERE enterprise_id = @enterpriseId
                                    ORDER BY block, floor, number;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QueryAsync<ApartmentUnit>(sql, new { enterpriseId });
        }

        public async Task<ApartmentUnit?> GetByIdAsync(int id)
        {
            const string sql = @"SELECT id, floor, block, number, value, income, size, dormitories,
                                    status, enterprise_id, created_at, updated_at, deleted_at, active
                                 FROM jmoficial.units
                                 WHERE id = @id;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QuerySingleOrDefaultAsync<ApartmentUnit>(sql, new { id });
        }

        public async Task<IEnumerable<ApartmentUnit>> GetDisponiveisAsync()
        {
            const string sql = @"SELECT id, floor, block, number, value, income, size, dormitories,
                                    status, enterprise_id, created_at, updated_at, deleted_at, active
                                 FROM jmoficial.units
                                 WHERE UPPER(status) = 'OPEN'
                                   AND active = 1
                                   AND deleted_at IS NULL
                                 ORDER BY enterprise_id, block, floor DESC, number;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QueryAsync<ApartmentUnit>(sql);
        }

        public async Task<bool> HasPropostaAtivaAsync(int id)
        {
            const string sql = @"SELECT COUNT(1)
                                 FROM jmoficial.proposals
                                 WHERE unidade_id = @id
                                   AND deleted_at IS NULL
                                   AND UPPER(status) <> 'RASCUNHO';";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.ExecuteScalarAsync<int>(sql, new { id }) > 0;
        }

        public async Task<bool> HardDeleteAsync(int id)
        {
            const string del = "DELETE FROM jmoficial.units WHERE id = @id;";
            await using var con = await _ctx.OpenConnectionAsync();
            return await con.ExecuteAsync(del, new { id }) > 0;
        }

        public async Task<bool> SoftDeleteAsync(int id)
        {
            const string del = @"UPDATE jmoficial.units
                                 SET deleted_at = UTC_TIMESTAMP(),
                                   active = 0,
                                   updated_at = UTC_TIMESTAMP()
                                 WHERE id = @id AND deleted_at IS NULL;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.ExecuteAsync(del, new { id }) > 0;
        }

        public async Task<bool> UpdateAsync(int id, ApartmentUnit u)
        {
            const string upd = @"UPDATE jmoficial.units
                                 SET floor = @Floor,
                                     block = @Block,
                                     number = @Number,
                                     value = @Value,
                                     income = @Income,
                                     size = @Size,
                                     dormitories = @Dormitories,
                                     status = @Status,
                                     active = @Active,
                                     updated_at = UTC_TIMESTAMP()
                                 WHERE id = @Id;";
            u.Id = id;

            await using var con = await _ctx.OpenConnectionAsync();
            var rows = await con.ExecuteAsync(upd, u);
            return rows > 0;
        }
    }
}
