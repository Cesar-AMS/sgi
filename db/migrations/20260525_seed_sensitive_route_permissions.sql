-- Migration: seed permissions for sensitive pending routes.
-- Scope: permissions catalog only.
-- MySQL 8 compatible and idempotent.
-- Does not alter users, roles, role_permissions, or user_permission_overrides.

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'comercial.propostas.analisar_credito',
  'Analisar Credito de Propostas',
  'Permite analisar credito/perfil de propostas e vendas.',
  'Comercial',
  'analisar_credito',
  '/jm/credit-analysis/:saleId',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'comercial.propostas.analisar_credito'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'comercial.contratos.visualizar',
  'Visualizar Contratos',
  'Permite visualizar contratos comerciais.',
  'Comercial',
  'visualizar',
  '/jm/contracts/:saleId',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'comercial.contratos.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'comercial.contratos.editar',
  'Editar Contratos',
  'Permite criar e editar contratos comerciais.',
  'Comercial',
  'editar',
  '/jm/contracts/:saleId',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'comercial.contratos.editar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.repasses.visualizar',
  'Visualizar Repasses',
  'Permite visualizar repasses para construtora.',
  'Financeiro',
  'visualizar',
  '/jm/constructor-transfer/:saleId',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.repasses.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.repasses.editar',
  'Editar Repasses',
  'Permite criar e editar repasses para construtora.',
  'Financeiro',
  'editar',
  '/jm/constructor-transfer/:saleId',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.repasses.editar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'rh.comparecimentos.visualizar',
  'Visualizar Comparecimentos',
  'Permite visualizar registros de comparecimento/presenca.',
  'RH',
  'visualizar',
  '/jm/comparecimento',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'rh.comparecimentos.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'rh.comparecimentos.editar',
  'Editar Comparecimentos',
  'Permite lancar, editar e excluir registros de comparecimento/presenca.',
  'RH',
  'editar',
  '/jm/comparecimento',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'rh.comparecimentos.editar'
);
