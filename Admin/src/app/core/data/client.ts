export interface Client {
    id: number
    cpf: string
    name: string
    phone: string
    phoneSecondary?: string
    address: Address
    dependent?: Dependent
}

export interface Dependent {
    id: number
    cpf: string
    name: string
    phone: string
    phoneSecondary?: string
}


export interface Address {
  zipCode: string
  street: string
  streetNumber: string
  complement?: string
  neighborhood: string
  city: string          
  state: string
}

export interface VendaDTO {
  id: number;
  idImovel: number;
  idEmpreendimento: number;
  idFilial: number;
  idCliente: number;

  percentualComissao: number;
  valorComissao: number;
  valorUnidade: number;

  idCorretor: number;
  idGerente: number;

  contrato: string;
  numeroContrato: string;
  status: string;

  /** ISO-8601 string, ex: "2025-08-25T20:21:44.758Z" */
  dataVenda: string;

  idFormasPagamento: number;
  qtdeParcelas: number;

  /** ISO-8601 string, ex: "2025-08-25T20:21:44.758Z" */
  dtInicio: string;

  valorParcelas: number;

  percentualComissaoFinanceiro: number;
  valorComissaoFinanceiro: number;
  statusComissaoFinanceiro: string;

  valorImpostos: number;
  statusImpostos: string;

  gerarAlertaBoleto: boolean;
}
