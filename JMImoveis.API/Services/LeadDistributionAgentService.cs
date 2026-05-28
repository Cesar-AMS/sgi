using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class LeadDistributionAgentService : ILeadDistributionAgentService
    {
        private static readonly HashSet<string> ValidLevels = new(StringComparer.OrdinalIgnoreCase)
        {
            "NOVATO",
            "INTERMEDIARIO",
            "EXPERIENTE"
        };

        private readonly ILeadDistributionAgentRepository _repository;

        public LeadDistributionAgentService(ILeadDistributionAgentRepository repository)
        {
            _repository = repository;
        }

        public Task<IEnumerable<LeadDistributionAgent>> ListAsync()
            => _repository.ListAsync();

        public async Task<LeadDistributionAgent> CreateAsync(CreateLeadDistributionAgentRequest request)
        {
            if (request == null)
            {
                throw new ArgumentException("Solicitacao invalida.");
            }

            if (request.UserId <= 0)
            {
                throw new ArgumentException("Usuario obrigatorio.");
            }

            if (!await _repository.UserExistsAsync(request.UserId))
            {
                throw new KeyNotFoundException("Usuario nao encontrado.");
            }

            if (await _repository.ExistsByUserIdAsync(request.UserId))
            {
                throw new ArgumentException("Usuario ja configurado na distribuicao.");
            }

            var agent = new LeadDistributionAgent
            {
                UserId = request.UserId,
                IsActive = request.IsActive,
                Level = NormalizeLevel(request.Level),
                Priority = NormalizePriority(request.Priority),
                MaxDailyLeads = NormalizeMaxDailyLeads(request.MaxDailyLeads)
            };

            var id = await _repository.CreateAsync(agent);
            return await _repository.GetByIdAsync(id)
                ?? throw new InvalidOperationException("Agente criado, mas nao foi possivel consulta-lo.");
        }

        public async Task<LeadDistributionAgent> UpdateAsync(long id, UpdateLeadDistributionAgentRequest request)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Configuracao invalida.");
            }

            if (request == null)
            {
                throw new ArgumentException("Solicitacao invalida.");
            }

            var existing = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Configuracao de distribuicao nao encontrada.");

            existing.IsActive = request.IsActive;
            existing.Level = NormalizeLevel(request.Level);
            existing.Priority = NormalizePriority(request.Priority);
            existing.MaxDailyLeads = NormalizeMaxDailyLeads(request.MaxDailyLeads);

            var updated = await _repository.UpdateAsync(existing);
            if (!updated)
            {
                throw new KeyNotFoundException("Configuracao de distribuicao nao encontrada.");
            }

            return await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Configuracao de distribuicao nao encontrada.");
        }

        public async Task<LeadDistributionAgent> ToggleAsync(long id, ToggleLeadDistributionAgentRequest request)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Configuracao invalida.");
            }

            if (request == null)
            {
                throw new ArgumentException("Solicitacao invalida.");
            }

            var updated = await _repository.ToggleAsync(id, request.IsActive);
            if (!updated)
            {
                throw new KeyNotFoundException("Configuracao de distribuicao nao encontrada.");
            }

            return await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Configuracao de distribuicao nao encontrada.");
        }

        public async Task DeleteAsync(long id)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Configuracao invalida.");
            }

            var deleted = await _repository.DeleteAsync(id);
            if (!deleted)
            {
                throw new KeyNotFoundException("Configuracao de distribuicao nao encontrada.");
            }
        }

        private static string NormalizeLevel(string? level)
        {
            var normalized = (level ?? string.Empty).Trim().ToUpperInvariant();
            if (string.IsNullOrWhiteSpace(normalized))
            {
                throw new ArgumentException("Nivel obrigatorio.");
            }

            if (!ValidLevels.Contains(normalized))
            {
                throw new ArgumentException("Nivel invalido. Use NOVATO, INTERMEDIARIO ou EXPERIENTE.");
            }

            return normalized;
        }

        private static int NormalizePriority(int? priority)
            => priority.HasValue && priority.Value > 0 ? priority.Value : 100;

        private static int? NormalizeMaxDailyLeads(int? maxDailyLeads)
        {
            if (!maxDailyLeads.HasValue)
            {
                return null;
            }

            if (maxDailyLeads.Value < 0)
            {
                throw new ArgumentException("Limite diario nao pode ser negativo.");
            }

            return maxDailyLeads.Value;
        }
    }
}
