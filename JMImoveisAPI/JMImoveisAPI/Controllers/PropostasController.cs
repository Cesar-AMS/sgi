using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public sealed class PropostasController : ControllerBase
{
    private readonly IProposalService _svc;
    public PropostasController(IProposalService svc) => _svc = svc;

    /// <summary>Cria proposta com condições financeiras</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PropostaReservaDto dto, CancellationToken ct)
    {
        if (dto is null) return BadRequest("Payload inválido.");
        var id = await _svc.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    /// <summary>Lista propostas por filtros opcionais ?de=yyyy-MM-dd&ate=yyyy-MM-dd&status=OPEN</summary>
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? de, [FromQuery] string? ate, [FromQuery] string? status, [FromQuery] int? user, int? gerente, int? corretor, CancellationToken ct)
    {
        DateTime? dtDe = string.IsNullOrWhiteSpace(de) ? null : DateTime.Parse(de);
        DateTime? dtAte = string.IsNullOrWhiteSpace(ate) ? null : DateTime.Parse(ate);

        // incluir dia final por completo: se veio só data, somo 1 dia (exclusivo no repo)
        if (dtAte.HasValue) dtAte = dtAte.Value.Date.AddDays(1);

        var list = await _svc.ListAsync(dtDe, dtAte, string.IsNullOrWhiteSpace(status) ? null : status.ToUpperInvariant(), user, gerente, corretor, ct);
        return Ok(list);
    }

    /// <summary>Retorna proposta completa por id (com condições)</summary>
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById([FromRoute] long id, CancellationToken ct)
    {
        var p = await _svc.GetByIdAsync(id, ct);
        return p is null ? NotFound() : Ok(p);
    }
}
