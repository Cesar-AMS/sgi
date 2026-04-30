using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;

        public AuthController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] Usuario login)
        {
            if (login is null)
            {
                return BadRequest("Dados de login não informados.");
            }

            var email = login.Email?.Trim();
            var password = login.Password;

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                return BadRequest("Email e senha são obrigatórios.");
            }

            var (token, id) = await _usuarioService.AuthenticateAsync(email, password);
            if (token == null)
            {
                return Unauthorized("Email ou senha inválidos.");
            }

            login.Token = token;
            login.Id = id;
            return Ok(login);
        }

        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Usuário não identificado.");
            }

            var user = await _usuarioService.GetByIdAsync(userId);
            if (user is null)
            {
                return NotFound("Usuário não encontrado.");
            }

            var perfil = (user.JobpositionId?.Contains(3) ?? false) ? "GERENTE" : "DIRETOR";
            var gerenteId = perfil == "GERENTE" ? user.Id : user.ManagerId;

            return Ok(new
            {
                id = user.Id,
                nome = user.Name,
                email = user.Email,
                perfil,
                gerenteId,
                jobpositionId = user.JobpositionId,
                managerId = user.ManagerId,
                coordenatorId = user.CoordenatorId,
                gestorId = user.GestorId
            });
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] string email)
        {
            var success = await _usuarioService.ResetPasswordAsync(email);
            if (!success)
            {
                return NotFound("Usuário não encontrado.");
            }

            return Ok("Senha redefinida e enviada por e-mail.");
        }
    }
}
