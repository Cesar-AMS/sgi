using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private const string ViewFinancialReportsPermission = "financeiro.relatorios.visualizar";

        private readonly IReportsRepository _reportsRepository;
        private readonly IPermissionService _permissionService;

        public ReportsController(
            IReportsRepository reportsRepository,
            IPermissionService permissionService)
        {
            _reportsRepository = reportsRepository;
            _permissionService = permissionService;
        }

        /// <summary>
        /// Relatório mensal por Filial (Valor Venda + Comissões).
        /// GET api/reports/sales/monthly-branch?year=2025
        /// </summary>
        [HttpGet("sales/monthly-branch")]
        public async Task<ActionResult<IEnumerable<MonthlyBranchSalesReportV3>>> GetMonthlyBranchSales(
            [FromQuery] int? year)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewFinancialReportsPermission, "visualizar relatorios financeiros.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            var result = await _reportsRepository.GetMonthlyBranchSalesAsync(year);
            return Ok(result);
        }

        /// <summary>
        /// Contas a pagar por UserId (resumo mensal).
        /// GET api/reports/payables/user-monthly?year=2025
        /// </summary>
        [HttpGet("payables/user-monthly")]
        public async Task<ActionResult<IEnumerable<UserMonthlyPayablesSummaryV3>>> GetUserMonthlyPayablesSummary(
            [FromQuery] int year)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewFinancialReportsPermission, "visualizar relatorios financeiros.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            if (year <= 0)
                return BadRequest("Ano inválido.");

            var result = await _reportsRepository.GetUserMonthlyPayablesSummaryAsync(year);
            return Ok(result);
        }

        /// <summary>
        /// Contas a pagar por UserId + Categoria + Mês.
        /// GET api/reports/payables/user-category-monthly?year=2025
        /// </summary>
        [HttpGet("payables/user-category-monthly")]
        public async Task<ActionResult<IEnumerable<UserCategoryMonthlyPayablesSummaryV3>>> GetUserCategoryMonthlyPayables(
            [FromQuery] int year)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewFinancialReportsPermission, "visualizar relatorios financeiros.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            if (year <= 0)
                return BadRequest("Ano inválido.");

            var result = await _reportsRepository.GetUserCategoryMonthlyPayablesAsync(year);
            return Ok(result);
        }

        /// <summary>
        /// Detalhe de todas as despesas de um usuário.
        /// GET api/reports/payables/user-details/123?year=2025
        /// </summary>
        [HttpGet("payables/user-details/{userId:long}")]
        public async Task<ActionResult<IEnumerable<UserPayableDetailV3>>> GetUserPayablesDetails(
            long userId,
            [FromQuery] int? year)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewFinancialReportsPermission, "visualizar relatorios financeiros.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            if (userId <= 0)
                return BadRequest("UserId inválido.");

            var result = await _reportsRepository.GetUserPayablesDetailsAsync(userId, year);
            return Ok(result);
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
