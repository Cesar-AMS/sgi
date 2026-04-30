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
        private readonly IEmpreendimentoService _empreendimentoService;

        public ApartamentController(
            IApartamentosRepository repo,
            IEmpreendimentoService empreendimentoService)
        {
            _repo = repo;
            _empreendimentoService = empreendimentoService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApartmentUnit>>> GetAll([FromQuery] int enterpriseId)
         => Ok(await _repo.GetAllAsync(enterpriseId));

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApartmentUnit>> Get(int id)
            => (await _repo.GetByIdAsync(id)) is { } x ? Ok(x) : NotFound();

        [HttpGet("disponiveis")]
        public async Task<ActionResult<IEnumerable<ApartmentUnit>>> GetDisponiveis()
            => Ok(await _repo.GetDisponiveisAsync());

        [HttpGet("espelho/{id}")]
        public async Task<ActionResult<ApartmentUnit>> GetEspelho(int id)
            => (await _repo.GetEspelhoAsync(id)) is { } x ? Ok(x) : NotFound();
        


        [HttpPost]
        public async Task<ActionResult> Create([FromBody] ApartmentUnit dto)
        {
            var empreendimento = await _empreendimentoService.GetByIdAsync(dto.EnterpriseId);
            if (empreendimento is null || empreendimento.DeletedAt is not null || empreendimento.Hidden)
            {
                return BadRequest(new { message = "Empreendimento invalido ou inativo." });
            }

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
        {
            if (await _repo.HasPropostaAtivaAsync(id))
            {
                return BadRequest(new { message = "Nao e possivel excluir unidade com proposta ativa." });
            }

            return await _repo.SoftDeleteAsync(id) ? NoContent() : NotFound();
        }

        [HttpDelete("{id:int}/hard")]
        public async Task<ActionResult> HardDelete(int id)
        {
            if (await _repo.HasPropostaAtivaAsync(id))
            {
                return BadRequest(new { message = "Nao e possivel excluir unidade com proposta ativa." });
            }

            return await _repo.HardDeleteAsync(id) ? NoContent() : NotFound();
        }
    }
}
