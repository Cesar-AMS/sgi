
export interface Apartamento {
  id: number;
  idEmpreendimento: number;
  andar: number;
  bloco: string;
  numero: any;
  mt2: any;
  dormitorios: number;
  valor: number;
  perfilRenda: string;
  status: string;
}

export interface ApartamentoManagement {
  id: number;
  floor: number;
  block: string;
  number: number;
  value: number;
  income: string;
  size: number;
  dormitories: number;
  status: string;
  enterpriseId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  active: boolean;

  pending?: boolean;   // <— rosa até salvar
}