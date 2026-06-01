CREATE TABLE IF NOT EXISTS lead_sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 100,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @add_lead_sources_name_unique_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'lead_sources'
       AND INDEX_NAME = 'uk_lead_sources_name'
  ),
  'ALTER TABLE lead_sources ADD UNIQUE KEY uk_lead_sources_name (name)',
  'SELECT ''uk_lead_sources_name already exists'' AS message'
);
PREPARE add_lead_sources_name_unique_stmt FROM @add_lead_sources_name_unique_sql;
EXECUTE add_lead_sources_name_unique_stmt;
DEALLOCATE PREPARE add_lead_sources_name_unique_stmt;

SET @add_lead_sources_active_sort_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'lead_sources'
       AND INDEX_NAME = 'idx_lead_sources_active_sort'
  ),
  'ALTER TABLE lead_sources ADD INDEX idx_lead_sources_active_sort (is_active, sort_order, name)',
  'SELECT ''idx_lead_sources_active_sort already exists'' AS message'
);
PREPARE add_lead_sources_active_sort_idx_stmt FROM @add_lead_sources_active_sort_idx_sql;
EXECUTE add_lead_sources_active_sort_idx_stmt;
DEALLOCATE PREPARE add_lead_sources_active_sort_idx_stmt;

SET @add_lead_sources_sort_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'lead_sources'
       AND INDEX_NAME = 'idx_lead_sources_sort_order'
  ),
  'ALTER TABLE lead_sources ADD INDEX idx_lead_sources_sort_order (sort_order)',
  'SELECT ''idx_lead_sources_sort_order already exists'' AS message'
);
PREPARE add_lead_sources_sort_idx_stmt FROM @add_lead_sources_sort_idx_sql;
EXECUTE add_lead_sources_sort_idx_stmt;
DEALLOCATE PREPARE add_lead_sources_sort_idx_stmt;

INSERT INTO permissions (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.fontes_origem.visualizar',
  'Visualizar Fontes de Origem',
  'Permite visualizar o cadastro interno de fontes de origem de leads.',
  'Atendimento',
  'visualizar',
  '/jm/atendimento/fontes-origem',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM permissions WHERE permission_key = 'atendimento.fontes_origem.visualizar'
);

INSERT INTO permissions (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.fontes_origem.editar',
  'Editar Fontes de Origem',
  'Permite criar, editar e inativar fontes de origem de leads.',
  'Atendimento',
  'editar',
  '/jm/atendimento/fontes-origem',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM permissions WHERE permission_key = 'atendimento.fontes_origem.editar'
);

INSERT INTO lead_sources
  (name, is_active, sort_order, created_at, updated_at)
SELECT
  official_source.name,
  1,
  official_source.sort_order,
  NOW(),
  NOW()
FROM (
  SELECT 'Instagram' AS name, 10 AS sort_order
  UNION ALL SELECT 'Facebook', 20
  UNION ALL SELECT 'WhatsApp', 30
  UNION ALL SELECT 'Google', 40
  UNION ALL SELECT 'Google Ads', 50
  UNION ALL SELECT 'Site', 60
  UNION ALL SELECT 'Indicação', 70
  UNION ALL SELECT 'Plantão', 80
  UNION ALL SELECT 'Panfleto', 90
  UNION ALL SELECT 'Outdoor', 100
  UNION ALL SELECT 'Ligação', 110
  UNION ALL SELECT 'Portal Imobiliário', 120
  UNION ALL SELECT 'Evento', 130
  UNION ALL SELECT 'Parceiro', 140
  UNION ALL SELECT 'Outros', 150
) AS official_source
WHERE NOT EXISTS (
  SELECT 1
  FROM lead_sources AS existing_source
  WHERE existing_source.name = official_source.name
);
