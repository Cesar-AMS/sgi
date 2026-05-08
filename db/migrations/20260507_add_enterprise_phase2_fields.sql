-- Migration: add enterprise phase 2 fields
-- Target database: MySQL 8 / jmoficial
--
-- Apply this migration once only.
-- MySQL support for ALTER TABLE ... ADD COLUMN IF NOT EXISTS varies by version,
-- so the ADD COLUMN statements below intentionally do not use IF NOT EXISTS.
-- Before applying, confirm these columns do not already exist in enterprises.

ALTER TABLE enterprises
  ADD COLUMN floor_count INT NULL AFTER towers_number,
  ADD COLUMN units_per_floor INT NULL AFTER floor_count,
  ADD COLUMN approval_act DECIMAL(10,2) NULL AFTER observations,
  ADD COLUMN approval_installments INT NULL AFTER approval_act,
  ADD COLUMN approval_intermediate DECIMAL(10,2) NULL AFTER approval_installments;

CREATE TABLE IF NOT EXISTS enterprise_unit_final_sizes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  enterprise_id BIGINT UNSIGNED NOT NULL,
  unit_final INT NOT NULL,
  size_m2 DECIMAL(10,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_enterprise_final (enterprise_id, unit_final),
  CONSTRAINT fk_enterprise_unit_final_sizes_enterprise
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id)
);
