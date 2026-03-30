using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApartamentController : ControllerBase
    {
        private readonly IApartamentosRepository _repo;
        public ApartamentController(IApartamentosRepository repo) => _repo = repo;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApartmentUnit>>> GetAll([FromQuery] int enterpriseId)
         => Ok(await _repo.GetAllAsync(enterpriseId));

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApartmentUnit>> Get(int id)
            => (await _repo.GetByIdAsync(id)) is { } x ? Ok(x) : NotFound();

        [HttpGet("espelho/{id}")]
        public async Task<ActionResult<ApartmentUnit>> GetEspelho(int id)
            => (await _repo.GetEspelhoAsync(id)) is { } x ? Ok(x) : NotFound();
        


        [HttpPost]
        public async Task<ActionResult> Create([FromBody] ApartmentUnit dto)
        {
            var id = await _repo.CreateAsync(new ApartmentUnit
            {
                Floor = dto.Floor,
                Block = dto.Block,
                Number = dto.Number,
                Value = dto.Value,
                Income = dto.Income,
                Size = dto.Size,
                Dormitories = dto.Dormitories,
                Status = dto.Status,
                EnterpriseId = dto.EnterpriseId,
                Active = dto.Active
            });
            return CreatedAtAction(nameof(Get), new { id }, new { id });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult> Update(int id, [FromBody] ApartmentUnit dto)
        {
            var ok = await _repo.UpdateAsync(id, new ApartmentUnit
            {
                Floor = dto.Floor,
                Block = dto.Block,
                Number = dto.Number,
                Value = dto.Value,
                Income = dto.Income,
                Size = dto.Size,
                Dormitories = dto.Dormitories,
                Status = dto.Status,
                Active = dto.Active
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
