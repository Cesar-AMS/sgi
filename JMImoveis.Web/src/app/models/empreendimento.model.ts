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
}

export interface CountResponse {
    total: number;
}
