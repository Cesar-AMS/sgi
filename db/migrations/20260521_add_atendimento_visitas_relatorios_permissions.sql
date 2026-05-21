-- Migration: add definitive Atendimento permissions for Visitas and Relatorios
-- Scope: permissions catalog only.
-- MySQL 8 compatible and idempotent.

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'atendimento.visitas.visualizar',
  'Visualizar Visitas',
  'Permite visualizar o painel de visitas presenciais.',
  'Atendimento',
  'visualizar',
  '/jm/atendimento/visitas',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'atendimento.visitas.visualizar'
);

UPDATE jmoficial.permissions
SET
  name = 'Visualizar Visitas',
  description = 'Permite visualizar o painel de visitas presenciais.',
  module = 'Atendimento',
  action = 'visualizar',
  route = '/jm/atendimento/visitas',
  is_active = 1,
  updated_at = CURRENT_TIMESTAMP
WHERE permission_key = 'atendimento.visitas.visualizar';

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'atendimento.relatorios.visualizar',
  'Visualizar Relatorios de Atendimento',
  'Permite visualizar relatorios e indicadores de atendimento.',
  'Atendimento',
  'visualizar',
  '/jm/atendimento/relatorios',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'atendimento.relatorios.visualizar'
);

UPDATE jmoficial.permissions
SET
  name = 'Visualizar Relatorios de Atendimento',
  description = 'Permite visualizar relatorios e indicadores de atendimento.',
  module = 'Atendimento',
  action = 'visualizar',
  route = '/jm/atendimento/relatorios',
  is_active = 1,
  updated_at = CURRENT_TIMESTAMP
WHERE permission_key = 'atendimento.relatorios.visualizar';

INSERT INTO jmoficial.role_permissions (role_id, permission_id, created_at)
SELECT
  rp.role_id,
  visitas.id,
  CURRENT_TIMESTAMP
FROM jmoficial.role_permissions rp
JOIN jmoficial.permissions agendamento
  ON agendamento.id = rp.permission_id
  AND agendamento.permission_key = 'atendimento.agendamento.visualizar'
JOIN jmoficial.permissions visitas
  ON visitas.permission_key = 'atendimento.visitas.visualizar'
WHERE NOT EXISTS (
  SELECT 1
  FROM jmoficial.role_permissions existing
  WHERE existing.role_id = rp.role_id
    AND existing.permission_id = visitas.id
);
