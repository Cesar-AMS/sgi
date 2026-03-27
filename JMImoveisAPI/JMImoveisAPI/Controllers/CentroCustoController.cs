using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CentroCustoController : ControllerBase
    {
        private readonly ICentroCustoRepository _repository;

        public CentroCustoController(ICentroCustoRepository repository) => _repository = repository;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _repository.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _repository.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CentroCusto item)
        {
           await _repository.CreateAsync(item);
            return Ok();
        }

        [HttpPut]
        public async Task<IActionResult> Update(CentroCusto item)
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
