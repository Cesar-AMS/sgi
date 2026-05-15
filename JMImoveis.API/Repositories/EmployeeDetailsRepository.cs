using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class EmployeeDetailsRepository : IEmployeeDetailsRepository
    {
        private readonly DapperContext _context;

        public EmployeeDetailsRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<EmployeeDetails?> GetByUserIdAsync(long userId)
        {
            const string sql = @"
                SELECT id AS Id,
                       user_id AS UserId,
                       rg AS Rg,
                       rg_issue_date AS RgIssueDate,
                       rg_issuer AS RgIssuer,
                       rg_state AS RgState,
                       birth_date AS BirthDate,
                       birth_city AS BirthCity,
                       birth_state AS BirthState,
                       nationality AS Nationality,
                       marital_status AS MaritalStatus,
                       spouse_name AS SpouseName,
                       father_name AS FatherName,
                       mother_name AS MotherName,
                       education_level AS EducationLevel,
                       education_status AS EducationStatus,
                       ctps_number AS CtpsNumber,
                       ctps_series AS CtpsSeries,
                       ctps_state AS CtpsState,
                       ctps_issue_date AS CtpsIssueDate,
                       pis_pasep AS PisPasep,
                       sus_number AS SusNumber,
                       voter_title AS VoterTitle,
                       voter_zone AS VoterZone,
                       voter_section AS VoterSection,
                       reservist_number AS ReservistNumber,
                       reservist_category AS ReservistCategory,
                       first_job AS FirstJob,
                       salary AS Salary,
                       function_name AS FunctionName,
                       monthly_workload AS MonthlyWorkload,
                       weekly_workload AS WeeklyWorkload,
                       day_off AS DayOff,
                       experience_contract_days AS ExperienceContractDays,
                       experience_extension_days AS ExperienceExtensionDays,
                       transport_voucher_discount AS TransportVoucherDiscount,
                       work_schedule_notes AS WorkScheduleNotes,
                       has_dependents AS HasDependents,
                       dependent_notes AS DependentNotes,
                       notes AS Notes,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt
                  FROM jmoficial.employee_details
                 WHERE user_id = @UserId
                 LIMIT 1;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QuerySingleOrDefaultAsync<EmployeeDetails>(sql, new { UserId = userId });
        }

        public async Task<long> CreateAsync(EmployeeDetails entity)
        {
            const string sql = @"
                INSERT INTO jmoficial.employee_details
                    (user_id, rg, rg_issue_date, rg_issuer, rg_state, birth_date,
                     birth_city, birth_state, nationality, marital_status, spouse_name,
                     father_name, mother_name, education_level, education_status,
                     ctps_number, ctps_series, ctps_state, ctps_issue_date, pis_pasep,
                     sus_number, voter_title, voter_zone, voter_section, reservist_number, reservist_category,
                     first_job, salary, function_name, monthly_workload, weekly_workload,
                     day_off, experience_contract_days, experience_extension_days,
                     transport_voucher_discount, work_schedule_notes, has_dependents,
                     dependent_notes, notes, created_at, updated_at)
                VALUES
                    (@UserId, @Rg, @RgIssueDate, @RgIssuer, @RgState, @BirthDate,
                     @BirthCity, @BirthState, @Nationality, @MaritalStatus, @SpouseName,
                     @FatherName, @MotherName, @EducationLevel, @EducationStatus,
                     @CtpsNumber, @CtpsSeries, @CtpsState, @CtpsIssueDate, @PisPasep,
                     @SusNumber, @VoterTitle, @VoterZone, @VoterSection, @ReservistNumber, @ReservistCategory,
                     @FirstJob, @Salary, @FunctionName, @MonthlyWorkload, @WeeklyWorkload,
                     @DayOff, @ExperienceContractDays, @ExperienceExtensionDays,
                     @TransportVoucherDiscount, @WorkScheduleNotes, @HasDependents,
                     @DependentNotes, @Notes, NOW(), NULL);
                SELECT LAST_INSERT_ID();";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<long>(sql, entity);
        }

        public async Task<bool> UpdateByUserIdAsync(long userId, EmployeeDetails entity)
        {
            const string sql = @"
                UPDATE jmoficial.employee_details
                   SET rg = @Rg,
                       rg_issue_date = @RgIssueDate,
                       rg_issuer = @RgIssuer,
                       rg_state = @RgState,
                       birth_date = @BirthDate,
                       birth_city = @BirthCity,
                       birth_state = @BirthState,
                       nationality = @Nationality,
                       marital_status = @MaritalStatus,
                       spouse_name = @SpouseName,
                       father_name = @FatherName,
                       mother_name = @MotherName,
                       education_level = @EducationLevel,
                       education_status = @EducationStatus,
                       ctps_number = @CtpsNumber,
                       ctps_series = @CtpsSeries,
                       ctps_state = @CtpsState,
                       ctps_issue_date = @CtpsIssueDate,
                       pis_pasep = @PisPasep,
                       sus_number = @SusNumber,
                       voter_title = @VoterTitle,
                       voter_zone = @VoterZone,
                       voter_section = @VoterSection,
                       reservist_number = @ReservistNumber,
                       reservist_category = @ReservistCategory,
                       first_job = @FirstJob,
                       salary = @Salary,
                       function_name = @FunctionName,
                       monthly_workload = @MonthlyWorkload,
                       weekly_workload = @WeeklyWorkload,
                       day_off = @DayOff,
                       experience_contract_days = @ExperienceContractDays,
                       experience_extension_days = @ExperienceExtensionDays,
                       transport_voucher_discount = @TransportVoucherDiscount,
                       work_schedule_notes = @WorkScheduleNotes,
                       has_dependents = @HasDependents,
                       dependent_notes = @DependentNotes,
                       notes = @Notes,
                       updated_at = NOW()
                 WHERE user_id = @UserId;";

            entity.UserId = userId;
            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, entity) > 0;
        }

        public async Task<EmployeeDetails> UpsertByUserIdAsync(long userId, EmployeeDetails entity)
        {
            var updated = await UpdateByUserIdAsync(userId, entity);
            if (!updated)
            {
                entity.UserId = userId;
                await CreateAsync(entity);
            }

            var saved = await GetByUserIdAsync(userId);
            if (saved is null)
            {
                throw new InvalidOperationException("Nao foi possivel carregar os dados admissionais salvos.");
            }

            return saved;
        }

        public async Task<bool> ExistsByUserIdAsync(long userId)
        {
            const string sql = @"
                SELECT COUNT(1)
                  FROM jmoficial.employee_details
                 WHERE user_id = @UserId;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, new { UserId = userId }) > 0;
        }

        public async Task<bool> UserExistsAsync(long userId)
        {
            const string sql = @"
                SELECT COUNT(1)
                  FROM jmoficial.users
                 WHERE id = @UserId;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, new { UserId = userId }) > 0;
        }
    }
}
