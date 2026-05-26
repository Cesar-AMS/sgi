using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JMImoveisAPI.Controllers
{
    [Route("api/accounts-payable")]
    [ApiController]
    public class AccountsPayableController : ControllerBase
    {
        private const string ViewPayablesPermission = "financeiro.contas_pagar.visualizar";
        private const string CreatePayablesPermission = "financeiro.contas_pagar.criar";
        private const string PayPayablesPermission = "financeiro.contas_pagar.pagar";

        private readonly IAccountsPayableService _service;
        private readonly IPermissionService _permissionService;

        public AccountsPayableController(
            IAccountsPayableService service,
            IPermissionService permissionService)
        {
            _service = service;
            _permissionService = permissionService;
        }



        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] AccountsPayableQuery q)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewPayablesPermission, "visualizar contas a pagar.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            var (items, total) = await _service.GetPagedAsync(q);
            return Ok(new { items, total });
        }

        [HttpGet("summary")]
        public async Task<IActionResult> Summary([FromQuery] AccountsPayableQuery q)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewPayablesPermission, "visualizar contas a pagar.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            var s = await _service.GetSummaryAsync(q);
            return Ok(s);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAccountsPayableRequest req)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(CreatePayablesPermission, "criar contas a pagar.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

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

        [HttpPost("{id:long}/settle")]
        public async Task<IActionResult> Settle(long id, [FromBody] SettleAccountsPayableRequest req)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(PayPayablesPermission, "pagar contas a pagar.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                await _service.SettleAsync(id, req);
                return Ok();
            }
            catch (ArgumentException ex)
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
