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
        private readonly IConstrutoraService _construtoraService;

        public EmpreendimentoController(
            IEmpreendimentoService empreendimentoService,
            IConstrutoraService construtoraService)
        {
            _empreendimentoService = empreendimentoService;
            _construtoraService = construtoraService;
        }

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
        public async Task<IActionResult> GetByConstrutoraAsync([FromQuery] int enterpriseId)
        => Ok(await _empreendimentoService.GetEnterpriseByConstructorAsync(enterpriseId));


        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Enterprise dto)
        {
            var construtora = await _construtoraService.GetByIdAsync(dto.ConstructorId);
            if (construtora is null || construtora.DeletedAt is not null)
            {
                return BadRequest(new { message = "Construtora invalida ou inativa." });
            }

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
        {
            if (await _empreendimentoService.HasUnidadesAsync(id))
            {
                return BadRequest(new { message = "Nao e possivel excluir empreendimento com unidade vinculada." });
            }

            return await _empreendimentoService.SoftDeleteAsync(id) ? NoContent() : NotFound();
        }

        [HttpDelete("{id:int}/hard")]
        public async Task<ActionResult> HardDelete(int id)
        {
            if (await _empreendimentoService.HasUnidadesAsync(id))
            {
                return BadRequest(new { message = "Nao e possivel excluir empreendimento com unidade vinculada." });
            }

            return await _empreendimentoService.HardDeleteAsync(id) ? NoContent() : NotFound();
        }
    }
}
