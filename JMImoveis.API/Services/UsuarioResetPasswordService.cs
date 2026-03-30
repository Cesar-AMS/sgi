using JMImoveisAPI.Interfaces;
using System.Net;
using System.Net.Mail;

namespace JMImoveisAPI.Services
{
    public class UsuarioResetPasswordService : IUsuarioResetPasswordService
    {
        private readonly IUsuarioRepository _usuarioRepository;

        public UsuarioResetPasswordService(IUsuarioRepository usuarioRepository)
        {
            _usuarioRepository = usuarioRepository;
        }

        public async Task<bool> ResetPasswordAsync(string email)
        {
            var user = await _usuarioRepository.GetByEmailAsync(email);
            if (user == null) return false;

            string novaSenha = Guid.NewGuid().ToString("N")[..8];

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(novaSenha);

            await _usuarioRepository.UpdatePasswordAsync(user.Id.Value, hashedPassword);

            using var smtp = new SmtpClient("smtp.seudominio.com")
            {
                Credentials = new NetworkCredential("email@seudominio.com", "senha"),
                EnableSsl = true,
                Port = 587
            };

            await smtp.SendMailAsync(new MailMessage("email@seudominio.com", email)
            {
                Subject = "Nova senha JMImoveis",
                Body = $"Sua nova senha Ã©: {novaSenha}"
            });

            return true;
        }
    }
}
