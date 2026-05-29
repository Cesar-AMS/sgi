using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class LeadInterestRegionService : ILeadInterestRegionService
    {
        private readonly ILeadInterestRegionRepository _repository;

        public LeadInterestRegionService(ILeadInterestRegionRepository repository)
        {
            _repository = repository;
        }

        public Task<IEnumerable<LeadInterestRegion>> ListAsync()
            => _repository.ListAsync();

        public Task<IEnumerable<LeadInterestRegion>> ListActiveAsync()
            => _repository.ListActiveAsync();

        public async Task<LeadInterestRegion> CreateAsync(CreateLeadInterestRegionRequest request)
        {
            if (request == null)
            {
                throw new ArgumentException("Solicitacao invalida.");
            }

            var name = NormalizeName(request.Name);
            if (await _repository.ExistsByNameAsync(name))
            {
                throw new ArgumentException("Regiao de interesse ja cadastrada.");
            }

            var region = new LeadInterestRegion
            {
                Name = name,
                IsActive = request.IsActive,
                SortOrder = NormalizeSortOrder(request.SortOrder)
            };

            var id = await _repository.CreateAsync(region);
            return await _repository.GetByIdAsync(id)
                ?? throw new InvalidOperationException("Regiao criada, mas nao foi possivel consulta-la.");
        }

        public async Task<LeadInterestRegion> UpdateAsync(int id, UpdateLeadInterestRegionRequest request)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Regiao invalida.");
            }

            if (request == null)
            {
                throw new ArgumentException("Solicitacao invalida.");
            }

            var existing = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Regiao de interesse nao encontrada.");

            var name = NormalizeName(request.Name);
            if (await _repository.ExistsByNameAsync(name, id))
            {
                throw new ArgumentException("Regiao de interesse ja cadastrada.");
            }

            existing.Name = name;
            existing.IsActive = request.IsActive;
            existing.SortOrder = NormalizeSortOrder(request.SortOrder);

            var updated = await _repository.UpdateAsync(existing);
            if (!updated)
            {
                throw new KeyNotFoundException("Regiao de interesse nao encontrada.");
            }

            return await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Regiao de interesse nao encontrada.");
        }

        public async Task<LeadInterestRegion> ToggleAsync(int id, ToggleLeadInterestRegionRequest request)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Regiao invalida.");
            }

            if (request == null)
            {
                throw new ArgumentException("Solicitacao invalida.");
            }

            var updated = await _repository.ToggleAsync(id, request.IsActive);
            if (!updated)
            {
                throw new KeyNotFoundException("Regiao de interesse nao encontrada.");
            }

            return await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Regiao de interesse nao encontrada.");
        }

        public async Task DeleteAsync(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Regiao invalida.");
            }

            var deleted = await _repository.DeleteAsync(id);
            if (!deleted)
            {
                throw new KeyNotFoundException("Regiao de interesse nao encontrada.");
            }
        }

        private static string NormalizeName(string? name)
        {
            var normalized = (name ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(normalized))
            {
                throw new ArgumentException("Nome da regiao obrigatorio.");
            }

            if (normalized.Length > 120)
            {
                throw new ArgumentException("Nome da regiao deve ter no maximo 120 caracteres.");
            }

            return normalized;
        }

        private static int NormalizeSortOrder(int? sortOrder)
            => sortOrder.HasValue && sortOrder.Value > 0 ? sortOrder.Value : 100;
    }
}
