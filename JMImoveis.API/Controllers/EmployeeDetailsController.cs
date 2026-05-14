using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/employee-details")]
    public class EmployeeDetailsController : ControllerBase
    {
        private readonly IEmployeeDetailsService _service;

        public EmployeeDetailsController(IEmployeeDetailsService service)
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
                    ? NotFound(new { message = "Dados admissionais nao encontrados para este usuario." })
                    : Ok(details);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EmployeeDetails details)
        {
            try
            {
                var saved = await _service.CreateAsync(details);
                return Ok(new { message = "Dados admissionais salvos com sucesso.", data = saved });
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

        [HttpPut("user/{userId:long}")]
        public async Task<IActionResult> UpsertByUserId([FromRoute] long userId, [FromBody] EmployeeDetails details)
        {
            try
            {
                var saved = await _service.UpsertByUserIdAsync(userId, details);
                return Ok(new { message = "Dados admissionais salvos com sucesso.", data = saved });
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
    }
}
