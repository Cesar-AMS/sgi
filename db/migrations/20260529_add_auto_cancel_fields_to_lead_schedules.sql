SET @column_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'LeadSchedules'
    AND COLUMN_NAME = 'auto_cancelled_at'
);

SET @sql := IF(
  @column_exists = 0,
  'ALTER TABLE LeadSchedules ADD COLUMN auto_cancelled_at DATETIME NULL',
  'SELECT "Column auto_cancelled_at already exists"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'LeadSchedules'
    AND COLUMN_NAME = 'auto_cancelled_reason'
);

SET @sql := IF(
  @column_exists = 0,
  'ALTER TABLE LeadSchedules ADD COLUMN auto_cancelled_reason VARCHAR(255) NULL',
  'SELECT "Column auto_cancelled_reason already exists"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'LeadSchedules'
    AND INDEX_NAME = 'idx_lead_schedules_auto_cancelled_at'
);

SET @sql := IF(
  @index_exists = 0,
  'CREATE INDEX idx_lead_schedules_auto_cancelled_at ON LeadSchedules (auto_cancelled_at)',
  'SELECT "Index idx_lead_schedules_auto_cancelled_at already exists"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
