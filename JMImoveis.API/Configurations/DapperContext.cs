using Microsoft.Extensions.Configuration;
using MySqlConnector;
using System.Data;

namespace JMImoveisAPI.Configurations
{
    public sealed class DapperContext
    {
        private readonly string _cs;

        public DapperContext(IConfiguration configuration)
        {
            var raw = configuration.GetConnectionString("DefaultConnection")!;

            // Canoniza a string (evita diferenças de ordem/espaço) e configura o pool
            var b = new MySqlConnectionStringBuilder(raw)
            {
                Pooling = true,
                MinimumPoolSize = 0,
                MaximumPoolSize = 100,
                ConnectionTimeout = 15,
                ConnectionIdleTimeout = 180,
                AllowUserVariables = true
            };
            _cs = b.ConnectionString;
        }

        public MySqlConnection CreateConnection() => new MySqlConnection(_cs);

        public async Task<MySqlConnection> OpenConnectionAsync()
        {
            var conn = new MySqlConnection(_cs);
            await conn.OpenAsync();
            return conn;
        }
    }
}
