using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [Route("api/dash/sales")]
    [ApiController]
    public sealed class DashboardSalesController : ControllerBase
    {
        private readonly IDashboardSalesService _dashboardSalesService;

        public DashboardSalesController(IDashboardSalesService dashboardSalesService)
        {
            _dashboardSalesService = dashboardSalesService;
        }

        // 1) Vendas por mês (ano inteiro)
        // GET /api/dash/sales/by-month?year=2025
        [HttpGet("by-month")]
        public async Task<ActionResult<IReadOnlyList<SalesByMonthDto>>> GetByMonth([FromQuery] int year, CancellationToken ct)
        {
            var rows = await _dashboardSalesService.GetByMonthAsync(year, ct);
            return Ok(rows);
        }

        // 2) Por corretor (mês)
        // GET /api/dash/sales/by-realtor?year=2025&month=12
        [HttpGet("by-realtor")]
        public async Task<ActionResult<IReadOnlyList<SalesByEntityDto>>> GetByRealtor([FromQuery] int year, [FromQuery] int month, CancellationToken ct)
        {
            var rows = await _dashboardSalesService.GetByRealtorAsync(year, month, ct);
            return Ok(rows);
        }

        // 3) Por gerente (mês)
        [HttpGet("by-manager")]
        public async Task<ActionResult<IReadOnlyList<SalesByEntityDto>>> GetByManager([FromQuery] int year, [FromQuery] int month, CancellationToken ct)
        {
            var rows = await _dashboardSalesService.GetByManagerAsync(year, month, ct);
            return Ok(rows);
        }

        // 4) Por coordenador (mês)
        [HttpGet("by-coordenator")]
        public async Task<ActionResult<IReadOnlyList<SalesByEntityDto>>> GetByCoordenator([FromQuery] int year, [FromQuery] int month, CancellationToken ct)
        {
            var rows = await _dashboardSalesService.GetByCoordenatorAsync(year, month, ct);
            return Ok(rows);
        }

        // 5) Por filial (mês)
        [HttpGet("by-branch")]
        public async Task<ActionResult<IReadOnlyList<SalesByEntityDto>>> GetByBranch([FromQuery] int year, [FromQuery] int month, CancellationToken ct)
        {
            var rows = await _dashboardSalesService.GetByBranchAsync(year, month, ct);
            return Ok(rows);
        }
    }
}
