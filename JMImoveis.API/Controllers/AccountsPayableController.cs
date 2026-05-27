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
        private const string EditPayablesPermission = "financeiro.contas_pagar.editar";
        private const string PayPayablesPermission = "financeiro.contas_pagar.pagar";
        private const string CancelPayablesPermission = "financeiro.contas_pagar.cancelar";

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

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewPayablesPermission, "visualizar contas a pagar.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            var item = await _service.GetByIdAsync(id);
            return item == null ? NotFound() : Ok(item);
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
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                {
                    return Unauthorized(new { message = "Usuario autenticado nao identificado." });
                }

                if (!req.UserId.HasValue || req.UserId.Value <= 0)
                {
                    req.UserId = currentUserId.Value;
                }

                var id = await _service.CreateAsync(req);
                return Ok(new { id });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateAccountsPayableRequest req)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditPayablesPermission, "editar contas a pagar.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                await _service.UpdateAsync(id, req);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
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
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch("{id:long}/cancel")]
        public async Task<IActionResult> Cancel(long id, [FromBody] CancelAccountsPayableRequest req)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(CancelPayablesPermission, "cancelar contas a pagar.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                await _service.CancelAsync(id, req ?? new CancelAccountsPayableRequest());
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
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
