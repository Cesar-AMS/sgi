import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import {
  selectData,
  selectlistData,
} from 'src/app/store/Invoices/invoices.selector';
import {
  deleteinvoice,
  fetchInvoiceData,
  fetchInvoicelistData,
} from 'src/app/store/Invoices/invoices.action';
import { ExportExcelService } from 'src/app/shared/export-excel.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-proposta',
  templateUrl: './proposta.component.html',
  styleUrl: './proposta.component.scss',
})
export class PropostaComponent {
  breadCrumbItems!: Array<{}>;
  invoiceslist: any[] = [];
  invoices: any[] = [];
  invoiceCard: any;

  deleteID: any;
  masterSelected = false;
  term: string = '';

  checkedValGet: any[] = [];

  direction: 'asc' | 'desc' = 'asc';

  propostaSelecionada: any = null;

  @ViewChild('deleteRecordModal', { static: false })
  deleteRecordModal?: ModalDirective;

  @ViewChild('visualizarModal', { static: false })
  visualizarModal?: ModalDirective;

  constructor(
    public store: Store,
    private excel: ExportExcelService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Propostas', active: true },
      { label: 'Lista de Propostas', active: true },
    ];

    setTimeout(() => {
      this.store.dispatch(fetchInvoicelistData());
      this.store.select(selectlistData).subscribe((data: any[]) => {
        this.invoiceslist = data || [];
        this.invoices = this.invoiceslist.slice(0, 10);
      });
      document.getElementById('elmLoader')?.classList.add('d-none');
    }, 1000);

    this.store.dispatch(fetchInvoiceData());
    this.store.select(selectData).subscribe((data) => {
      this.invoiceCard = data;
    });
  }

  // === STATUS EM PORTUGUÊS ===
  getStatusLabel(status: string): string {
    if (!status) return '-';

    switch (status.toLowerCase()) {
      case 'paid':
      case 'pago':
        return 'Pago';
      case 'unpaid':
      case 'em aberto':
      case 'open':
        return 'Em Aberto';
      case 'pending':
      case 'pendente':
        return 'Pendente';
      case 'refused':
      case 'canceled':
      case 'cancelado':
      case 'refused/canceled':
      case 'refund':
        return 'Cancelada';
      default:
        return status; // fallback: mostra como veio
    }
  }

  getStatusClass(status: string): string {
    if (!status) return 'bg-secondary-subtle text-secondary';

    const s = status.toLowerCase();

    if (['paid', 'pago'].includes(s)) {
      return 'bg-success-subtle text-success';
    }

    if (['pending', 'pendente'].includes(s)) {
      return 'bg-warning-subtle text-warning';
    }

    if (
      ['unpaid', 'em aberto', 'open', 'refused', 'canceled', 'cancelado', 'refund'].includes(
        s
      )
    ) {
      return 'bg-danger-subtle text-danger';
    }

    return 'bg-secondary-subtle text-secondary';
  }

  // === ORDEM / SORT ===
  onSort(column: string) {
    this.direction = this.direction === 'asc' ? 'desc' : 'asc';

    const sortedArray = [...this.invoices];

    sortedArray.sort((a: any, b: any) => {
      const v1 = a[column];
      const v2 = b[column];

      if (v1 == null && v2 == null) return 0;
      if (v1 == null) return -1;
      if (v2 == null) return 1;

      if (v1 < v2) return this.direction === 'asc' ? -1 : 1;
      if (v1 > v2) return this.direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.invoices = sortedArray;
  }

  // === FILTRO ===
  filterdata() {
    if (this.term) {
      const termLower = this.term.toLowerCase();

      this.invoices = this.invoiceslist.filter((el: any) => {
        return (
          (el.customer && el.customer.toLowerCase().includes(termLower)) ||
          (el.email && el.email.toLowerCase().includes(termLower)) ||
          (el.empreendimento &&
            el.empreendimento.toLowerCase().includes(termLower)) ||
          (el.unidade && el.unidade.toLowerCase().includes(termLower))
        );
      });
    } else {
      this.invoices = this.invoiceslist.slice(0, 10);
    }

    this.updateNoResultDisplay();
  }

  updateNoResultDisplay() {
    const noResultElement = document.querySelector(
      '.noresult'
    ) as HTMLElement | null;

    if (!noResultElement) return;

    if (this.term && this.invoices.length === 0) {
      noResultElement.style.display = 'block';
    } else {
      noResultElement.style.display = 'none';
    }
  }

  // === CHECKBOX MASTER / INDIVIDUAL ===
  checkUncheckAll(ev: any) {
    const checked = ev.target.checked;

    this.invoices = this.invoices.map((x: any) => ({
      ...x,
      states: checked,
    }));

    const checkedVal: any[] = [];

    for (let i = 0; i < this.invoices.length; i++) {
      if (this.invoices[i].states === true) {
        const result = this.invoices[i]._id;
        checkedVal.push(result);
      }
    }

    this.checkedValGet = checkedVal;
    checkedVal.length > 0
      ? document.getElementById('remove-actions')?.classList.remove('d-none')
      : document.getElementById('remove-actions')?.classList.add('d-none');
  }

  onCheckboxChange(e: any) {
    const checkedVal: any[] = [];

    for (let i = 0; i < this.invoices.length; i++) {
      if (this.invoices[i].states === true) {
        const result = this.invoices[i]._id;
        checkedVal.push(result);
      }
    }

    this.checkedValGet = checkedVal;
    checkedVal.length > 0
      ? document.getElementById('remove-actions')?.classList.remove('d-none')
      : document.getElementById('remove-actions')?.classList.add('d-none');
  }

  // === VISUALIZAR MODAL ===
  openVisualizarModal(proposta: any) {
    this.propostaSelecionada = proposta;
    this.visualizarModal?.show();
  }

  // === EDITAR ===
  editarProposta(proposta: any) {
    if (!proposta || !proposta._id) return;

    // Ajusta a rota conforme seu app
    this.router.navigate(['/propostas/edit', proposta._id]);
  }

  // === TORNAR CLIENTE ===
  tornarCliente(proposta: any) {
    if (!proposta) return;

    // Aqui você pluga sua API / store:
    // this.store.dispatch(tornarClienteFromProposta({ propostaId: proposta._id }));
    console.log('Tornar cliente:', proposta);

    // Exemplo: fechar modal depois
    // this.visualizarModal?.hide();
  }

  // === DELETE ===
  removeItem(id: any) {
    this.deleteID = id;
    this.deleteRecordModal?.show();
  }

  deleteData(id: any) {
    if (id) {
      this.store.dispatch(deleteinvoice({ id: id.toString() }));
    }

    if (this.checkedValGet && this.checkedValGet.length > 0) {
      this.store.dispatch(
        deleteinvoice({ id: this.checkedValGet.toString() })
      );
    }

    this.deleteRecordModal?.hide();
    this.masterSelected = false;
  }

  // === PAGINAÇÃO ===
  pageChanged(event: any): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.invoices = this.invoiceslist.slice(startItem, endItem);
  }
}
