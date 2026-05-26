using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/enterprise-commission-rules")]
    public class EnterpriseCommissionRulesController : ControllerBase
    {
        private const string ViewCommissionRulesPermission = "financeiro.regras_comissao.visualizar";
        private const string EditCommissionRulesPermission = "financeiro.regras_comissao.editar";

        private readonly IEnterpriseCommissionRuleService _service;
        private readonly IPermissionService _permissionService;

        public EnterpriseCommissionRulesController(
            IEnterpriseCommissionRuleService service,
            IPermissionService permissionService)
        {
            _service = service;
            _permissionService = permissionService;
        }

        [HttpGet("enterprise/{enterpriseId:long}")]
        public async Task<IActionResult> ListByEnterprise([FromRoute] long enterpriseId)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewCommissionRulesPermission, "visualizar regras de comissao.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                return Ok(await _service.ListByEnterpriseAsync(enterpriseId));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("enterprise/{enterpriseId:long}/active")]
        public async Task<IActionResult> ListActiveByEnterprise([FromRoute] long enterpriseId, [FromQuery] string? ruleType)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewCommissionRulesPermission, "visualizar regras de comissao.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                return Ok(await _service.ListActiveByEnterpriseAsync(enterpriseId, ruleType));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EnterpriseCommissionRule rule)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditCommissionRulesPermission, "editar regras de comissao.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            if (rule is null)
            {
                return BadRequest(new { message = "Payload invalido." });
            }

            try
            {
                var saved = await _service.CreateAsync(rule);
                return Ok(saved);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update([FromRoute] long id, [FromBody] EnterpriseCommissionRule rule)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditCommissionRulesPermission, "editar regras de comissao.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            if (rule is null)
            {
                return BadRequest(new { message = "Payload invalido." });
            }

            try
            {
                var saved = await _service.UpdateAsync(id, rule);
                return saved is null ? NotFound(new { message = "Regra nao encontrada." }) : Ok(saved);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id:long}/deactivate")]
        public async Task<IActionResult> Deactivate([FromRoute] long id)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditCommissionRulesPermission, "editar regras de comissao.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                var deactivated = await _service.DeactivateAsync(id);
                return deactivated ? Ok(new { message = "Regra desativada com sucesso." }) : NotFound(new { message = "Regra nao encontrada." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private async Task<ActionResult?> AuthorizeCurrentUserAsync(string permissionKey, string actionDescription)
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Usuario autenticado nao identificado." });
            }

            try
            {
                var hasPermission = await _permissionService.UserHasPermissionAsync(currentUserId.Value, permissionKey);
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
