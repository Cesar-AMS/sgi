using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class AccountsReceivableService : IAccountsReceivableService
    {
        private static readonly HashSet<string> AllowedStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "WAITING",
            "PAID",
            "CANCELLED",
            "PROJECAO"
        };

        private readonly IAccountsReceivableRepository _repo;

        public AccountsReceivableService(IAccountsReceivableRepository repo)
        {
            _repo = repo;
        }

        public async Task<PagedResult<AccountsReceivableRowDto>> GetPagedAsync(
            DateTime? dueFrom,
            DateTime? dueTo,
            int? branchId,
            string? category,
            string? status,
            string? search,
            int page,
            int pageSize)
        {
            var query = BuildQuery(dueFrom, dueTo, branchId, category, status, search);
            return await _repo.GetPagedAsync(query, page, pageSize);
        }

        public async Task<AccountsReceivableSummaryDto> GetSummaryAsync(
            DateTime? dueFrom,
            DateTime? dueTo,
            int? branchId,
            string? category,
            string? status,
            string? search)
        {
            var query = BuildQuery(dueFrom, dueTo, branchId, category, status, search);
            return await _repo.GetSummaryAsync(query);
        }

        public async Task<AccountsReceivableRowDto?> GetByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("id invalido.");

            return await _repo.GetByIdAsync(id);
        }

        public async Task<int> CreateAsync(CreateAccountsReceivableRequest req)
        {
            ValidateCreate(req);
            return await _repo.CreateAsync(req);
        }

        public async Task UpdateAsync(int id, UpdateAccountsReceivableRequest req)
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

        public async Task CancelAsync(int id, CancelAccountsReceivableRequest req)
        {
            if (id <= 0)
                throw new ArgumentException("id invalido.");

            var cancelled = await _repo.CancelAsync(id, req);
            if (!cancelled)
            {
                throw new KeyNotFoundException("Titulo nao encontrado.");
            }
        }

        public Task<bool> HasAnyBySaleIdAsync(int saleId)
        {
            if (saleId <= 0)
            {
                return Task.FromResult(false);
            }

            return _repo.HasAnyBySaleIdAsync(saleId);
        }

        public async Task SettleAsync(int id, SettleAccountsReceivableRequest req)
        {
            if (id <= 0)
                throw new ArgumentException("id invalido.");

            if (req == null)
                throw new ArgumentException("payload invalido.");

            if (req.PaidValue <= 0)
                throw new ArgumentException("paidValue deve ser maior que zero.");

            if (!req.PaidDate.HasValue || req.PaidDate == default)
                throw new ArgumentException("paidDate e obrigatorio.");

            await _repo.SettleAsync(id, req);
        }

        private static AccountsReceivableQuery BuildQuery(
            DateTime? dueFrom,
            DateTime? dueTo,
            int? branchId,
            string? category,
            string? status,
            string? search)
        {
            return new AccountsReceivableQuery
            {
                DueFrom = dueFrom,
                DueTo = dueTo,
                BranchId = branchId,
                Category = category,
                Status = status,
                Search = search
            };
        }

        private static void ValidateCreate(CreateAccountsReceivableRequest req)
        {
            if (req == null)
                throw new ArgumentException("payload invalido.");

            ValidateCommonFields(req.Description, req.Category, req.Amount, req.PendingAmount);

            req.Description = req.Description.Trim();
            req.Category = req.Category.Trim();
            req.Status = NormalizeStatus(req.Status);

            if (req.Status == "CANCELLED")
                throw new ArgumentException("Nao e permitido criar titulo diretamente como CANCELLED. Use o endpoint de cancelamento.");

            if (req.Status == "PAID")
            {
                if (!req.PaidDate.HasValue || req.PaidDate == default)
                    throw new ArgumentException("paidDate e obrigatorio para titulo PAID.");

                req.PendingAmount = 0;
            }
            else
            {
                req.PaidDate = null;
                req.PendingAmount = ResolvePendingAmount(req.Amount, req.PendingAmount);
            }

            req.SaleId ??= 0;
        }

        private static void ValidateUpdate(UpdateAccountsReceivableRequest req)
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
