import { createAction } from '@ngrx/store';
export interface ContaBancaria {
  nome: string;
  ativa: boolean;
  saldoInicial?: number | null;
  numeroConta?: string | null;
  agencia?: string | null;
  tipoChavePix?: 'cpf' | 'cnpj' | 'email' | 'celular' | 'aleatoria' | null;
  chavePix?: string | null;
}

// conta-receber.model.ts
// conta-receber.model.ts
export interface ContaReceber {
  // Esquerda
  valor: number | null;
  jaRecebido: boolean;
  dataRecebimento?: string | null;
  descricao?: string | null;
  categoria?: string | null;
  conta?: string | null;

  // Dados do Lançamento (aba 1)
  dataCompetencia?: string | null;
  dataVencimento?: string | null;
  cliente?: string | null;
  centroCusto?: string | null;

  // Recorrência (aba 2)
  usarRecorrencia?: boolean;
  periodoRecorrencia?: 'mensal' | 'semanal' | 'quinzenal' | 'anual' | null;
  parcelas?: number | null;
  recebimentoFixo?: boolean;

  // Adicionais (aba 3)
  referencia?: string | null;
  anotacoes?: string | null;

  // Documentos (aba 4)
  documentos?: { nome: string; tamanho: number; data: Date }[];
}

export interface Lancamento {
  id: number;
  recebido: boolean;
  data: string;          // ISO yyyy-MM-dd
  descricao: string;
  cliente: string;
  conta: string;
  categoria: string;
  centroCusto?: string | null;
  valor: number;         // em reais
}

// dre.model.ts
export interface DreLinha {
  descricao: string;
  valor: number; // sempre POSITIVO; sinal é dado pelo grupo
}

export interface AccountBank{
  id: number,
  description: string,
  amount: number,
  active: boolean,
  account: string,
  agency: string,
  amountActual: number,
  createAt: string,
  userId: number,
  type_key: string,
  key_value: string
}

export interface DreEstrutura {
  receitaBruta: DreLinha[];
  deducoes: DreLinha[];              // (-)
  custos: DreLinha[];                // (-) CPV/CMV/CSP
  despesasVendas: DreLinha[];        // (-)
  despesasAdm: DreLinha[];           // (-)
  despesasGerais: DreLinha[];        // (-)
  outrasReceitas: DreLinha[];        // (+)
  outrasDespesas: DreLinha[];        // (-)
  receitaFinanceira: DreLinha[];     // (+)
  despesaFinanceira: DreLinha[];     // (-)
  impostos: DreLinha[];              // (-) IR/CSLL
}

export interface Filial {
  id: number
  name: string
  address: string
  status: boolean
  phone: string

}

export interface UnitsEnterprise {
  id: number
  block: string
  floor: number
  number: number
  value: number
  size: string
  dormitories: string
  commission: number
  active: number
}

export interface Usuarios  {
  id: number;
  name: string;
  email: string;
  emailVerifiedAt: string;
  password: string;
  rememberToken: string;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
  cpf: string;
  address: string;
  cellphone: string;
  admissionDate: string;
  token: string;
  commissioned?: boolean;
  tpCommissioned?: string;
  valueCommissioned?: number;
  valueCommissionedMax?: number;
  jobpositionId: number;
  filial: number;
  enterpriseVisibility: boolean
  empregado: boolean
  coordenatorId?: number
  managerId?: number
  gestorId?: number
}


export interface Cargos {
  id: number;
  name: string;
  status: boolean;
  commissioned?: boolean;
  tpCommissioned?: string;
  valueCommissioned?: number;
}

export type SeriesData = { labels: string[]; values: number[] };


export interface DashboardResponse {
  vendasQtd: number;
  despesasTotal: number;
  ato: number;
  parcelas: number;
  receitaBruta: number;
  receitaLiquida: number;

  inad_pctMes: number;
  inad_pctTotal: number;
  inad_pagantes: number;
  inad_recebidos: number;
  inad_qtdMes: number;
  inad_valorAberto: number;

  vendas: SeriesData;
  despesas: SeriesData;
}

