using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpreendimentoController : ControllerBase
    {
        private readonly IEmpreendimentoService _empreendimentoService;
        public EmpreendimentoController(IEmpreendimentoService empreendimentoService) => _empreendimentoService = empreendimentoService;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Enterprise>>> GetAll()
        => Ok(await _empreendimentoService.GetAllAsync());

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Enterprise>> Get(int id)
        => (await _empreendimentoService.GetByIdAsync(id)) is { } x ? Ok(x) : NotFound();


        [HttpGet("units-actives/{enterpriseId}")]
        public async Task<IActionResult> GetAllUnitsActivesByEnterprise(int enterpriseId)
         => Ok(await _empreendimentoService.GetAllUnitsActivesByEnterpriseAsync(enterpriseId));

        [HttpGet("units/{enterpriseId}")]
        public async Task<IActionResult> GetAllUnitsByEnterprise(int enterpriseId)
         => Ok(await _empreendimentoService.GetAllUnitsByEnterpriseAsync(enterpriseId));

        [HttpGet("per-enterprise/{enterpriseId}")]
        public async Task<IActionResult> GetEnterpriseByConstructorAsync(int enterpriseId)
         => Ok(await _empreendimentoService.GetEnterpriseByConstructorAsync(enterpriseId));

        [HttpGet("constructor")]
        public async Task<IActionResult> GetConstructorAsync(int enterpriseId)
        => Ok(await _empreendimentoService.GetConstructorAsync());


        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Enterprise dto)
        {
            var id = await _empreendimentoService.CreateAsync(new Enterprise
            {
                Name = dto.Name,
                Address = dto.Address,
                ConstructorId = dto.ConstructorId,
                Hidden = dto.Hidden
            });
            return CreatedAtAction(nameof(Get), new { id }, new { id });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult> Update(int id, [FromBody] Enterprise dto)
        {
            var ok = await _empreendimentoService.UpdateAsync(id, new Enterprise
            {
                Name = dto.Name,
                Address = dto.Address,
                ConstructorId = dto.ConstructorId,
                Hidden = dto.Hidden
            });
            return ok ? NoContent() : NotFound();
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> SoftDelete(int id)
            => await _empreendimentoService.SoftDeleteAsync(id) ? NoContent() : NotFound();

        [HttpDelete("{id:int}/hard")]
        public async Task<ActionResult> HardDelete(int id)
            => await _empreendimentoService.HardDeleteAsync(id) ? NoContent() : NotFound();
    }
}
