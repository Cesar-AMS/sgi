using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JMImoveisAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountPlainsController : ControllerBase { 

        private readonly IAccountPlainRepository _repo;
        public AccountPlainsController(IAccountPlainRepository repo) => _repo = repo;
        [HttpGet] public async Task<ActionResult> All() => Ok(await _repo.GetAllAsync());
        [HttpGet("{id:int}")] public async Task<ActionResult> Get(int id) => (await _repo.GetAsync(id)) is { } x ? Ok(x) : NotFound();
        [HttpPost] public async Task<ActionResult> Create([FromBody] AccountPlain dto) { var id = await _repo.CreateAsync(dto); return CreatedAtAction(nameof(Get), new { id }, new { id }); }
        [HttpPut("{id:int}")] public async Task<ActionResult> Update(int id, [FromBody] AccountPlain dto) => await _repo.UpdateAsync(id, dto) ? NoContent() : NotFound();
        [HttpDelete("{id:int}")] public async Task<ActionResult> Delete(int id) => await _repo.DeleteAsync(id) ? NoContent() : NotFound();
    }
}
