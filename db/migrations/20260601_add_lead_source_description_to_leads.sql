SET @add_leads_fonte_descricao_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'leads'
       AND COLUMN_NAME = 'FonteDescricao'
  ),
  'ALTER TABLE leads ADD COLUMN FonteDescricao VARCHAR(255) NULL AFTER Fonte',
  'SELECT ''FonteDescricao already exists'' AS message'
);
PREPARE add_leads_fonte_descricao_stmt FROM @add_leads_fonte_descricao_sql;
EXECUTE add_leads_fonte_descricao_stmt;
DEALLOCATE PREPARE add_leads_fonte_descricao_stmt;

INSERT INTO permissions (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.leads.fonte_descricao.editar',
  'Editar descricao/campanha da fonte do Lead',
  'Permite preencher e alterar a descricao ou campanha complementar da fonte de origem do lead.',
  'Atendimento',
  'editar',
  '/jm/atendimento/leads',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM permissions WHERE permission_key = 'atendimento.leads.fonte_descricao.editar'
);
