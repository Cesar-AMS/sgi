using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;
using System.Security.Claims;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // LEGADO FINANCEIRO: este controller usa a base paralela receivables/payables.
    // Para o piloto empresarial, a base oficial e accounts_receivable/accounts_payable.
    // Preservar por compatibilidade ate uma migracao futura; nao usar como referencia
    // para novas frentes financeiras.
    public class PayableController : ControllerBase
    {
        private const string ViewPayablesPermission = "financeiro.contas_pagar.visualizar";
        private const string CreatePayablesPermission = "financeiro.contas_pagar.criar";
        private const string EditPayablesPermission = "financeiro.contas_pagar.editar";
        private const string PayPayablesPermission = "financeiro.contas_pagar.pagar";

        private readonly IReceivableRepository _repo;
        private readonly IPermissionService _permissionService;

        public PayableController(
            IReceivableRepository repo,
            IPermissionService permissionService)
        {
            _repo = repo;
            _permissionService = permissionService;
        }

        [HttpGet("all")]
        public async Task<ActionResult> GetAll()
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewPayablesPermission, "visualizar contas a pagar.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            return Ok(await _repo.GetAllAsync());
        }


        [HttpGet("periodo")]
        public async Task<IActionResult> Get([FromQuery] DateTime? de, [FromQuery] DateTime? ate, [FromQuery] string typeFilter, [FromQuery] string categoriaFilter)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewPayablesPermission, "visualizar contas a pagar.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            var result = await _repo.GetPayablesAsync(de, ate, typeFilter, categoriaFilter);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Payable dto)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(CreatePayablesPermission, "criar contas a pagar.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            if (dto.CreatedAt == null) dto.CreatedAt = DateTime.UtcNow;
            if (dto.CompetenceDate == null) dto.CompetenceDate = DateTime.UtcNow;
            if (dto.DueDate == null) dto.DueDate = DateTime.UtcNow;
            if (dto.InstallmentNo == null) dto.InstallmentNo = 1;

            dto.UpdatedAt = DateTime.UtcNow;

            dto.Status = dto.PaidDate.HasValue ? "Pago" : "Em Aberto";

            await _repo.CreatePayableAsync(dto);

            return Ok();
        }


        [HttpPatch("{id}")]
        public async Task<ActionResult> UpdateAsync([FromBody] Payable dto, [FromRoute] int id)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditPayablesPermission, "editar contas a pagar.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            await _repo.UpdateAsync(id, dto);

            return Ok();
        }

        [HttpPost("{id}/pay")]
        public async Task<IActionResult> MarkAsReceived(int id, [FromBody] MarkAsPaidRequest req)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(PayPayablesPermission, "pagar contas a pagar.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            await _repo.MarkPaidAsync(id, req);

            return NoContent(); 
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
