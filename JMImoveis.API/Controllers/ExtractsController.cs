using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExtractsController : ControllerBase
    {
        private readonly IExtractRepository _repo;
        public ExtractsController(IExtractRepository repo) => _repo = repo;

        [HttpGet("{accountId:int}")]
        public async Task<ActionResult> List(int accountId, [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
            => Ok(await _repo.GetByAccountAsync(accountId, from, to));

        [HttpGet("item/{id:int}")]
        public async Task<ActionResult> Get(int id)
            => (await _repo.GetAsync(id)) is { } x ? Ok(x) : NotFound();

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] ExtractAccountBank dto)
        {
            // Se não vier data, usa agora (UTC) — ajuste se quiser local.
            if (dto.CreateDate == default) dto.CreateDate = DateTime.UtcNow;
            var id = await _repo.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id }, new { id });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult> Update(int id, [FromBody] ExtractAccountBank dto)
            => await _repo.UpdateAsync(id, dto) ? NoContent() : NotFound();

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
            => await _repo.DeleteAsync(id) ? NoContent() : NotFound();
    }
}