export interface Cliente {
  id: number
  name: string 
  cpfCnpj: string
  email: string
  cellphone: string
  cellphone2: string
  cep: string
  address: string
  addressNumber: string
  complement: string
  neighborhood: string
  city: string
  state: string
  type: string
  profession: string
  income: string
  idTitular: number
}
type MonthYearOpt = { month: number; year: number; label: string; short: string };
type Row12 = { name: string; values: number[] };

export interface ManagerOption { id: number | null; label: string; } // null = Todos
export interface CorretorDashboardResponse {
  managerOptions: ManagerOption[];     // [{id:null,label:'Todos'},{id:1,label:'Gerente 1'},...]
  defaultManagerId: number | null;     // sugerido pelo back
  salariosCorretores: Row12[];
  salariosGerentes: Row12[];
  comissoesCorretores: Row12[];        // filtradas por gerente (param)
  comissoesGerentes: Row12[];
  despesasFiliais: Row12[];
}

export interface LeadFilter {
  nome?: string | null;
  status?: string | null;
  vendedor?: string | null;
  coordenador?: string | null;
  gerente?: string | null;
  startAt?: string | null;
  finishAt?: string | null;
}

export interface LeadActivity {
  id: number;
  leadId: number;
  dateTime: string;    // ISO
  author?: string;
  type?: string;       // ex: "Sistema", "Nota"
  description: string;
}

export interface ViaCEP {
  cep: string
  logradouro: string
  complemento: string
  unidade: string
  bairro: string
  localidade: string
  uf: string
  estado: string
  regiao: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
}


export interface Construtoras {
  id: number
  name: string
  empreendimentos: number
  unidades: number
  vendidos: number
  reservados: number
  disponiveis: number
  createdAt: any
  updatedAt: any
  deletedAt: any
}

export interface Categories{
  id: number
  description: string
  status: boolean
}

export interface CentroCusto {
  id: number
  name: string
  status: boolean
}


export interface AccountPlains{
  
  id: number
  account: string
  description: string
  idCategory: number
  typeAccount: string

}

export interface DreTotals {
  grossRevenue: number;
  totalExpenses: number;
  operatingResult: number;
}

export interface DreLine {
  accountId: number;
  section: 'RECEITA' | 'DESPESA';
  accountCode: string;
  accountName: string;
  totalReceita: number;
  totalDespesa: number;
  totalLiquido: number;
}

export interface DreResponse {
  totals: DreTotals;
  lines: DreLine[];
}

export type LeadScheduleStatus = 'Pendente' | 'Cumprido' | 'NaoCumprido';

export interface LeadSchedule {
  id: number;
  leadId: number;
  scheduledAt: string; // ISO
  note?: string;
  status: LeadScheduleStatus;
}

export interface CreateLeadScheduleRequest {
  leadId: number;
  nameClient: string;
  userId: number;
  scheduledAt: string; // ISO
  note?: string;
  tipoAgenda: string;
}

export interface UpdateLeadScheduleStatusRequest {
  id: number;
  leadId: number;
  status: LeadScheduleStatus;
}



export interface Empreendimento {
  id: number
  name: string
  address: string
  constructorId: number
  constructor: string
  createdAt: string
  updatedAt: any
  deletedAt: any
  hidden: boolean
}

