using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class ContractService : IContractService
    {
        private static readonly HashSet<string> AllowedStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "PENDENTE",
            "EMITIDO",
            "ASSINADO"
        };

        private readonly IContractRepository _contractRepository;

        public ContractService(IContractRepository contractRepository)
        {
            _contractRepository = contractRepository;
        }

        public Task<Contract?> GetBySaleIdAsync(int saleId)
        {
            if (saleId <= 0)
            {
                throw new ArgumentException("saleId invalido.");
            }

            return _contractRepository.GetBySaleIdAsync(saleId);
        }

        public Task<Contract> CreateAsync(Contract entity)
        {
            entity.Id = null;
            NormalizeAndValidate(entity);
            return _contractRepository.CreateAsync(entity);
        }

        public Task<bool> UpdateAsync(Contract entity)
        {
            if (entity.Id <= 0)
            {
                throw new ArgumentException("id invalido para atualizacao.");
            }

            NormalizeAndValidate(entity);
            return _contractRepository.UpdateAsync(entity);
        }

        private static void NormalizeAndValidate(Contract entity)
        {
            if (entity.SaleId <= 0)
            {
                throw new ArgumentException("saleId invalido.");
            }

            entity.Number ??= string.Empty;
            entity.Path ??= string.Empty;
            entity.Observations ??= string.Empty;
            entity.Status = string.IsNullOrWhiteSpace(entity.Status) ? "PENDENTE" : entity.Status.Trim().ToUpperInvariant();

            if (!AllowedStatuses.Contains(entity.Status))
            {
                throw new ArgumentException("status invalido.");
            }
        }
    }
}
