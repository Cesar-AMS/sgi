using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class UsuarioGestaoService : IUsuarioGestaoService
    {
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
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(entity.Password);
            entity.Password = hashedPassword;

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

        public async Task<bool> DeleteAsync(int id)
        {
            return await _usuarioRepository.DeleteAsync(id);
        }
    }
}
