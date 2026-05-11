-- Migration: add proposal commission summary fields
-- Target database: MySQL 8 / jmoficial
--
-- Apply this migration once only.
-- MySQL support for ALTER TABLE ... ADD COLUMN IF NOT EXISTS varies by version,
-- so the ADD COLUMN statements below intentionally do not use IF NOT EXISTS.
-- Before applying, confirm these columns do not already exist in proposals.

ALTER TABLE proposals
  ADD COLUMN commission_mode VARCHAR(30) NULL AFTER deleted_at,
  ADD COLUMN commission_percentage DECIMAL(5,2) NULL AFTER commission_mode,
  ADD COLUMN commission_total DECIMAL(15,2) NULL AFTER commission_percentage,
  ADD COLUMN commission_total_to_realestate DECIMAL(15,2) NULL AFTER commission_total,
  ADD COLUMN commission_total_to_constructor DECIMAL(15,2) NULL AFTER commission_total_to_realestate,
  ADD COLUMN commission_balance DECIMAL(15,2) NULL AFTER commission_total_to_constructor,
  ADD COLUMN commission_calculated_at DATETIME(6) NULL AFTER commission_balance,
  ADD COLUMN commission_calculation_version INT NULL AFTER commission_calculated_at;
