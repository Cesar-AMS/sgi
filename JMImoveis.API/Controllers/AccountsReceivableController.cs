using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [Route("api/accounts-receivable")]
    [ApiController]
    public class AccountsReceivableController : ControllerBase
    {
        private readonly IAccountsReceivableService _service;

        public AccountsReceivableController(IAccountsReceivableService service)
        {
            _service = service;
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
            var result = await _service.GetSummaryAsync(dueFrom, dueTo, branchId, category, status, search);
            return Ok(result);
        }

        // POST /api/accounts-receivable
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAccountsReceivableRequest req)
        {
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
    }
}
