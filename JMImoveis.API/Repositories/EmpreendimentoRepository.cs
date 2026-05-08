using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using MySqlConnector;

namespace JMImoveisAPI.Repositories
{
    public class EmpreendimentoRepository : IEmpreendimentoRepository
    {
        private readonly DapperContext _ctx;
        public EmpreendimentoRepository(DapperContext ctx) => _ctx = ctx;

        public async Task<int> CreateAsync(Enterprise entity)
        {
            const string ins = @"INSERT INTO enterprises (
                                     name,
                                     address,
                                     constructor_id,
                                     hidden,
                                     type,
                                     expected_delivery_date,
                                     towers_number,
                                     floor_count,
                                     units_per_floor,
                                     approval_act,
                                     approval_installments,
                                     approval_intermediate,
                                     created_at,
                                     updated_at)
                                 VALUES (
                                     @Name,
                                     @Address,
                                     @ConstructorId,
                                     @Hidden,
                                     @Type,
                                     @ExpectedDeliveryDate,
                                     @TowersNumber,
                                     @FloorCount,
                                     @UnitsPerFloor,
                                     @ApprovalAct,
                                     @ApprovalInstallments,
                                     @ApprovalIntermediate,
                                     UTC_TIMESTAMP(),
                                     UTC_TIMESTAMP());
                                 SELECT LAST_INSERT_ID();";

            await using var con = await _ctx.OpenConnectionAsync();
            await using var tx = await con.BeginTransactionAsync();

