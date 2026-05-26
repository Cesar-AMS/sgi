-- Migration: seed finance action permissions.
-- Scope: permissions catalog only.
-- MySQL 8 compatible and idempotent.
-- Does not alter users, roles, role_permissions, or user_permission_overrides.

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.contas_receber.criar',
  'Criar Contas a Receber',
  'Permite criar contas a receber.',
  'Financeiro',
  'criar',
  '/jm/financeiro/contas-receber',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.contas_receber.criar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.contas_receber.editar',
  'Editar Contas a Receber',
  'Permite editar contas a receber.',
  'Financeiro',
  'editar',
  '/jm/financeiro/contas-receber',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.contas_receber.editar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.contas_receber.baixar',
  'Baixar Contas a Receber',
  'Permite baixar contas a receber.',
  'Financeiro',
  'baixar',
  '/jm/financeiro/contas-receber',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.contas_receber.baixar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.contas_receber.cancelar',
  'Cancelar Contas a Receber',
  'Permite cancelar contas a receber.',
  'Financeiro',
  'cancelar',
  '/jm/financeiro/contas-receber',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.contas_receber.cancelar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.contas_pagar.criar',
  'Criar Contas a Pagar',
  'Permite criar contas a pagar.',
  'Financeiro',
  'criar',
  '/jm/financeiro/contas-pagar',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.contas_pagar.criar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.contas_pagar.editar',
  'Editar Contas a Pagar',
  'Permite editar contas a pagar.',
  'Financeiro',
  'editar',
  '/jm/financeiro/contas-pagar',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.contas_pagar.editar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.contas_pagar.pagar',
  'Pagar Contas a Pagar',
  'Permite pagar contas a pagar.',
  'Financeiro',
  'pagar',
  '/jm/financeiro/contas-pagar',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.contas_pagar.pagar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.contas_pagar.cancelar',
  'Cancelar Contas a Pagar',
  'Permite cancelar contas a pagar.',
  'Financeiro',
  'cancelar',
  '/jm/financeiro/contas-pagar',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.contas_pagar.cancelar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.comissoes.editar',
  'Editar Comissoes',
  'Permite editar comissoes.',
  'Financeiro',
  'editar',
  '/jm/financeiro/comissoes',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.comissoes.editar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.comissoes.pagar',
  'Pagar Comissoes',
  'Permite pagar comissoes.',
  'Financeiro',
  'pagar',
  '/jm/financeiro/comissoes',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.comissoes.pagar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.regras_comissao.visualizar',
  'Visualizar Regras de Comissao',
  'Permite visualizar regras de comissao.',
  'Financeiro',
  'visualizar',
  '/jm/financeiro/comissoes',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.regras_comissao.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.regras_comissao.editar',
  'Editar Regras de Comissao',
  'Permite criar, editar e desativar regras de comissao.',
  'Financeiro',
  'editar',
  '/jm/financeiro/comissoes',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.regras_comissao.editar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.relatorios.visualizar',
  'Visualizar Relatorios Financeiros',
  'Permite visualizar relatorios financeiros.',
  'Financeiro',
  'visualizar',
  NULL,
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.relatorios.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.financial.gerar',
  'Gerar Financeiro',
  'Permite gerar financeiro a partir de venda ou proposta.',
  'Financeiro',
  'gerar',
  NULL,
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.financial.gerar'
);
