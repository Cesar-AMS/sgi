using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/lead-distribution-agents")]
    public class LeadDistributionAgentsController : ControllerBase
    {
        private const string ViewPermission = "atendimento.gestao.distribuicao_leads.visualizar";
        private const string EditPermission = "atendimento.gestao.distribuicao_leads.editar";

        private readonly ILeadDistributionAgentService _service;
        private readonly IPermissionService _permissionService;

        public LeadDistributionAgentsController(
            ILeadDistributionAgentService service,
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateLeadDistributionAgentRequest request)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditPermission, "editar distribuicao de leads.");
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
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(
            [FromRoute] long id,
            [FromBody] UpdateLeadDistributionAgentRequest request)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditPermission, "editar distribuicao de leads.");
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

        [HttpPatch("{id:long}/toggle")]
        public async Task<IActionResult> Toggle(
            [FromRoute] long id,
            [FromBody] ToggleLeadDistributionAgentRequest request)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditPermission, "editar distribuicao de leads.");
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

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete([FromRoute] long id)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditPermission, "editar distribuicao de leads.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                await _service.DeleteAsync(id);
                return Ok(new { message = "Configuracao removida com sucesso." });
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
                    return StatusCode(403, new { message = "Usuario sem permissao para visualizar distribuicao de leads." });
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
