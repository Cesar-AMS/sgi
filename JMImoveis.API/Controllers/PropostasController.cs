using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public sealed class PropostasController : ControllerBase
{
    private readonly IProposalService _svc;
    private readonly IUsuarioService _usuarioService;

    public PropostasController(IProposalService svc, IUsuarioService usuarioService)
    {
        _svc = svc;
        _usuarioService = usuarioService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PropostaReservaDto dto, CancellationToken ct)
    {
        if (dto is null)
        {
            return BadRequest("Payload inválido.");
        }

        try
        {
            var id = await _svc.CreateAsync(dto, ct);
            return CreatedAtAction(nameof(GetById), new { id }, new { id });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update([FromRoute] long id, [FromBody] PropostaReservaDto dto, CancellationToken ct)
    {
        if (dto is null)
        {
            return BadRequest("Payload inválido.");
        }

        var updated = await _svc.UpdateAsync(id, dto, ct);
        if (!updated)
        {
            return NotFound(new { message = "Proposta não encontrada" });
        }

        return Ok(new { message = "Proposta atualizada com sucesso" });
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? de, [FromQuery] string? ate, [FromQuery] string? status, [FromQuery] int? user, int? gerente, int? coordenador, int? corretor, int? construtora, int? empreendimento, CancellationToken ct)
    {
        DateTime? dtDe = string.IsNullOrWhiteSpace(de) ? null : DateTime.Parse(de);
        DateTime? dtAte = string.IsNullOrWhiteSpace(ate) ? null : DateTime.Parse(ate);

        if (dtAte.HasValue)
        {
            dtAte = dtAte.Value.Date.AddDays(1);
        }

        var list = await _svc.ListAsync(dtDe, dtAte, status, user, gerente, coordenador, corretor, construtora, empreendimento, ct);
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
        if (!await UsuarioPodeValidarAsync())
        {
            return Forbid();
        }

        var result = await _svc.AprovarAsync(id, ct);
        if (result.Error == "NOT_FOUND")
        {
            return NotFound(new { message = "Proposta não encontrada" });
        }

        if (!result.Success)
        {
            return BadRequest(new
            {
                message = ObterMensagemErroValidacao(result.Error, true),
                error = result.Error,
                status = result.Proposal?.Status
            });
        }

        return Ok(new { message = "Proposta aprovada com sucesso", status = result.Proposal!.Status });
    }

    [HttpPost("{id:long}/reprovar")]
    public async Task<IActionResult> ReprovarProposta([FromRoute] long id, CancellationToken ct)
    {
        if (!await UsuarioPodeValidarAsync())
        {
            return Forbid();
        }

        var result = await _svc.ReprovarAsync(id, ct);
        if (result.Error == "NOT_FOUND")
        {
            return NotFound(new { message = "Proposta não encontrada" });
        }

        if (!result.Success)
        {
            return BadRequest(new
            {
                message = ObterMensagemErroValidacao(result.Error, false),
                error = result.Error,
                status = result.Proposal?.Status
            });
        }

        return Ok(new { message = "Proposta reprovada com sucesso", status = result.Proposal!.Status });
    }

    private static string ObterMensagemErroValidacao(string? error, bool aprovacao)
    {
        return error switch
        {
            "INVALID_STATUS" => aprovacao
                ? "Apenas propostas em análise ou reprovadas podem ser aprovadas"
                : "Apenas propostas em análise ou aprovadas podem ser reprovadas",
            "UNIT_STATUS_UPDATE_FAILED" => aprovacao
                ? "Não foi possível atualizar a unidade para vendida"
                : "Não foi possível liberar a unidade novamente",
            _ => aprovacao
                ? "Erro ao aprovar proposta"
                : "Erro ao reprovar proposta"
        };
    }

    private async Task<bool> UsuarioPodeValidarAsync()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return false;
        }

        var user = await _usuarioService.GetByIdAsync(userId);
        return user?.JobpositionId?.Any(id => id == 3 || id == 11) == true;
    }
}
