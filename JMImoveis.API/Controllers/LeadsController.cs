using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeadsController : ControllerBase
    {
        private readonly ILeadService _leadService;

        public LeadsController(ILeadService leadService)
        {
            _leadService = leadService;
        }

        [HttpGet("{leadId}/schedules")]
        public async Task<IActionResult> GetLeadsSchedulesById(int leadId, [FromQuery] string typeSchedule)
            => Ok(await _leadService.GetSchedulesByLeadIdAsync(leadId, typeSchedule));

        [HttpPost("{leadId}/schedules")]
        public async Task<IActionResult> CreateLeadsActivitiesById(CreateLeadScheduleRequest lead)
            => Ok(await _leadService.CreateScheduleAsync(lead));

        [HttpPost("schedule")]
        public async Task<IActionResult> Create([FromBody] LeadScheduleRequest request)
        {
            var (isValid, errorMessage) = await _leadService.CreateScheduleAsync(request, 0);
            if (!isValid) return BadRequest(errorMessage);

            return Ok();
        }

        [HttpPost("{leadId}/schedule/v2")]
        public async Task<IActionResult> CreateV2([FromBody] LeadScheduleRequest request, int leadId)
        {
            var (isValid, errorMessage) = await _leadService.CreateScheduleAsync(request, leadId);
            if (!isValid) return BadRequest(errorMessage);

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
            [FromQuery] string? finishAt)
            => Ok(await _leadService.ListScheduleAsync(
                q, vendedorId, status, compareceu, virouVenda, startAt, finishAt
            ));

        [HttpPut("{leadId}/schedules/{scheduleId}/status")]
        public async Task<IActionResult> UpdateStatus(
            int leadId,
            int scheduleId,
            [FromBody] UpdateLeadScheduleStatusRequest request)
        {
            await _leadService.UpdateScheduleStatusAsync(leadId, scheduleId, request);
            return NoContent();
        }

        [HttpPut("schedule/{id:int}")]
        public async Task<IActionResult> UpdateSchedule(int id, [FromBody] VisitaPatchRequest patch)
        {
            var ok = await _leadService.UpdateScheduleAsync(id, patch);
            if (!ok) return BadRequest("Nada para atualizar.");

            return Ok();
        }

        [HttpGet("{leadId}/activities")]
        public async Task<IActionResult> GetLeadsActivitiesById(int leadId)
            => Ok(await _leadService.GetActivitiesByLeadIdAsync(leadId));

        [HttpPost("{leadId}/activities")]
        public async Task<IActionResult> CreateLeadsActivitiesById(CreateLeadActivityRequest lead)
            => Ok(await _leadService.CreateActivityAsync(lead));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
            => Ok(await _leadService.GetByIdAsync(id));

        [HttpPost("report")]
        public async Task<IActionResult> GetReportLead(LeadFilter filter)
            => Ok(await _leadService.GetAllByFiltersAsync(filter));

        [HttpPost]
        public async Task<IActionResult> CreateLead(Lead lead)
        {
            await _leadService.CreateLeadAsync(lead);
            return Ok();
        }

        [HttpPatch]
        public async Task<IActionResult> UpdateLead(Lead lead)
        {
            await _leadService.UpdateLeadAsync(lead);
            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteLead(Lead lead)
        {
            await _leadService.DeleteLeadAsync(lead);
            return Ok();
        }
    }
}
