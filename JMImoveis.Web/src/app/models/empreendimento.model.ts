export interface EnterpriseUnitFinalSize {
    id?: number;
    enterpriseId?: number;
    unitFinal: number;
    sizeM2: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface Empreendimento {
    id: number;
    nome: string;
    endereco?: string;
    construtoraId: number;
    nomeConstrutora?: string;
    dataCriacao: Date;
    telefone?: string;
    email?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    bairro?: string;
    tipo?: string;
    status?: string;
    numeroTorres?: number;
    numeroUnidades?: number;
    areaTotal?: number;
    dataLancamento?: Date | string;
    dataEntregaPrevista?: Date | string;
    incorporador?: string;
    cnpjIncorporador?: string;
    registroCRI?: string;
    alvaraNumero?: string;
    habitese?: string;
    dataAprovacao?: Date | string;
    responsavelTecnico?: string;
    descricao?: string;
    observacoes?: string;
    numeroAndares?: number;
    unidadesPorAndar?: number;
    parametroAto?: number;
    parametroParcelas?: number;
    parametroIntermediaria?: number;
    unitFinalSizes?: EnterpriseUnitFinalSize[];
}

export interface CreateEmpreendimento {
    nome: string;
    endereco?: string;
    construtoraId: number;
    telefone?: string;
    email?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    bairro?: string;
    tipo?: string;
    status?: string;
    numeroTorres?: number;
    numeroUnidades?: number;
    areaTotal?: number;
    dataLancamento?: Date | string;
    dataEntregaPrevista?: Date | string;
    incorporador?: string;
    cnpjIncorporador?: string;
    registroCRI?: string;
    alvaraNumero?: string;
    habitese?: string;
    dataAprovacao?: Date | string;
    responsavelTecnico?: string;
    descricao?: string;
    observacoes?: string;
    numeroAndares?: number;
    unidadesPorAndar?: number;
    parametroAto?: number;
    parametroParcelas?: number;
    parametroIntermediaria?: number;
    unitFinalSizes?: EnterpriseUnitFinalSize[];
}

export interface UpdateEmpreendimento {
    nome: string;
    endereco?: string;
    construtoraId: number;
    telefone?: string;
    email?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    bairro?: string;
    tipo?: string;
    status?: string;
    numeroTorres?: number;
    numeroUnidades?: number;
    areaTotal?: number;
    dataLancamento?: Date | string;
    dataEntregaPrevista?: Date | string;
    incorporador?: string;
    cnpjIncorporador?: string;
    registroCRI?: string;
    alvaraNumero?: string;
    habitese?: string;
    dataAprovacao?: Date | string;
    responsavelTecnico?: string;
    descricao?: string;
    observacoes?: string;
    numeroAndares?: number;
    unidadesPorAndar?: number;
    parametroAto?: number;
    parametroParcelas?: number;
    parametroIntermediaria?: number;
    unitFinalSizes?: EnterpriseUnitFinalSize[];
}

export interface CountResponse {
    total: number;
}
