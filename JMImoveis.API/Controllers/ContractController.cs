using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/contracts")]
    public class ContractController : ControllerBase
    {
        private readonly IContractService _contractService;

        public ContractController(IContractService contractService)
        {
            _contractService = contractService;
        }

        [HttpGet("sale/{saleId}")]
        public async Task<IActionResult> GetBySaleId(int saleId)
        {
            try
            {
                var result = await _contractService.GetBySaleIdAsync(saleId);
                return result == null ? NotFound() : Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(Contract item)
        {
            try
            {
                var saved = await _contractService.CreateAsync(item);
                return CreatedAtAction(nameof(GetBySaleId), new { saleId = saved.SaleId }, saved);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut]
        public async Task<IActionResult> Update(Contract item)
        {
            try
            {
                var updated = await _contractService.UpdateAsync(item);
                return updated ? Ok() : NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
