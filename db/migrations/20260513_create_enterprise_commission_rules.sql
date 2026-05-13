-- Migration: create enterprise commission rule tables
-- Target database: MySQL 8 / jmoficial
--
-- Apply this migration manually when the commission rule admin is ready.
-- This migration only creates new tables; it does not alter existing flow tables.

CREATE TABLE IF NOT EXISTS enterprise_commission_rules (
  id BIGINT NOT NULL AUTO_INCREMENT,
  enterprise_id BIGINT NOT NULL,
  rule_type VARCHAR(30) NOT NULL,
  version INT NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  ato_threshold DECIMAL(15,2) NULL DEFAULT 5000.00,
  payment_day INT NOT NULL DEFAULT 5,
  director_enabled TINYINT(1) NOT NULL DEFAULT 0,
  campaign_name VARCHAR(150) NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_enterprise_commission_rules_version (enterprise_id, rule_type, version),
  KEY idx_enterprise_commission_rules_enterprise_active (enterprise_id, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS enterprise_commission_rule_items (
  id BIGINT NOT NULL AUTO_INCREMENT,
  rule_id BIGINT NOT NULL,
  role VARCHAR(40) NOT NULL,
  percentage DECIMAL(8,4) NULL,
  fixed_amount DECIMAL(15,2) NULL,
  payment_mode VARCHAR(40) NOT NULL DEFAULT 'FIXED_DAY',
  payment_day INT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_enterprise_commission_rule_items_rule_id (rule_id),
  CONSTRAINT fk_enterprise_commission_rule_items_rule_id
    FOREIGN KEY (rule_id)
    REFERENCES enterprise_commission_rules (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
