-- Migration: create external collaborator details table
-- Target database/schema: MySQL 8 / jmoficial
--
-- Stores PJ/external collaborator dates and contract metadata.
-- Contract files are stored on disk; this table stores only metadata/path.

CREATE TABLE IF NOT EXISTS jmoficial.external_collaborator_details (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  contract_file_name VARCHAR(255) NULL,
  contract_file_path VARCHAR(500) NULL,
  contract_content_type VARCHAR(120) NULL,
  contract_size BIGINT UNSIGNED NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_external_collaborator_details_user_id (user_id),
  KEY idx_external_collaborator_details_user_id (user_id),
  CONSTRAINT fk_external_collaborator_details_user_id
    FOREIGN KEY (user_id)
    REFERENCES jmoficial.users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
