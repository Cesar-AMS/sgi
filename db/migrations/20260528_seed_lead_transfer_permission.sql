INSERT INTO permissions (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.leads.transferir',
  'Transferir Leads',
  'Permite transferir leads selecionados entre agentes.',
  'Atendimento',
  'transferir',
  '/jm/atendimento/leads',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM permissions WHERE permission_key = 'atendimento.leads.transferir'
);
