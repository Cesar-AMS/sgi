INSERT INTO jmoficial.permissions
(permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.agendamento.editar',
  'Editar Agendamento',
  'Permite criar, editar, confirmar e cancelar agendamentos.',
  'Atendimento',
  'editar',
  '/jm/atendimento/agendamento',
  1
WHERE NOT EXISTS (
  SELECT 1
  FROM jmoficial.permissions
  WHERE permission_key = 'atendimento.agendamento.editar'
);

INSERT INTO jmoficial.permissions
(permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.visitas.editar',
  'Editar Visitas',
  'Permite criar, editar, realizar, cancelar e alterar visitas.',
  'Atendimento',
  'editar',
  '/jm/visitas',
  1
WHERE NOT EXISTS (
  SELECT 1
  FROM jmoficial.permissions
  WHERE permission_key = 'atendimento.visitas.editar'
);
