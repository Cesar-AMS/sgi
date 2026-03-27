using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountBankController : ControllerBase
    {
        private readonly IAccountBankRepository _repo;
        public AccountBankController(IAccountBankRepository repo) => _repo = repo;

        [HttpGet]
        public async Task<ActionResult> GetAll([FromQuery] bool onlyActive = true)
            => Ok(await _repo.GetAllAsync(onlyActive));

        [HttpGet("{id:int}")]
        public async Task<ActionResult> Get(int id)
            => (await _repo.GetByIdAsync(id)) is { } x ? Ok(x) : NotFound();

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] AccountBank dto)
        {
            var id = await _repo.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id }, new { id });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult> Update(int id, [FromBody] AccountBank dto)
            => await _repo.UpdateAsync(id, dto) ? NoContent() : NotFound();

        [HttpPatch("{id:int}/active")]
        public async Task<ActionResult> SetActive(int id, [FromQuery] bool active = true)
            => await _repo.SetActiveAsync(id, active) ? NoContent() : NotFound();

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
            => await _repo.DeleteAsync(id) ? NoContent() : NotFound();

        // Movimentações
        [HttpPost("{id:int}/credit")]
        public async Task<ActionResult> Credit(int id, [FromQuery] decimal value)
            => await _repo.CreditAsync(id, value) ? NoContent() : BadRequest("Não foi possível creditar.");

        [HttpPost("{id:int}/debit")]
        public async Task<ActionResult> Debit(int id, [FromQuery] decimal value)
            => await _repo.DebitAsync(id, value) ? NoContent() : BadRequest("Saldo insuficiente.");
    }
}
