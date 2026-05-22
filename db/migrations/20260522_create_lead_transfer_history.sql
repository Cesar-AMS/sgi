CREATE TABLE IF NOT EXISTS jmoficial.lead_transfer_history (
  id BIGINT NOT NULL AUTO_INCREMENT,
  lead_id INT NOT NULL,
  previous_seller_id BIGINT NULL,
  previous_seller_name VARCHAR(255) NULL,
  new_seller_id BIGINT NULL,
  new_seller_name VARCHAR(255) NULL,
  previous_coordinator_id BIGINT NULL,
  previous_coordinator_name VARCHAR(255) NULL,
  new_coordinator_id BIGINT NULL,
  new_coordinator_name VARCHAR(255) NULL,
  previous_manager_id BIGINT NULL,
  previous_manager_name VARCHAR(255) NULL,
  new_manager_id BIGINT NULL,
  new_manager_name VARCHAR(255) NULL,
  changed_by_user_id BIGINT NULL,
  change_reason TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lead_transfer_history_lead_id (lead_id),
  KEY idx_lead_transfer_history_created_at (created_at),
  KEY idx_lead_transfer_history_changed_by_user_id (changed_by_user_id),
  CONSTRAINT fk_lead_transfer_history_lead
    FOREIGN KEY (lead_id) REFERENCES jmoficial.leads(Id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);
