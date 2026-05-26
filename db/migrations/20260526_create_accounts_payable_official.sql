-- Migration: create official Accounts Payable base for the financial pilot.
-- Scope: official pilot tables only.
-- MySQL 8 compatible and idempotent.
-- Does not alter legacy receivables/payables.
-- Does not delete, truncate, migrate, or overwrite existing data.

CREATE TABLE IF NOT EXISTS jmoficial.accounts_payable (
  Id BIGINT AUTO_INCREMENT PRIMARY KEY,
  SaleId BIGINT NULL,
  UserId BIGINT NULL,
  CreateDate DATETIME NULL,
  DueDate DATETIME NULL,
  PayDate DATETIME NULL,
  Description VARCHAR(255) NOT NULL,
  Status VARCHAR(30) NOT NULL DEFAULT 'WAITING',
  Amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  PendingAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
  Category VARCHAR(80) NOT NULL,
  Observations TEXT NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS jmoficial.accounts_payable_settlements (
  Id BIGINT AUTO_INCREMENT PRIMARY KEY,
  accounts_payable_id BIGINT NOT NULL,
  paid_value DECIMAL(18,2) NOT NULL,
  paid_date DATETIME NOT NULL,
  observations TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes are created through INFORMATION_SCHEMA guards because CREATE INDEX IF NOT EXISTS
-- is not consistently available across MySQL/MariaDB installations used in deployments.

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_payable'
    AND INDEX_NAME = 'idx_accounts_payable_sale_id'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_payable ADD INDEX idx_accounts_payable_sale_id (SaleId)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_payable'
    AND INDEX_NAME = 'idx_accounts_payable_user_id'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_payable ADD INDEX idx_accounts_payable_user_id (UserId)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_payable'
    AND INDEX_NAME = 'idx_accounts_payable_due_date'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_payable ADD INDEX idx_accounts_payable_due_date (DueDate)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_payable'
    AND INDEX_NAME = 'idx_accounts_payable_pay_date'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_payable ADD INDEX idx_accounts_payable_pay_date (PayDate)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_payable'
    AND INDEX_NAME = 'idx_accounts_payable_status'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_payable ADD INDEX idx_accounts_payable_status (Status)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_payable'
    AND INDEX_NAME = 'idx_accounts_payable_category'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_payable ADD INDEX idx_accounts_payable_category (Category)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_payable'
    AND INDEX_NAME = 'idx_accounts_payable_deleted_at'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_payable ADD INDEX idx_accounts_payable_deleted_at (deleted_at)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_payable_settlements'
    AND INDEX_NAME = 'idx_accounts_payable_settlements_payable_id'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_payable_settlements ADD INDEX idx_accounts_payable_settlements_payable_id (accounts_payable_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_payable_settlements'
    AND INDEX_NAME = 'idx_accounts_payable_settlements_paid_date'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_payable_settlements ADD INDEX idx_accounts_payable_settlements_paid_date (paid_date)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- FK intentionally not added in this pilot migration to avoid failing on existing
-- environments that may already have settlement rows without enforced integrity.
-- Referential integrity must be reviewed in a future migration after data audit.
