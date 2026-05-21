using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeadsController : ControllerBase
    {
        private const string ViewAllSchedulesPermission = "sistema.admin.total";
        private const string EditLeadPermission = "atendimento.leads.editar";
        private readonly ILeadService _leadService;
        private readonly IPermissionService _permissionService;

        public LeadsController(ILeadService leadService, IPermissionService permissionService)
        {
            _leadService = leadService;
            _permissionService = permissionService;
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
            [FromQuery] string? finishAt,
            [FromQuery] string? tipoAgenda)
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Usuario autenticado nao identificado." });
            }

            bool canViewAll;
            try
            {
                canViewAll = await _permissionService.UserHasPermissionAsync(
                    currentUserId.Value,
                    ViewAllSchedulesPermission);
            }
            catch (KeyNotFoundException)
            {
                return Unauthorized(new { message = "Usuario autenticado nao encontrado." });
            }

            return Ok(await _leadService.ListScheduleAsync(
                q, vendedorId, status, compareceu, virouVenda, startAt, finishAt, tipoAgenda,
                currentUserId.Value,
                canViewAll
            ));
        }

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

        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> UpdateLeadStatus(int id, [FromBody] UpdateLeadStatusRequest request)
        {
            var authorizationResult = await AuthorizeCurrentUserForLeadEditAsync();
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                var updated = await _leadService.UpdateLeadStatusAsync(id, request?.Status ?? string.Empty, GetCurrentUserDisplayName());
                if (!updated)
                {
                    return NotFound(new { message = "Lead nao encontrado." });
                }

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id:int}/etapa-atendimento")]
        public async Task<IActionResult> UpdateLeadEtapaAtendimento(int id, [FromBody] UpdateLeadEtapaAtendimentoRequest request)
        {
            var authorizationResult = await AuthorizeCurrentUserForLeadEditAsync();
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            try
            {
                var updated = await _leadService.UpdateLeadEtapaAtendimentoAsync(
                    id,
                    request?.EtapaAtendimento ?? string.Empty,
                    GetCurrentUserDisplayName());

                if (!updated)
                {
                    return NotFound(new { message = "Lead nao encontrado." });
                }

                return Ok();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteLead(Lead lead)
        {
            await _leadService.DeleteLeadAsync(lead);
            return Ok();
        }

        private long? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return long.TryParse(userIdClaim, out var userId) && userId > 0
                ? userId
                : null;
        }

        private string? GetCurrentUserDisplayName()
            => User.FindFirst(ClaimTypes.Email)?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        private async Task<IActionResult?> AuthorizeCurrentUserForLeadEditAsync()
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Usuario autenticado nao identificado." });
            }

            try
            {
                var hasPermission = await _permissionService.UserHasPermissionAsync(
                    currentUserId.Value,
                    EditLeadPermission);

                if (!hasPermission)
                {
                    return StatusCode(403, new { message = "Usuario sem permissao para editar leads." });
                }
            }
            catch (KeyNotFoundException)
            {
                return Unauthorized(new { message = "Usuario autenticado nao encontrado." });
            }

            return null;
        }
    }
}
