using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepository _repo;
        public CategoriesController(ICategoryRepository repo) => _repo = repo;

        [HttpGet] public async Task<ActionResult> All([FromQuery] bool onlyActive = false) => Ok(await _repo.GetAllAsync(onlyActive));
        [HttpGet("{id:int}")] public async Task<ActionResult> Get(int id) => (await _repo.GetAsync(id)) is { } x ? Ok(x) : NotFound();
        [HttpPost] public async Task<ActionResult> Create([FromBody] Category dto) { var id = await _repo.CreateAsync(dto); return CreatedAtAction(nameof(Get), new { id }, new { id }); }
        [HttpPut("{id:int}")] public async Task<ActionResult> Update(int id, [FromBody] Category dto) => await _repo.UpdateAsync(id, dto) ? NoContent() : NotFound();
        [HttpPatch("{id:int}/status")] public async Task<ActionResult> Status(int id, [FromQuery] bool status) => await _repo.SetStatusAsync(id, status) ? NoContent() : NotFound();
        [HttpDelete("{id:int}")] public async Task<ActionResult> Delete(int id) => await _repo.DeleteAsync(id) ? NoContent() : NotFound();

    }
}
