-- Migration: seed official company roles structure.
-- Scope: roles only.
-- Does not remove or rename existing roles.
-- Does not alter users, user_roles, permissions, role_permissions, or user_permission_overrides.
-- MySQL 8 compatible and idempotent.

DROP TEMPORARY TABLE IF EXISTS tmp_official_roles;

CREATE TEMPORARY TABLE tmp_official_roles (
  name VARCHAR(150) NOT NULL,
  PRIMARY KEY (name)
) ENGINE=Memory DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO tmp_official_roles (name) VALUES
  -- Administrativo / Financeiro
  ('CFO'),
  ('Coordenador Financeiro'),
  ('Analista Financeiro'),
  ('Assistente Financeiro'),
  ('Contas a Pagar'),
  ('Contas a Receber'),
  ('Tesouraria'),
  ('Controladoria / DRE'),
  (CONVERT(0x436F72726573706F6E64656E74652042616E63C3A172696F USING utf8mb4)),
  ('Compras'),

  -- RH
  ('Coordenador de RH'),
  ('Analista de RH'),
  ('Assistente de RH'),
  ('Departamento Pessoal'),
  (CONVERT(0x526563727574616D656E746F20652053656C65C3A7C3A36F USING utf8mb4)),

  -- TI
  ('Coordenador de TI'),
  ('Analista de Sistemas'),
  ('Analista de Suporte'),
  ('Infraestrutura / Redes'),
  (CONVERT(0x446573656E766F6C7665646F72202F204175746F6D61C3A7C3A36F USING utf8mb4)),

  -- Marketing
  ('Coordenador de Marketing'),
  ('Analista de Marketing'),
  ('Social Media'),
  ('Designer / Criativo'),
  (CONVERT(0x5472C3A16665676F205061676F USING utf8mb4)),

  -- Operacional
  (CONVERT(0x5365727669C3A76F7320476572616973 USING utf8mb4)),
  ('Limpeza'),
  ('Limpeza - Chefe'),
  ('Recepcionista'),
  ('Secretaria'),

  -- Comercial
  ('Gestor Comercial'),
  ('Gerente Comercial'),
  ('Coordenador Comercial'),
  (CONVERT(0x4167656E7465204CC3AD646572 USING utf8mb4)),
  ('Agente'),

  -- Cargos operacionais/legados preservados
  ('Corretor'),
  ('Corretor Parceiro'),
  ('Atendente'),
  ('Vendedor'),
  ('Controle de visitas'),
  ('Empreendimentos'),
  ('Mudar - Empreendimentos');

INSERT INTO jmoficial.roles (name, created_at, updated_at)
SELECT official.name, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  FROM tmp_official_roles official
 WHERE NOT EXISTS (
       SELECT 1
         FROM jmoficial.roles existing
        WHERE LOWER(TRIM(CONVERT(existing.name USING utf8mb4))) =
              LOWER(TRIM(CONVERT(official.name USING utf8mb4)))
       );

DROP TEMPORARY TABLE IF EXISTS tmp_official_roles;
