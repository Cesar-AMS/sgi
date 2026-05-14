using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Services
{
    public class EmployeeDetailsService : IEmployeeDetailsService
    {
        private readonly IEmployeeDetailsRepository _repository;

        public EmployeeDetailsService(IEmployeeDetailsRepository repository)
        {
            _repository = repository;
        }

        public async Task<EmployeeDetails?> GetByUserIdAsync(long userId)
        {
            ValidateUserId(userId);
            return await _repository.GetByUserIdAsync(userId);
        }

        public async Task<EmployeeDetails> CreateAsync(EmployeeDetails entity)
        {
            if (entity is null)
            {
                throw new ArgumentException("Payload invalido.");
            }

            ValidateAndNormalize(entity.UserId, entity);
            await EnsureUserExistsAsync(entity.UserId);

            if (await _repository.ExistsByUserIdAsync(entity.UserId))
            {
                throw new ArgumentException("Ja existem dados admissionais para este usuario. Use PUT para atualizar.");
            }

            await _repository.CreateAsync(entity);
            var saved = await _repository.GetByUserIdAsync(entity.UserId);
            if (saved is null)
            {
                throw new InvalidOperationException("Nao foi possivel carregar os dados admissionais salvos.");
            }

            return saved;
        }

        public async Task<EmployeeDetails> UpsertByUserIdAsync(long userId, EmployeeDetails entity)
        {
            if (entity is null)
            {
                throw new ArgumentException("Payload invalido.");
            }

            ValidateAndNormalize(userId, entity);
            await EnsureUserExistsAsync(userId);
            return await _repository.UpsertByUserIdAsync(userId, entity);
        }

        private async Task EnsureUserExistsAsync(long userId)
        {
            if (!await _repository.UserExistsAsync(userId))
            {
                throw new KeyNotFoundException("Usuario nao encontrado.");
            }
        }

        private static void ValidateAndNormalize(long userId, EmployeeDetails entity)
        {
            ValidateUserId(userId);
            entity.UserId = userId;

            ValidateNonNegative(entity.Salary, "salary");
            ValidateNonNegative(entity.MonthlyWorkload, "monthly_workload");
            ValidateNonNegative(entity.WeeklyWorkload, "weekly_workload");
            ValidateNonNegative(entity.TransportVoucherDiscount, "transport_voucher_discount");
            ValidateNonNegative(entity.ExperienceContractDays, "experience_contract_days");
            ValidateNonNegative(entity.ExperienceExtensionDays, "experience_extension_days");

            NormalizeDefaultDates(entity);
        }

        private static void ValidateUserId(long userId)
        {
            if (userId <= 0)
            {
                throw new ArgumentException("userId invalido.");
            }
        }

        private static void ValidateNonNegative(decimal? value, string fieldName)
        {
            if (value.HasValue && value.Value < 0)
            {
                throw new ArgumentException($"{fieldName} nao pode ser negativo.");
            }
        }

        private static void ValidateNonNegative(int? value, string fieldName)
        {
            if (value.HasValue && value.Value < 0)
            {
                throw new ArgumentException($"{fieldName} nao pode ser negativo.");
            }
        }

        private static void NormalizeDefaultDates(EmployeeDetails entity)
        {
            entity.RgIssueDate = NormalizeDate(entity.RgIssueDate);
            entity.BirthDate = NormalizeDate(entity.BirthDate);
            entity.CtpsIssueDate = NormalizeDate(entity.CtpsIssueDate);
        }

        private static DateTime? NormalizeDate(DateTime? value)
        {
            if (!value.HasValue || value.Value == default)
            {
                return null;
            }

            return value;
        }
    }
}