            try
            {
                var id = await con.ExecuteScalarAsync<int>(ins, entity, tx);
                if (entity.UnitFinalSizes is not null)
                {
                    await ReplaceUnitFinalSizesAsync(con, tx, id, entity.UnitFinalSizes);
                }

                await tx.CommitAsync();
                return id;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<UnitsEnterprise>> GetAllUnitsByEnterprise(int enterpriseId)
        {
            string sql = @$"SELECT T0.id as ""Id"",
                                   T0.block  as ""Block"", 
                                   T0.floor  as ""Floor"", 
                                   T0.`number` as ""Number"", 
                                   T0.value as ""Value"",
                                   T0.`size` as ""Size"", 
                                   T0.dormitories as ""Dormitories"",
                                   0 AS ""Commission"",
                                   T0.active as ""Active""
                                 FROM units T0 
                                 WHERE T0.enterprise_id = {enterpriseId};";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QueryAsync<UnitsEnterprise>(sql);

        }
        public async Task<IEnumerable<UnitsEnterprise>> GetAllUnitsActivesByEnterprise(int enterpriseId)
        {
            string sql = @$"SELECT T0.id as ""Id"",
                                   T0.block  as ""Block"", 
                                   T0.floor  as ""Floor"", 
                                   T0.`number` as ""Number"", 
                                   T0.value as ""Value"",
                                   T0.`size` as ""Size"", 
                                   T0.dormitories as ""Dormitories"",
                                   T0.active as ""Active""
                                FROM units T0 
                                WHERE T0.status = 'OPEN' AND T0.enterprise_id = {enterpriseId} AND T0.active = 1;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QueryAsync<UnitsEnterprise>(sql);

        }

        public async Task<IEnumerable<Enterprise>> GetAllAsync()
        {
            const string sql = @"SELECT T0.id,
                                        T0.name,
                                        T0.address,
                                        T0.constructor_id AS ""ConstructorId"",
                                        T1.name AS ""Constructor"",
                                        T0.created_at AS ""CreatedAt"",
                                        T0.updated_at AS ""UpdatedAt"",
                                        T0.deleted_at AS ""DeletedAt"",
                                        T0.hidden AS ""Hidden"",
                                        T0.type AS ""Type"",
                                        T0.expected_delivery_date AS ""ExpectedDeliveryDate"",
                                        T0.towers_number AS ""TowersNumber"",
                                        T0.floor_count AS ""FloorCount"",
                                        T0.units_per_floor AS ""UnitsPerFloor"",
                                        T0.approval_act AS ""ApprovalAct"",
                                        T0.approval_installments AS ""ApprovalInstallments"",
                                        T0.approval_intermediate AS ""ApprovalIntermediate""
                                 FROM enterprises T0
                                 INNER JOIN constructors T1 ON T0.constructor_id = T1.id
                                 WHERE T0.hidden = 0;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QueryAsync<Enterprise>(sql);
        }

        public async Task<Enterprise?> GetByIdAsync(int id)
        {
            const string sql = @"SELECT id,
                                        name,
                                        address,
                                        constructor_id AS ""ConstructorId"",
                                        created_at AS ""CreatedAt"",
                                        updated_at AS ""UpdatedAt"",
                                        deleted_at AS ""DeletedAt"",
                                        hidden AS ""Hidden"",
                                        type AS ""Type"",
                                        expected_delivery_date AS ""ExpectedDeliveryDate"",
                                        towers_number AS ""TowersNumber"",
                                        floor_count AS ""FloorCount"",
                                        units_per_floor AS ""UnitsPerFloor"",
                                        approval_act AS ""ApprovalAct"",
                                        approval_installments AS ""ApprovalInstallments"",
                                        approval_intermediate AS ""ApprovalIntermediate""
                                FROM enterprises
                                WHERE id = @id;";

            const string sizesSql = @"SELECT id AS ""Id"",
                                             enterprise_id AS ""EnterpriseId"",
                                             unit_final AS ""UnitFinal"",
                                             size_m2 AS ""SizeM2"",
                                             created_at AS ""CreatedAt"",
                                             updated_at AS ""UpdatedAt""
                                      FROM enterprise_unit_final_sizes
                                      WHERE enterprise_id = @id
                                      ORDER BY unit_final;";

            await using var con = await _ctx.OpenConnectionAsync();
            var enterprise = await con.QuerySingleOrDefaultAsync<Enterprise>(sql, new { id });
            if (enterprise is not null)
            {
                enterprise.UnitFinalSizes = (await con.QueryAsync<EnterpriseUnitFinalSize>(sizesSql, new { id })).ToList();
            }

            return enterprise;
        }

        public async Task<IEnumerable<Enterprise?>> GetConstructorAsync()
        {
            string sql = @$"select id , name from jm.constructors c;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QueryAsync<Enterprise>(sql);
        }

        public async Task<IEnumerable<Enterprise?>> GetEnterpriseByConstructorAsync(int id)
        {
            const string sql = @"SELECT id,
                                        name,
                                        address,
                                        constructor_id AS ""ConstructorId"",
                                        created_at AS ""CreatedAt"",
                                        updated_at AS ""UpdatedAt"",
                                        deleted_at AS ""DeletedAt"",
                                        hidden AS ""Hidden"",
                                        type AS ""Type"",
                                        expected_delivery_date AS ""ExpectedDeliveryDate"",
                                        towers_number AS ""TowersNumber"",
                                        floor_count AS ""FloorCount"",
                                        units_per_floor AS ""UnitsPerFloor"",
                                        approval_act AS ""ApprovalAct"",
                                        approval_installments AS ""ApprovalInstallments"",
                                        approval_intermediate AS ""ApprovalIntermediate""
                                 FROM jmoficial.enterprises
                                 WHERE constructor_id = @id
                                   AND hidden = 0;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.QueryAsync<Enterprise>(sql, new { id });
        }

        public async Task<bool> HardDeleteAsync(int id)
        {
            const string del = @"DELETE FROM enterprises WHERE id = @id;";
            await using var con = await _ctx.OpenConnectionAsync();
            var rows = await con.ExecuteAsync(del, new { id });
            return rows > 0;
        }

        public async Task<bool> SoftDeleteAsync(int id)
        {
            const string del = @"UPDATE enterprises
                                 SET deleted_at = UTC_TIMESTAMP(), updated_at = UTC_TIMESTAMP()
                                 WHERE id = @id AND deleted_at IS NULL;";

            await using var con = await _ctx.OpenConnectionAsync();
            var rows = await con.ExecuteAsync(del, new { id });
            return rows > 0;
        }

        public async Task<bool> HasUnidadesAsync(int id)
        {
            const string sql = @"SELECT COUNT(1)
                                 FROM jmoficial.units
                                 WHERE enterprise_id = @id
                                   AND deleted_at IS NULL
                                   AND active = 1;";

            await using var con = await _ctx.OpenConnectionAsync();
            return await con.ExecuteScalarAsync<int>(sql, new { id }) > 0;
        }

        public async Task<bool> UpdateAsync(int id, Enterprise entity)
        {
            const string upd = @"UPDATE enterprises
                                 SET name = @Name,
                                     address = @Address,
                                     constructor_id = @ConstructorId,
                                     hidden = @Hidden,
                                     type = @Type,
                                     expected_delivery_date = @ExpectedDeliveryDate,
                                     towers_number = @TowersNumber,
                                     floor_count = @FloorCount,
                                     units_per_floor = @UnitsPerFloor,
                                     approval_act = @ApprovalAct,
                                     approval_installments = @ApprovalInstallments,
                                     approval_intermediate = @ApprovalIntermediate,
                                     updated_at = UTC_TIMESTAMP()
                                 WHERE id = @Id;";

            entity.Id = id;
            await using var con = await _ctx.OpenConnectionAsync();
            await using var tx = await con.BeginTransactionAsync();

            try
            {
                var rows = await con.ExecuteAsync(upd, entity, tx);
                if (rows == 0)
                {
                    await tx.RollbackAsync();
                    return false;
                }

                if (entity.UnitFinalSizes is not null)
                {
                    await ReplaceUnitFinalSizesAsync(con, tx, id, entity.UnitFinalSizes);
                }

                await tx.CommitAsync();
                return true;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        private static async Task ReplaceUnitFinalSizesAsync(
            MySqlConnection con,
            MySqlTransaction tx,
            int enterpriseId,
            IEnumerable<EnterpriseUnitFinalSize> sizes)
        {
            const string deleteSql = @"DELETE FROM enterprise_unit_final_sizes
                                       WHERE enterprise_id = @enterpriseId;";

            const string insertSql = @"INSERT INTO enterprise_unit_final_sizes
                                           (enterprise_id, unit_final, size_m2, created_at)
                                       VALUES
                                           (@EnterpriseId, @UnitFinal, @SizeM2, UTC_TIMESTAMP());";

            var validSizes = sizes
                .Where(x => x.UnitFinal > 0 && x.SizeM2 >= 0)
                .GroupBy(x => x.UnitFinal)
                .Select(g => g.Last())
                .Select(x => new
                {
                    EnterpriseId = enterpriseId,
                    x.UnitFinal,
                    x.SizeM2
                })
                .ToList();

            await con.ExecuteAsync(deleteSql, new { enterpriseId }, tx);

            if (validSizes.Count > 0)
            {
                await con.ExecuteAsync(insertSql, validSizes, tx);
            }
        }
    }
}


