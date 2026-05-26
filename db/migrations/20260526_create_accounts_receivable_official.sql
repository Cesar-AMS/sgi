-- Migration: create official Accounts Receivable base for the financial pilot.
-- Scope: official pilot tables only.
-- MySQL 8 compatible and idempotent.
-- Does not alter legacy receivables/payables.
-- Does not delete, truncate, migrate, or overwrite existing data.

CREATE TABLE IF NOT EXISTS jmoficial.accounts_receivable (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  SaleId INT NULL DEFAULT 0,
  BranchId INT NULL,
  CreateDate DATETIME NULL,
  DueDate DATETIME NULL,
  PayDate DATETIME NULL,
  description VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'WAITING',
  category VARCHAR(80) NOT NULL,
  Amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  PendingAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
  observations TEXT NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS jmoficial.accounts_receivable_settlements (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  accounts_receivable_id INT NOT NULL,
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
    AND TABLE_NAME = 'accounts_receivable'
    AND INDEX_NAME = 'idx_accounts_receivable_sale_id'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_receivable ADD INDEX idx_accounts_receivable_sale_id (SaleId)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_receivable'
    AND INDEX_NAME = 'idx_accounts_receivable_branch_id'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_receivable ADD INDEX idx_accounts_receivable_branch_id (BranchId)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_receivable'
    AND INDEX_NAME = 'idx_accounts_receivable_due_date'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_receivable ADD INDEX idx_accounts_receivable_due_date (DueDate)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_receivable'
    AND INDEX_NAME = 'idx_accounts_receivable_pay_date'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_receivable ADD INDEX idx_accounts_receivable_pay_date (PayDate)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_receivable'
    AND INDEX_NAME = 'idx_accounts_receivable_status'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_receivable ADD INDEX idx_accounts_receivable_status (status)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_receivable'
    AND INDEX_NAME = 'idx_accounts_receivable_category'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_receivable ADD INDEX idx_accounts_receivable_category (category)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_receivable'
    AND INDEX_NAME = 'idx_accounts_receivable_deleted_at'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_receivable ADD INDEX idx_accounts_receivable_deleted_at (deleted_at)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_receivable_settlements'
    AND INDEX_NAME = 'idx_accounts_receivable_settlements_receivable_id'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_receivable_settlements ADD INDEX idx_accounts_receivable_settlements_receivable_id (accounts_receivable_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'jmoficial'
    AND TABLE_NAME = 'accounts_receivable_settlements'
    AND INDEX_NAME = 'idx_accounts_receivable_settlements_paid_date'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE jmoficial.accounts_receivable_settlements ADD INDEX idx_accounts_receivable_settlements_paid_date (paid_date)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- FK intentionally not added in this pilot migration to avoid failing on existing
-- environments that may already have settlement rows without enforced integrity.
-- Referential integrity must be reviewed in a future migration after data audit.
