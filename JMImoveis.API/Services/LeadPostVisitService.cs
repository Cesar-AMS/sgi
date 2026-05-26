using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class LeadPostVisitService : ILeadPostVisitService
    {
        private static readonly HashSet<string> ValidStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "AGENDOU_RETORNO",
            "OPORTUNIDADE_FUTURA",
            "ACOMPANHANDO",
            "EM_PROPOSTA",
            "FECHOU_VENDA"
        };

        private static readonly HashSet<string> ValidIncomeTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "CLT",
            "AUTONOMO",
            "OUTRO"
        };

        private static readonly HashSet<string> ValidPropertyInterestTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "PRONTO",
            "PLANTA",
            "AMBOS",
            "INDEFINIDO"
        };

        private readonly ILeadPostVisitRepository _repository;

        public LeadPostVisitService(ILeadPostVisitRepository repository)
        {
            _repository = repository;
        }

        public async Task<LeadPostVisit?> GetByLeadIdAsync(int leadId)
        {
            await EnsureLeadExistsAsync(leadId);
            return await _repository.GetByLeadIdAsync(leadId);
        }

        public async Task<IEnumerable<LeadPostVisitListItem>> ListAsync(
            string? status,
            long? agentId,
            string? search,
            DateTime? followUpFrom,
            DateTime? followUpTo)
        {
            var normalizedStatus = NormalizeOptionalValue(status);
            if (!string.IsNullOrWhiteSpace(normalizedStatus) && !ValidStatuses.Contains(normalizedStatus))
            {
                throw new ArgumentException("Status de pos-visita invalido.");
            }

            return await _repository.ListAsync(normalizedStatus, agentId, search, followUpFrom, followUpTo);
        }

        public async Task<LeadPostVisit> CreateOrGetByLeadIdAsync(int leadId, LeadPostVisitRequest request)
        {
            await EnsureLeadExistsAsync(leadId);

            var existing = await _repository.GetByLeadIdAsync(leadId);
            if (existing != null)
            {
                return existing;
            }

            var entity = BuildEntity(leadId, request);
            var id = await _repository.CreateAsync(entity);
            return await _repository.GetByIdAsync(id)
                ?? throw new InvalidOperationException("Pos-visita criado, mas nao foi possivel consulta-lo.");
        }

        public async Task<LeadPostVisit> UpdateByLeadIdAsync(int leadId, LeadPostVisitRequest request)
        {
            await EnsureLeadExistsAsync(leadId);

            var existing = await _repository.GetByLeadIdAsync(leadId);
            if (existing == null)
            {
                var createdId = await _repository.CreateAsync(BuildEntity(leadId, request));
                return await _repository.GetByIdAsync(createdId)
                    ?? throw new InvalidOperationException("Pos-visita criado, mas nao foi possivel consulta-lo.");
            }

            ApplyRequest(existing, request);

            var updated = await _repository.UpdateAsync(existing);
            if (!updated)
            {
                throw new KeyNotFoundException("Pos-visita nao encontrado.");
            }

            return await _repository.GetByIdAsync(existing.Id)
                ?? throw new KeyNotFoundException("Pos-visita nao encontrado.");
        }

        public async Task<LeadPostVisit> UpdateStatusAsync(long id, UpdateLeadPostVisitStatusRequest request)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Pos-visita invalido.");
            }

            var status = NormalizeRequiredStatus(request?.Status);
            var updated = await _repository.UpdateStatusAsync(id, status);
            if (!updated)
            {
                throw new KeyNotFoundException("Pos-visita nao encontrado.");
            }

            return await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Pos-visita nao encontrado.");
        }

        public async Task<LeadPostVisit> MarkAsInProposalAsync(int leadId, long? proposalId)
        {
            await EnsureLeadExistsAsync(leadId);

            var existing = await _repository.GetByLeadIdAsync(leadId);
            if (existing == null)
            {
                var id = await _repository.CreateAsync(new LeadPostVisit
                {
                    LeadId = leadId,
                    PostVisitStatus = "EM_PROPOSTA",
                    ProposalId = proposalId
                });

                return await _repository.GetByIdAsync(id)
                    ?? throw new InvalidOperationException("Pos-visita criado, mas nao foi possivel consulta-lo.");
            }

            existing.PostVisitStatus = "EM_PROPOSTA";
            existing.ProposalId = proposalId ?? existing.ProposalId;

            var updated = await _repository.UpdateAsync(existing);
            if (!updated)
            {
                throw new KeyNotFoundException("Pos-visita nao encontrado.");
            }

            return await _repository.GetByIdAsync(existing.Id)
                ?? throw new KeyNotFoundException("Pos-visita nao encontrado.");
        }

        public async Task<LeadPostVisit> EnsurePostVisitForCompletedVisitAsync(int leadId, long? attendingAgentId = null, string? summary = null)
        {
            await EnsureLeadExistsAsync(leadId);

            var existing = await _repository.GetByLeadIdAsync(leadId);
            if (existing != null)
            {
                return existing;
            }

            var id = await _repository.CreateAsync(new LeadPostVisit
            {
                LeadId = leadId,
                PostVisitStatus = "ACOMPANHANDO",
                AttendingAgentId = attendingAgentId,
                LastInteractionSummary = NormalizeOptionalValue(summary)
                    ?? "Pos-visita iniciado automaticamente apos visita realizada."
            });

            return await _repository.GetByIdAsync(id)
                ?? throw new InvalidOperationException("Pos-visita criado, mas nao foi possivel consulta-lo.");
        }

        private async Task EnsureLeadExistsAsync(int leadId)
        {
            if (leadId <= 0)
            {
                throw new ArgumentException("Lead invalido.");
            }

            if (!await _repository.LeadExistsAsync(leadId))
            {
                throw new KeyNotFoundException("Lead nao encontrado.");
            }
        }

        private static LeadPostVisit BuildEntity(int leadId, LeadPostVisitRequest request)
        {
            var entity = new LeadPostVisit { LeadId = leadId };
            ApplyRequest(entity, request);
            return entity;
        }

        private static void ApplyRequest(LeadPostVisit entity, LeadPostVisitRequest request)
        {
            request ??= new LeadPostVisitRequest();

            entity.Cpf = NormalizeOptionalValue(request.Cpf);
            entity.HasRestriction = request.HasRestriction;
            entity.IncomeType = NormalizeOptionalEnum(request.IncomeType, ValidIncomeTypes, "Tipo de renda invalido.");
            entity.InterestRegion = NormalizeOptionalValue(request.InterestRegion);
            entity.PaysRent = request.PaysRent;
            entity.MaritalStatus = NormalizeOptionalValue(request.MaritalStatus);
            entity.DownPaymentAmount = request.DownPaymentAmount;
            entity.AttendingAgentId = request.AttendingAgentId;
            entity.PropertyInterestType = NormalizeOptionalEnum(request.PropertyInterestType, ValidPropertyInterestTypes, "Tipo de interesse de imovel invalido.");
            entity.PostVisitStatus = NormalizeOptionalStatus(request.PostVisitStatus) ?? "ACOMPANHANDO";
            entity.NextFollowUpAt = request.NextFollowUpAt;
            entity.LastInteractionSummary = NormalizeOptionalValue(request.LastInteractionSummary);
            entity.ProposalId = request.ProposalId;
        }

        private static string? NormalizeOptionalStatus(string? status)
        {
            var normalized = NormalizeOptionalValue(status)?.ToUpperInvariant();
            if (string.IsNullOrWhiteSpace(normalized))
            {
                return null;
            }

            if (!ValidStatuses.Contains(normalized))
            {
                throw new ArgumentException("Status de pos-visita invalido.");
            }

            return normalized;
        }

        private static string NormalizeRequiredStatus(string? status)
            => NormalizeOptionalStatus(status)
               ?? throw new ArgumentException("Status de pos-visita obrigatorio.");

        private static string? NormalizeOptionalEnum(string? value, HashSet<string> validValues, string invalidMessage)
        {
            var normalized = NormalizeOptionalValue(value)?.ToUpperInvariant();
            if (string.IsNullOrWhiteSpace(normalized))
            {
                return null;
            }

            if (!validValues.Contains(normalized))
            {
                throw new ArgumentException(invalidMessage);
            }

            return normalized;
        }

        private static string? NormalizeOptionalValue(string? value)
            => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
