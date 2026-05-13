using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class EnterpriseCommissionRuleService : IEnterpriseCommissionRuleService
    {
        private static readonly HashSet<string> AllowedRuleTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "TIPO_1",
            "TIPO_2",
            "TIPO_3",
            "PARCEIRO"
        };

        private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase)
        {
            "GERENTE",
            "COORDENADOR",
            "DIRETOR",
            "GESTOR_COMERCIAL",
            "CORRETOR_PARCEIRO"
        };

        private static readonly HashSet<string> AllowedPaymentModes = new(StringComparer.OrdinalIgnoreCase)
        {
            "FIXED_DAY",
            "CLIENT_PAYMENT_FLOW",
            "MANUAL_ADVANCE"
        };

        private readonly IEnterpriseCommissionRuleRepository _repository;

        public EnterpriseCommissionRuleService(IEnterpriseCommissionRuleRepository repository)
        {
            _repository = repository;
        }

        public Task<IEnumerable<EnterpriseCommissionRule>> ListByEnterpriseAsync(long enterpriseId)
        {
            if (enterpriseId <= 0)
            {
                throw new ArgumentException("enterpriseId invalido.");
            }

            return _repository.ListByEnterpriseAsync(enterpriseId);
        }

        public Task<IEnumerable<EnterpriseCommissionRule>> ListActiveByEnterpriseAsync(long enterpriseId, string? ruleType)
        {
            if (enterpriseId <= 0)
            {
                throw new ArgumentException("enterpriseId invalido.");
            }

            ruleType = NormalizeOptionalRuleType(ruleType);
            return _repository.ListActiveByEnterpriseAsync(enterpriseId, ruleType);
        }

        public async Task<EnterpriseCommissionRule> CreateAsync(EnterpriseCommissionRule rule)
        {
            NormalizeAndValidate(rule, isCreate: true);
            rule.Version = await _repository.GetNextVersionAsync(rule.EnterpriseId, rule.RuleType);

            if (rule.Active)
            {
                await _repository.DeactivateActiveByTypeAsync(rule.EnterpriseId, rule.RuleType);
            }

            var id = await _repository.CreateAsync(rule);
            var saved = await _repository.GetByIdAsync(id);
            if (saved is null)
            {
                throw new InvalidOperationException("Nao foi possivel carregar a regra criada.");
            }

            return saved;
        }

        public async Task<EnterpriseCommissionRule?> UpdateAsync(long id, EnterpriseCommissionRule rule)
        {
            if (id <= 0)
            {
                throw new ArgumentException("id invalido.");
            }

            var existing = await _repository.GetByIdAsync(id);
            if (existing is null)
            {
                return null;
            }

            rule.Id = id;
            rule.EnterpriseId = existing.EnterpriseId;
            rule.RuleType = existing.RuleType;
            rule.Version = existing.Version;

            NormalizeAndValidate(rule, isCreate: false);

            if (rule.Active)
            {
                await _repository.DeactivateActiveByTypeAsync(rule.EnterpriseId, rule.RuleType, id);
            }

            var updated = await _repository.UpdateAsync(rule);
            return updated ? await _repository.GetByIdAsync(id) : null;
        }

        public Task<bool> DeactivateAsync(long id)
        {
            if (id <= 0)
            {
                throw new ArgumentException("id invalido.");
            }

            return _repository.DeactivateAsync(id);
        }

        private static string? NormalizeOptionalRuleType(string? ruleType)
        {
            if (string.IsNullOrWhiteSpace(ruleType))
            {
                return null;
            }

            var normalized = ruleType.Trim().ToUpperInvariant();
            if (!AllowedRuleTypes.Contains(normalized))
            {
                throw new ArgumentException("rule_type invalido.");
            }

            return normalized;
        }

        private static void NormalizeAndValidate(EnterpriseCommissionRule rule, bool isCreate)
        {
            if (rule.EnterpriseId <= 0)
            {
                throw new ArgumentException("enterprise_id invalido.");
            }

            rule.RuleType = NormalizeRequired(rule.RuleType, "rule_type");
            if (!AllowedRuleTypes.Contains(rule.RuleType))
            {
                throw new ArgumentException("rule_type invalido.");
            }

            if (rule.PaymentDay <= 0 || rule.PaymentDay > 31)
            {
                throw new ArgumentException("payment_day deve estar entre 1 e 31.");
            }

            if (rule.AtoThreshold.HasValue && rule.AtoThreshold.Value < 0)
            {
                throw new ArgumentException("ato_threshold nao pode ser negativo.");
            }

            if (rule.EndsAt.HasValue && rule.StartsAt.HasValue && rule.EndsAt.Value < rule.StartsAt.Value)
            {
                throw new ArgumentException("ends_at nao pode ser menor que starts_at.");
            }

            rule.CampaignName = NormalizeNullable(rule.CampaignName);
            rule.Notes = NormalizeNullable(rule.Notes);
            rule.Items ??= new List<EnterpriseCommissionRuleItem>();

            if (isCreate)
            {
                rule.Id = 0;
            }

            foreach (var item in rule.Items)
            {
                NormalizeAndValidateItem(item);
            }
        }

        private static void NormalizeAndValidateItem(EnterpriseCommissionRuleItem item)
        {
            item.Role = NormalizeRequired(item.Role, "role");
            if (!AllowedRoles.Contains(item.Role))
            {
                throw new ArgumentException("role invalido.");
            }

            item.PaymentMode = string.IsNullOrWhiteSpace(item.PaymentMode)
                ? "FIXED_DAY"
                : item.PaymentMode.Trim().ToUpperInvariant();

            if (!AllowedPaymentModes.Contains(item.PaymentMode))
            {
                throw new ArgumentException("payment_mode invalido.");
            }

            if (item.Percentage.HasValue && item.Percentage.Value < 0)
            {
                throw new ArgumentException("percentage nao pode ser negativo.");
            }

            if (item.FixedAmount.HasValue && item.FixedAmount.Value < 0)
            {
                throw new ArgumentException("fixed_amount nao pode ser negativo.");
            }

            if (!item.Percentage.HasValue && !item.FixedAmount.HasValue)
            {
                throw new ArgumentException("Informe percentage ou fixed_amount para cada item.");
            }

            if (item.PaymentDay.HasValue && (item.PaymentDay.Value <= 0 || item.PaymentDay.Value > 31))
            {
                throw new ArgumentException("payment_day do item deve estar entre 1 e 31.");
            }

            item.Id = 0;
            item.RuleId = 0;
        }

        private static string NormalizeRequired(string? value, string field)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new ArgumentException($"{field} obrigatorio.");
            }

            return value.Trim().ToUpperInvariant();
        }

        private static string? NormalizeNullable(string? value)
            => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
