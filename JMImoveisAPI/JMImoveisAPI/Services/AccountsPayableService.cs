using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class AccountsPayableService : IAccountsPayableService
    {
        private readonly IAccountsPayableRepository _repo;

        public AccountsPayableService(IAccountsPayableRepository repo)
        {
            _repo = repo;
        }

        public Task<(List<AccountsPayableRowDto> Items, int Total)> GetPagedAsync(AccountsPayableQuery q)
            => _repo.GetPagedAsync(q);

        public Task<AccountsPayableSummaryDto> GetSummaryAsync(AccountsPayableQuery q)
            => _repo.GetSummaryAsync(q);

        public Task SettleAsync(long id, SettleAccountsPayableRequest req)
        {
            if (req.PaidValue <= 0)
                throw new ArgumentException("paidValue deve ser maior que zero.");

            if (req.PaidDate == default)
                throw new ArgumentException("paidDate é obrigatório.");

            return _repo.SettleAsync(id, req);
        }

        public Task<long> CreateAsync(CreateAccountsPayableRequest req)
        {
            if (req.Amount <= 0)
                throw new ArgumentException("Amount deve ser maior que zero.");

            if (string.IsNullOrWhiteSpace(req.Description))
                throw new ArgumentException("Description é obrigatório.");

            if (string.IsNullOrWhiteSpace(req.Category))
                throw new ArgumentException("Category é obrigatório.");

            req.Status = NormalizeStatus(req.Status);
            req.PendingAmount = ResolvePendingAmount(req);

            return _repo.CreateAsync(req);
        }

        private static string NormalizeStatus(string? status)
        {
            var normalized = (status ?? "WAITING").Trim().ToUpperInvariant();
            return normalized == "PAID" ? "PAID" : "WAITING";
        }

        private static decimal ResolvePendingAmount(CreateAccountsPayableRequest req)
        {
            if (req.Status == "PAID")
            {
                return 0;
            }

            return req.PendingAmount <= 0 ? req.Amount : req.PendingAmount;
        }
    }
}
