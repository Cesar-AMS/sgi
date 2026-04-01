using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class ConstructorTransferService : IConstructorTransferService
    {
        private static readonly HashSet<string> AllowedStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "PENDENTE",
            "PROGRAMADO",
            "REPASSADO",
            "BLOQUEADO"
        };

        private readonly IConstructorTransferRepository _constructorTransferRepository;

        public ConstructorTransferService(IConstructorTransferRepository constructorTransferRepository)
        {
            _constructorTransferRepository = constructorTransferRepository;
        }

        public Task<ConstructorTransfer?> GetBySaleIdAsync(int saleId)
        {
            if (saleId <= 0)
            {
                throw new ArgumentException("saleId invalido.");
            }

            return _constructorTransferRepository.GetBySaleIdAsync(saleId);
        }

        public Task<ConstructorTransfer> CreateAsync(ConstructorTransfer entity)
        {
            entity.Id = null;
            NormalizeAndValidate(entity);
            return _constructorTransferRepository.CreateAsync(entity);
        }

        public Task<bool> UpdateAsync(ConstructorTransfer entity)
        {
            if (entity.Id <= 0)
            {
                throw new ArgumentException("id invalido para atualizacao.");
            }

            NormalizeAndValidate(entity);
            return _constructorTransferRepository.UpdateAsync(entity);
        }

        private static void NormalizeAndValidate(ConstructorTransfer entity)
        {
            if (entity.SaleId <= 0)
            {
                throw new ArgumentException("saleId invalido.");
            }

            if (entity.ConstructorId <= 0)
            {
                entity.ConstructorId = null;
            }

            if (entity.Amount < 0)
            {
                throw new ArgumentException("amount invalido.");
            }

            entity.Observations ??= string.Empty;
            entity.Status = string.IsNullOrWhiteSpace(entity.Status) ? "PENDENTE" : entity.Status.Trim().ToUpperInvariant();

            if (!AllowedStatuses.Contains(entity.Status))
            {
                throw new ArgumentException("status invalido.");
            }
        }
    }
}
