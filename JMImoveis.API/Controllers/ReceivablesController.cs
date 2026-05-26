using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // LEGADO FINANCEIRO: este controller usa a base paralela receivables/payables.
    // Para o piloto empresarial, a base oficial e accounts_receivable/accounts_payable.
    // Preservar por compatibilidade ate uma migracao futura; nao usar como referencia
    // para novas frentes financeiras.
    public class ReceivablesController : ControllerBase
    {
        private const string ViewReceivablesPermission = "financeiro.contas_receber.visualizar";
        private const string CreateReceivablesPermission = "financeiro.contas_receber.criar";
        private const string EditReceivablesPermission = "financeiro.contas_receber.editar";
        private const string SettleReceivablesPermission = "financeiro.contas_receber.baixar";
        private const string CancelReceivablesPermission = "financeiro.contas_receber.cancelar";
        private const string ViewPayablesPermission = "financeiro.contas_pagar.visualizar";
        private const string EditPayablesPermission = "financeiro.contas_pagar.editar";
        private const string ViewDrePermission = "financeiro.dre.visualizar";
        private const string ViewCostCentersPermission = "financeiro.centro_custo.visualizar";
        private const string ViewAccountingAccountsPermission = "financeiro.contas_contabeis.visualizar";
        private const string ViewFinancialReportsPermission = "financeiro.relatorios.visualizar";

        private readonly IReceivableRepository _repo;
        private readonly IPermissionService _permissionService;

        public ReceivablesController(
            IReceivableRepository repo,
            IPermissionService permissionService)
        {
            _repo = repo;
            _permissionService = permissionService;
        }

        // GET /api/receivables?from=2025-01-01&to=2025-01-31&byDueDate=true
        [HttpGet]
        public async Task<ActionResult> GetByPeriod(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to,
            [FromQuery] bool includeDeleted = false,
            [FromQuery] bool byDueDate = true)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewReceivablesPermission, "visualizar contas a receber.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            return Ok(await _repo.GetByPeriodAsync(from, to));
        }

        [HttpGet("periodo")]
        public async Task<IActionResult> Get([FromQuery] DateTime? de, [FromQuery] DateTime? ate, [FromQuery] string typeFilter, [FromQuery] string categoriaFilter)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewReceivablesPermission, "visualizar contas a receber.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            var result = await _repo.GetReceivableAsync(de, ate, typeFilter, categoriaFilter);
            return Ok(result);
        }

        [HttpGet("dre")]
        public async Task<ActionResult<DreResponse>> GetDre(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] int? categoryId)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewDrePermission, "visualizar DRE.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

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
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewReceivablesPermission, "visualizar contas a receber.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            return Ok(await _repo.GetAllAsync(includeDeleted));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult> Get(int id)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewReceivablesPermission, "visualizar contas a receber.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            return (await _repo.GetAsync(id)) is { } r ? Ok(r) : NotFound();
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Receivable dto)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(CreateReceivablesPermission, "criar contas a receber.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

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
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditReceivablesPermission, "editar contas a receber.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            return await _repo.UpdateAsync(id, dto) ? NoContent() : NotFound();
        }

        //[HttpPatch("{id:int}/receive")]
        //public async Task<ActionResult> Receive(int id, [FromQuery] DateTime? date = null)
        //    => await _repo.MarkReceivedAsync(id, date ?? DateTime.UtcNow.Date) ? NoContent() : NotFound();

        [HttpPatch("{id:int}/unreceive")]
        public async Task<ActionResult> Unreceive(int id)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(SettleReceivablesPermission, "baixar contas a receber.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            return await _repo.UnreceiveAsync(id) ? NoContent() : NotFound();
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> SoftDelete(int id)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(CancelReceivablesPermission, "cancelar contas a receber.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            return await _repo.SoftDeleteAsync(id) ? NoContent() : NotFound();
        }

        [HttpDelete("{id:int}/hard")]
        public async Task<ActionResult> HardDelete(int id)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(CancelReceivablesPermission, "cancelar contas a receber.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            return await _repo.HardDeleteAsync(id) ? NoContent() : NotFound();
        }


        [HttpGet("ac/summary")]
        public async Task<ActionResult<AccountSummaryResponse>> Summary(
        [FromQuery] DateTime start,
        [FromQuery] DateTime end,
        [FromQuery] string type = "all",
        [FromQuery] int? costCenterId = null,
        [FromQuery] int? categoryId = null,
        CancellationToken ct = default)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewFinancialReportsPermission, "visualizar relatorios financeiros.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            var res = await _repo.GetMonthlySummaryAsync(start, end, type, costCenterId, categoryId, ct);
            return Ok(res);
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult> UpdateAsync([FromBody] Receivable dto, [FromRoute] int id)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(EditReceivablesPermission, "editar contas a receber.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            await _repo.UpdateAsync(id, dto);

            return Ok();
        }

        [HttpPost("{id}/pay")]
        public async Task<IActionResult> MarkAsReceived(int id, [FromBody] MarkAsReceivedRequest req)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(SettleReceivablesPermission, "baixar contas a receber.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

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
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewFinancialReportsPermission, "visualizar relatorios financeiros.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            var rows = await _repo.GetEntriesByAccountAsync(accountId, start, end, type, costCenterId, categoryId, ct);
            return Ok(rows);
        }

        [HttpGet("cc")]
        public async Task<ActionResult<List<CostCenter>>> GetAll(CancellationToken ct)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewCostCentersPermission, "visualizar centro de custo.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            return Ok(await _repo.GetAllAsync(ct));
        }

        [HttpGet("cc/summary")]
        public async Task<ActionResult<SummaryResponse>> Summary(
            [FromQuery] DateTime start,
            [FromQuery] DateTime end,
            [FromQuery] string type = "all",
            CancellationToken ct = default)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewFinancialReportsPermission, "visualizar relatorios financeiros.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            return Ok(await _repo.GetMonthlySummaryAsync(start, end, type, ct));
        }


        [HttpGet("{costCenterId:int}/entries")]
        public async Task<ActionResult<List<Entry>>> GetEntries(int costCenterId,
                                                                [FromQuery] DateTime start,
                                                                [FromQuery] DateTime end,
                                                                [FromQuery] string type = "all",
                                                                CancellationToken ct = default)

        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewFinancialReportsPermission, "visualizar relatorios financeiros.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            return Ok(await _repo.GetEntriesAsync(costCenterId, start, end, type, ct));
        }



        [HttpPut("{kind}/{id:int}/reclassify")]
        public async Task<IActionResult> Reclassify(
            string kind, int id, [FromBody] ReclassifyRequest body, CancellationToken ct)
        {
            if (!Enum.TryParse<EntryKind>(kind, true, out var ek)) return BadRequest("kind deve ser RECEIVABLE ou PAYABLE");
            if (body.CostCenterId <= 0) return BadRequest("CostCenterId inválido");

            var permissionKey = ek == EntryKind.RECEIVABLE
                ? EditReceivablesPermission
                : EditPayablesPermission;
            var actionDescription = ek == EntryKind.RECEIVABLE
                ? "editar contas a receber."
                : "editar contas a pagar.";
            var authorizationResult = await AuthorizeCurrentUserAsync(permissionKey, actionDescription);
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            await _repo.ReclassifyAsync(ek, id, body, ct);
            return NoContent();
        }

        [HttpGet("accounts")]
        public async Task<ActionResult<List<AccountOption>>> Get([FromQuery] string? q, CancellationToken ct)
        {
            var authorizationResult = await AuthorizeCurrentUserAsync(ViewAccountingAccountsPermission, "visualizar contas contabeis.");
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            return Ok(await _repo.SearchAsync(q, ct));
        }

        private async Task<ActionResult?> AuthorizeCurrentUserAsync(string permissionKey, string actionDescription)
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Usuario autenticado nao identificado." });
            }

            try
            {
                var hasPermission = await _permissionService.UserHasPermissionAsync(currentUserId.Value, permissionKey);
                if (!hasPermission)
                {
                    return StatusCode(403, new { message = $"Usuario sem permissao para {actionDescription}" });
                }
            }
            catch (KeyNotFoundException)
            {
                return Unauthorized(new { message = "Usuario autenticado nao encontrado." });
            }

            return null;
        }

        private long? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return long.TryParse(userIdClaim, out var userId) && userId > 0
                ? userId
                : null;
        }
    }
}
