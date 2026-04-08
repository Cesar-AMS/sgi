using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public sealed class PropostasController : ControllerBase
{
    private readonly IProposalService _svc;

    public PropostasController(IProposalService svc) => _svc = svc;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PropostaReservaDto dto, CancellationToken ct)
    {
        if (dto is null)
        {
            return BadRequest("Payload inválido.");
        }

        var id = await _svc.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? de, [FromQuery] string? ate, [FromQuery] string? status, [FromQuery] int? user, int? gerente, int? corretor, CancellationToken ct)
    {
        DateTime? dtDe = string.IsNullOrWhiteSpace(de) ? null : DateTime.Parse(de);
        DateTime? dtAte = string.IsNullOrWhiteSpace(ate) ? null : DateTime.Parse(ate);

        if (dtAte.HasValue)
        {
            dtAte = dtAte.Value.Date.AddDays(1);
        }

        var list = await _svc.ListAsync(dtDe, dtAte, status, user, gerente, corretor, ct);
        return Ok(list);
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById([FromRoute] long id, CancellationToken ct)
    {
        var proposta = await _svc.GetByIdAsync(id, ct);
        return proposta is null ? NotFound() : Ok(proposta);
    }

    [HttpPost("{id:long}/enviar-para-analise")]
    public async Task<IActionResult> EnviarParaAnalise([FromRoute] long id, CancellationToken ct)
    {
        var result = await _svc.EnviarParaAnaliseAsync(id, ct);
        if (result.Error == "NOT_FOUND")
        {
            return NotFound(new { message = "Proposta não encontrada" });
        }

        if (!result.Success)
        {
            return BadRequest(new { message = "Apenas propostas em rascunho podem ser enviadas para análise", status = result.Proposal?.Status });
        }

        return Ok(new { message = "Proposta enviada para análise com sucesso", status = result.Proposal!.Status });
    }

    [HttpPatch("{id:long}/aprovar")]
    public async Task<IActionResult> Aprovar([FromRoute] long id, CancellationToken ct)
    {
        var result = await _svc.AprovarAsync(id, ct);
        if (result.Error == "NOT_FOUND")
        {
            return NotFound(new { message = "Proposta não encontrada" });
        }

        if (!result.Success)
        {
            return BadRequest(new { message = "Apenas propostas em análise podem ser aprovadas", status = result.Proposal?.Status });
        }

        return Ok(new { message = "Proposta aprovada com sucesso", status = result.Proposal!.Status });
    }

    [HttpPost("{id:long}/reprovar")]
    public async Task<IActionResult> ReprovarProposta([FromRoute] long id, CancellationToken ct)
    {
        var result = await _svc.ReprovarAsync(id, ct);
        if (result.Error == "NOT_FOUND")
        {
            return NotFound(new { message = "Proposta não encontrada" });
        }

        if (!result.Success)
        {
            return BadRequest(new { message = "Apenas propostas em análise podem ser reprovadas", status = result.Proposal?.Status });
        }

        return Ok(new { message = "Proposta reprovada com sucesso", status = result.Proposal!.Status });
    }
}
