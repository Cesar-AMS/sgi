using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CargoController : ControllerBase
    {
        private readonly ICargoService _cargoService;

        public CargoController(ICargoService cargoService) => _cargoService = cargoService;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _cargoService.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _cargoService.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Cargo item)
        {
            var id = await _cargoService.CreateAsync(item);
            return CreatedAtAction(nameof(GetById), new { id }, item);
        }

        [HttpPut]
        public async Task<IActionResult> Update(Cargo item)
        {
            var updated = await _cargoService.UpdateAsync(item);
            return updated ? Ok() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _cargoService.DeleteAsync(id);
            return deleted ? Ok() : NotFound();
        }
    }
}
