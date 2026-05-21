using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AtendimentoController : ControllerBase
    {
        private const string ReportsPermission = "atendimento.relatorios.visualizar";
        private const string ViewAllPermission = "sistema.admin.total";

        private readonly IAtendimentoRelatorioService _service;
        private readonly IPermissionService _permissionService;

        public AtendimentoController(
            IAtendimentoRelatorioService service,
            IPermissionService permissionService)
        {
            _service = service;
            _permissionService = permissionService;
        }

        [HttpGet("relatorios/resumo")]
        public async Task<IActionResult> GetResumo(
            [FromQuery] DateTime? startAt,
            [FromQuery] DateTime? finishAt,
            [FromQuery] int? vendedorId,
            [FromQuery] int? coordenadorId,
            [FromQuery] int? gerenteId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!long.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized(new { message = "Usuario autenticado nao identificado." });
            }

            var canViewAll = await _permissionService.UserHasPermissionAsync(
                currentUserId,
                ViewAllPermission);

            var canViewReports = await _permissionService.UserHasPermissionAsync(
                currentUserId,
                ReportsPermission);

            if (!canViewAll && !canViewReports)
            {
                return Forbid();
            }

            var result = await _service.GetResumoAsync(
                startAt,
                finishAt,
                vendedorId,
                coordenadorId,
                gerenteId,
                currentUserId,
                canViewAll);

            return Ok(result);
        }
    }
}