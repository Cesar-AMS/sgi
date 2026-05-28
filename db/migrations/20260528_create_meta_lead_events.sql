CREATE TABLE IF NOT EXISTS meta_lead_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  meta_lead_id VARCHAR(100) NOT NULL,
  page_id VARCHAR(100) NULL,
  form_id VARCHAR(100) NULL,
  raw_payload LONGTEXT NULL,
  lead_id INT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
  error_message TEXT NULL,
  received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @add_meta_lead_events_meta_lead_unique_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'meta_lead_events'
       AND INDEX_NAME = 'uk_meta_lead_events_meta_lead_id'
  ),
  'ALTER TABLE meta_lead_events ADD UNIQUE KEY uk_meta_lead_events_meta_lead_id (meta_lead_id)',
  'SELECT ''uk_meta_lead_events_meta_lead_id already exists'' AS message'
);
PREPARE add_meta_lead_events_meta_lead_unique_stmt FROM @add_meta_lead_events_meta_lead_unique_sql;
EXECUTE add_meta_lead_events_meta_lead_unique_stmt;
DEALLOCATE PREPARE add_meta_lead_events_meta_lead_unique_stmt;

SET @add_meta_lead_events_page_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'meta_lead_events'
       AND INDEX_NAME = 'idx_meta_lead_events_page_id'
  ),
  'ALTER TABLE meta_lead_events ADD INDEX idx_meta_lead_events_page_id (page_id)',
  'SELECT ''idx_meta_lead_events_page_id already exists'' AS message'
);
PREPARE add_meta_lead_events_page_idx_stmt FROM @add_meta_lead_events_page_idx_sql;
EXECUTE add_meta_lead_events_page_idx_stmt;
DEALLOCATE PREPARE add_meta_lead_events_page_idx_stmt;

SET @add_meta_lead_events_form_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'meta_lead_events'
       AND INDEX_NAME = 'idx_meta_lead_events_form_id'
  ),
  'ALTER TABLE meta_lead_events ADD INDEX idx_meta_lead_events_form_id (form_id)',
  'SELECT ''idx_meta_lead_events_form_id already exists'' AS message'
);
PREPARE add_meta_lead_events_form_idx_stmt FROM @add_meta_lead_events_form_idx_sql;
EXECUTE add_meta_lead_events_form_idx_stmt;
DEALLOCATE PREPARE add_meta_lead_events_form_idx_stmt;

SET @add_meta_lead_events_lead_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'meta_lead_events'
       AND INDEX_NAME = 'idx_meta_lead_events_lead_id'
  ),
  'ALTER TABLE meta_lead_events ADD INDEX idx_meta_lead_events_lead_id (lead_id)',
  'SELECT ''idx_meta_lead_events_lead_id already exists'' AS message'
);
PREPARE add_meta_lead_events_lead_idx_stmt FROM @add_meta_lead_events_lead_idx_sql;
EXECUTE add_meta_lead_events_lead_idx_stmt;
DEALLOCATE PREPARE add_meta_lead_events_lead_idx_stmt;

SET @add_meta_lead_events_status_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'meta_lead_events'
       AND INDEX_NAME = 'idx_meta_lead_events_status'
  ),
  'ALTER TABLE meta_lead_events ADD INDEX idx_meta_lead_events_status (status)',
  'SELECT ''idx_meta_lead_events_status already exists'' AS message'
);
PREPARE add_meta_lead_events_status_idx_stmt FROM @add_meta_lead_events_status_idx_sql;
EXECUTE add_meta_lead_events_status_idx_stmt;
DEALLOCATE PREPARE add_meta_lead_events_status_idx_stmt;

SET @add_meta_lead_events_received_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'meta_lead_events'
       AND INDEX_NAME = 'idx_meta_lead_events_received_at'
  ),
  'ALTER TABLE meta_lead_events ADD INDEX idx_meta_lead_events_received_at (received_at)',
  'SELECT ''idx_meta_lead_events_received_at already exists'' AS message'
);
PREPARE add_meta_lead_events_received_idx_stmt FROM @add_meta_lead_events_received_idx_sql;
EXECUTE add_meta_lead_events_received_idx_stmt;
DEALLOCATE PREPARE add_meta_lead_events_received_idx_stmt;
