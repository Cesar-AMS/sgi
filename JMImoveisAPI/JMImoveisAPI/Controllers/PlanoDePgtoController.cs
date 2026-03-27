using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlanoDePgtoController : ControllerBase
    {
        private readonly IPlanoDePgtoRepository _repository;

        public PlanoDePgtoController(IPlanoDePgtoRepository repository) => _repository = repository;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _repository.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _repository.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(PlanoDePgto item)
        {
            var id = await _repository.CreateAsync(item);
            return CreatedAtAction(nameof(GetById), new { id }, item);
        }

        [HttpPut]
        public async Task<IActionResult> Update(PlanoDePgto item)
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
