namespace JMImoveisAPI.Entities
{
    public class UserPermissionOverride
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public long PermissionId { get; set; }
        public string PermissionKey { get; set; } = string.Empty;
        public string Effect { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
