-- Migration: add lead transfer history permission
-- Scope: permissions catalog only.
-- MySQL 8 compatible and idempotent.

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'atendimento.leads.transferencias.visualizar',
  'Visualizar historico de transferencia de Leads',
  'Permite visualizar o historico de transferencia de responsaveis do lead.',
  'Atendimento',
  'visualizar',
  '/jm/atendimento/leads/:id',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM jmoficial.permissions
  WHERE permission_key = 'atendimento.leads.transferencias.visualizar'
);

UPDATE jmoficial.permissions
SET
  name = 'Visualizar historico de transferencia de Leads',
  description = 'Permite visualizar o historico de transferencia de responsaveis do lead.',
  module = 'Atendimento',
  action = 'visualizar',
  route = '/jm/atendimento/leads/:id',
  is_active = 1,
  updated_at = CURRENT_TIMESTAMP
WHERE permission_key = 'atendimento.leads.transferencias.visualizar';
