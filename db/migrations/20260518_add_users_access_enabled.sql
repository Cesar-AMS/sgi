-- Adds explicit login access control without changing RH operational status.
-- hidden remains responsible for operational/listing status.

SET @column_exists := (
  SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = 'jmoficial'
     AND TABLE_NAME = 'users'
     AND COLUMN_NAME = 'access_enabled'
);

SET @sql := IF(
  @column_exists = 0,
  'ALTER TABLE jmoficial.users ADD COLUMN access_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER hidden',
  'SELECT ''Column access_enabled already exists in jmoficial.users'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
