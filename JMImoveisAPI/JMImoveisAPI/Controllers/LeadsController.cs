using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeadsController : ControllerBase
    {
        private readonly ILeadRepository _leadRepository;

        public LeadsController(ILeadRepository leadRepository)
        {
            _leadRepository = leadRepository;
        }

        [HttpGet("{leadId}/schedules")]
        public async Task<IActionResult> GetLeadsSchedulesById(int leadId, [FromQuery] string typeSchedule) => Ok(await _leadRepository.GetSchedulesByLeadId(leadId, typeSchedule));

        [HttpPost("{leadId}/schedules")]
        public async Task<IActionResult> CreateLeadsActivitiesById(CreateLeadScheduleRequest lead) => Ok(await _leadRepository.CreateSchedule(lead));

     
        [HttpPost("schedule")]
        public async Task<IActionResult> Create([FromBody] LeadScheduleRequest request)
        {
            if (request == null) return BadRequest("Body inválido.");

            if (string.IsNullOrWhiteSpace(request.NomeCliente))
                return BadRequest("nomeCliente é obrigatório.");

            if (string.IsNullOrWhiteSpace(request.Status))
                return BadRequest("status é obrigatório.");

            if (request.VendedorId <= 0)
                return BadRequest("vendedorId inválido.");

            var newId = await _leadRepository.InsertAsync(request, 0);

            return Ok();
        }

        [HttpPost("{leadId}/schedule/v2")]
        public async Task<IActionResult> CreateV2([FromBody] LeadScheduleRequest request, int leadId)
        {
            if (request == null) return BadRequest("Body inválido.");

            if (string.IsNullOrWhiteSpace(request.NomeCliente))
                return BadRequest("nomeCliente é obrigatório.");

            if (string.IsNullOrWhiteSpace(request.Status))
                return BadRequest("status é obrigatório.");

            if (request.VendedorId <= 0)
                return BadRequest("vendedorId inválido.");

            var newId = await _leadRepository.InsertAsync(request, leadId);

            return Ok();
        }

        [HttpGet("schedule")]
        public async Task<IActionResult> ListSchedule(
        [FromQuery] string? q,
        [FromQuery] int? vendedorId,
        [FromQuery] string? status,
        [FromQuery] bool? compareceu,
        [FromQuery] bool? virouVenda,
        [FromQuery] string? startAt,
        [FromQuery] string? finishAt
    )
        {
            DateTime? start = TryParseIsoDate(startAt);
            DateTime? finish = TryParseIsoDate(finishAt);

            var result = await _leadRepository.ListScheduleAsync(
                q, vendedorId, status, compareceu, virouVenda, start, finish
            );

            return Ok(result);
        }

        private static DateTime? TryParseIsoDate(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;

              if (DateTimeOffset.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var dto))
                return dto.LocalDateTime;

            if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt))
                return dt;

            return null;
        }

        [HttpPut("{leadId}/schedules/{scheduleId}/status")]
        public async Task<IActionResult> UpdateStatus(
        int leadId,
        int scheduleId,
        [FromBody] UpdateLeadScheduleStatusRequest request
    )
        {
            await _leadRepository.UpdateStatus(leadId, scheduleId, request.Status);
            return NoContent();
        }

        [HttpPut("schedule/{id:int}")]
        public async Task<IActionResult> UpdateSchedule(int id, [FromBody] VisitaPatchRequest patch)
        {
                var ok = await _leadRepository.UpdateScheduleAsync(id, patch);
            if (!ok) return BadRequest("Nada para atualizar.");

            return Ok();
        }

        [HttpGet("{leadId}/activities")]
        public async Task<IActionResult> GetLeadsActivitiesById(int leadId) => Ok(await _leadRepository.GetActivitiesByLeadId(leadId));

        [HttpPost("{leadId}/activities")]
        public async Task<IActionResult> CreateLeadsActivitiesById(CreateLeadActivityRequest lead) => Ok(await _leadRepository.CreateActivity(lead));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id) => Ok(await _leadRepository.GetLeadById(id));

        [HttpPost("report")]
        public async Task<IActionResult> GetReportLead(LeadFilter filter)
        {
            var report = await _leadRepository.GetAllByFilters(filter);

            return Ok(report);
        }

        [HttpPost]
        public async Task<IActionResult> CreateLead(Lead lead)
        {
            await _leadRepository.CreateLead(lead);

            return Ok();
        }

        [HttpPatch]
        public async Task<IActionResult> UpdateLead(Lead lead)
        {
            await _leadRepository.UpdateLead(lead);

            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteLead(Lead lead)
        {
            await _leadRepository.DeleteLead(lead);

            return Ok();
        }
    }
}
