INSERT INTO permissions (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.distribuicao_leads.visualizar',
  'Visualizar Distribuicao de Leads',
  'Permite visualizar configuracoes da distribuicao inteligente de leads.',
  'Atendimento',
  'visualizar',
  '/jm/atendimento/leads/distribuicao',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM permissions WHERE permission_key = 'atendimento.distribuicao_leads.visualizar'
);

INSERT INTO permissions (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.distribuicao_leads.editar',
  'Editar Distribuicao de Leads',
  'Permite criar, editar, ativar e remover agentes da distribuicao inteligente de leads.',
  'Atendimento',
  'editar',
  '/jm/atendimento/leads/distribuicao',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM permissions WHERE permission_key = 'atendimento.distribuicao_leads.editar'
);
