-- Migration: create lead_post_visit for Atendimento Pos-Visita.
-- Scope: creates the post-visit layer linked to leads only.
-- MySQL 8 compatible and idempotent.
-- Does not alter leads, lead_schedules, proposals, users, roles, or permissions.

CREATE TABLE IF NOT EXISTS jmoficial.lead_post_visit (
  id BIGINT NOT NULL AUTO_INCREMENT,
  lead_id INT NOT NULL,
  cpf VARCHAR(20) NULL,
  has_restriction TINYINT(1) NULL,
  income_type VARCHAR(30) NULL,
  interest_region VARCHAR(255) NULL,
  pays_rent TINYINT(1) NULL,
  marital_status VARCHAR(50) NULL,
  down_payment_amount DECIMAL(15,2) NULL,
  attending_agent_id BIGINT NULL,
  property_interest_type VARCHAR(30) NULL,
  post_visit_status VARCHAR(50) NOT NULL DEFAULT 'ACOMPANHANDO',
  next_follow_up_at DATETIME NULL,
  last_interaction_summary TEXT NULL,
  proposal_id BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_lead_post_visit_lead_id (lead_id),
  KEY idx_lead_post_visit_status (post_visit_status),
  KEY idx_lead_post_visit_attending_agent_id (attending_agent_id),
  KEY idx_lead_post_visit_proposal_id (proposal_id),
  KEY idx_lead_post_visit_next_follow_up_at (next_follow_up_at),
  KEY idx_lead_post_visit_deleted_at (deleted_at),
  CONSTRAINT fk_lead_post_visit_lead
    FOREIGN KEY (lead_id) REFERENCES jmoficial.leads(Id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);
