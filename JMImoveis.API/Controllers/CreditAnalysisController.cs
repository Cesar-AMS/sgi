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
            var result = await _creditAnalysisService.GetBySaleIdAsync(saleId);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreditAnalysis item)
        {
            var id = await _creditAnalysisService.CreateAsync(item);
            item.Id = id;
            return CreatedAtAction(nameof(GetBySaleId), new { saleId = item.SaleId }, item);
        }

        [HttpPut]
        public async Task<IActionResult> Update(CreditAnalysis item)
        {
            var updated = await _creditAnalysisService.UpdateAsync(item);
            return updated ? Ok() : NotFound();
        }
    }
}
