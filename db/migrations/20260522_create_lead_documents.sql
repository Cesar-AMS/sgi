CREATE TABLE IF NOT EXISTS jmoficial.lead_documents (
  id BIGINT NOT NULL AUTO_INCREMENT,
  lead_id INT NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  content_type VARCHAR(120) NOT NULL,
  file_size BIGINT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_by_user_id BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_lead_documents_lead_id (lead_id),
  KEY idx_lead_documents_deleted_at (deleted_at),
  KEY idx_lead_documents_uploaded_by_user_id (uploaded_by_user_id),
  CONSTRAINT fk_lead_documents_lead
    FOREIGN KEY (lead_id) REFERENCES jmoficial.leads(Id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);
