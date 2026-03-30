using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using MySqlConnector;
using static Dapper.SqlMapper;

namespace JMImoveisAPI.Repositories
{
    public class ClienteRepository : IClienteRepository
    {
        private readonly DapperContext _context;
        public ClienteRepository(DapperContext context) => _context = context;

        public async Task<IEnumerable<Cliente>> GetAllAsync()
        {
             string sql = @"SELECT id,
                                    name,
                                    cpf_cnpj AS CpfCnpj,
                                    email,
                                    cellphone,
                                    cellphone2,
                                    cep,
                                    address,
                                    address_number as ""AddressNumber"",
                                    complement,
                                    neighborhood,
                                    city,
                                    state

                                    FROM customers 
                                    WHERE id not in (select cd.dependent_customer_id from customer_dependents cd )
                                    ORDER BY 2";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Cliente>(sql);
        }

        public async Task<IEnumerable<Cliente?>> GetByTerms(string terms)
        {
            var sql = @$"SELECT T0.id, T0.name, T0.email , T0.cellphone , T0.cpf_cnpj as ""CpfCnpj""
                         FROM customers T0 
                         WHERE T0.name
                         LIKE '{terms}%'";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<Cliente>(sql);
        }
        public async Task<Cliente?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM customers WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<Cliente>(sql, new { id });
        }

        public async Task<Cliente?> GetDependentByClientIdAsync(int id)
        {
            var sql = @$"select t0.cpf_cnpj as ""CpfCnpj"",
                                t0.address_number as ""AddressNumber"" from customers t0
                         where t0.id in (select max(cd.dependent_customer_id)
                                         from customer_dependents cd where cd.customer_id = {id})";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<Cliente>(sql, new { id });
        }


        public async Task<int> CreateAsync(Cliente entity)
        {
            const string sql = @"INSERT INTO customers(name, cpf_cnpj, email, cellphone, cellphone2, cep, address, address_number, complement, neighborhood, city, state, profession, income)
                                            VALUES (@Name, @CpfCnpj, @Email, @Cellphone, @Cellphone2, @Cep, @Address, @AddressNumber, @Complement, @Neighborhood, @City, @State, @Profession, @Income);
                            SELECT LAST_INSERT_ID();";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, entity);
        }

        public async Task<bool> UpdateAsync(Cliente entity)
        {
            var sql = @$"UPDATE customers SET name = @Name,
                                             cpf_cnpj = @CpfCnpj,
                                             email = @Email,
                                             cellphone = @Cellphone,
                                             cellphone2 = @Cellphone2,
                                             cep = @Cep,
                                             address = @Address,
                                             address_number = @AddressNumber,
                                             complement = @Complement,
                                             neighborhood = @Neighborhood,
                                             city = @City,
                                             state = @State,
                                             profession = @Profession,
                                             income = @Income
                                            WHERE id = @Id";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM customers WHERE id = @id";
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { id }) > 0;
        }

        public async Task InsertDependents(int customerId, int dependentId)
        {
            string sql = @$"INSERT INTO customer_dependents (customer_id, dependent_customer_id, created_at, updated_at)
                                    VALUES ({customerId},{dependentId},now(),now());
                            SELECT LAST_INSERT_ID();";

            await using var conn = await _context.OpenConnectionAsync();
            await conn.ExecuteScalarAsync(sql);
        }
    }
}
