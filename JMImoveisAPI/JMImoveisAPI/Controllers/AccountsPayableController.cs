using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [Route("api/accounts-payable")]
    [ApiController]
    public class AccountsPayableController : ControllerBase
    {
        private readonly IAccountsPayableService _service;
        public AccountsPayableController(IAccountsPayableService service) => _service = service;



        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] AccountsPayableQuery q)
        {
            var (items, total) = await _service.GetPagedAsync(q);
            return Ok(new { items, total });
        }

        [HttpGet("summary")]
        public async Task<IActionResult> Summary([FromQuery] AccountsPayableQuery q)
        {
            var s = await _service.GetSummaryAsync(q);
            return Ok(s);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAccountsPayableRequest req)
        {
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
    }
}
