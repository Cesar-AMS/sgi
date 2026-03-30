namespace JMImoveisAPI.Entities
{
    public record PagedResultVisitas<T>(IEnumerable<T> Items, int Total, int Page, int PageSize);
    public class Visitas
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;          // customer_name
        public string SourceDescription { get; set; } = string.Empty;      // source_description
        public int RealtorId { get; set; } // realtor_id
        public string? Realtor { get; set; } // realtor_id
        public DateTime Date { get; set; }                                 // date
        public DateTime? CreatedAt { get; set; }                            // created_at
        public DateTime? UpdatedAt { get; set; }                           // updated_at
        public DateTime? DeletedAt { get; set; }                           // deleted_at
        public bool HasSell { get; set; }                                  // has_sell
        public string? Observations { get; set; }                          // observations
        public string? CustomerCellphone { get; set; }                     // customer_cellphone
    }

    public record VisitationsQuery(
    int Page = 1,
    int PageSize = 25,
    string? Q = null,
    string? Date = null,        // "YYYY-MM-DD" (filtra o dia)
    string? Realtor = null,     // nome do corretor (contains)
    int? RealtorId = null,      // ou ID do corretor
    bool? HadSale = null,
    string? SortBy = null,      // "CustomerName" | "Realtor" | "Date" | "Origin" | "HasSell"
    string? SortDir = null      // "asc" | "desc"
);
}
