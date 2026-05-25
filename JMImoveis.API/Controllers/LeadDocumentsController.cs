using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/Leads/{leadId:int}/documents")]
    public class LeadDocumentsController : ControllerBase
    {
        private const string EditLeadPermission = "atendimento.leads.editar";

        private readonly ILeadDocumentService _service;
        private readonly IPermissionService _permissionService;

        public LeadDocumentsController(
            ILeadDocumentService service,
            IPermissionService permissionService)
        {
            _service = service;
            _permissionService = permissionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetByLeadId([FromRoute] int leadId)
        {
            if (!GetCurrentUserId().HasValue)
            {
                return Unauthorized(new { message = "Usuario autenticado nao identificado." });
            }

            try
            {
                return Ok(await _service.GetByLeadIdAsync(leadId));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Upload([FromRoute] int leadId, [FromForm] List<IFormFile> files)
        {
            var authorizationResult = await AuthorizeCurrentUserForLeadEditAsync();
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Usuario autenticado nao identificado." });
            }

            try
            {
                var documents = await _service.UploadAsync(leadId, files, currentUserId.Value);
                return Ok(new { message = "Documento salvo com sucesso.", data = documents });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("{documentId:long}")]
        public async Task<IActionResult> Update(
            [FromRoute] int leadId,
            [FromRoute] long documentId,
            [FromBody] UpdateLeadDocumentRequest request)
        {
            var authorizationResult = await AuthorizeCurrentUserForLeadEditAsync();
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            if (!GetCurrentUserId().HasValue)
            {
                return Unauthorized(new { message = "Usuario autenticado nao identificado." });
            }

            try
            {
                return Ok(await _service.UpdateAsync(leadId, documentId, request));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{documentId:long}/download")]
        public async Task<IActionResult> Download([FromRoute] int leadId, [FromRoute] long documentId)
        {
            if (!GetCurrentUserId().HasValue)
            {
                return Unauthorized(new { message = "Usuario autenticado nao identificado." });
            }

            try
            {
                var document = await _service.DownloadAsync(leadId, documentId);
                return document is null
                    ? NotFound(new { message = "Documento nao encontrado." })
                    : File(document.Value.Content, document.Value.ContentType, document.Value.FileName);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{documentId:long}")]
        public async Task<IActionResult> Delete([FromRoute] int leadId, [FromRoute] long documentId)
        {
            var authorizationResult = await AuthorizeCurrentUserForLeadEditAsync();
            if (authorizationResult != null)
            {
                return authorizationResult;
            }

            if (!GetCurrentUserId().HasValue)
            {
                return Unauthorized(new { message = "Usuario autenticado nao identificado." });
            }

            try
            {
                var deleted = await _service.DeleteAsync(leadId, documentId);
                return deleted
                    ? Ok(new { message = "Documento excluido com sucesso." })
                    : NotFound(new { message = "Documento nao encontrado." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        private async Task<IActionResult?> AuthorizeCurrentUserForLeadEditAsync()
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Usuario autenticado nao identificado." });
            }

            var hasPermission = await _permissionService.UserHasPermissionAsync(
                currentUserId.Value,
                EditLeadPermission
            );

            return hasPermission ? null : Forbid();
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
