using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VisitasController : ControllerBase
    {
        private readonly IVisitasRepository _repository;

        public VisitasController(IVisitasRepository repository) => _repository = repository;

        [HttpGet]
        public async Task<ActionResult<PagedResultVisitas<Visitas>>> List([FromQuery] VisitationsQuery q)
        {
            var (items, total) = await _repository.ListAsync(q);
            return Ok(new PagedResultVisitas<Visitas>(items, total, q.Page, q.PageSize));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _repository.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Visitas item)
        {
            var id = await _repository.CreateAsync(item);
            return CreatedAtAction(nameof(GetById), new { id }, item);
        }

        [HttpPut]
        public async Task<IActionResult> Update(Visitas item)
        {
            var updated = await _repository.UpdateAsync(item);
            return updated ? Ok() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _repository.DeleteAsync(id);
            return deleted ? Ok() : NotFound();
        }
    }
}
