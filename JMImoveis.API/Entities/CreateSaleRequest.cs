namespace JMImoveisAPI.Entities
{
    public class CreateSaleRequest
    {
        public SaleV2? Sale { get; set; }
        public List<ParcelV2?> Parcels { get; set; } = new();
        public List<int> CustomerIds { get; set; } = new(); // <- IDs dos clientes
    }
}
