CREATE TABLE IF NOT EXISTS lead_distribution_agents (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  level VARCHAR(30) NOT NULL DEFAULT 'INTERMEDIARIO',
  priority INT NOT NULL DEFAULT 100,
  max_daily_leads INT NULL,
  last_assigned_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lead_distribution_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  assigned_to_user_id BIGINT UNSIGNED NOT NULL,
  distribution_type VARCHAR(30) NULL,
  agent_level VARCHAR(30) NULL,
  reason VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @add_leads_distribution_type_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'leads'
       AND COLUMN_NAME = 'distribution_type'
  ),
  'ALTER TABLE leads ADD COLUMN distribution_type VARCHAR(30) NULL AFTER assigned_by_user_id',
  'SELECT ''leads.distribution_type already exists'' AS message'
);
PREPARE add_leads_distribution_type_stmt FROM @add_leads_distribution_type_sql;
EXECUTE add_leads_distribution_type_stmt;
DEALLOCATE PREPARE add_leads_distribution_type_stmt;

SET @add_lead_distribution_agents_user_unique_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'lead_distribution_agents'
       AND INDEX_NAME = 'uk_lead_distribution_agents_user_id'
  ),
  'ALTER TABLE lead_distribution_agents ADD UNIQUE KEY uk_lead_distribution_agents_user_id (user_id)',
  'SELECT ''uk_lead_distribution_agents_user_id already exists'' AS message'
);
PREPARE add_lead_distribution_agents_user_unique_stmt FROM @add_lead_distribution_agents_user_unique_sql;
EXECUTE add_lead_distribution_agents_user_unique_stmt;
DEALLOCATE PREPARE add_lead_distribution_agents_user_unique_stmt;

SET @add_lead_distribution_agents_active_level_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'lead_distribution_agents'
       AND INDEX_NAME = 'idx_lead_distribution_agents_active_level'
  ),
  'ALTER TABLE lead_distribution_agents ADD INDEX idx_lead_distribution_agents_active_level (is_active, level)',
  'SELECT ''idx_lead_distribution_agents_active_level already exists'' AS message'
);
PREPARE add_lead_distribution_agents_active_level_idx_stmt FROM @add_lead_distribution_agents_active_level_idx_sql;
EXECUTE add_lead_distribution_agents_active_level_idx_stmt;
DEALLOCATE PREPARE add_lead_distribution_agents_active_level_idx_stmt;

SET @add_lead_distribution_agents_last_assigned_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'lead_distribution_agents'
       AND INDEX_NAME = 'idx_lead_distribution_agents_last_assigned'
  ),
  'ALTER TABLE lead_distribution_agents ADD INDEX idx_lead_distribution_agents_last_assigned (last_assigned_at)',
  'SELECT ''idx_lead_distribution_agents_last_assigned already exists'' AS message'
);
PREPARE add_lead_distribution_agents_last_assigned_idx_stmt FROM @add_lead_distribution_agents_last_assigned_idx_sql;
EXECUTE add_lead_distribution_agents_last_assigned_idx_stmt;
DEALLOCATE PREPARE add_lead_distribution_agents_last_assigned_idx_stmt;

SET @add_lead_distribution_agents_priority_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'lead_distribution_agents'
       AND INDEX_NAME = 'idx_lead_distribution_agents_priority'
  ),
  'ALTER TABLE lead_distribution_agents ADD INDEX idx_lead_distribution_agents_priority (priority)',
  'SELECT ''idx_lead_distribution_agents_priority already exists'' AS message'
);
PREPARE add_lead_distribution_agents_priority_idx_stmt FROM @add_lead_distribution_agents_priority_idx_sql;
EXECUTE add_lead_distribution_agents_priority_idx_stmt;
DEALLOCATE PREPARE add_lead_distribution_agents_priority_idx_stmt;

SET @add_lead_distribution_history_lead_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'lead_distribution_history'
       AND INDEX_NAME = 'idx_lead_distribution_history_lead_id'
  ),
  'ALTER TABLE lead_distribution_history ADD INDEX idx_lead_distribution_history_lead_id (lead_id)',
  'SELECT ''idx_lead_distribution_history_lead_id already exists'' AS message'
);
PREPARE add_lead_distribution_history_lead_idx_stmt FROM @add_lead_distribution_history_lead_idx_sql;
EXECUTE add_lead_distribution_history_lead_idx_stmt;
DEALLOCATE PREPARE add_lead_distribution_history_lead_idx_stmt;

SET @add_lead_distribution_history_assigned_to_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'lead_distribution_history'
       AND INDEX_NAME = 'idx_lead_distribution_history_assigned_to_user_id'
  ),
  'ALTER TABLE lead_distribution_history ADD INDEX idx_lead_distribution_history_assigned_to_user_id (assigned_to_user_id)',
  'SELECT ''idx_lead_distribution_history_assigned_to_user_id already exists'' AS message'
);
PREPARE add_lead_distribution_history_assigned_to_idx_stmt FROM @add_lead_distribution_history_assigned_to_idx_sql;
EXECUTE add_lead_distribution_history_assigned_to_idx_stmt;
DEALLOCATE PREPARE add_lead_distribution_history_assigned_to_idx_stmt;

SET @add_lead_distribution_history_created_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'lead_distribution_history'
       AND INDEX_NAME = 'idx_lead_distribution_history_created_at'
  ),
  'ALTER TABLE lead_distribution_history ADD INDEX idx_lead_distribution_history_created_at (created_at)',
  'SELECT ''idx_lead_distribution_history_created_at already exists'' AS message'
);
PREPARE add_lead_distribution_history_created_idx_stmt FROM @add_lead_distribution_history_created_idx_sql;
EXECUTE add_lead_distribution_history_created_idx_stmt;
DEALLOCATE PREPARE add_lead_distribution_history_created_idx_stmt;

SET @add_lead_distribution_history_type_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'lead_distribution_history'
       AND INDEX_NAME = 'idx_lead_distribution_history_distribution_type'
  ),
  'ALTER TABLE lead_distribution_history ADD INDEX idx_lead_distribution_history_distribution_type (distribution_type)',
  'SELECT ''idx_lead_distribution_history_distribution_type already exists'' AS message'
);
PREPARE add_lead_distribution_history_type_idx_stmt FROM @add_lead_distribution_history_type_idx_sql;
EXECUTE add_lead_distribution_history_type_idx_stmt;
DEALLOCATE PREPARE add_lead_distribution_history_type_idx_stmt;

SET @add_leads_distribution_type_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'leads'
       AND INDEX_NAME = 'idx_leads_distribution_type'
  ),
  'ALTER TABLE leads ADD INDEX idx_leads_distribution_type (distribution_type)',
  'SELECT ''idx_leads_distribution_type already exists'' AS message'
);
PREPARE add_leads_distribution_type_idx_stmt FROM @add_leads_distribution_type_idx_sql;
EXECUTE add_leads_distribution_type_idx_stmt;
DEALLOCATE PREPARE add_leads_distribution_type_idx_stmt;
