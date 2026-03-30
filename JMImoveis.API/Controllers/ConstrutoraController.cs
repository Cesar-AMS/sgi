using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConstrutoraController : ControllerBase
    {
        private readonly IConstrutoraRepository _repo;
        public ConstrutoraController(IConstrutoraRepository repo) => _repo = repo;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Constructor>>> GetAll() => Ok(await _repo.GetAllAsync());

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Constructor>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            return item is null ? NotFound() : Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Constructor dto)
        {
            var id = await _repo.CreateAsync(dto.Name);
            return CreatedAtAction(nameof(Get), new { id }, new { id });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult> Update(int id, [FromBody] Constructor dto)
            => await _repo.UpdateAsync(id, dto.Name) ? NoContent() : NotFound();

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> SoftDelete(int id)
            => await _repo.SoftDeleteAsync(id) ? NoContent() : NotFound();

        [HttpDelete("{id:int}/hard")]
        public async Task<ActionResult> HardDelete(int id)
            => await _repo.HardDeleteAsync(id) ? NoContent() : NotFound();


    }
}
