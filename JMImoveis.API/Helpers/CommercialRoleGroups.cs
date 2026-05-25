using JMImoveisAPI.Entities;

namespace JMImoveisAPI.Helpers
{
    public static class CommercialRoleGroups
    {
        public static readonly int[] SellerLegacyRoleIds = { 2, 4, 9 };
        public static readonly string[] SellerRoleNames =
        {
            "Corretor",
            "Corretor Parceiro",
            "Atendente",
            "Vendedor",
            "Agente",
            "Agente L\u00edder",
            "Agente Lider"
        };

        public static readonly int[] ManagerLegacyRoleIds = { 3 };
        public static readonly string[] ManagerRoleNames =
        {
            "Gerente",
            "Gerente Comercial"
        };

        public static readonly int[] CoordinatorLegacyRoleIds = { 11 };
        public static readonly string[] CoordinatorRoleNames =
        {
            "Coordenador",
            "Coordenador Comercial"
        };

        public static readonly string[] CommercialManagementRoleNames =
        {
            "Gestor",
            "Gestor Comercial",
            "Diretor Comercial"
        };

        public static bool HasManagerRole(Usuario user)
        {
            return HasAnyRole(user, ManagerLegacyRoleIds, ManagerRoleNames);
        }

        private static bool HasAnyRole(Usuario user, IEnumerable<int> legacyRoleIds, IEnumerable<string> roleNames)
        {
            var userRoleIds = user.JobpositionId ?? new List<int>();
            if (userRoleIds.Any(roleId => legacyRoleIds.Contains(roleId)))
            {
                return true;
            }

            var normalizedRoleNames = new HashSet<string>(
                roleNames.Select(NormalizeRoleName),
                StringComparer.OrdinalIgnoreCase);

            return (user.RoleNames ?? new List<string>())
                .Select(NormalizeRoleName)
                .Any(normalizedRoleNames.Contains);
        }

        private static string NormalizeRoleName(string? roleName)
        {
            return (roleName ?? string.Empty).Trim();
        }
    }
}
