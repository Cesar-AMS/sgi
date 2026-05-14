-- Migration: add employment type to users
-- Target database/schema: MySQL 8 / jmoficial
--
-- Apply this migration manually before using the RH employee/external split.
-- Existing users are not updated; NULL is treated as FUNCIONARIO by the application.
-- This migration is idempotent and targets jmoficial.users explicitly.

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = 'jmoficial'
    AND table_name = 'users'
    AND column_name = 'employment_type'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE jmoficial.users ADD COLUMN employment_type VARCHAR(30) NULL AFTER gestor_id',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
