namespace JMImoveisAPI.Entities
{
    public class ParcelV2
    {
        public long Id { get; set; }
        public int Number { get; set; }            // number
        public decimal Value { get; set; }         // value
        public DateTime Date { get; set; }         // date
        public string Observations { get; set; } = string.Empty;   // observations
        public string? SourceType { get; set; } = "App\\Models\\Sale\\Sale";    // source_type
        public long SourceId { get; set; }         // source_id
        public string Status { get; set; } = string.Empty;         // status
        public string Type { get; set; } = string.Empty;           // type ('ACT' para ato parcelado)
    }

}
