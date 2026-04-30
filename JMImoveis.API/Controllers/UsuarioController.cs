using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;

        public UsuarioController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpGet("status/{status}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll(string status) => Ok(await _usuarioService.GetAllAsync(status));

        [HttpGet("enterprise/{enterpriseId}")]
        public async Task<IActionResult> GetAllByEnterpriseAsync(int enterpriseId)
        {
            var result = await _usuarioService.GetAllByEnterpriseAsync(enterpriseId);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPut("users/{userId}/menu")]
        [AllowAnonymous]
        public async Task<IActionResult> UpdateUserMenu(int userId, [FromBody] List<MenuItemDto> menu)
        {
            await _usuarioService.UpdateMenuAsync(menu, userId);
            return Ok();
        }

        [HttpGet("me/{userId}")]
        [AllowAnonymous]
        public async Task<ActionResult<List<MenuItemDto>>> GetMyMenu(int userId)
        {
            var menu = await _usuarioService.GetUserMenuAsync(userId);
            return Ok(menu);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _usuarioService.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpGet("roleId/{roleId}/branchId/{branchId}/hidden/{hidden}")]
        public async Task<IActionResult> GetUsersByRoleAndBranch(int roleId, int branchId, int hidden)
        {
            var result = await _usuarioService.GetUsersByRoleAndBranchAsync(branchId, roleId, hidden);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpGet("corretores")]
        [HttpGet("vendedores")]
        public async Task<IActionResult> GetCorretoresAsync([FromQuery] int? gerenteId)
        {
            var result = await _usuarioService.GetCorretoresAsync();
            if (result == null)
            {
                return NotFound();
            }

            if (gerenteId.HasValue)
            {
                result = result.Where(x => x.ManagerId == gerenteId.Value).ToList();
            }

            return Ok(result);
        }

        [HttpGet("gerente")]
        [HttpGet("gerentes")]
        public async Task<IActionResult> GetGerente()
        {
            var result = await _usuarioService.GetGerentesAsync();
            return result == null ? NotFound() : Ok(result);
        }

        [HttpGet("coordenadores")]
        public async Task<IActionResult> GetCoordenadoresAsync([FromQuery] int? gerenteId)
        {
            var result = await _usuarioService.GetCoordenadoresAsync();
            if (result == null)
            {
                return NotFound();
            }

            if (gerenteId.HasValue)
            {
                result = result.Where(x => x.ManagerId == gerenteId.Value).ToList();
            }

            return Ok(result);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create(Usuario item)
        {
            await _usuarioService.CreateAsync(item);
            return Ok();
        }

        [HttpPut]
        public async Task<IActionResult> Update(Usuario item)
        {
            var updated = await _usuarioService.UpdateAsync(item);
            return updated ? Ok() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _usuarioService.DeleteAsync(id);
            return deleted ? Ok() : NotFound();
        }
    }
}
