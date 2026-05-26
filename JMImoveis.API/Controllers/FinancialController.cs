using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FinancialController : Controller
    {
        private const string ViewFinancialReportsPermission = "financeiro.relatorios.visualizar";
        private const string GenerateFinancialPermission = "financeiro.financial.gerar";

        private readonly IFinancialService _financialService;
        private readonly IPermissionService _permissionService;

        public FinancialController(
            IFinancialService financialService,
            IPermissionService permissionService)
        {
            _financialService = financialService;
            _permissionService = permissionService;
        }

        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<FinancialHistoryItemV2>>> GetHistory(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewFinancialReportsPermission, "visualizar relatorios financeiros.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            var result = await _financialService.GetFinancialHistoryAsync(from, to);
            return Ok(result);
        }

        [HttpPost("generate/{saleId:long}")]
        public async Task<IActionResult> GenerateForSale(long saleId)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(GenerateFinancialPermission, "gerar financeiro.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            await _financialService.GenerateAccountsForSaleAsync(saleId);
            return NoContent();
        }

        [HttpPost("sales")]
        public async Task<IActionResult> CreateSale([FromBody] CreateSaleRequest request)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(GenerateFinancialPermission, "gerar financeiro.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            if (request == null || request.Sale == null)
                return BadRequest("Dados da venda são obrigatórios.");

            var parcels = request.Parcels.Where(p => p is not null).Select(p => p!).ToList();

            var saleId = await _financialService.CreateSaleWithFinancialAsync(request.Sale, parcels, request.CustomerIds);

            return Ok();
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
