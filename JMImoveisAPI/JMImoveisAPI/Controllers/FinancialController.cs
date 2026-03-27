using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FinancialController : Controller
    {
        private readonly IFinancialService _financialService;

        public FinancialController(IFinancialService financialService)
        {
            _financialService = financialService;
        }

        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<FinancialHistoryItemV2>>> GetHistory(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
        {
            var result = await _financialService.GetFinancialHistoryAsync(from, to);
            return Ok(result);
        }

        [HttpPost("generate/{saleId:long}")]
        public async Task<IActionResult> GenerateForSale(long saleId)
        {
            await _financialService.GenerateAccountsForSaleAsync(saleId);
            return NoContent();
        }

        [HttpPost("sales")]
        public async Task<IActionResult> CreateSale([FromBody] CreateSaleRequest request)
        {
            if (request == null || request.Sale == null)
                return BadRequest("Dados da venda são obrigatórios.");

            var saleId = await _financialService.CreateSaleWithFinancialAsync(request.Sale, request.Parcels, request.CustomerIds);

            return Ok();
        }
    }
}
