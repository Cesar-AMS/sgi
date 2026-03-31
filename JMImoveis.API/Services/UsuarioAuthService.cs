using JMImoveisAPI.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace JMImoveisAPI.Services
{
    public class UsuarioAuthService : IUsuarioAuthService
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly Configurations.JwtSettings _jwtSettings;

        public UsuarioAuthService(IUsuarioRepository usuarioRepository, IOptions<Configurations.JwtSettings> jwtSettings)
        {
            _usuarioRepository = usuarioRepository;
            _jwtSettings = jwtSettings.Value;
        }

        public async Task<(string? token, int? id)> AuthenticateAsync(string email, string password)
        {
            var user = await _usuarioRepository.GetByEmailAsync(email);
            if (user == null) return (null, null);

            var hash = NormalizeBcryptHash(user.Password);

            if (hash == null || !hash.StartsWith("$2a$") || hash.Length < 20)
                return (null, null);

            if (!BCrypt.Net.BCrypt.Verify(password, hash))
                return (null, null);

            if (!user.Id.HasValue)
                return (null, null);

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.Value.ToString()),
                    new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                }),
                Expires = DateTime.UtcNow.AddHours(8),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return (tokenHandler.WriteToken(token), user.Id.Value);
        }

        private static string? NormalizeBcryptHash(string? hash)
        {
            if (string.IsNullOrWhiteSpace(hash)) return hash;

            if (hash.StartsWith("$2y$")) return "$2a$" + hash.Substring(4);

            if (hash.StartsWith("$2b$")) return "$2a$" + hash.Substring(4);

            return hash;
        }
    }
}
