-- Migration: seed missing permissions used by menu and Angular routes.
-- Scope: permissions catalog only.
-- MySQL 8 compatible and idempotent.
-- Does not alter users, roles, role_permissions, or user_permission_overrides.

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'atendimento.clientes.visualizar',
  'Visualizar Clientes',
  'Permite visualizar clientes.',
  'Atendimento',
  'visualizar',
  '/jm/clientes',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'atendimento.clientes.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'vendas.dashboard.visualizar',
  'Visualizar Dashboard de Vendas',
  'Permite visualizar o dashboard comercial/vendas.',
  'Vendas',
  'visualizar',
  '/jm/vendas/dashboard',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'vendas.dashboard.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'vendas.unidades.visualizar',
  'Visualizar Unidades',
  'Permite visualizar unidades no modulo de vendas.',
  'Vendas',
  'visualizar',
  '/jm/vendas/gerenciamento-unidades',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'vendas.unidades.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.dre.visualizar',
  'Visualizar DRE',
  'Permite visualizar DRE.',
  'Financeiro',
  'visualizar',
  '/jm/financeiro/dre',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.dre.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.fluxo_caixa.visualizar',
  'Visualizar Fluxo de Caixa',
  'Permite visualizar fluxo de caixa.',
  'Financeiro',
  'visualizar',
  '/jm/financeiro/fluxo-caixa',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.fluxo_caixa.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.comissoes.visualizar',
  'Visualizar Comissoes',
  'Permite visualizar comissoes.',
  'Financeiro',
  'visualizar',
  '/jm/financeiro/comissoes',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.comissoes.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'cadastros.construtoras.visualizar',
  'Visualizar Construtoras',
  'Permite visualizar construtoras.',
  'Cadastros',
  'visualizar',
  '/jm/cadastros/construtoras',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'cadastros.construtoras.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'cadastros.empreendimentos.visualizar',
  'Visualizar Empreendimentos',
  'Permite visualizar empreendimentos.',
  'Cadastros',
  'visualizar',
  '/jm/cadastros/empreendimentos',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'cadastros.empreendimentos.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'administracao.usuarios.visualizar',
  'Visualizar Usuarios',
  'Permite visualizar usuarios.',
  'Administracao',
  'visualizar',
  '/jm/configuracoes/perfis-acessos',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'administracao.usuarios.visualizar'
);
