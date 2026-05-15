-- Migration: create relational permissions model
-- Scope: database/modeling only.
-- Does not remove users.menu_json, roles, user_roles, or any existing data.
-- MySQL 8 compatible and idempotent for table creation and seed.

CREATE TABLE IF NOT EXISTS jmoficial.permissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  permission_key VARCHAR(150) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(255) NULL,
  module VARCHAR(80) NOT NULL,
  action VARCHAR(80) NOT NULL,
  route VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_permissions_key (permission_key),
  KEY idx_permissions_module (module),
  KEY idx_permissions_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS jmoficial.role_permissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_role_permissions_role_permission (role_id, permission_id),
  KEY idx_role_permissions_role_id (role_id),
  KEY idx_role_permissions_permission_id (permission_id),
  CONSTRAINT fk_role_permissions_role_id
    FOREIGN KEY (role_id)
    REFERENCES jmoficial.roles (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission_id
    FOREIGN KEY (permission_id)
    REFERENCES jmoficial.permissions (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS jmoficial.user_permission_overrides (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  effect ENUM('ALLOW', 'DENY') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_permission_override (user_id, permission_id),
  KEY idx_user_permission_overrides_user_id (user_id),
  KEY idx_user_permission_overrides_permission_id (permission_id),
  CONSTRAINT fk_user_permission_overrides_user_id
    FOREIGN KEY (user_id)
    REFERENCES jmoficial.users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_permission_overrides_permission_id
    FOREIGN KEY (permission_id)
    REFERENCES jmoficial.permissions (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO jmoficial.permissions
  (permission_key, name, description, module, action, route, is_active)
VALUES
  ('dashboard.visualizar', 'Visualizar Dashboard', 'Permite visualizar o dashboard principal.', 'Dashboard', 'visualizar', '/jm/dashboard', 1),

  ('atendimento.leads.visualizar', 'Visualizar Leads', 'Permite visualizar leads de atendimento.', 'Atendimento', 'visualizar', '/jm/atendimento/leads/listagem', 1),
  ('atendimento.leads.editar', 'Editar Leads', 'Permite criar e editar leads de atendimento.', 'Atendimento', 'editar', '/jm/atendimento/leads/listagem', 1),
  ('atendimento.agendamento.visualizar', 'Visualizar Agendamento', 'Permite visualizar agendamentos.', 'Atendimento', 'visualizar', '/jm/atendimento/agendamento', 1),
  ('atendimento.visitas.visualizar', 'Visualizar Visitas', 'Permite visualizar visitas/agendamentos.', 'Atendimento', 'visualizar', '/jm/atendimento/agendamento', 1),

  ('vendas.espelho.visualizar', 'Visualizar Espelho de Vendas', 'Permite visualizar o espelho de vendas.', 'Vendas', 'visualizar', '/jm/vendas/espelho', 1),
  ('vendas.propostas.visualizar', 'Visualizar Propostas', 'Permite visualizar propostas.', 'Vendas', 'visualizar', '/jm/vendas/propostas', 1),
  ('vendas.propostas.criar', 'Criar Propostas', 'Permite criar propostas.', 'Vendas', 'criar', '/jm/vendas/propostas', 1),
  ('vendas.propostas.aprovar', 'Aprovar Propostas', 'Permite aprovar propostas.', 'Vendas', 'aprovar', '/jm/vendas/propostas', 1),
  ('vendas.vendas.visualizar', 'Visualizar Vendas', 'Permite visualizar vendas.', 'Vendas', 'visualizar', '/jm/vendas/vendas', 1),

  ('financeiro.contas_receber.visualizar', 'Visualizar Contas a Receber', 'Permite visualizar contas a receber.', 'Financeiro', 'visualizar', '/jm/financeiro/contas-receber', 1),
  ('financeiro.contas_pagar.visualizar', 'Visualizar Contas a Pagar', 'Permite visualizar contas a pagar.', 'Financeiro', 'visualizar', '/jm/financeiro/contas-pagar', 1),

  ('rh.colaboradores.visualizar', 'Visualizar Colaboradores', 'Permite visualizar colaboradores.', 'RH', 'visualizar', '/jm/rh/controle-funcionarios', 1),
  ('rh.colaboradores.criar', 'Criar Colaboradores', 'Permite criar colaboradores.', 'RH', 'criar', '/jm/rh/controle-funcionarios', 1),
  ('rh.colaboradores.editar', 'Editar Colaboradores', 'Permite editar colaboradores.', 'RH', 'editar', '/jm/rh/controle-funcionarios', 1),
  ('rh.colaboradores.documentos', 'Gerenciar Documentos de Colaboradores', 'Permite gerenciar documentos de colaboradores.', 'RH', 'documentos', '/jm/rh/controle-funcionarios', 1),

  ('administracao.gerais.visualizar', 'Visualizar Configuracoes Gerais', 'Permite visualizar configuracoes gerais.', 'Administracao', 'visualizar', '/jm/settings', 1),
  ('administracao.perfis_acessos.visualizar', 'Visualizar Perfis e Acessos', 'Permite visualizar perfis e acessos.', 'Administracao', 'visualizar', '/jm/configuracoes/perfis-acessos', 1),
  ('administracao.perfis_acessos.editar', 'Editar Perfis e Acessos', 'Permite editar perfis e acessos.', 'Administracao', 'editar', '/jm/configuracoes/perfis-acessos', 1),
  ('administracao.parametros.visualizar', 'Visualizar Parametros do Sistema', 'Permite visualizar parametros do sistema.', 'Administracao', 'visualizar', NULL, 1),

  ('sistema.admin.total', 'Administrador Total', 'Permite acesso administrativo total ao sistema.', 'Sistema', 'admin_total', NULL, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  module = VALUES(module),
  action = VALUES(action),
  route = VALUES(route),
  is_active = VALUES(is_active),
  updated_at = CURRENT_TIMESTAMP;
