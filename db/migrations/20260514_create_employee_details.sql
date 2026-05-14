-- Migration: create employee details table
-- Target database/schema: MySQL 8 / jmoficial
--
-- Apply this migration manually when RH employee details are ready.
-- This migration creates a complementary table for employee-specific data.
-- It does not alter users and does not duplicate person/access records.

CREATE TABLE IF NOT EXISTS jmoficial.employee_details (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,

  rg VARCHAR(30) NULL,
  rg_issue_date DATE NULL,
  rg_issuer VARCHAR(50) NULL,
  rg_state VARCHAR(2) NULL,
  birth_date DATE NULL,
  birth_city VARCHAR(120) NULL,
  birth_state VARCHAR(2) NULL,
  nationality VARCHAR(80) NULL,
  marital_status VARCHAR(40) NULL,
  spouse_name VARCHAR(150) NULL,
  father_name VARCHAR(150) NULL,
  mother_name VARCHAR(150) NULL,
  education_level VARCHAR(80) NULL,
  education_status VARCHAR(50) NULL,

  ctps_number VARCHAR(40) NULL,
  ctps_series VARCHAR(20) NULL,
  ctps_state VARCHAR(2) NULL,
  ctps_issue_date DATE NULL,
  pis_pasep VARCHAR(30) NULL,
  voter_title VARCHAR(40) NULL,
  voter_zone VARCHAR(20) NULL,
  voter_section VARCHAR(20) NULL,
  reservist_number VARCHAR(40) NULL,
  reservist_category VARCHAR(40) NULL,

  first_job TINYINT(1) NULL,
  salary DECIMAL(15,2) NULL,
  function_name VARCHAR(120) NULL,
  monthly_workload DECIMAL(8,2) NULL,
  weekly_workload DECIMAL(8,2) NULL,
  day_off VARCHAR(40) NULL,
  experience_contract_days INT NULL,
  experience_extension_days INT NULL,
  transport_voucher_discount DECIMAL(8,2) NULL,
  work_schedule_notes TEXT NULL,

  has_dependents TINYINT(1) NULL,
  dependent_notes TEXT NULL,
  notes TEXT NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_employee_details_user_id (user_id),
  KEY idx_employee_details_user_id (user_id),
  CONSTRAINT fk_employee_details_user_id
    FOREIGN KEY (user_id)
    REFERENCES jmoficial.users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
