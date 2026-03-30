using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IReportsRepository _reportsRepository;

        public ReportsController(IReportsRepository reportsRepository)
        {
            _reportsRepository = reportsRepository;
        }

        /// <summary>
        /// Relatório mensal por Filial (Valor Venda + Comissões).
        /// GET api/reports/sales/monthly-branch?year=2025
        /// </summary>
        [HttpGet("sales/monthly-branch")]
        public async Task<ActionResult<IEnumerable<MonthlyBranchSalesReportV3>>> GetMonthlyBranchSales(
            [FromQuery] int? year)
        {
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
            if (userId <= 0)
                return BadRequest("UserId inválido.");

            var result = await _reportsRepository.GetUserPayablesDetailsAsync(userId, year);
            return Ok(result);
        }
    }
}
