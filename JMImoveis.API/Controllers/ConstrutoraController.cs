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
        private readonly IConstrutoraService _construtoraService;
        public ConstrutoraController(IConstrutoraService construtoraService) => _construtoraService = construtoraService;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Constructor>>> GetAll() => Ok(await _construtoraService.GetAllAsync());

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Constructor>> Get(int id)
        {
            var item = await _construtoraService.GetByIdAsync(id);
            return item is null ? NotFound() : Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Constructor dto)
        {
            var id = await _construtoraService.CreateAsync(dto.Name);
            return CreatedAtAction(nameof(Get), new { id }, new { id });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult> Update(int id, [FromBody] Constructor dto)
            => await _construtoraService.UpdateAsync(id, dto.Name) ? NoContent() : NotFound();

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> SoftDelete(int id)
            => await _construtoraService.SoftDeleteAsync(id) ? NoContent() : NotFound();

        [HttpDelete("{id:int}/hard")]
        public async Task<ActionResult> HardDelete(int id)
            => await _construtoraService.HardDeleteAsync(id) ? NoContent() : NotFound();


    }
}
