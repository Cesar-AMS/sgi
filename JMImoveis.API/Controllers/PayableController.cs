using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PayableController : ControllerBase
    {
        private readonly IReceivableRepository _repo;
        public PayableController(IReceivableRepository repo) => _repo = repo;

        [HttpGet("all")]
        public async Task<ActionResult> GetAll()
          => Ok(await _repo.GetAllAsync());


        [HttpGet("periodo")]
        public async Task<IActionResult> Get([FromQuery] DateTime? de, [FromQuery] DateTime? ate, [FromQuery] string typeFilter, [FromQuery] string categoriaFilter)
        {
            var result = await _repo.GetPayablesAsync(de, ate, typeFilter, categoriaFilter);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Payable dto)
        {
            if (dto.CreatedAt == null) dto.CreatedAt = DateTime.UtcNow;
            if (dto.CompetenceDate == null) dto.CompetenceDate = DateTime.UtcNow;
            if (dto.DueDate == null) dto.DueDate = DateTime.UtcNow;
            if (dto.InstallmentNo == null) dto.InstallmentNo = 1;

            dto.UpdatedAt = DateTime.UtcNow;

            dto.Status = dto.PaidDate.HasValue ? "Pago" : "Em Aberto";

            await _repo.CreatePayableAsync(dto);

            return Ok();
        }


        [HttpPatch("{id}")]
        public async Task<ActionResult> UpdateAsync([FromBody] Payable dto, [FromRoute] int id)
        {
            await _repo.UpdateAsync(id, dto);

            return Ok();
        }

        [HttpPost("{id}/pay")]
        public async Task<IActionResult> MarkAsReceived(int id, [FromBody] MarkAsPaidRequest req)
        {
            await _repo.MarkPaidAsync(id, req);

            return NoContent(); 
        }

    }
}
