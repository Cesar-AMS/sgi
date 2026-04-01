using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/credit-analysis")]
    public class CreditAnalysisController : ControllerBase
    {
        private readonly ICreditAnalysisService _creditAnalysisService;

        public CreditAnalysisController(ICreditAnalysisService creditAnalysisService)
        {
            _creditAnalysisService = creditAnalysisService;
        }

        [HttpGet("sale/{saleId}")]
        public async Task<IActionResult> GetBySaleId(int saleId)
        {
            try
            {
                var result = await _creditAnalysisService.GetBySaleIdAsync(saleId);
                return result == null ? NotFound() : Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreditAnalysis item)
        {
            try
            {
                var saved = await _creditAnalysisService.CreateAsync(item);
                return CreatedAtAction(nameof(GetBySaleId), new { saleId = saved.SaleId }, saved);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut]
        public async Task<IActionResult> Update(CreditAnalysis item)
        {
            try
            {
                var updated = await _creditAnalysisService.UpdateAsync(item);
                return updated ? Ok() : NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
