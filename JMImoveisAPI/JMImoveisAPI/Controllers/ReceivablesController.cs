using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReceivablesController : ControllerBase
    {
        private readonly IReceivableRepository _repo;
        public ReceivablesController(IReceivableRepository repo) => _repo = repo;

        // GET /api/receivables?from=2025-01-01&to=2025-01-31&byDueDate=true
        [HttpGet]
        public async Task<ActionResult> GetByPeriod(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to,
            [FromQuery] bool includeDeleted = false,
            [FromQuery] bool byDueDate = true)
            => Ok(await _repo.GetByPeriodAsync(from, to));

        [HttpGet("periodo")]
        public async Task<IActionResult> Get([FromQuery] DateTime? de, [FromQuery] DateTime? ate, [FromQuery] string typeFilter, [FromQuery] string categoriaFilter)
        {
            var result = await _repo.GetReceivableAsync(de, ate, typeFilter, categoriaFilter);
            return Ok(result);
        }

        [HttpGet("dre")]
        public async Task<ActionResult<DreResponse>> GetDre(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] int? categoryId)
        {
            var req = new DreRequest
            {
                StartDate = startDate,
                EndDate = endDate,
                CategoryId = categoryId
            };

            var resp = await _repo.GetDreAsync(req);
            return Ok(resp);
        }

        [HttpGet("all")]
        public async Task<ActionResult> GetAll([FromQuery] bool includeDeleted = false)
            => Ok(await _repo.GetAllAsync(includeDeleted));

        [HttpGet("{id:int}")]
        public async Task<ActionResult> Get(int id)
            => (await _repo.GetAsync(id)) is { } r ? Ok(r) : NotFound();

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Receivable dto)
        {
            if (dto.CreatedAt == null) dto.CreatedAt = DateTime.UtcNow;
            if (dto.CompetenceDate == null) dto.CompetenceDate = DateTime.UtcNow;
            if (dto.DueDate == null) dto.DueDate = DateTime.UtcNow;
            if (dto.InstallmentNo == null) dto.InstallmentNo = 1;

            dto.UpdatedAt = DateTime.UtcNow;

            dto.Status = dto.Received.HasValue ? "Recebido" : "Aguardando Pagamento";


            var ids = await _repo.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = ids.First() }, new { ids });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult> Update(int id, [FromBody] Receivable dto)
            => await _repo.UpdateAsync(id, dto) ? NoContent() : NotFound();

        //[HttpPatch("{id:int}/receive")]
        //public async Task<ActionResult> Receive(int id, [FromQuery] DateTime? date = null)
        //    => await _repo.MarkReceivedAsync(id, date ?? DateTime.UtcNow.Date) ? NoContent() : NotFound();

        [HttpPatch("{id:int}/unreceive")]
        public async Task<ActionResult> Unreceive(int id)
            => await _repo.UnreceiveAsync(id) ? NoContent() : NotFound();

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> SoftDelete(int id)
            => await _repo.SoftDeleteAsync(id) ? NoContent() : NotFound();

        [HttpDelete("{id:int}/hard")]
        public async Task<ActionResult> HardDelete(int id)
            => await _repo.HardDeleteAsync(id) ? NoContent() : NotFound();


        [HttpGet("ac/summary")]
        public async Task<ActionResult<AccountSummaryResponse>> Summary(
        [FromQuery] DateTime start,
        [FromQuery] DateTime end,
        [FromQuery] string type = "all",
        [FromQuery] int? costCenterId = null,
        [FromQuery] int? categoryId = null,
        CancellationToken ct = default)
        {
            var res = await _repo.GetMonthlySummaryAsync(start, end, type, costCenterId, categoryId, ct);
            return Ok(res);
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult> UpdateAsync([FromBody] Receivable dto, [FromRoute] int id)
        {
            await _repo.UpdateAsync(id, dto);

            return Ok();
        }

        [HttpPost("{id}/pay")]
        public async Task<IActionResult> MarkAsReceived(int id, [FromBody] MarkAsReceivedRequest req)
        {
            await _repo.MarkReceivedAsync(id, req);

            return NoContent();
        }

        [HttpGet("ac/{accountId:int}/entries")]
        public async Task<ActionResult<List<Entry>>> Entries(
        int accountId,
        [FromQuery] DateTime start,
        [FromQuery] DateTime end,
        [FromQuery] string type = "all",
        [FromQuery] int? costCenterId = null,
        [FromQuery] int? categoryId = null,
        CancellationToken ct = default)
        {
            var rows = await _repo.GetEntriesByAccountAsync(accountId, start, end, type, costCenterId, categoryId, ct);
            return Ok(rows);
        }

        [HttpGet("cc")]
        public async Task<ActionResult<List<CostCenter>>> GetAll(CancellationToken ct)
        => Ok(await _repo.GetAllAsync(ct));

        [HttpGet("cc/summary")]
        public async Task<ActionResult<SummaryResponse>> Summary(
            [FromQuery] DateTime start,
            [FromQuery] DateTime end,
            [FromQuery] string type = "all",
            CancellationToken ct = default)
            => Ok(await _repo.GetMonthlySummaryAsync(start, end, type, ct));


        [HttpGet("{costCenterId:int}/entries")]
        public async Task<ActionResult<List<Entry>>> GetEntries(int costCenterId,
                                                                [FromQuery] DateTime start,
                                                                [FromQuery] DateTime end,
                                                                [FromQuery] string type = "all",
                                                                CancellationToken ct = default)

         => Ok(await _repo.GetEntriesAsync(costCenterId, start, end, type, ct));



        [HttpPut("{kind}/{id:int}/reclassify")]
        public async Task<IActionResult> Reclassify(
            string kind, int id, [FromBody] ReclassifyRequest body, CancellationToken ct)
        {
            if (!Enum.TryParse<EntryKind>(kind, true, out var ek)) return BadRequest("kind deve ser RECEIVABLE ou PAYABLE");
            if (body.CostCenterId <= 0) return BadRequest("CostCenterId inválido");

            await _repo.ReclassifyAsync(ek, id, body, ct);
            return NoContent();
        }

        [HttpGet("accounts")]
        public async Task<ActionResult<List<AccountOption>>> Get([FromQuery] string? q, CancellationToken ct)
        => Ok(await _repo.SearchAsync(q, ct));
    }
}
