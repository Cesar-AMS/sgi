using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/constructor-transfers")]
    public class ConstructorTransferController : ControllerBase
    {
        private readonly IConstructorTransferService _constructorTransferService;

        public ConstructorTransferController(IConstructorTransferService constructorTransferService)
        {
            _constructorTransferService = constructorTransferService;
        }

        [HttpGet("sale/{saleId}")]
        public async Task<IActionResult> GetBySaleId(int saleId)
        {
            try
            {
                var result = await _constructorTransferService.GetBySaleIdAsync(saleId);
                return result == null ? NotFound() : Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(ConstructorTransfer item)
        {
            try
            {
                var saved = await _constructorTransferService.CreateAsync(item);
                return CreatedAtAction(nameof(GetBySaleId), new { saleId = saved.SaleId }, saved);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut]
        public async Task<IActionResult> Update(ConstructorTransfer item)
        {
            try
            {
                var updated = await _constructorTransferService.UpdateAsync(item);
                return updated ? Ok() : NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
