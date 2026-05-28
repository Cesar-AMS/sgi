INSERT INTO permissions (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.leads.visualizar.todos',
  'Visualizar todos os Leads',
  'Permite visualizar todos os leads, independentemente do responsavel.',
  'Atendimento',
  'visualizar_todos',
  '/jm/atendimento/leads',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM permissions WHERE permission_key = 'atendimento.leads.visualizar.todos'
);
