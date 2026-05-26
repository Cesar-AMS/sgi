INSERT INTO jmoficial.permissions
(permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.posvisita.visualizar',
  'Visualizar Pos-Visita',
  'Permite visualizar a lista operacional e os dados de pos-visita.',
  'Atendimento',
  'visualizar',
  '/jm/atendimento/pos-visita',
  1
WHERE NOT EXISTS (
  SELECT 1
  FROM jmoficial.permissions
  WHERE permission_key = 'atendimento.posvisita.visualizar'
);

INSERT INTO jmoficial.permissions
(permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.posvisita.editar',
  'Editar Pos-Visita',
  'Permite iniciar, editar, salvar e alterar status de pos-visita.',
  'Atendimento',
  'editar',
  '/jm/atendimento/pos-visita',
  1
WHERE NOT EXISTS (
  SELECT 1
  FROM jmoficial.permissions
  WHERE permission_key = 'atendimento.posvisita.editar'
);
