CREATE TABLE IF NOT EXISTS lead_interest_regions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 100,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @add_lead_interest_regions_name_unique_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'lead_interest_regions'
       AND INDEX_NAME = 'uk_lead_interest_regions_name'
  ),
  'ALTER TABLE lead_interest_regions ADD UNIQUE KEY uk_lead_interest_regions_name (name)',
  'SELECT ''uk_lead_interest_regions_name already exists'' AS message'
);
PREPARE add_lead_interest_regions_name_unique_stmt FROM @add_lead_interest_regions_name_unique_sql;
EXECUTE add_lead_interest_regions_name_unique_stmt;
DEALLOCATE PREPARE add_lead_interest_regions_name_unique_stmt;

SET @add_lead_interest_regions_active_sort_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'lead_interest_regions'
       AND INDEX_NAME = 'idx_lead_interest_regions_active_sort'
  ),
  'ALTER TABLE lead_interest_regions ADD INDEX idx_lead_interest_regions_active_sort (is_active, sort_order, name)',
  'SELECT ''idx_lead_interest_regions_active_sort already exists'' AS message'
);
PREPARE add_lead_interest_regions_active_sort_idx_stmt FROM @add_lead_interest_regions_active_sort_idx_sql;
EXECUTE add_lead_interest_regions_active_sort_idx_stmt;
DEALLOCATE PREPARE add_lead_interest_regions_active_sort_idx_stmt;

SET @add_lead_interest_regions_sort_idx_sql := IF(
  NOT EXISTS (
    SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'lead_interest_regions'
       AND INDEX_NAME = 'idx_lead_interest_regions_sort_order'
  ),
  'ALTER TABLE lead_interest_regions ADD INDEX idx_lead_interest_regions_sort_order (sort_order)',
  'SELECT ''idx_lead_interest_regions_sort_order already exists'' AS message'
);
PREPARE add_lead_interest_regions_sort_idx_stmt FROM @add_lead_interest_regions_sort_idx_sql;
EXECUTE add_lead_interest_regions_sort_idx_stmt;
DEALLOCATE PREPARE add_lead_interest_regions_sort_idx_stmt;

INSERT INTO permissions (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.regioes_interesse.visualizar',
  'Visualizar Regioes de Interesse',
  'Permite visualizar o cadastro interno de regioes de interesse de leads.',
  'Atendimento',
  'visualizar',
  '/jm/atendimento/regioes-interesse',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM permissions WHERE permission_key = 'atendimento.regioes_interesse.visualizar'
);

INSERT INTO permissions (permission_key, name, description, module, action, route, is_active)
SELECT
  'atendimento.regioes_interesse.editar',
  'Editar Regioes de Interesse',
  'Permite criar, editar e inativar regioes de interesse de leads.',
  'Atendimento',
  'editar',
  '/jm/atendimento/regioes-interesse',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM permissions WHERE permission_key = 'atendimento.regioes_interesse.editar'
);
