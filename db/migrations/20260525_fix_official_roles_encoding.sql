-- Migration: fix official role names encoded incorrectly by previous seed execution.
-- Scope: roles only.
-- Does not alter users, user_roles, permissions, role_permissions, or user_permission_overrides.
-- Does not remove roles.
-- MySQL compatible and intentionally avoids text comparisons/collation clauses.

UPDATE jmoficial.roles
   SET name = CONVERT(0x436F72726573706F6E64656E74652042616E63C3A172696F USING utf8mb4),
       updated_at = CURRENT_TIMESTAMP
 WHERE id = 39;

UPDATE jmoficial.roles
   SET name = CONVERT(0x526563727574616D656E746F20652053656C65C3A7C3A36F USING utf8mb4),
       updated_at = CURRENT_TIMESTAMP
 WHERE id = 45;

UPDATE jmoficial.roles
   SET name = CONVERT(0x446573656E766F6C7665646F72202F204175746F6D61C3A7C3A36F USING utf8mb4),
       updated_at = CURRENT_TIMESTAMP
 WHERE id = 50;

UPDATE jmoficial.roles
   SET name = CONVERT(0x5472C3A16665676F205061676F USING utf8mb4),
       updated_at = CURRENT_TIMESTAMP
 WHERE id = 55;

UPDATE jmoficial.roles
   SET name = CONVERT(0x5365727669C3A76F7320476572616973 USING utf8mb4),
       updated_at = CURRENT_TIMESTAMP
 WHERE id = 56;

UPDATE jmoficial.roles
   SET name = CONVERT(0x4167656E7465204CC3AD646572 USING utf8mb4),
       updated_at = CURRENT_TIMESTAMP
 WHERE id = 60;
