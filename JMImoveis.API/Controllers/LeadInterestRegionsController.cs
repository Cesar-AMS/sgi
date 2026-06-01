using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/lead-interest-regions")]
    public class LeadInterestRegionsController : ControllerBase
    {
        private const string ViewPermission = "atendimento.gestao.regioes_interesse.visualizar";
        private const string EditPermission = "atendimento.gestao.regioes_interesse.editar";

        private readonly ILeadInterestRegionService _service;
        private readonly IPermissionService _permissionService;

        public LeadInterestRegionsController(
            ILeadInterestRegionService service,
            IPermissionService permissionService)
        {
            _service = service;
            _permissionService = permissionService;
        }

        [HttpGet]
        public async Task<IActionResult> List()
        {
            var authorizationResult = await AuthorizeCurrentUserForViewAsync();
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            return Ok(await _service.ListAsync());
        }

        [HttpGet("active")]
        public async Task<IActionResult> ListActive()
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Usuario autenticado nao identificado." });
            }

            return Ok(await _service.ListActiveAsync());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateLeadInterestRegionRequest request)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditPermission, "editar regioes de interesse.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                return Ok(await _service.CreateAsync(request));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            [FromRoute] int id,
            [FromBody] UpdateLeadInterestRegionRequest request)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditPermission, "editar regioes de interesse.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                return Ok(await _service.UpdateAsync(id, request));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPatch("{id:int}/toggle")]
        public async Task<IActionResult> Toggle(
            [FromRoute] int id,
            [FromBody] ToggleLeadInterestRegionRequest request)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditPermission, "editar regioes de interesse.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                return Ok(await _service.ToggleAsync(id, request));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditPermission, "editar regioes de interesse.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                await _service.DeleteAsync(id);
                return Ok(new { message = "Regiao de interesse inativada com sucesso." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        private async Task<IActionResult?> AuthorizeCurrentUserForViewAsync()
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Usuario autenticado nao identificado." });
            }

            try
            {
                var canView = await _permissionService.UserHasPermissionAsync(currentUserId.Value, ViewPermission);
                var canEdit = await _permissionService.UserHasPermissionAsync(currentUserId.Value, EditPermission);

                if (!canView && !canEdit)
                {
                    return StatusCode(403, new { message = "Usuario sem permissao para visualizar regioes de interesse." });
                }
            }
            catch (KeyNotFoundException)
            {
                return Unauthorized(new { message = "Usuario autenticado nao encontrado." });
            }

            return null;
        }

        private async Task<IActionResult?> AuthorizeCurrentUserAsync(string permissionKey, string actionDescription)
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Usuario autenticado nao identificado." });
            }

            try
            {
                var hasPermission = await _permissionService.UserHasPermissionAsync(
                    currentUserId.Value,
                    permissionKey);

                if (!hasPermission)
                {
                    return StatusCode(403, new { message = $"Usuario sem permissao para {actionDescription}" });
                }
            }
            catch (KeyNotFoundException)
            {
                return Unauthorized(new { message = "Usuario autenticado nao encontrado." });
            }

            return null;
        }

        private long? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return long.TryParse(userIdClaim, out var userId) && userId > 0
                ? userId
                : null;
        }
    }
}
