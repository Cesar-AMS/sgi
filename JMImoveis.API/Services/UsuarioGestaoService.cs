using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using System.Security.Cryptography;

namespace JMImoveisAPI.Services
{
    public class UsuarioGestaoService : IUsuarioGestaoService
    {
        private const int MinimumPasswordLength = 8;

        private readonly IUsuarioRepository _usuarioRepository;

        public UsuarioGestaoService(IUsuarioRepository usuarioRepository)
        {
            _usuarioRepository = usuarioRepository;
        }

        public async Task<IEnumerable<Usuario>> GetAllAsync(string status)
        {
            return await _usuarioRepository.GetAllAsync(status);
        }

        public async Task<IEnumerable<Usuario>> GetAllByEnterpriseAsync(int enterprise)
        {
            return await _usuarioRepository.GetAllByEnterpriseAsync(enterprise);
        }

        public async Task<Usuario?> GetByIdAsync(int id)
        {
            return await _usuarioRepository.GetByIdAsync(id);
        }

        public async Task CreateAsync(Usuario entity)
        {
            var hasExplicitPassword = !string.IsNullOrWhiteSpace(entity.Password);
            var passwordToHash = hasExplicitPassword
                ? entity.Password!
                : GenerateTechnicalPassword();

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(passwordToHash);
            entity.Password = hashedPassword;

            if (!hasExplicitPassword)
            {
                entity.AccessEnabled = false;
            }

            await _usuarioRepository.CreateAsync(entity);
        }

        public async Task<bool> UpdateAsync(Usuario entity)
        {
            if (!string.IsNullOrWhiteSpace(entity.Password))
            {
                entity.Password = BCrypt.Net.BCrypt.HashPassword(entity.Password);
            }

            return await _usuarioRepository.UpdateAsync(entity);
        }

        public async Task<bool> UpdateAccessEnabledAsync(int id, bool accessEnabled)
        {
            return await _usuarioRepository.UpdateAccessEnabledAsync(id, accessEnabled);
        }

        public async Task<bool> UpdatePasswordAsync(int id, string? newPassword, string? confirmPassword)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Usuario invalido.");
            }

            if (string.IsNullOrWhiteSpace(newPassword))
            {
                throw new ArgumentException("Informe a nova senha.");
            }

            if (string.IsNullOrWhiteSpace(confirmPassword))
            {
                throw new ArgumentException("Confirme a nova senha.");
            }

            if (newPassword != confirmPassword)
            {
                throw new ArgumentException("A confirmacao da senha nao confere.");
            }

            if (newPassword.Length < MinimumPasswordLength)
            {
                throw new ArgumentException($"A senha deve ter pelo menos {MinimumPasswordLength} caracteres.");
            }

            var user = await _usuarioRepository.GetByIdAsync(id);
            if (user is null)
            {
                return false;
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _usuarioRepository.UpdatePasswordAsync(id, hashedPassword);
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _usuarioRepository.DeleteAsync(id);
        }

        private static string GenerateTechnicalPassword()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        }
    }
}
