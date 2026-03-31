using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClienteController : ControllerBase
    {
        private readonly IClienteService _clienteService;

        public ClienteController(IClienteService clienteService) => _clienteService = clienteService;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _clienteService.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _clienteService.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpGet("term/{terms}")]
        public async Task<IActionResult> GetByTerms(string terms)
        {
            var result = await _clienteService.GetByTermsAsync(terms);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Cliente item)
        {
            var id = await _clienteService.CreateAsync(item);
            return CreatedAtAction(nameof(GetById), new { id }, item);
        }

        [HttpGet("customers/{id}/dependents")]
        public async Task<IActionResult> GetDependents([FromRoute] int id)
        {
            var client = await _clienteService.GetDependentByClientIdAsync(id);
            return Ok(client);
        }

        [HttpPost("{customer}/dependents/{dependents}")]
        public async Task<IActionResult> CreateDependents([FromRoute] int customer, [FromRoute] int dependents)
        {
            await _clienteService.InsertDependentsAsync(customer, dependents);
            return Ok();
        }

        [HttpPut]
        public async Task<IActionResult> Update(Cliente item)
        {
            var updated = await _clienteService.UpdateAsync(item);
            return updated ? Ok() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _clienteService.DeleteAsync(id);
            return deleted ? Ok() : NotFound();
        }
    }
}
