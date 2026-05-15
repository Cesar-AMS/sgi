-- Migration: add SUS number to employee details
-- Target database/schema: MySQL 8 / jmoficial
--
-- Adds the optional Sistema Unico de Saude field for employee records.

SET @column_exists := (
  SELECT COUNT(1)
    FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = 'jmoficial'
     AND TABLE_NAME = 'employee_details'
     AND COLUMN_NAME = 'sus_number'
);

SET @ddl := IF(
  @column_exists = 0,
  'ALTER TABLE jmoficial.employee_details ADD COLUMN sus_number VARCHAR(40) NULL AFTER pis_pasep',
  'SELECT ''Column sus_number already exists in jmoficial.employee_details'' AS message'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
