export type AppAction =
  | 'visualizar'
  | 'criar'
  | 'editar'
  | 'excluir'
  | 'aprovar'
  | 'exportar'
  | 'bloquear'
  | 'liberar'
  | 'alterar_status';

export type AppProfile =
  | 'Recepcao'
  | 'AgenteAtendimento'
  | 'Coordenador'
  | 'Gerente'
  | 'GestorComercial'
  | 'Financeiro'
  | 'RH'
  | 'Marketing'
  | 'Diretor';

export interface CurrentUserPermissionState {
  profile: AppProfile | null;
  permissions: string[];
}

export interface ProfilePermissionMap {
  permissions: string[];
}
