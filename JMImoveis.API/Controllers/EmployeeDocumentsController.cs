using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/employee-documents")]
    public class EmployeeDocumentsController : ControllerBase
    {
        private readonly IEmployeeDocumentService _service;

        public EmployeeDocumentsController(IEmployeeDocumentService service)
        {
            _service = service;
        }

        [HttpGet("user/{userId:long}")]
        public async Task<IActionResult> GetByUserId([FromRoute] long userId)
        {
            try
            {
                return Ok(await _service.GetByUserIdAsync(userId));
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

        [HttpPost("user/{userId:long}")]
        public async Task<IActionResult> Upload(
            [FromRoute] long userId,
            [FromForm] IFormFile file,
            [FromForm] string? documentType,
            [FromForm] string? documentLabel,
            [FromForm] string? notes)
        {
            try
            {
                var document = await _service.UploadAsync(userId, file, documentType, documentLabel, notes);
                return Ok(new { message = "Documento salvo com sucesso.", data = document });
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

        [HttpGet("{id:long}/download")]
        public async Task<IActionResult> Download([FromRoute] long id)
        {
            try
            {
                var document = await _service.DownloadAsync(id);
                return document is null
                    ? NotFound(new { message = "Documento nao encontrado." })
                    : File(document.Value.Content, document.Value.ContentType, document.Value.FileName);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete([FromRoute] long id)
        {
            try
            {
                var deleted = await _service.DeleteAsync(id);
                return deleted
                    ? Ok(new { message = "Documento excluido com sucesso." })
                    : NotFound(new { message = "Documento nao encontrado." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
