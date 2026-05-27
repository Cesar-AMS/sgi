using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class AccountsPayableService : IAccountsPayableService
    {
        private static readonly HashSet<string> AllowedStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "WAITING",
            "PAID",
            "CANCELLED",
            "PROJECAO"
        };

        private readonly IAccountsPayableRepository _repo;

        public AccountsPayableService(IAccountsPayableRepository repo)
        {
            _repo = repo;
        }

        public Task<(List<AccountsPayableRowDto> Items, int Total)> GetPagedAsync(AccountsPayableQuery q)
            => _repo.GetPagedAsync(q);

        public Task<AccountsPayableSummaryDto> GetSummaryAsync(AccountsPayableQuery q)
            => _repo.GetSummaryAsync(q);

        public async Task<AccountsPayableRowDto?> GetByIdAsync(long id)
        {
            if (id <= 0)
                throw new ArgumentException("id invalido.");

            return await _repo.GetByIdAsync(id);
        }

        public async Task<long> CreateAsync(CreateAccountsPayableRequest req)
        {
            ValidateCreate(req);
            return await _repo.CreateAsync(req);
        }

        public async Task UpdateAsync(long id, UpdateAccountsPayableRequest req)
        {
            if (id <= 0)
                throw new ArgumentException("id invalido.");

            ValidateUpdate(req);

            var updated = await _repo.UpdateAsync(id, req);
            if (!updated)
            {
                throw new KeyNotFoundException("Titulo nao encontrado.");
            }
        }

        public async Task CancelAsync(long id, CancelAccountsPayableRequest req)
        {
            if (id <= 0)
                throw new ArgumentException("id invalido.");

            var cancelled = await _repo.CancelAsync(id, req);
            if (!cancelled)
            {
                throw new KeyNotFoundException("Titulo nao encontrado.");
            }
        }

        public Task SettleAsync(long id, SettleAccountsPayableRequest req)
        {
            if (id <= 0)
                throw new ArgumentException("id invalido.");

            if (req == null)
                throw new ArgumentException("payload invalido.");

            if (req.PaidValue <= 0)
                throw new ArgumentException("paidValue deve ser maior que zero.");

            if (req.PaidDate == default)
                throw new ArgumentException("paidDate e obrigatorio.");

            return _repo.SettleAsync(id, req);
        }

        private static void ValidateCreate(CreateAccountsPayableRequest req)
        {
            if (req == null)
                throw new ArgumentException("payload invalido.");

            if (!req.UserId.HasValue || req.UserId.Value <= 0)
                throw new ArgumentException("userId e obrigatorio para contas a pagar.");

            if (!req.SaleId.HasValue)
                req.SaleId = 0;

            if (req.SaleId.Value < 0)
                throw new ArgumentException("saleId nao pode ser negativo.");

            ValidateCommonFields(req.Description, req.Category, req.Amount, req.PendingAmount);

            req.Description = req.Description.Trim();
            req.Category = req.Category.Trim();
            req.Status = NormalizeStatus(req.Status);

            if (req.Status == "CANCELLED")
                throw new ArgumentException("Nao e permitido criar titulo diretamente como CANCELLED. Use o endpoint de cancelamento.");

            if (req.Status == "PAID")
            {
                if (!req.PayDate.HasValue || req.PayDate == default)
                    throw new ArgumentException("payDate e obrigatorio para titulo PAID.");

                req.PendingAmount = 0;
            }
            else
            {
                req.PayDate = null;
                req.PendingAmount = ResolvePendingAmount(req.Amount, req.PendingAmount);
            }
        }

        private static void ValidateUpdate(UpdateAccountsPayableRequest req)
        {
            if (req == null)
                throw new ArgumentException("payload invalido.");

            ValidateCommonFields(req.Description, req.Category, req.Amount, req.PendingAmount);

            req.Description = req.Description.Trim();
            req.Category = req.Category.Trim();
            req.Status = NormalizeStatus(req.Status);

            if (req.Status != "WAITING" && req.Status != "PROJECAO")
                throw new ArgumentException("A edicao permite apenas status WAITING ou PROJECAO.");
        }

        private static void ValidateCommonFields(string description, string category, decimal amount, decimal pendingAmount)
        {
            if (amount <= 0)
                throw new ArgumentException("amount deve ser maior que zero.");

            if (pendingAmount < 0)
                throw new ArgumentException("pendingAmount nao pode ser negativo.");

            if (pendingAmount > amount)
                throw new ArgumentException("pendingAmount nao pode ser maior que amount.");

            if (string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("description e obrigatorio.");

            if (string.IsNullOrWhiteSpace(category))
                throw new ArgumentException("category e obrigatorio.");
        }

        private static string NormalizeStatus(string? status)
        {
            var normalized = (status ?? "WAITING").Trim().ToUpperInvariant();
            if (!AllowedStatuses.Contains(normalized))
            {
                throw new ArgumentException("status invalido.");
            }

            return normalized;
        }

        private static decimal ResolvePendingAmount(decimal amount, decimal pendingAmount)
            => pendingAmount <= 0 ? amount : pendingAmount;
    }
}
