-- Migration: organize Atendimento permissions by role.
-- Scope: additive role grants only.
-- Does not remove existing permissions, does not touch users, and does not alter user_permission_overrides.
-- MySQL 8 compatible and idempotent.

INSERT INTO jmoficial.role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM jmoficial.roles r
JOIN jmoficial.permissions p
  ON p.permission_key IN (
    'atendimento.leads.visualizar',
    'atendimento.leads.editar',
    'atendimento.agendamento.visualizar'
  )
WHERE r.name IN ('Corretor', 'Corretor Parceiro', 'Vendedor', 'Atendente')
  AND p.is_active = 1
  AND NOT EXISTS (
    SELECT 1
    FROM jmoficial.role_permissions existing
    WHERE existing.role_id = r.id
      AND existing.permission_id = p.id
  );

INSERT INTO jmoficial.role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM jmoficial.roles r
JOIN jmoficial.permissions p
  ON p.permission_key IN (
    'atendimento.leads.visualizar',
    'atendimento.leads.editar',
    'atendimento.visitas.visualizar'
  )
WHERE r.name IN ('Recepcionista', 'Controle de visitas', 'Secretaria')
  AND p.is_active = 1
  AND NOT EXISTS (
    SELECT 1
    FROM jmoficial.role_permissions existing
    WHERE existing.role_id = r.id
      AND existing.permission_id = p.id
  );

INSERT INTO jmoficial.role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM jmoficial.roles r
JOIN jmoficial.permissions p
  ON p.permission_key IN (
    'atendimento.leads.visualizar',
    'atendimento.leads.editar',
    'atendimento.agendamento.visualizar',
    'atendimento.visitas.visualizar',
    'atendimento.relatorios.visualizar'
  )
WHERE r.name IN ('Diretor Comercial', 'Diretor Financeiro', 'Gerente', 'Coordenador', 'Gestor')
  AND p.is_active = 1
  AND NOT EXISTS (
    SELECT 1
    FROM jmoficial.role_permissions existing
    WHERE existing.role_id = r.id
      AND existing.permission_id = p.id
  );
