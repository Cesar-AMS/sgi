using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class AccountsReceivableService : IAccountsReceivableService
    {
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

        public async Task<int> CreateAsync(CreateAccountsReceivableRequest req)
        {
            if (req.Amount <= 0)
                throw new ArgumentException("total_value deve ser maior que zero.");

            if (string.IsNullOrWhiteSpace(req.Description))
                throw new ArgumentException("description é obrigatório.");

            if (string.IsNullOrWhiteSpace(req.Category))
                throw new ArgumentException("category é obrigatório.");

            req.Status = NormalizeStatus(req.Status);
            req.PendingAmount = ResolvePendingAmount(req);
            req.PaidDate = req.Status == "PAID" ? req.PaidDate : null;
            req.SaleId ??= 0;

            return await _repo.CreateAsync(req);
        }

        public async Task SettleAsync(int id, SettleAccountsReceivableRequest req)
        {
            if (req.PaidValue <= 0)
                throw new ArgumentException("paidValue deve ser maior que zero.");

            if (!req.PaidDate.HasValue || req.PaidDate == default)
                throw new ArgumentException("paidDate é obrigatório.");

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

        private static string NormalizeStatus(string? status)
        {
            return (status ?? "WAITING").ToUpperInvariant();
        }

        private static decimal ResolvePendingAmount(CreateAccountsReceivableRequest req)
        {
            if (req.Status == "PAID")
            {
                return 0;
            }

            return req.PendingAmount <= 0 ? req.Amount : req.PendingAmount;
        }
    }
}
