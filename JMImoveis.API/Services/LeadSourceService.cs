using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class LeadSourceService : ILeadSourceService
    {
        private readonly ILeadSourceRepository _repository;

        public LeadSourceService(ILeadSourceRepository repository)
        {
            _repository = repository;
        }

        public Task<IEnumerable<LeadSource>> ListAsync()
            => _repository.ListAsync();

        public Task<IEnumerable<LeadSource>> ListActiveAsync()
            => _repository.ListActiveAsync();

        public async Task<LeadSource> CreateAsync(CreateLeadSourceRequest request)
        {
            if (request == null)
            {
                throw new ArgumentException("Solicitacao invalida.");
            }

            var name = NormalizeName(request.Name);
            if (await _repository.ExistsByNameAsync(name))
            {
                throw new ArgumentException("Fonte de origem ja cadastrada.");
            }

            var source = new LeadSource
            {
                Name = name,
                IsActive = request.IsActive,
                SortOrder = NormalizeSortOrder(request.SortOrder)
            };

            var id = await _repository.CreateAsync(source);
            return await _repository.GetByIdAsync(id)
                ?? throw new InvalidOperationException("Fonte criada, mas nao foi possivel consulta-la.");
        }

        public async Task<LeadSource> UpdateAsync(int id, UpdateLeadSourceRequest request)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Fonte invalida.");
            }

            if (request == null)
            {
                throw new ArgumentException("Solicitacao invalida.");
            }

            var existing = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Fonte de origem nao encontrada.");

            var name = NormalizeName(request.Name);
            if (await _repository.ExistsByNameAsync(name, id))
            {
                throw new ArgumentException("Fonte de origem ja cadastrada.");
            }

            existing.Name = name;
            existing.IsActive = request.IsActive;
            existing.SortOrder = NormalizeSortOrder(request.SortOrder);

            var updated = await _repository.UpdateAsync(existing);
            if (!updated)
            {
                throw new KeyNotFoundException("Fonte de origem nao encontrada.");
            }

            return await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Fonte de origem nao encontrada.");
        }

        public async Task<LeadSource> ToggleAsync(int id, ToggleLeadSourceRequest request)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Fonte invalida.");
            }

            if (request == null)
            {
                throw new ArgumentException("Solicitacao invalida.");
            }

            var updated = await _repository.ToggleAsync(id, request.IsActive);
            if (!updated)
            {
                throw new KeyNotFoundException("Fonte de origem nao encontrada.");
            }

            return await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Fonte de origem nao encontrada.");
        }

        public async Task DeleteAsync(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Fonte invalida.");
            }

            var deleted = await _repository.DeleteAsync(id);
            if (!deleted)
            {
                throw new KeyNotFoundException("Fonte de origem nao encontrada.");
            }
        }

        private static string NormalizeName(string? name)
        {
            var normalized = (name ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(normalized))
            {
                throw new ArgumentException("Nome da fonte obrigatorio.");
            }

            if (normalized.Length > 120)
            {
                throw new ArgumentException("Nome da fonte deve ter no maximo 120 caracteres.");
            }

            return normalized;
        }

        private static int NormalizeSortOrder(int? sortOrder)
            => sortOrder.HasValue && sortOrder.Value > 0 ? sortOrder.Value : 100;
    }
}
