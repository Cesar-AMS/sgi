export interface Construtora {
    id: number;
    nome: string;
    endereco?: string;
    telefone?: string;
    celular?: string;
    email?: string;
    site?: string;
    cnpj?: string;
    inscricaoEstadual?: string;
    inscricaoMunicipal?: string;
    banco?: string;
    agencia?: string;
    conta?: string;
    pix?: string;
    responsavel?: string;
    observacoes?: string;
    dataCriacao: Date;
}

export interface CreateConstrutora {
    nome: string;
    endereco?: string;
    telefone?: string;
    celular?: string;
    email?: string;
    site?: string;
    cnpj?: string;
    inscricaoEstadual?: string;
    inscricaoMunicipal?: string;
    banco?: string;
    agencia?: string;
    conta?: string;
    pix?: string;
    responsavel?: string;
    observacoes?: string;
}

export interface UpdateConstrutora {
    nome: string;
    endereco?: string;
    telefone?: string;
    celular?: string;
    email?: string;
    site?: string;
    cnpj?: string;
    inscricaoEstadual?: string;
    inscricaoMunicipal?: string;
    banco?: string;
    agencia?: string;
    conta?: string;
    pix?: string;
    responsavel?: string;
    observacoes?: string;
}
