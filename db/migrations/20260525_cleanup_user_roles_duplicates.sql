-- Migration: clean duplicated user_roles and prevent future duplicates.
-- Scope: user_roles only.
-- Does not remove users, roles, permissions, role_permissions, or user_permission_overrides.
-- MySQL 8 compatible. Execute manually after a backup.

CREATE TABLE IF NOT EXISTS jmoficial.user_roles_duplicate_cleanup_backup AS
SELECT ur.*, CURRENT_TIMESTAMP AS backed_up_at
  FROM jmoficial.user_roles ur
 WHERE 1 = 0;

INSERT INTO jmoficial.user_roles_duplicate_cleanup_backup
SELECT ur.*, CURRENT_TIMESTAMP AS backed_up_at
  FROM jmoficial.user_roles ur
 WHERE NOT EXISTS (
       SELECT 1
         FROM jmoficial.user_roles_duplicate_cleanup_backup backup
        WHERE backup.id = ur.id
       );

SET @user_roles_has_deleted_at := (
  SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = 'jmoficial'
     AND TABLE_NAME = 'user_roles'
     AND COLUMN_NAME = 'deleted_at'
);

SET @delete_user_roles_soft_deleted_sql := IF(
  @user_roles_has_deleted_at > 0,
  'DELETE FROM jmoficial.user_roles WHERE deleted_at IS NOT NULL',
  'SELECT ''Column deleted_at not found in jmoficial.user_roles; no soft deleted rows to remove'' AS message'
);

PREPARE delete_user_roles_soft_deleted_stmt FROM @delete_user_roles_soft_deleted_sql;
EXECUTE delete_user_roles_soft_deleted_stmt;
DEALLOCATE PREPARE delete_user_roles_soft_deleted_stmt;

DROP TEMPORARY TABLE IF EXISTS tmp_user_roles_keep;

CREATE TEMPORARY TABLE tmp_user_roles_keep AS
SELECT user_id,
       role_id,
       MIN(id) AS keep_id
  FROM jmoficial.user_roles
 WHERE user_id IS NOT NULL
   AND role_id IS NOT NULL
 GROUP BY user_id, role_id
HAVING COUNT(*) > 1;

DELETE ur
  FROM jmoficial.user_roles ur
  JOIN tmp_user_roles_keep keepers
    ON keepers.user_id = ur.user_id
   AND keepers.role_id = ur.role_id
 WHERE ur.id <> keepers.keep_id;

DROP TEMPORARY TABLE IF EXISTS tmp_user_roles_keep;

SET @user_roles_unique_exists := (
  SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = 'jmoficial'
     AND TABLE_NAME = 'user_roles'
     AND INDEX_NAME = 'uk_user_roles_user_id_role_id'
);

SET @add_user_roles_unique_sql := IF(
  @user_roles_unique_exists = 0,
  'ALTER TABLE jmoficial.user_roles
     ADD UNIQUE KEY uk_user_roles_user_id_role_id (user_id, role_id)',
  'SELECT ''Unique index uk_user_roles_user_id_role_id already exists'' AS message'
);

PREPARE add_user_roles_unique_stmt FROM @add_user_roles_unique_sql;
EXECUTE add_user_roles_unique_stmt;
DEALLOCATE PREPARE add_user_roles_unique_stmt;
