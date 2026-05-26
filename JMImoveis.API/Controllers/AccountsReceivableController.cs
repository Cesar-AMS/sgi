using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JMImoveisAPI.Controllers
{
    [Route("api/accounts-receivable")]
    [ApiController]
    public class AccountsReceivableController : ControllerBase
    {
        private const string ViewReceivablesPermission = "financeiro.contas_receber.visualizar";
        private const string CreateReceivablesPermission = "financeiro.contas_receber.criar";
        private const string SettleReceivablesPermission = "financeiro.contas_receber.baixar";

        private readonly IAccountsReceivableService _service;
        private readonly IPermissionService _permissionService;

        public AccountsReceivableController(
            IAccountsReceivableService service,
            IPermissionService permissionService)
        {
            _service = service;
            _permissionService = permissionService;
        }

        // GET /api/accounts-receivable?dueFrom=2025-12-01&dueTo=2025-12-31&branchId=1&category=RH&status=WAITING&search=abc&page=1&pageSize=50
        [HttpGet]
        public async Task<ActionResult<PagedResult<AccountsReceivableRowDto>>> GetPaged(
            [FromQuery] DateTime? dueFrom,
            [FromQuery] DateTime? dueTo,
            [FromQuery] int? branchId,
            [FromQuery] string? category,
            [FromQuery] string? status,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewReceivablesPermission, "visualizar contas a receber.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            var result = await _service.GetPagedAsync(dueFrom, dueTo, branchId, category, status, search, page, pageSize);
            return Ok(result);
        }

        // GET /api/accounts-receivable/summary?dueFrom=...&dueTo=...&branchId=...&category=...&status=...&search=...
        [HttpGet("summary")]
        public async Task<ActionResult<AccountsReceivableSummaryDto>> GetSummary(
            [FromQuery] DateTime? dueFrom,
            [FromQuery] DateTime? dueTo,
            [FromQuery] int? branchId,
            [FromQuery] string? category,
            [FromQuery] string? status,
            [FromQuery] string? search)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewReceivablesPermission, "visualizar contas a receber.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            var result = await _service.GetSummaryAsync(dueFrom, dueTo, branchId, category, status, search);
            return Ok(result);
        }

        // POST /api/accounts-receivable
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAccountsReceivableRequest req)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(CreateReceivablesPermission, "criar contas a receber.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            if (req == null) return BadRequest();
            try
            {
                var id = await _service.CreateAsync(req);
                return Ok(new { id });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{id:int}/settle")]
        public async Task<IActionResult> Settle(
        int id,
        [FromBody] SettleAccountsReceivableRequest req)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(SettleReceivablesPermission, "baixar contas a receber.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                if (req == null)
                    return BadRequest();

                await _service.SettleAsync(id, req);
                return Ok();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
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
