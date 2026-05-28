-- Prepares numeric Lead ownership fields for future access control, lead roulette and Meta integration.
-- Safe for existing data: nullable columns only, no backfill, no FK and no behavior change.

SET @schema_name := 'jmoficial';

SET @sql := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE jmoficial.leads ADD COLUMN owner_user_id BIGINT NULL AFTER Gerente',
        'SELECT ''leads.owner_user_id already exists'' AS message'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'leads'
      AND COLUMN_NAME = 'owner_user_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE jmoficial.leads ADD COLUMN coordinator_user_id BIGINT NULL AFTER owner_user_id',
        'SELECT ''leads.coordinator_user_id already exists'' AS message'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'leads'
      AND COLUMN_NAME = 'coordinator_user_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE jmoficial.leads ADD COLUMN manager_user_id BIGINT NULL AFTER coordinator_user_id',
        'SELECT ''leads.manager_user_id already exists'' AS message'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'leads'
      AND COLUMN_NAME = 'manager_user_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE jmoficial.leads ADD COLUMN assigned_at DATETIME NULL AFTER manager_user_id',
        'SELECT ''leads.assigned_at already exists'' AS message'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'leads'
      AND COLUMN_NAME = 'assigned_at'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE jmoficial.leads ADD COLUMN assigned_by_user_id BIGINT NULL AFTER assigned_at',
        'SELECT ''leads.assigned_by_user_id already exists'' AS message'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'leads'
      AND COLUMN_NAME = 'assigned_by_user_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
