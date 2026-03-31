using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FormasPagamentoController : ControllerBase
    {
        private readonly IFormasPagamentoService _formasPagamentoService;

        public FormasPagamentoController(IFormasPagamentoService formasPagamentoService) => _formasPagamentoService = formasPagamentoService;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _formasPagamentoService.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _formasPagamentoService.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(PaymentType item)
        {
            var id = await _formasPagamentoService.CreateAsync(item);
            return CreatedAtAction(nameof(GetById), new { id }, item);
        }

        [HttpPut]
        public async Task<IActionResult> Update(PaymentType item)
        {
            var updated = await _formasPagamentoService.UpdateAsync(item);
            return updated ? Ok() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _formasPagamentoService.DeleteAsync(id);
            return deleted ? Ok() : NotFound();
        }
    }
}
