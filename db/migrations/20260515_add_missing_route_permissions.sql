-- Migration: add missing route permissions
-- Scope: permissions catalog only.
-- MySQL 8 compatible and idempotent.

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'cadastros.construtoras.criar',
  'Criar Construtoras',
  'Permite criar construtoras.',
  'Cadastros',
  'criar',
  '/jm/cadastros/construtoras/novo',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'cadastros.construtoras.criar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'cadastros.construtoras.editar',
  'Editar Construtoras',
  'Permite editar construtoras.',
  'Cadastros',
  'editar',
  '/jm/cadastros/construtoras/editar/:id',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'cadastros.construtoras.editar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'cadastros.empreendimentos.criar',
  'Criar Empreendimentos',
  'Permite criar empreendimentos.',
  'Cadastros',
  'criar',
  '/jm/cadastros/empreendimentos/novo',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'cadastros.empreendimentos.criar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'cadastros.empreendimentos.editar',
  'Editar Empreendimentos',
  'Permite editar empreendimentos.',
  'Cadastros',
  'editar',
  '/jm/cadastros/empreendimentos/editar/:id',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'cadastros.empreendimentos.editar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'cadastros.unidades.visualizar',
  'Visualizar Unidades',
  'Permite visualizar unidades.',
  'Cadastros',
  'visualizar',
  '/jm/cadastros/unidades',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'cadastros.unidades.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'cadastros.unidades.criar',
  'Criar Unidades',
  'Permite criar unidades.',
  'Cadastros',
  'criar',
  '/jm/cadastros/unidades/novo',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'cadastros.unidades.criar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'cadastros.unidades.editar',
  'Editar Unidades',
  'Permite editar unidades.',
  'Cadastros',
  'editar',
  '/jm/cadastros/unidades/editar/:id',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'cadastros.unidades.editar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'atendimento.clientes.criar',
  'Criar Clientes',
  'Permite criar clientes.',
  'Atendimento',
  'criar',
  '/jm/cadastros/clientes/novo',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'atendimento.clientes.criar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'atendimento.clientes.editar',
  'Editar Clientes',
  'Permite editar clientes.',
  'Atendimento',
  'editar',
  '/jm/cadastros/clientes/editar/:id',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'atendimento.clientes.editar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'vendas.vendas.criar',
  'Criar Vendas',
  'Permite criar vendas.',
  'Vendas',
  'criar',
  '/jm/vendas/new',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'vendas.vendas.criar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'vendas.vendas.editar',
  'Editar Vendas',
  'Permite editar vendas.',
  'Vendas',
  'editar',
  '/jm/vendas/edit/:id',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'vendas.vendas.editar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'vendas.cancelamentos.visualizar',
  'Visualizar Cancelamentos',
  'Permite visualizar cancelamentos de vendas.',
  'Vendas',
  'visualizar',
  '/jm/vendas/desistencias',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'vendas.cancelamentos.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.centro_custo.visualizar',
  'Visualizar Centro de Custo',
  'Permite visualizar centro de custo.',
  'Financeiro',
  'visualizar',
  '/jm/financeiro/centro-custo',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.centro_custo.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.contas_contabeis.visualizar',
  'Visualizar Contas Contabeis',
  'Permite visualizar contas contabeis.',
  'Financeiro',
  'visualizar',
  '/jm/financeiro/contas-contabeis',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.contas_contabeis.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'financeiro.projecao.visualizar',
  'Visualizar Projecao Financeira',
  'Permite visualizar projecao financeira.',
  'Financeiro',
  'visualizar',
  '/jm/financeiro/projecao',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'financeiro.projecao.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'rh.faltas.visualizar',
  'Visualizar Controle de Faltas',
  'Permite visualizar controle de faltas.',
  'RH',
  'visualizar',
  '/jm/rh/controle-faltas',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'rh.faltas.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'rh.folha_pagamentos.visualizar',
  'Visualizar Folha de Pagamentos',
  'Permite visualizar folha de pagamentos.',
  'RH',
  'visualizar',
  '/jm/rh/folha-pagamentos',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'rh.folha_pagamentos.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'rh.ferias.visualizar',
  'Visualizar Ferias',
  'Permite visualizar ferias.',
  'RH',
  'visualizar',
  '/jm/rh/ferias',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'rh.ferias.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active, created_at, updated_at)
SELECT
  'rh.uniformes.visualizar',
  'Visualizar Controle de Uniformes',
  'Permite visualizar controle de uniformes.',
  'RH',
  'visualizar',
  '/jm/rh/controle-uniforme',
  1,
  CURRENT_TIMESTAMP,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'rh.uniformes.visualizar'
);
