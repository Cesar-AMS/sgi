namespace JMImoveisAPI.Interfaces
{
    public interface IUsuarioAuthService
    {
        Task<(string? token, int? id)> AuthenticateAsync(string email, string password);
    }
}
