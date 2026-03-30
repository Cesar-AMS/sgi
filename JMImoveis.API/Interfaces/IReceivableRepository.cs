using JMImoveisAPI.Entities;
using System.Data;
using System.Reflection;

namespace JMImoveisAPI.Interfaces
{
    public interface IReceivableRepository
    {
        Task<IEnumerable<Receivable>> GetByPeriodAsync(DateTime from, DateTime to); //
        Task<IEnumerable<Receivable>> GetAllAsync(bool includeDeleted = false);

        Task<DreResponse> GetDreAsync(DreRequest req);
        Task<IEnumerable<Receivable>> GetReceivableAsync(DateTime? dateFrom, DateTime? dateTo, string TypeFilter, string categoriaFilter);
        Task<IEnumerable<Payable>> GetPayablesAsync(DateTime? dateFrom, DateTime? dateTo, string TypeFilter, string categoriaFilter);
        Task<IEnumerable<Payable>> GetAllAsync();
        Task<Receivable?> GetAsync(int id);
        Task<int[]> CreateAsync(Receivable seed);
        Task CreatePayableAsync(Payable seed);
        Task<bool> UpdateAsync(int id, Receivable r);

        Task<bool> UpdateAsync(int id, Payable r);
        Task<bool> MarkReceivedAsync(int id, MarkAsReceivedRequest obj);
        Task<bool> MarkPaidAsync(int id, MarkAsPaidRequest obj);

        Task<bool> UnreceiveAsync(int id);
        Task<bool> SoftDeleteAsync(int id);
        Task<bool> HardDeleteAsync(int id);


        Task<List<CostCenter>> GetAllAsync(CancellationToken ct);
        Task<SummaryResponse> GetMonthlySummaryAsync(DateTime start, DateTime end, string type, CancellationToken ct);


        Task<List<Entry>> GetEntriesAsync(int costCenterId, DateTime start, DateTime end, string type, CancellationToken ct);
        Task ReclassifyAsync(EntryKind kind, int id, ReclassifyRequest body, CancellationToken ct);

        Task<List<AccountOption>> SearchAsync(string? q, CancellationToken ct);

        Task<AccountSummaryResponse> GetMonthlySummaryAsync(DateTime start, DateTime end, string type, int? costCenterId, int? categoryId, CancellationToken ct);

        Task<List<Entry>> GetEntriesByAccountAsync(int accountId, DateTime start, DateTime end, string type, int? costCenterId, int? categoryId, CancellationToken ct);

    }
}
