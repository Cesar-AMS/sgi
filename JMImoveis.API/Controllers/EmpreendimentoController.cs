using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpreendimentoController : ControllerBase
    {
        private readonly IEmpreendimentoRepository _repo;
        public EmpreendimentoController(IEmpreendimentoRepository repo) => _repo = repo;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Enterprise>>> GetAll()
        => Ok(await _repo.GetAllAsync());

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Enterprise>> Get(int id)
        => (await _repo.GetByIdAsync(id)) is { } x ? Ok(x) : NotFound();


        [HttpGet("units-actives/{enterpriseId}")]
        public async Task<IActionResult> GetAllUnitsActivesByEnterprise(int enterpriseId)
         => Ok(await _repo.GetAllUnitsActivesByEnterprise(enterpriseId));

        [HttpGet("units/{enterpriseId}")]
        public async Task<IActionResult> GetAllUnitsByEnterprise(int enterpriseId)
         => Ok(await _repo.GetAllUnitsByEnterprise(enterpriseId));

        [HttpGet("per-enterprise/{enterpriseId}")]
        public async Task<IActionResult> GetEnterpriseByConstructorAsync(int enterpriseId)
         => Ok(await _repo.GetEnterpriseByConstructorAsync(enterpriseId));

        [HttpGet("constructor")]
        public async Task<IActionResult> GetConstructorAsync(int enterpriseId)
        => Ok(await _repo.GetConstructorAsync());


        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Enterprise dto)
        {
            var id = await _repo.CreateAsync(new Enterprise
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
            var ok = await _repo.UpdateAsync(id, new Enterprise
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
            => await _repo.SoftDeleteAsync(id) ? NoContent() : NotFound();

        [HttpDelete("{id:int}/hard")]
        public async Task<ActionResult> HardDelete(int id)
            => await _repo.HardDeleteAsync(id) ? NoContent() : NotFound();
    }
}
