using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeadPostVisitController : ControllerBase
    {
        private const string ViewPostVisitPermission = "atendimento.posvisita.visualizar";
        private const string EditPostVisitPermission = "atendimento.posvisita.editar";

        private readonly ILeadPostVisitService _service;
        private readonly IPermissionService _permissionService;

        public LeadPostVisitController(
            ILeadPostVisitService service,
            IPermissionService permissionService)
        {
            _service = service;
            _permissionService = permissionService;
        }

        [HttpGet]
        public async Task<IActionResult> List(
            [FromQuery] string? status,
            [FromQuery] long? agentId,
            [FromQuery] string? search,
            [FromQuery] DateTime? followUpFrom,
            [FromQuery] DateTime? followUpTo)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewPostVisitPermission, "visualizar pos-visita.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                return Ok(await _service.ListAsync(status, agentId, search, followUpFrom, followUpTo));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("lead/{leadId:int}")]
        public async Task<IActionResult> GetByLeadId([FromRoute] int leadId)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewPostVisitPermission, "visualizar pos-visita.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                var postVisit = await _service.GetByLeadIdAsync(leadId);
                return postVisit == null
                    ? NotFound(new { message = "Pos-visita nao encontrado para este lead." })
                    : Ok(postVisit);
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

        [HttpPost("lead/{leadId:int}")]
        public async Task<IActionResult> CreateOrGetByLeadId(
            [FromRoute] int leadId,
            [FromBody] LeadPostVisitRequest request)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditPostVisitPermission, "editar pos-visita.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                return Ok(await _service.CreateOrGetByLeadIdAsync(leadId, request));
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

        [HttpPut("lead/{leadId:int}")]
        public async Task<IActionResult> UpdateByLeadId(
            [FromRoute] int leadId,
            [FromBody] LeadPostVisitRequest request)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditPostVisitPermission, "editar pos-visita.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                return Ok(await _service.UpdateByLeadIdAsync(leadId, request));
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

        [HttpPatch("{id:long}/status")]
        public async Task<IActionResult> UpdateStatus(
            [FromRoute] long id,
            [FromBody] UpdateLeadPostVisitStatusRequest request)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditPostVisitPermission, "editar pos-visita.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                return Ok(await _service.UpdateStatusAsync(id, request));
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
