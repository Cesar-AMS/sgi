import { Component, OnInit } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { ProposalsService } from 'src/app/core/services/proposals.service';
import { Cliente } from 'src/app/models/ContaBancaria';
import { PropostaReserva } from 'src/app/models/proposta-reserva';

type DesistenciaRow = {
  clientName: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  status: string;
  empreendimento: string;
  unidade: string;
  createdAt: string;
  matchedClientId?: number;
};

@Component({
  selector: 'app-desistencias',
  templateUrl: './desistencias.component.html',
  styleUrl: './desistencias.component.scss',
})
export class DesistenciasComponent implements OnInit {
  loading = false;
  rows: DesistenciaRow[] = [];
  filteredRows: DesistenciaRow[] = [];
  searchTerm = '';

  constructor(
    private apiService: ApiService,
    private proposalsService: ProposalsService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    forkJoin({
      propostas: this.proposalsService.list({
        gerente: 0,
        corretor: 0,
        status: 'ALL',
      }),
      clientes: this.apiService.getClientes(),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ propostas, clientes }) => {
          this.rows = this.buildRows(propostas ?? [], clientes ?? []);
          this.applyFilter();
        },
        error: () => {
          this.rows = [];
          this.filteredRows = [];
        },
      });
  }

  applyFilter(): void {
    const term = this.normalize(this.searchTerm);

    if (!term) {
      this.filteredRows = [...this.rows];
      return;
    }

    this.filteredRows = this.rows.filter((row) => {
      const blob = [
        row.clientName,
        row.cpfCnpj,
        row.email,
        row.phone,
        row.status,
        row.empreendimento,
        row.unidade,
      ]
        .map((value) => this.normalize(value))
        .join(' ');

      return blob.includes(term);
    });
  }

  private buildRows(propostas: PropostaReserva[], clientes: Cliente[]): DesistenciaRow[] {
    return propostas
      .filter((proposta) => this.isDesistenciaStatus(proposta.status))
      .map((proposta) => {
        const matchedClient = this.findClientForProposal(proposta, clientes);

        return {
          clientName: proposta.clienteName || matchedClient?.name || 'Cliente não informado',
          cpfCnpj: proposta.cnpjCpf || matchedClient?.cpfCnpj || '-',
          email: proposta.emailCliente || matchedClient?.email || '-',
          phone: proposta.phoneOne || matchedClient?.cellphone || '-',
          status: this.formatStatus(proposta.status),
          empreendimento: proposta.enterPriseName || '-',
          unidade: proposta.unitName || `${proposta.unidadeID ?? '-'}`,
          createdAt: proposta.createdAt,
          matchedClientId: matchedClient?.id,
        };
      })
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return bTime - aTime;
      });
  }

  private findClientForProposal(proposta: PropostaReserva, clientes: Cliente[]): Cliente | undefined {
    const proposalCpf = this.normalizeDocument(proposta.cnpjCpf);
    const proposalEmail = this.normalize(proposta.emailCliente);
    const proposalPhone = this.normalizeDocument(proposta.phoneOne);
    const proposalName = this.normalize(proposta.clienteName);

    return clientes.find((cliente) => {
      const clientCpf = this.normalizeDocument(cliente.cpfCnpj);
      const clientEmail = this.normalize(cliente.email);
      const clientPhone = this.normalizeDocument(cliente.cellphone);
      const clientName = this.normalize(cliente.name);

      return (
        (!!proposalCpf && proposalCpf === clientCpf) ||
        (!!proposalEmail && proposalEmail === clientEmail) ||
        (!!proposalPhone && proposalPhone === clientPhone) ||
        (!!proposalName && proposalName === clientName)
      );
    });
  }

  private isDesistenciaStatus(status: string | undefined): boolean {
    const normalized = this.normalize(status);
    return [
      'cancelado',
      'canceled',
      'cancelled',
      'recusado',
      'rejected',
      'refused',
      'refused/canceled',
    ].includes(normalized);
  }

  private formatStatus(status: string | undefined): string {
    const normalized = this.normalize(status);

    if (['cancelado', 'canceled', 'cancelled'].includes(normalized)) {
      return 'Cancelado';
    }

    if (['recusado', 'rejected', 'refused', 'refused/canceled'].includes(normalized)) {
      return 'Desistência/Recusa';
    }

    return status || '-';
  }

  private normalize(value: unknown): string {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private normalizeDocument(value: unknown): string {
    return String(value ?? '').replace(/\D/g, '');
  }
}
