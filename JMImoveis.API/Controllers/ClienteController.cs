using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClienteController : ControllerBase
    {
        private readonly IClienteRepository _repository;

        public ClienteController(IClienteRepository repository) => _repository = repository;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _repository.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _repository.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpGet("term/{terms}")]
        public async Task<IActionResult> GetByTerms(string terms)
        {
            var result = await _repository.GetByTerms(terms);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Cliente item)
        {
            var id = await _repository.CreateAsync(item);
            return CreatedAtAction(nameof(GetById), new { id }, item);
        }

        [HttpGet("customers/{id}/dependents")]
        public async Task<IActionResult> GetDependents([FromRoute] int id)
        {
            var client = await _repository.GetDependentByClientIdAsync(id);
            return Ok(client);
        }

        [HttpPost("{customer}/dependents/{dependents}")]
        public async Task<IActionResult> CreateDependents([FromRoute] int customer, [FromRoute] int dependents)
        {
            await _repository.InsertDependents(customer, dependents);
            return Ok();
        }

        [HttpPut]
        public async Task<IActionResult> Update(Cliente item)
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
