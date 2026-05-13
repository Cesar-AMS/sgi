using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/enterprise-commission-rules")]
    public class EnterpriseCommissionRulesController : ControllerBase
    {
        private readonly IEnterpriseCommissionRuleService _service;

        public EnterpriseCommissionRulesController(IEnterpriseCommissionRuleService service)
        {
            _service = service;
        }

        [HttpGet("enterprise/{enterpriseId:long}")]
        public async Task<IActionResult> ListByEnterprise([FromRoute] long enterpriseId)
        {
            try
            {
                return Ok(await _service.ListByEnterpriseAsync(enterpriseId));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("enterprise/{enterpriseId:long}/active")]
        public async Task<IActionResult> ListActiveByEnterprise([FromRoute] long enterpriseId, [FromQuery] string? ruleType)
        {
            try
            {
                return Ok(await _service.ListActiveByEnterpriseAsync(enterpriseId, ruleType));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EnterpriseCommissionRule rule)
        {
            if (rule is null)
            {
                return BadRequest(new { message = "Payload invalido." });
            }

            try
            {
                var saved = await _service.CreateAsync(rule);
                return Ok(saved);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update([FromRoute] long id, [FromBody] EnterpriseCommissionRule rule)
        {
            if (rule is null)
            {
                return BadRequest(new { message = "Payload invalido." });
            }

            try
            {
                var saved = await _service.UpdateAsync(id, rule);
                return saved is null ? NotFound(new { message = "Regra nao encontrada." }) : Ok(saved);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id:long}/deactivate")]
        public async Task<IActionResult> Deactivate([FromRoute] long id)
        {
            try
            {
                var deactivated = await _service.DeactivateAsync(id);
                return deactivated ? Ok(new { message = "Regra desativada com sucesso." }) : NotFound(new { message = "Regra nao encontrada." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
