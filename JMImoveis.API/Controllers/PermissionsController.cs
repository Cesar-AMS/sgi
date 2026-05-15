using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JMImoveisAPI.Controllers
{
    [ApiController]
    [Route("api/permissions")]
    public class PermissionsController : ControllerBase
    {
        private const string ManageAccessPermission = "administracao.perfis_acessos.editar";

        private readonly IPermissionService _permissionService;

        public PermissionsController(IPermissionService permissionService)
        {
            _permissionService = permissionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _permissionService.GetAllPermissionsAsync());
        }

        [HttpGet("roles/{roleId:long}")]
        public async Task<IActionResult> GetRolePermissions(long roleId)
        {
            try
            {
                return Ok(await _permissionService.GetRolePermissionsAsync(roleId));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("roles/{roleId:long}")]
        public async Task<IActionResult> ReplaceRolePermissions(
            long roleId,
            [FromBody] ReplaceRolePermissionsRequest? request)
        {
            try
            {
                var authorizationResult = await AuthorizeCurrentUserForManageAccessAsync();
                if (authorizationResult != null)
                {
                    return authorizationResult;
                }

                await _permissionService.ReplaceRolePermissionsAsync(
                    roleId,
                    request?.PermissionIds ?? new List<long>());

                return Ok(new { message = "Permissoes do perfil atualizadas com sucesso." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("users/{userId:long}/overrides")]
        public async Task<IActionResult> GetUserOverrides(long userId)
        {
            try
            {
                return Ok(await _permissionService.GetUserOverridesAsync(userId));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("users/{userId:long}/overrides")]
        public async Task<IActionResult> ReplaceUserOverrides(
            long userId,
            [FromBody] ReplaceUserOverridesRequest? request)
        {
            try
            {
                var authorizationResult = await AuthorizeCurrentUserForManageAccessAsync();
                if (authorizationResult != null)
                {
                    return authorizationResult;
                }

                var overrides = (request?.Overrides ?? new List<UserPermissionOverrideRequest>())
                    .Select(item => new UserPermissionOverride
                    {
                        UserId = userId,
                        PermissionId = item.PermissionId,
                        Effect = item.Effect
                    });

                await _permissionService.ReplaceUserOverridesAsync(userId, overrides);

                return Ok(new { message = "Excecoes de permissao do usuario atualizadas com sucesso." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("users/{userId:long}/effective")]
        public async Task<IActionResult> GetEffectiveUserPermissions(long userId)
        {
            try
            {
                return Ok(await _permissionService.GetEffectiveUserPermissionsAsync(userId));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private async Task<IActionResult?> AuthorizeCurrentUserForManageAccessAsync()
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
            {
                return Unauthorized(new { message = "Usuario autenticado nao identificado." });
            }

            try
            {
                var hasPermission = await _permissionService.UserHasPermissionAsync(
                    currentUserId.Value,
                    ManageAccessPermission);

                if (!hasPermission)
                {
                    return StatusCode(403, new { message = "Usuario sem permissao para alterar perfis e acessos." });
                }
            }
            catch (KeyNotFoundException)
            {
                return Unauthorized(new { message = "Usuario autenticado nao encontrado." });
            }

            return null;
        }

        private long? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return long.TryParse(userIdClaim, out var userId) && userId > 0
                ? userId
                : null;
        }
    }

    public class ReplaceRolePermissionsRequest
    {
        public List<long>? PermissionIds { get; set; }
    }

    public class ReplaceUserOverridesRequest
    {
        public List<UserPermissionOverrideRequest>? Overrides { get; set; }
    }

    public class UserPermissionOverrideRequest
    {
        public long PermissionId { get; set; }
        public string Effect { get; set; } = string.Empty;
    }
}
