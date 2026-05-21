-- Adds the operational attendance stage for Leads without changing the existing commercial Status.

SET @column_exists := (
  SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = 'jmoficial'
     AND TABLE_NAME = 'leads'
     AND COLUMN_NAME = 'EtapaAtendimento'
);

SET @sql := IF(
  @column_exists = 0,
  'ALTER TABLE jmoficial.leads ADD COLUMN EtapaAtendimento VARCHAR(100) NULL AFTER Status',
  'SELECT ''Column EtapaAtendimento already exists in jmoficial.leads'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
