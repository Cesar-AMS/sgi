using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/external-collaborator-details")]
    public class ExternalCollaboratorDetailsController : ControllerBase
    {
        private readonly IExternalCollaboratorDetailsService _service;

        public ExternalCollaboratorDetailsController(IExternalCollaboratorDetailsService service)
        {
            _service = service;
        }

        [HttpGet("user/{userId:long}")]
        public async Task<IActionResult> GetByUserId([FromRoute] long userId)
        {
            try
            {
                var details = await _service.GetByUserIdAsync(userId);
                return details is null
                    ? NotFound(new { message = "Dados de colaborador externo nao encontrados para este usuario." })
                    : Ok(details);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("user/{userId:long}")]
        public async Task<IActionResult> UpsertByUserId([FromRoute] long userId, [FromBody] ExternalCollaboratorDetails details)
        {
            try
            {
                var saved = await _service.UpsertByUserIdAsync(userId, details);
                return Ok(new { message = "Dados do colaborador externo salvos com sucesso.", data = saved });
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

        [HttpPost("user/{userId:long}/contract")]
        public async Task<IActionResult> UploadContract([FromRoute] long userId, [FromForm] IFormFile file)
        {
            try
            {
                var saved = await _service.SaveContractAsync(userId, file);
                return Ok(new { message = "Contrato salvo com sucesso.", data = saved });
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

        [HttpGet("user/{userId:long}/contract")]
        public async Task<IActionResult> DownloadContract([FromRoute] long userId)
        {
            try
            {
                var contract = await _service.GetContractAsync(userId);
                return contract is null
                    ? NotFound(new { message = "Contrato nao encontrado para este usuario." })
                    : File(contract.Value.Content, contract.Value.ContentType, contract.Value.FileName);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
