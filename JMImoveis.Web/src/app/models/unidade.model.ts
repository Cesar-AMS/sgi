export type StatusUnidade = 'disponivel' | 'reservada' | 'vendida';

export interface Unidade {
    id: number;
    numero: string;
    andar?: number;
    area?: number | string;
    dormitorios?: number;
    valor?: number;
    perfilRenda?: string;
    status: string;
    statusTexto: string;
    statusCor: string;
    empreendimentoId: number;
}

export interface CreateUnidade {
    numero: string;
    andar?: number;
    area?: number;
    dormitorios?: number;
    valor?: number;
    perfilRenda?: string;
    status: string;
    empreendimentoId: number;
}

export interface UpdateUnidade {
    numero: string;
    andar?: number;
    area?: number;
    dormitorios?: number;
    valor?: number;
    perfilRenda?: string;
    status: string;
    empreendimentoId: number;
}

export const StatusConfig: Record<StatusUnidade, { texto: string; cor: string; cssClass: string }> = {
    disponivel: { texto: 'Disponível', cor: '#4CAF50', cssClass: 'status-disponivel' },
    reservada: { texto: 'Reservada', cor: '#FFC107', cssClass: 'status-reservada' },
    vendida: { texto: 'Vendida', cor: '#F44336', cssClass: 'status-vendida' }
};
