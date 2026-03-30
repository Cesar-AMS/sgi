using Dapper;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using MySqlConnector;

namespace JMImoveisAPI.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly string _cs;
        public CategoryRepository(IConfiguration cfg) => _cs = cfg.GetConnectionString("DefaultConnection")!;
        private async Task<MySqlConnection> Open() { var c = new MySqlConnection(_cs); await c.OpenAsync(); return c; }

        public async Task<IEnumerable<Category>> GetAllAsync(bool onlyActive = false)
        {
            const string sql = "SELECT id, description, status FROM categories WHERE (@only=0 OR status=1) ORDER BY description;";
            await using var con = await Open();
            return await con.QueryAsync<Category>(sql, new { only = onlyActive ? 1 : 0 });
        }

        public async Task<Category?> GetAsync(int id)
        {
            const string sql = "SELECT id, description, status FROM categories WHERE id=@id;";
            await using var con = await Open();
            return await con.QuerySingleOrDefaultAsync<Category>(sql, new { id });
        }

        public async Task<int> CreateAsync(Category c)
        {
            const string sql = "INSERT INTO categories(description, status) VALUES (@Description, @Status); SELECT LAST_INSERT_ID();";
            await using var con = await Open();
            return await con.ExecuteScalarAsync<int>(sql, c);
        }

        public async Task<bool> UpdateAsync(int id, Category c)
        {
            const string sql = "UPDATE categories SET description=@Description, status=@Status WHERE id=@Id;";
            c.Id = id;
            await using var con = await Open();
            return await con.ExecuteAsync(sql, c) > 0;
        }

        public async Task<bool> SetStatusAsync(int id, bool status)
        {
            const string sql = "UPDATE categories SET status=@status WHERE id=@id;";
            await using var con = await Open();
            return await con.ExecuteAsync(sql, new { id, status }) > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            const string sql = "DELETE FROM categories WHERE id=@id;";
            await using var con = await Open();
            return await con.ExecuteAsync(sql, new { id }) > 0;
        }
    }
}
