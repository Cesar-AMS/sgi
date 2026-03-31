using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FilialController : ControllerBase
    {
        private readonly IFilialService _filialService;

        public FilialController(IFilialService filialService) => _filialService = filialService;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _filialService.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _filialService.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Filial item)
        {
            await _filialService.CreateAsync(item);
            return Ok();
        }

        [HttpPut]
        public async Task<IActionResult> Update(Filial item)
        {
            var updated = await _filialService.UpdateAsync(item);
            return updated ? Ok() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _filialService.DeleteAsync(id);
            return deleted ? Ok() : NotFound();
        }
    }
}
