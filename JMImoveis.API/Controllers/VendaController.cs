using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VendaController : ControllerBase
    {
        private readonly IVendaCriacaoService _vendaCriacaoService;
        private readonly IVendaConsultaService _vendaConsultaService;
        private readonly IVendaGestaoService _vendaGestaoService;

        public VendaController(
            IVendaCriacaoService vendaCriacaoService,
            IVendaConsultaService vendaConsultaService,
            IVendaGestaoService vendaGestaoService)
        {
            _vendaCriacaoService = vendaCriacaoService;
            _vendaConsultaService = vendaConsultaService;
            _vendaGestaoService = vendaGestaoService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _vendaConsultaService.GetAllAsync());

        [HttpPost("filters")]
        public async Task<IActionResult> GetAllFilters([FromBody] SalesFilters filters)
            => Ok(await _vendaConsultaService.GetAllFiltersAsync(filters));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _vendaConsultaService.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpGet("sales/{id}/full")]
        public async Task<IActionResult> GetFull(int id)
        {
            var result = await _vendaConsultaService.GetFullAsync(id);
            if (result is null) return NotFound();

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(VendasV2 item)
        {
            var id = await _vendaCriacaoService.CreateAsync(item);
            return CreatedAtAction(nameof(GetById), new { id }, item);
        }

        [HttpGet("{id:int}/customers")]
        public async Task<ActionResult<List<int>>> GetCustomers(int id)
        {
            var customerIds = await _vendaConsultaService.GetCustomerIdsBySaleIdAsync(id);
            return Ok(customerIds);
        }

        [HttpGet("{id:int}/parcels")]
        public async Task<ActionResult<List<ParcelDto>>> GetParcels(int id)
        {
            var parcels = await _vendaConsultaService.GetParcelsBySaleIdAsync(id);
            return Ok(parcels);
        }

        [HttpGet("corretor")]
        [ProducesResponseType(typeof(CorretorDashboardResponse), StatusCodes.Status200OK)]
        public async Task<ActionResult<CorretorDashboardResponse>> Get(
            [FromQuery] int? year,
            [FromQuery] int? month,
            [FromQuery] int? managerId,
            CancellationToken ct)
        {
            var (isValid, result) = await _vendaConsultaService.GetDashboardCorretorAsync(year, month, managerId, ct);
            if (!isValid) return BadRequest("ParÃ¢metros invÃ¡lidos.");

            return Ok(result);
        }

        [HttpGet("dashboard")]
        public async Task<ActionResult<DashboardResponse>> Get([FromQuery] int year, [FromQuery] int month, CancellationToken ct)
        {
            var (isValid, result) = await _vendaConsultaService.GetDashboardAsync(year, month, ct);
            if (!isValid)
                return BadRequest("ParÃ¢metros invÃ¡lidos: year e month");

            return Ok(result);
        }

        [HttpPut]
        public async Task<IActionResult> Update(VendasV2 item)
        {
            var updated = await _vendaGestaoService.UpdateAsync(item);
            return updated ? Ok() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _vendaGestaoService.DeleteAsync(id);
            return deleted ? Ok() : NotFound();
        }
    }
}