export interface Sales {
  id: number
  unitValue: number
  startValue: number
  valueToConstructor: any
  percentageToRealtor?: number
  percentageToManager?: number
  parcelsStart: any // Data incio
  realtorComission: number
  realtorComissionRemaining: any
  realtorComissionStatus: string
  managerComission: number
  managerComissionRemaining: any
  managerComissionStatus: string
  generateNotification: boolean
  notificatedDate: any
  netEarnings: number
  grossEarnings: number
  contractPath: any
  status: string
  coordenador?: any
  branchId: number
  enterpriseId: number
  unitId: number
  realtorId: number
  managerId: number
  paymentTypesId: number
  selledAt: any
  deletedAt: any
  createdAt: string
  updatedAt: string
  valueToRealstate: number
  percentageToRealstate: number
  percentageToFinancial: number
  financialComission: number
  financialComissionStatus: string
  percentageToTax: number
  taxComission: number
  taxComissionStatus: string
  contractNumber: any
  cliente?: string // ---------------------- NAO USAR NO POST
  gerente?: string // ---------------------- NAO USAR NO POST
  corretor?: string // ---------------------- NAO USAR NO POST
  branchName?: string // ---------------------- NAO USAR NO POST
  enterpriseName?: string // ---------------------- NAO USAR NO POST
  unitName: string // ---------------------- NAO USAR NO POST
  customerId: number // ID DO CLIENTE APENAS PARA POST
  emailCustomer: string // ---------------------- NAO USAR NO POST
  phoneCustomer: string // ---------------------- NAO USAR NO POST
  cpfCnpj: string // ---------------------- NAO USAR NO POST
  vlrAtoReference: number // ---------------------- NAO USAR NO POST
  qtdeParcelas: number // ------------------------- NÃO USAR NO POST
  dtIntermediaria: string // ------------------------- NÃO USAR NO POST
  vlIntermediaria: number // -----------´
  coordenatorId: number
  parcelas: Installments[]
  intermediarias: Installments[]
  acts : Act[]
  plainCorretor: Installments[]
  plainManager: Installments[] 
}


export interface Installments {
  id: number
  vlrInstallament: number;
  dueDate: string;
  dtPayment?: string;
  obs: string;
  status: string
}

export interface Act {
  id: number;
  parcel?: number;
  value: number;
  date?: any;
  observations?: string;
  sourceId?: number;
  status?: string;
  paymentId?: number;
  paidDate?: string;

}

export type DreType = 'RECEITA' | 'DESPESA' | 'DISTRIB';

export interface AccountPlain {
  id: number;
  account: string;        // ex: "2.2.8.1"
  description: string;
  idcategory?: number | null;
  typeaccount: DreType;   // 'RECEITA' | 'DESPESA' | 'DISTRIB'
}

export interface DreNode {
  code: string;           // "2", "2.2", "2.2.8.1" ...
  name: string;           // rótulo a exibir
  type: DreType;
  level: number;          // quantos níveis (1..n)
  value: number;          // total do período
  children: DreNode[];
}

export interface Period {
  from: string; // "YYYY-MM-DD"
  to:   string; // "YYYY-MM-DD"
}

export interface ContaPagarDto {
  id: number
  seriesId: number
  installmentNo: number
  amount: number
  description: string
  competenceDate: string
  dueDate: string
  paid: boolean
  paidDate: any
  categoryId: number
  accountId: number
  clientId: any
  costCenterId: any
  reference: string
  notes: any
  createdAt: string
  updatedAt: string
  deletedAt: any
  recurrencing: boolean
  periodic: any
  parcelas: number
  status: string

  categoryName: string
  accountName: string
  clientName: string
  centerCoustName: string
}



export interface ContaReceberDto {
  id: number;
  seriesId: number;
  installmentNo: number;
  amount: number;
  description: string | null;
  competenceDate: string | null; // ISO
  dueDate: string | null;        // ISO
  received: boolean;
  receivedDate: string | null;   // ISO
  categoryId: number | null;
  accountId: number | null;
  clientId: number | null;
  costCenterId: number | null;
  reference: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  recurrencing: boolean;
  periodic: string | null; // "DAILY" | "WEEKLY" | "MONTHLY".
  parcelas: number | null;

  categoryName: string
  accountName: string
  clientName: string
  centerCoustName: string
}


export interface ContaReceberForm {
  valor: number | null;
  jaRecebido: boolean;
  dataRecebimento: string | null;   // yyyy-MM-dd
  descricao: string | null;
  categoria: number | null;         // id
  conta: number | null;             // id
  dataCompetencia: string | null;   // yyyy-MM-dd
  dataVencimento: string | null;    // yyyy-MM-dd
  cliente: number | null;           // id
  centroCusto: number | null;       // id
  referencia: string | null;
  anotacoes: string | null;
  usarRecorrencia: boolean;
  periodoRecorrencia: string | null;
  parcelas: number | null;
  recebimentoFixo: boolean;         
  documentos: { nome: string; tamanho: number; data: Date }[];
}

export interface ViaCep {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface FormasPagamento {
  id: number,
  name: string,
  canParceling: boolean,
  deletedAt: string,
  createdAt: string,
  updatedAt: string
}