-- Migration: seed permissions for Atendimento > Gestao.
-- Scope: permissions catalog only.
-- MySQL 8 compatible and idempotent.
-- Does not alter roles, role_permissions, user_permission_overrides, users, or users.menu_json.

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.gestao.visualizar',
  'Visualizar Gestao de Atendimento',
  'Permite visualizar o submodulo Gestao de Atendimento.',
  'Atendimento',
  'visualizar',
  '/jm/atendimento/gestao',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'atendimento.gestao.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.gestao.editar',
  'Editar Gestao de Atendimento',
  'Permite editar configuracoes gerais do submodulo Gestao de Atendimento.',
  'Atendimento',
  'editar',
  '/jm/atendimento/gestao',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'atendimento.gestao.editar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.gestao.distribuicao_leads.visualizar',
  'Visualizar Distribuicao de Leads',
  'Permite visualizar a aba Distribuicao de Leads na Gestao de Atendimento.',
  'Atendimento',
  'visualizar',
  '/jm/atendimento/gestao/distribuicao-leads',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'atendimento.gestao.distribuicao_leads.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.gestao.distribuicao_leads.editar',
  'Editar Distribuicao de Leads',
  'Permite criar, alterar ou remover regras de distribuicao de leads.',
  'Atendimento',
  'editar',
  '/jm/atendimento/gestao/distribuicao-leads',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'atendimento.gestao.distribuicao_leads.editar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.gestao.regioes_interesse.visualizar',
  'Visualizar Regioes de Interesse',
  'Permite visualizar a aba Regioes de Interesse na Gestao de Atendimento.',
  'Atendimento',
  'visualizar',
  '/jm/atendimento/gestao/regioes-interesse',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'atendimento.gestao.regioes_interesse.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.gestao.regioes_interesse.editar',
  'Editar Regioes de Interesse',
  'Permite criar, alterar ou remover regioes de interesse.',
  'Atendimento',
  'editar',
  '/jm/atendimento/gestao/regioes-interesse',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'atendimento.gestao.regioes_interesse.editar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.gestao.fontes_origem.visualizar',
  'Visualizar Fontes de Origem',
  'Permite visualizar a aba Fontes de Origem na Gestao de Atendimento.',
  'Atendimento',
  'visualizar',
  '/jm/atendimento/gestao/fontes-origem',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'atendimento.gestao.fontes_origem.visualizar'
);

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.gestao.fontes_origem.editar',
  'Editar Fontes de Origem',
  'Permite criar, alterar ou remover fontes de origem.',
  'Atendimento',
  'editar',
  '/jm/atendimento/gestao/fontes-origem',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM jmoficial.permissions WHERE permission_key = 'atendimento.gestao.fontes_origem.editar'
);
