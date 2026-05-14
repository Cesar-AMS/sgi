-- Migration: create employee documents table
-- Target database/schema: MySQL 8 / jmoficial
--
-- Stores metadata for scanned employee documents.
-- Files must be stored on disk; this table stores only metadata/path.

CREATE TABLE IF NOT EXISTS jmoficial.employee_documents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  document_type VARCHAR(60) NOT NULL,
  document_label VARCHAR(120) NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  content_type VARCHAR(120) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_employee_documents_user_id (user_id),
  KEY idx_employee_documents_type (document_type),
  KEY idx_employee_documents_user_type (user_id, document_type),
  CONSTRAINT fk_employee_documents_user_id
    FOREIGN KEY (user_id)
    REFERENCES jmoficial.users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
