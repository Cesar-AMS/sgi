namespace JMImoveisAPI.Interfaces
{
    public interface IUsuarioResetPasswordService
    {
        Task<bool> ResetPasswordAsync(string email);
    }
}
