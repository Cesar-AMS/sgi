using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using System.Text;

namespace JMImoveisAPI.Repositories
{
    public class LeadPostVisitRepository : ILeadPostVisitRepository
    {
        private readonly DapperContext _context;

        public LeadPostVisitRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<bool> LeadExistsAsync(int leadId)
        {
            const string sql = @"
                SELECT COUNT(1)
                  FROM jmoficial.leads
                 WHERE Id = @LeadId;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<int>(sql, new { LeadId = leadId }) > 0;
        }

        public async Task<LeadPostVisit?> GetByLeadIdAsync(int leadId)
        {
            const string sql = @"
                SELECT id AS Id,
                       lead_id AS LeadId,
                       cpf AS Cpf,
                       has_restriction AS HasRestriction,
                       income_type AS IncomeType,
                       interest_region AS InterestRegion,
                       pays_rent AS PaysRent,
                       marital_status AS MaritalStatus,
                       down_payment_amount AS DownPaymentAmount,
                       attending_agent_id AS AttendingAgentId,
                       property_interest_type AS PropertyInterestType,
                       post_visit_status AS PostVisitStatus,
                       next_follow_up_at AS NextFollowUpAt,
                       last_interaction_summary AS LastInteractionSummary,
                       proposal_id AS ProposalId,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt,
                       deleted_at AS DeletedAt
                  FROM jmoficial.lead_post_visit
                 WHERE lead_id = @LeadId
                   AND deleted_at IS NULL
                 ORDER BY id DESC
                 LIMIT 1;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<LeadPostVisit>(sql, new { LeadId = leadId });
        }

        public async Task<LeadPostVisit?> GetByIdAsync(long id)
        {
            const string sql = @"
                SELECT id AS Id,
                       lead_id AS LeadId,
                       cpf AS Cpf,
                       has_restriction AS HasRestriction,
                       income_type AS IncomeType,
                       interest_region AS InterestRegion,
                       pays_rent AS PaysRent,
                       marital_status AS MaritalStatus,
                       down_payment_amount AS DownPaymentAmount,
                       attending_agent_id AS AttendingAgentId,
                       property_interest_type AS PropertyInterestType,
                       post_visit_status AS PostVisitStatus,
                       next_follow_up_at AS NextFollowUpAt,
                       last_interaction_summary AS LastInteractionSummary,
                       proposal_id AS ProposalId,
                       created_at AS CreatedAt,
                       updated_at AS UpdatedAt,
                       deleted_at AS DeletedAt
                  FROM jmoficial.lead_post_visit
                 WHERE id = @Id
                   AND deleted_at IS NULL
                 LIMIT 1;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryFirstOrDefaultAsync<LeadPostVisit>(sql, new { Id = id });
        }

        public async Task<IEnumerable<LeadPostVisitListItem>> ListAsync(
            string? status,
            long? agentId,
            string? search,
            DateTime? followUpFrom,
            DateTime? followUpTo)
        {
            var sql = new StringBuilder(@"
                SELECT pv.id AS PostVisitId,
                       pv.lead_id AS LeadId,
                       l.Nome AS NomeCliente,
                       l.Telefone AS Telefone,
                       l.Email AS Email,
                       pv.cpf AS Cpf,
                       pv.post_visit_status AS PostVisitStatus,
                       pv.next_follow_up_at AS NextFollowUpAt,
                       pv.attending_agent_id AS AttendingAgentId,
                       u.name AS AttendingAgentName,
                       pv.interest_region AS InterestRegion,
                       pv.down_payment_amount AS DownPaymentAmount,
                       pv.property_interest_type AS PropertyInterestType,
                       pv.last_interaction_summary AS LastInteractionSummary,
                       pv.proposal_id AS ProposalId,
                       pv.created_at AS CreatedAt,
                       pv.updated_at AS UpdatedAt
                  FROM jmoficial.lead_post_visit pv
                  JOIN jmoficial.leads l
                    ON l.Id = pv.lead_id
                  LEFT JOIN jmoficial.users u
                    ON u.id = pv.attending_agent_id
                 WHERE pv.deleted_at IS NULL");

            var parameters = new DynamicParameters();

            if (!string.IsNullOrWhiteSpace(status))
            {
                sql.Append(" AND pv.post_visit_status = @Status");
                parameters.Add("Status", status.Trim().ToUpperInvariant());
            }

            if (agentId.HasValue && agentId.Value > 0)
            {
                sql.Append(" AND pv.attending_agent_id = @AgentId");
                parameters.Add("AgentId", agentId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                sql.Append(@"
                   AND (
                        l.Nome LIKE @Search
                     OR l.Telefone LIKE @Search
                     OR l.Email LIKE @Search
                     OR pv.cpf LIKE @Search
                     OR pv.interest_region LIKE @Search
                   )");
                parameters.Add("Search", $"%{search.Trim()}%");
            }

            if (followUpFrom.HasValue)
            {
                sql.Append(" AND pv.next_follow_up_at >= @FollowUpFrom");
                parameters.Add("FollowUpFrom", followUpFrom.Value);
            }

            if (followUpTo.HasValue)
            {
                sql.Append(" AND pv.next_follow_up_at <= @FollowUpTo");
                parameters.Add("FollowUpTo", followUpTo.Value);
            }

            sql.Append(" ORDER BY COALESCE(pv.next_follow_up_at, pv.updated_at, pv.created_at) DESC, pv.id DESC;");

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<LeadPostVisitListItem>(sql.ToString(), parameters);
        }

        public async Task<long> CreateAsync(LeadPostVisit postVisit)
        {
            const string sql = @"
                INSERT INTO jmoficial.lead_post_visit
                    (lead_id, cpf, has_restriction, income_type, interest_region,
                     pays_rent, marital_status, down_payment_amount, attending_agent_id,
                     property_interest_type, post_visit_status, next_follow_up_at,
                     last_interaction_summary, proposal_id, created_at)
                VALUES
                    (@LeadId, @Cpf, @HasRestriction, @IncomeType, @InterestRegion,
                     @PaysRent, @MaritalStatus, @DownPaymentAmount, @AttendingAgentId,
                     @PropertyInterestType, @PostVisitStatus, @NextFollowUpAt,
                     @LastInteractionSummary, @ProposalId, NOW());
                SELECT LAST_INSERT_ID();";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<long>(sql, postVisit);
        }

        public async Task<bool> UpdateAsync(LeadPostVisit postVisit)
        {
            const string sql = @"
                UPDATE jmoficial.lead_post_visit
                   SET cpf = @Cpf,
                       has_restriction = @HasRestriction,
                       income_type = @IncomeType,
                       interest_region = @InterestRegion,
                       pays_rent = @PaysRent,
                       marital_status = @MaritalStatus,
                       down_payment_amount = @DownPaymentAmount,
                       attending_agent_id = @AttendingAgentId,
                       property_interest_type = @PropertyInterestType,
                       post_visit_status = @PostVisitStatus,
                       next_follow_up_at = @NextFollowUpAt,
                       last_interaction_summary = @LastInteractionSummary,
                       proposal_id = @ProposalId,
                       updated_at = NOW()
                 WHERE id = @Id
                   AND deleted_at IS NULL;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, postVisit) > 0;
        }

        public async Task<bool> UpdateStatusAsync(long id, string status)
        {
            const string sql = @"
                UPDATE jmoficial.lead_post_visit
                   SET post_visit_status = @Status,
                       updated_at = NOW()
                 WHERE id = @Id
                   AND deleted_at IS NULL;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { Id = id, Status = status }) > 0;
        }
    }
}
