using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class LeadTransferHistoryService : ILeadTransferHistoryService
    {
        private readonly ILeadTransferHistoryRepository _repository;

        public LeadTransferHistoryService(ILeadTransferHistoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<LeadTransferHistory>> GetByLeadIdAsync(int leadId)
        {
            if (leadId <= 0)
            {
                throw new ArgumentException("Lead invalido.");
            }

            if (!await _repository.LeadExistsAsync(leadId))
            {
                throw new KeyNotFoundException("Lead nao encontrado.");
            }

            return await _repository.GetByLeadIdAsync(leadId);
        }

        public async Task RegisterIfResponsibleChangedAsync(Lead previousLead, Lead updatedLead, long? changedByUserId)
        {
            if (previousLead == null || updatedLead == null || previousLead.Id <= 0)
            {
                return;
            }

            var sellerChanged = HasChanged(previousLead.Vendedor, updatedLead.Vendedor);
            var coordinatorChanged = HasChanged(previousLead.Coordenador, updatedLead.Coordenador);
            var managerChanged = HasChanged(previousLead.Gerente, updatedLead.Gerente);

            if (!sellerChanged && !coordinatorChanged && !managerChanged)
            {
                return;
            }

            var history = new LeadTransferHistory
            {
                LeadId = previousLead.Id,
                PreviousSellerId = ParseNullableId(previousLead.Vendedor),
                PreviousSellerLabel = ParseNullableLabel(previousLead.Vendedor),
                NewSellerId = ParseNullableId(updatedLead.Vendedor),
                NewSellerLabel = ParseNullableLabel(updatedLead.Vendedor),
                PreviousCoordinatorId = ParseNullableId(previousLead.Coordenador),
                PreviousCoordinatorLabel = ParseNullableLabel(previousLead.Coordenador),
                NewCoordinatorId = ParseNullableId(updatedLead.Coordenador),
                NewCoordinatorLabel = ParseNullableLabel(updatedLead.Coordenador),
                PreviousManagerId = ParseNullableId(previousLead.Gerente),
                PreviousManagerLabel = ParseNullableLabel(previousLead.Gerente),
                NewManagerId = ParseNullableId(updatedLead.Gerente),
                NewManagerLabel = ParseNullableLabel(updatedLead.Gerente),
                ChangedByUserId = changedByUserId,
                ChangeReason = "Responsaveis do lead atualizados."
            };

            await _repository.CreateAsync(history);
        }

        private static bool HasChanged(string? previousValue, string? newValue)
            => !string.Equals(NormalizeResponsibleValue(previousValue), NormalizeResponsibleValue(newValue), StringComparison.OrdinalIgnoreCase);

        private static string NormalizeResponsibleValue(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }

            var trimmed = value.Trim();
            return long.TryParse(trimmed, out var id)
                ? id.ToString()
                : trimmed;
        }

        private static long? ParseNullableId(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            return long.TryParse(value.Trim(), out var id) && id > 0
                ? id
                : null;
        }

        private static string? ParseNullableLabel(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            var trimmed = value.Trim();
            return long.TryParse(trimmed, out _)
                ? null
                : trimmed;
        }
    }
}
