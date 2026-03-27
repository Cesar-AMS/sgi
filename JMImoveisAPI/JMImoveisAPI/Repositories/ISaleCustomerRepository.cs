using System.Data;

namespace JMImoveisAPI.Repositories
{
    public interface ISaleCustomerRepository
    {
        Task InsertAsync(int saleId, IEnumerable<int> customerIds, IDbTransaction transaction);
    }
}
