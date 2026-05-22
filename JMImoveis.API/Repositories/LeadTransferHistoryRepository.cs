using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;

namespace JMImoveisAPI.Repositories
{
    public class LeadTransferHistoryRepository : ILeadTransferHistoryRepository
    {
        private readonly DapperContext _context;

        public LeadTransferHistoryRepository(DapperContext context)
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

        public async Task<long> CreateAsync(LeadTransferHistory history)
        {
            const string sql = @"
                INSERT INTO jmoficial.lead_transfer_history
                    (lead_id, previous_seller_id, new_seller_id,
                     previous_seller_name, new_seller_name,
                     previous_coordinator_id, new_coordinator_id,
                     previous_coordinator_name, new_coordinator_name,
                     previous_manager_id, new_manager_id,
                     previous_manager_name, new_manager_name,
                     changed_by_user_id, change_reason, created_at)
                VALUES
                    (@LeadId, @PreviousSellerId, @NewSellerId,
                     @PreviousSellerLabel, @NewSellerLabel,
                     @PreviousCoordinatorId, @NewCoordinatorId,
                     @PreviousCoordinatorLabel, @NewCoordinatorLabel,
                     @PreviousManagerId, @NewManagerId,
                     @PreviousManagerLabel, @NewManagerLabel,
                     @ChangedByUserId, @ChangeReason, NOW());
                SELECT LAST_INSERT_ID();";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.ExecuteScalarAsync<long>(sql, history);
        }

        public async Task<IEnumerable<LeadTransferHistory>> GetByLeadIdAsync(int leadId)
        {
            const string sql = @"
                SELECT h.id AS Id,
                       h.lead_id AS LeadId,
                       h.previous_seller_id AS PreviousSellerId,
                       COALESCE(previous_seller.name, h.previous_seller_name) AS PreviousSellerName,
                       h.new_seller_id AS NewSellerId,
                       COALESCE(new_seller.name, h.new_seller_name) AS NewSellerName,
                       h.previous_coordinator_id AS PreviousCoordinatorId,
                       COALESCE(previous_coordinator.name, h.previous_coordinator_name) AS PreviousCoordinatorName,
                       h.new_coordinator_id AS NewCoordinatorId,
                       COALESCE(new_coordinator.name, h.new_coordinator_name) AS NewCoordinatorName,
                       h.previous_manager_id AS PreviousManagerId,
                       COALESCE(previous_manager.name, h.previous_manager_name) AS PreviousManagerName,
                       h.new_manager_id AS NewManagerId,
                       COALESCE(new_manager.name, h.new_manager_name) AS NewManagerName,
                       h.changed_by_user_id AS ChangedByUserId,
                       changed_by.name AS ChangedByUserName,
                       h.change_reason AS ChangeReason,
                       h.created_at AS CreatedAt
                  FROM jmoficial.lead_transfer_history h
                  LEFT JOIN jmoficial.users previous_seller
                    ON previous_seller.id = h.previous_seller_id
                  LEFT JOIN jmoficial.users new_seller
                    ON new_seller.id = h.new_seller_id
                  LEFT JOIN jmoficial.users previous_coordinator
                    ON previous_coordinator.id = h.previous_coordinator_id
                  LEFT JOIN jmoficial.users new_coordinator
                    ON new_coordinator.id = h.new_coordinator_id
                  LEFT JOIN jmoficial.users previous_manager
                    ON previous_manager.id = h.previous_manager_id
                  LEFT JOIN jmoficial.users new_manager
                    ON new_manager.id = h.new_manager_id
                  LEFT JOIN jmoficial.users changed_by
                    ON changed_by.id = h.changed_by_user_id
                 WHERE h.lead_id = @LeadId
                 ORDER BY h.created_at DESC, h.id DESC;";

            await using var conn = await _context.OpenConnectionAsync();
            return await conn.QueryAsync<LeadTransferHistory>(sql, new { LeadId = leadId });
        }
    }
}
