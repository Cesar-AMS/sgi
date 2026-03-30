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
        private readonly IDashboardSalesRepository _repo;

        public DashboardSalesController(IDashboardSalesRepository repo)
        {
            _repo = repo;
        }

        // 1) Vendas por mês (ano inteiro)
        // GET /api/dash/sales/by-month?year=2025
        [HttpGet("by-month")]
        public async Task<ActionResult<IReadOnlyList<SalesByMonthDto>>> GetByMonth([FromQuery] int year, CancellationToken ct)
        {
            if (year <= 0) year = DateTime.UtcNow.Year;
            var start = new DateTime(year, 1, 1);
            var end = start.AddYears(1);
            var rows = await _repo.GetByMonthAsync(start, end, ct);
            return Ok(rows);
        }

        // 2) Por corretor (mês)
        // GET /api/dash/sales/by-realtor?year=2025&month=12
        [HttpGet("by-realtor")]
        public async Task<ActionResult<IReadOnlyList<SalesByEntityDto>>> GetByRealtor([FromQuery] int year, [FromQuery] int month, CancellationToken ct)
        {
            var (start, end) = MonthRange(year, month);
            var rows = await _repo.GetByRealtorAsync(start, end, ct);
            return Ok(rows);
        }

        // 3) Por gerente (mês)
        [HttpGet("by-manager")]
        public async Task<ActionResult<IReadOnlyList<SalesByEntityDto>>> GetByManager([FromQuery] int year, [FromQuery] int month, CancellationToken ct)
        {
            var (start, end) = MonthRange(year, month);
            var rows = await _repo.GetByManagerAsync(start, end, ct);
            return Ok(rows);
        }

        // 4) Por coordenador (mês)
        [HttpGet("by-coordenator")]
        public async Task<ActionResult<IReadOnlyList<SalesByEntityDto>>> GetByCoordenator([FromQuery] int year, [FromQuery] int month, CancellationToken ct)
        {
            var (start, end) = MonthRange(year, month);
            var rows = await _repo.GetByCoordenatorAsync(start, end, ct);
            return Ok(rows);
        }

        // 5) Por filial (mês)
        [HttpGet("by-branch")]
        public async Task<ActionResult<IReadOnlyList<SalesByEntityDto>>> GetByBranch([FromQuery] int year, [FromQuery] int month, CancellationToken ct)
        {
            var (start, end) = MonthRange(year, month);
            var rows = await _repo.GetByBranchAsync(start, end, ct);
            return Ok(rows);
        }

        private static (DateTime start, DateTime end) MonthRange(int year, int month)
        {
            if (year <= 0) year = DateTime.UtcNow.Year;
            if (month < 1 || month > 12) month = DateTime.UtcNow.Month;
            var start = new DateTime(year, month, 1);
            return (start, start.AddMonths(1));
        }
    }
}
