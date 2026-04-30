import { Condicao } from "../pages/project/empreendimentos/espelho/espelho.component";

export interface PropostaReserva
{
  id: number
  empreendimentoID: number | string;
  enterPriseName? : string
  unitName? : string
  unidadeID: number | string;
  vlrUnidade: number
  engCaixa: boolean
  clienteName: string;
  dateNascimento: string;
  cnpjCpf: string; 
  rg: string;
  emailCliente: string;
  phoneOne: string;
  phoneTwo: string;
  estadoCivil: string;
  profissao: string;
  renda: string;
  clienteNameSecondary: string;
  dataNascimentoSecondary: string;
  cnpjCPFSecondary: string;
  rgSecondary: string;
  emailClienteSecondary: string;
  phoneOneSecondary: string;
  phoneTwoSecondary: string;
  estadoCivilSecondary: string;
  profissaoSecondary: string;
  rendaSecondary: string;
  createdAt: string
  cep: string;
  rua: string;
  nro: string;
  comp: string;
  bairro: string;
  cidade: string;
  estado: string;
  corretorID: number | string;
  corretorNome?: string;
  gerenteID: number | string;
  gerenteNome?: string;
  coordenadorID: number | string;
  coordenadorNome?: string;
  status: string;
  condicao: Condicao[]
}
