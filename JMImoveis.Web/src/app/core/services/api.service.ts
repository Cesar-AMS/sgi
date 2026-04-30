import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { GlobalComponent } from '../../global-component';
import { BACKEND_API_URL } from './backend-api-url';
import { ProposalsService } from './proposals.service';
import { SessionService } from '../session/session.service';
import {
  AccountBank,
  AccountPlains,
  Cargos,
  Categories,
  CentroCusto,
  Cliente,
  Construtoras,
  ContaPagarDto,
  ContaReceberDto,
  CorretorDashboardResponse,
  CreateLeadScheduleRequest,
  DashboardResponse,
  DreResponse,
  Empreendimento,
  Filial,
  FormasPagamento,
  LeadActivity,
  LeadFilter,
  LeadSchedule,
  Sales,
  UnitsEnterprise,
  UpdateLeadScheduleStatusRequest,
  Usuarios,
  ViaCEP,
} from 'src/app/models/ContaBancaria';
import { VendaDTO } from '../data/client';
import { FinancialEntry } from 'src/app/pages/dashboards/crm/crm.component';
import { Apartamento, ApartamentoManagement } from '../data/empreendimento';
import { AccountOption, CostCenter, Entry, EntryKind, ReclassifyRequest, SummaryResponse } from 'src/app/models/CC';
import { AccountSummaryResponse } from 'src/app/models/contas';
import { PagedResult, VisitsQuery, VisitUpsert, VisitVm } from 'src/app/models/visitations';
import { AttendanceUpsert, AttendanceVm } from 'src/app/models/attendance';
import { PropostaReserva } from 'src/app/models/proposta-reserva';
import { CreateLeadActivityRequest, CreateLeadRequest, Lead } from 'src/app/models/lead';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  }),
};


const API_URL = BACKEND_API_URL;

var API_VIACEP = 'https://viacep.com.br/ws/03690040/json/'

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private proposalsService: ProposalsService,
    private sessionService: SessionService
  ) { }

  private getAuthHeaders(): { Authorization?: string } {
    const token = this.sessionService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getVIACEP(cep: string) {
    return this.http.get<ViaCEP>(`https://viacep.com.br/ws/${cep}/json/`);
  }


  getLeadById(id: number): Observable<Lead> {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.get<Lead>(`${API_URL}api/Leads/${id}`, { headers: headerToken });
  }

  updateLead(lead: Lead): Observable<void> {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.patch<void>(`${API_URL}api/Leads`, lead, { headers: headerToken });
  }



  getLeads(filter: LeadFilter): Observable<Lead[]> {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.post<Lead[]>(`${API_URL}api/Leads/report`, filter, { headers: headerToken });
  }

  createLead(payload: CreateLeadRequest) {

    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.post(API_URL + `api/Leads`, payload, { headers: headerToken });
  }

  updatePayable(id: number, payload: any) {

    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.patch(API_URL + `api/Payable/${id}`, payload, { headers: headerToken });
  }

  updateReceived(id: number, payload: any) {

    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.patch(API_URL + `api/Receivables/${id}`, payload, { headers: headerToken });
  }

  markAsPaid(id: number, body: { paidDate: string; accountId: number | null; amount: number; }) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.post(API_URL + `api/Payable/${id}/pay`, body, { headers: headerToken });
  }

  markAsReceived(id: number, body: { receivedDate: string; accountId: number | null; amount: number; }) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.post(API_URL + `api/Receivables/${id}/pay`, body, { headers: headerToken });
  }

  getCorretorDashboard(year: number, month: number, managerId: number | null): Observable<CorretorDashboardResponse> {
    let ps = new HttpParams().set('year', year).set('month', month);
    if (managerId !== null && managerId !== undefined) ps = ps.set('managerId', managerId);

    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.get<CorretorDashboardResponse>(API_URL + `api/Venda/corretor`, { params: ps, headers: headerToken });

    // MOCK (se precisar testar o front antes da API)
    /*return of({
      managerOptions: [{ id: null, label: 'Todos' }, { id: 1, label: 'Gerente 1' }, { id: 2, label: 'Gerente 2' }],
      defaultManagerId: null,
      salariosCorretores: [{ name: 'Amanda', values: [1, 2, 3, 4, 5, 6, 7, 0, 0, 0, 0, 0].map(n => n * 1234) }],
      salariosGerentes: [{ name: 'Gerente 1', values: Array(12).fill(25000) }],
      comissoesCorretores: [{ name: 'Amanda', values: Array(12).fill(4800) }],
      comissoesGerentes: [{ name: 'Gerente 1', values: Array(12).fill(8200) }],
      despesasFiliais: [{ name: 'Filial A', values: Array(12).fill(15000) }]
    });*/
  }

  getDetailsSale() {

  }

  getDashboard(year: number, month: number): Observable<DashboardResponse> {
    const ps = new HttpParams().set('year', year).set('month', month);
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<DashboardResponse>(API_URL + `api/Venda/dashboard`, { params: ps, headers: headerToken });
  }

  getClienteById(id: number) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<Cliente>(API_URL + `api/Cliente/${id}`, {
      headers: headerToken,
    });
  }

  getDependentsByClientId(id: number)
  {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.get<Cliente | null>(API_URL + `api/Cliente/customers/${id}/dependents`);
  }

  linkDependent(customerId: number, dependentId: number) {

    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.post<void>(API_URL + `api/Cliente/${customerId}/dependents/${dependentId}`, { headers: headerToken });
  }

  postClientes(obj: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.post<number>(API_URL + 'api/Cliente', obj, { headers: headerToken })
  }

  getPayablePeriodo(dtini: string, dtfim: string, typeFilter: string, categoriaFilter: string) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<ContaPagarDto[]>(API_URL + `api/Payable/periodo?de=${dtini}&ate=${dtfim}&typeFilter=${typeFilter}&categoriaFilter=${categoriaFilter}`, {
      headers: headerToken,
    });
  }

  listPropostas(params: { de?: string; ate?: string; gerente?: number | string, coordenador?: number | string, corretor?: number | string, construtora?: number | string, empreendimento?: number | string, status?: string }): Observable<PropostaReserva[]> {
    // Compatibilidade temporaria: manter ApiService como fachada legada
    // enquanto consumidores antigos sao migrados para ProposalsService.
    return this.proposalsService.list(params);
  }

  getPropostasById(id: number) {
    return this.proposalsService.getById(id);
  }

  createProposta(body: any) {
    return this.proposalsService.create(body);
  }

  // suposiÃ§Ã£o: endpoint para aprovar (implemente no .NET como PATCH/PUT)
  approveProposta(id: number) {
    return this.proposalsService.approve(id);
  }

  getReceivablePeriodo(dtini: string, dtfim: string, typeFilter: string, categoriaFilter: string) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<ContaReceberDto[]>(API_URL + `api/Receivables/periodo?de=${dtini}&ate=${dtfim}&typeFilter=${typeFilter}&categoriaFilter=${categoriaFilter}`, {
      headers: headerToken,
    });
  }

  getApartamentEnterprise(idEnterprise: any) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<ApartamentoManagement[]>(API_URL + `api/Apartament?enterpriseId=${idEnterprise}`, {
      headers: headerToken,
    });
  }

  putApartamentById(idApartament: number, body: any) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.put<any>(API_URL + `api/Apartament/${idApartament}`, body, { headers: headerToken });
  }

  postApartament(body: any) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.post<any>(API_URL + `api/Apartament`, body, { headers: headerToken });
  }


  getApartamentEspelho(idEnterprise: any) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<Apartamento[]>(API_URL + `api/Apartament/espelho/${idEnterprise}`, {
      headers: headerToken,
    });
  }


  listAttendanceVm(params: { page?: number; pageSize?: number; onDate?: string; userId?: number; authorId?: number })
    : Observable<PagedResult<AttendanceVm>> {

    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });
    return this.http.get<PagedResult<AttendanceVm>>(API_URL + `api/Comparecimento`, { headers: headerToken, params: p });
  }

  getAttendanceVm(id: number) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.get<AttendanceVm>(API_URL + `api/Comparecimento/${id}`, { headers: headerToken });
  }

  createAttendanceVm(body: AttendanceUpsert) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.post<{ id: number }>(API_URL + `api/Comparecimento`, body, { headers: headerToken });
  }

  updateAttendanceVm(id: number, body: AttendanceUpsert) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.put<void>(API_URL + `api/Comparecimento/${id}`, body, { headers: headerToken });
  }

  deleteAttendanceVm(id: number) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.delete<void>(API_URL + `api/Comparecimento/${id}`, { headers: headerToken });
  }


  list(params: VisitsQuery): Observable<PagedResult<VisitVm>> {

    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        httpParams = httpParams.set(k, String(v));
      }
    });

    return this.http.get<PagedResult<VisitVm>>(API_URL + `api/Visitas`, { headers: headerToken, params: httpParams });
  }

  get(id: number): Observable<VisitVm> {

    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    return this.http.get<VisitVm>(API_URL + `api/Visitas/${id}`, { headers: headerToken });
  }

  create(body: VisitUpsert): Observable<{ id: number }> {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.post<{ id: number }>(API_URL + `api/Visitas`, body, { headers: headerToken });
  }

  /** Atualizar */
  update(id: number, body: VisitUpsert): Observable<void> {

    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.put<void>(API_URL + `api/Visitas`, body, { headers: headerToken });
  }

  /** Excluir (hard delete) */
  delete(id: number): Observable<void> {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.delete<void>(API_URL + `api/Visitas/${id}`, { headers: headerToken });
  }

  delClienteById(id: number) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<Cliente>(API_URL + `api/Cliente/${id}`, {
      headers: headerToken,
    });
  }

  putCliente(obj: any) {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.put(API_URL + 'api/Cliente', obj, { headers });
  }

  getCategoriesById(id: number) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<Categories>(API_URL + `api/Categories/${id}`, {
      headers: headerToken,
    });
  }

  getCategories() {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<Categories[]>(API_URL + `api/Categories`, {
      headers: headerToken,
    });
  }

  getCategoriesActives() {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<Categories[]>(API_URL + `api/Categories?onlyActive=true`, {
      headers: headerToken,
    });
  }

  putCategories(id: number, obj: any) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.put(API_URL + `api/Categories/${id}`, obj, {
      headers: headerToken,
    });
  }

  postCategories(obj: any) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.post(API_URL + 'api/Categories', obj, {
      headers: headerToken,
    });
  }

  getFormasPagamentoById(id: number) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<FormasPagamento>(API_URL + `api/FormasPagamento/${id}`, {
      headers: headerToken,
    });
  }

  getFormasPagamento() {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<FormasPagamento[]>(API_URL + `api/FormasPagamento`, {
      headers: headerToken,
    });
  }

  postFormasPagamento(obj: any) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.post(API_URL + 'api/FormasPagamento', obj, {
      headers: headerToken,
    });
  }

  putFormasPagamento(obj: any) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.put(API_URL + 'api/FormasPagamento', obj, {
      headers: headerToken,
    });
  }

  //plano de conta

  getAccPlanById(id: number) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<AccountPlains>(API_URL + `api/AccountPlains/${id}`, {
      headers: headerToken,
    });
  }

  createAccBnk(obj: any) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.post<AccountBank>(API_URL + `api/AccountBank`, obj, {
      headers: headerToken,
    });
  }

  createSale(obj: any) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.post<AccountBank>(API_URL + `api/Venda`, obj, {
      headers: headerToken,
    });
  }


  getAccBnk() {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<AccountBank[]>(API_URL + `api/AccountBank`, {
      headers: headerToken,
    });
  }

  getAccBnkById(id: number) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<AccountBank[]>(API_URL + `api/AccountBank/${id}`, {
      headers: headerToken,
    });
  }

  putAccPlan() {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.put<AccountBank>(API_URL + `api/AccountBank`, {
      headers: headerToken,
    });
  }

  getDre(opts: { startDate: string; endDate: string; categoryId?: number; costCenterId?: number }) {

    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };


    let pr = new HttpParams()
      .set('startDate', opts.startDate)
      .set('endDate', opts.endDate);

    if (opts.categoryId != null) pr = pr.set('categoryId', String(opts.categoryId));
    if (opts.costCenterId != null) pr = pr.set('costCenterId', String(opts.costCenterId));

    return this.http.get<DreResponse>(API_URL + `api/Receivables/dre`, { params: pr, headers: headerToken });
  }

  getAccPlan() {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<AccountPlains>(API_URL + `api/AccountPlains`, {
      headers: headerToken,
    });
  }

  postAccPlan(obj: any) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.post(API_URL + 'api/AccountPlains', obj, {
      headers: headerToken,
    });
  }
  //venda

  getVenda() {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<VendaDTO[]>(API_URL + `api/Venda`, {
      headers: headerToken,
    });
  }

  getVendaById(id: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Sales>(API_URL + `api/Venda/${id}`, { headers: headerToken })
  }

  getVendaFullById(id: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Sales>(API_URL + `api/Venda/sales/${id}/full`, { headers: headerToken })
  }

  postFilterVenda(obj: any) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.post<Sales[]>(API_URL + 'api/Venda/filters', obj, {
      headers: headerToken,
    });
  }

  postAuth(email: any, pwd: any) {

    var obj = {
      email: email,
      password: pwd
    }
    return this.http.post(API_URL + 'api/Auth/login', obj);
  }

  //Recupera Filiais
  getFiliais() {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Filial[]>(API_URL + 'api/Filial', { headers: headerToken })
  }

  getClientesByTerms(terms: string) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<Cliente[]>(API_URL + `api/Cliente/term/${terms}`, {
      headers: headerToken,
    });
  }


  //---------------------------------

  getMonthlySummary(startDate: string, endDate: string, type: 'all' | 'revenue' | 'expense' = 'all') {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    const params = new HttpParams().set('start', startDate).set('end', endDate).set('type', type);
    return this.http.get<SummaryResponse>(API_URL + `api/Receivables/cc/summary`, { params, headers: headerToken });
  }

  getEntries(costCenterId: number, startDate: string, endDate: string, type: 'all' | 'revenue' | 'expense' = 'all') {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    const params = new HttpParams().set('start', startDate).set('end', endDate).set('type', type);
    return this.http.get<Entry[]>(API_URL + `api/Receivables/${costCenterId}/entries`, { headers: headerToken, params });
  }

  getCostCenters() {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<CostCenter[]>(API_URL + `/api/Receivables/cc`, { headers: headerToken });
  }

  getAccounts(q?: string) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    const params = q ? new HttpParams().set('q', q) : undefined;
    return this.http.get<AccountOption[]>(API_URL + `/api/Receivables/accounts`, { headers: headerToken, params });
  }

  //---------------------------------

  reclassify(kind: EntryKind, id: number, body: ReclassifyRequest) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.put<void>(`/api/Receivables/${kind}/${id}/reclassify`, body, { headers: headerToken });
  }

  //Recupera Filiais
  getFiliaisById(id: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Filial>(API_URL + `api/Filial/${id}`, { headers: headerToken })
  }

  getUsersByCargoAndFilial(cargo: number, filial: number, visiveis: number) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Usuarios[]>(API_URL + `api/Usuario/roleId/${cargo}/branchId/${filial}/hidden/${visiveis}`, { headers: headerToken })
  }

  getAllUnitsActiveByEnterprise(id: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<UnitsEnterprise[]>(API_URL + `api/Empreendimento/units-actives/${id}`, { headers: headerToken })
  }

  getAllUnitsByEnterpriseV2(id: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<UnitsEnterprise[]>(API_URL + `api/Empreendimento/units/${id}`, { headers: headerToken })
  }

  getAllUnitsByEnterprise(id: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Filial>(API_URL + `api/Empreendimento/units/${id}`, { headers: headerToken })
  }

  //Cria Filiais
  postFilial(obj: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.post(API_URL + 'api/Filial', obj, { headers: headerToken })
  }

  deleteFilial(id: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.delete(API_URL + `api/Filial/${id}`, { headers: headerToken })
  }

  //Atualiza Filiais
  updateFilial(obj: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.put(API_URL + 'api/Filial', obj, { headers: headerToken })
  }

  getUsuariosFilter(status: string) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Usuarios[]>(API_URL + `api/Usuario/status/${status}`, { headers: headerToken })
  }

  getUsuariosEnterprise(enterpriseId: number) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Usuarios[]>(API_URL + `api/Usuario/enterprise/${enterpriseId}`, { headers: headerToken })
  }

  getUsuarios() {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Usuarios[]>(API_URL + `api/Usuario/status/todos`, { headers: headerToken })
  }

  getUserById(id: number) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<Usuarios>(API_URL + `api/Usuario/${id}`, {
      headers: headerToken,
    });
  }

  //Cria usuÃ¡rio
  postUsuarios(obj: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.post(API_URL + 'api/Usuario', obj, { headers: headerToken })
  }

  updateUsuarios(obj: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.put(API_URL + 'api/Usuario', obj, { headers: headerToken })
  }

  //Pega todos os cargos
  getCargos() {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Cargos[]>(API_URL + `api/Cargo`, { headers: headerToken })
  }

  getCargoById(id: number) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<Cargos>(API_URL + `api/Cargo/${id}`, {
      headers: headerToken,
    });
  }


  //Cria cargo
  postCargos(obj: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.post(API_URL + 'api/Cargo', obj, { headers: headerToken })
  }

  getCentroCusto() {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<CentroCusto[]>(API_URL + `api/CentroCusto`, { headers: headerToken })
  }

  getCentroCustoById(id: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<CentroCusto>(API_URL + `api/CentroCusto/${id}`, { headers: headerToken })
  }

  postCentroCusto(obj: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.post(API_URL + 'api/CentroCusto', obj, { headers: headerToken })
  }

  //Pega todos os clientes
  getClientes() {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Cliente[]>(API_URL + `api/Cliente`, { headers: headerToken })
  }

  //Pega todos os cargos
  getConstrutora() {
    var headerToken = this.getAuthHeaders();
    return this.http.get<Construtoras[]>(API_URL + `api/Construtora`, { headers: headerToken })
  }

  putConstrutora(obj: any, id: number) {
    const headerToken = this.getAuthHeaders();
    return this.http.put(API_URL + `api/Construtora/${id}`, obj, { headers: headerToken });
  }

  getEmpreendimentosBYConstrutor(id: any) {
    var headerToken = this.getAuthHeaders();
    return this.http.get<Empreendimento[]>(API_URL + `api/Empreendimento/per-enterprise/${id}`, { headers: headerToken })
  }

  //Cria Construtora
  postConstrutora(obj: any) {
    var headerToken = this.getAuthHeaders();
    return this.http.post(API_URL + 'api/Construtora', obj, { headers: headerToken })
  }

  //------------------------------------------------------------------------------
  getSummary(opts: {

    start: string; end: string;
    type?: 'all' | 'revenue' | 'expense';
    costCenterId?: number; categoryId?: number;
  }) {

    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    let params = new HttpParams().set('start', opts.start).set('end', opts.end);
    if (opts.type) params = params.set('type', opts.type);
    if (opts.costCenterId != null) params = params.set('costCenterId', String(opts.costCenterId));
    if (opts.categoryId != null) params = params.set('categoryId', String(opts.categoryId));
    return this.http.get<AccountSummaryResponse>(API_URL + `api/Receivables/ac/summary`, { headers: headerToken, params });
  }

  getEntriesAC(accountId: number, opts: {
    start: string; end: string;
    type?: 'all' | 'revenue' | 'expense';
    costCenterId?: number; categoryId?: number;
  }) {
    let params = new HttpParams().set('start', opts.start).set('end', opts.end);
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    if (opts.type) params = params.set('type', opts.type);
    if (opts.costCenterId != null) params = params.set('costCenterId', String(opts.costCenterId));
    if (opts.categoryId != null) params = params.set('categoryId', String(opts.categoryId));
    return this.http.get<Entry[]>(API_URL + `api/Receivables/ac/${accountId}/entries`, { headers: headerToken, params });
  }

  // auxiliares para selects

  //-------------------------------------------------------------------------------

  getEmpreendimentos() {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Empreendimento[]>(API_URL + `api/Empreendimento`, { headers: headerToken })
  }

  getEmpreendimentosById(id: number) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Empreendimento>(API_URL + `api/Empreendimento/${id}`, { headers: headerToken })
  }

  getCorretores() {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Usuarios[]>(API_URL + `api/Usuario/corretores`, { headers: headerToken })
  }

  getVendedoresPorGerente(gerenteId: number) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Usuarios[]>(API_URL + `api/Usuario/vendedores?gerenteId=${gerenteId}`, { headers: headerToken })
  }

  getGerentes() {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Usuarios[]>(API_URL + `api/Usuario/gerentes`, { headers: headerToken })
  }

  getCoordenadores() {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Usuarios[]>(API_URL + `api/Usuario/coordenadores`, { headers: headerToken })
  }

  getCoordenadoresPorGerente(gerenteId: number) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<Usuarios[]>(API_URL + `api/Usuario/coordenadores?gerenteId=${gerenteId}`, { headers: headerToken })
  }

  getActivitiesByLead(leadId: number): Observable<LeadActivity[]> {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<LeadActivity[]>(`${API_URL}api/Leads/${leadId}/activities`, { headers: headerToken });
  }

  addActivity(leadId: number, payload: CreateLeadActivityRequest): Observable<LeadActivity> {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.post<LeadActivity>(`${API_URL}api/Leads/${leadId}/activities`, payload, { headers: headerToken });
  }

  getSchedulesByLead(leadId: number, typeSchedule: string ) {
    var headerToken = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<LeadSchedule[]>(`${API_URL}api/Leads/${leadId}/schedules?typeSchedule=${typeSchedule}`, { headers: headerToken });
  }

  createSchedule(leadId: number, payload: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.post<LeadSchedule>(`${API_URL}api/Leads/schedule`, payload, { headers: headerToken });
  }

  createScheduleV3(leadId: number, payload: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.post<LeadSchedule>(`${API_URL}api/Leads/${leadId}/schedule/v2`, payload, { headers: headerToken });
  }
  updateScheduleStatus(leadId: number, scheduleId: number, payload: UpdateLeadScheduleStatusRequest) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.put<void>(`${API_URL}api/Leads/${leadId}/schedules/${scheduleId}/status`, payload, { headers: headerToken });
  }

  postEmpreendimentos(obj: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.post(API_URL + 'api/Empreendimento', obj, { headers: headerToken })
  }

  putEmpreendimentos(id: any, obj: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.put(API_URL + `api/Empreendimento/${id}`, obj, { headers: headerToken })
  }

  getPayable() {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<FinancialEntry[]>(API_URL + 'api/Payable/all', { headers: headerToken })
  }

  postPayable(obj: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.post(API_URL + 'api/Payable', obj, { headers: headerToken })
  }

  getReceivables() {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.get<FinancialEntry[]>(API_URL + 'api/Receivables/all', { headers: headerToken })
  }

  postReceivables(obj: any) {
    var headerToken = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    return this.http.post(API_URL + 'api/Receivables', obj, { headers: headerToken })
  }
}


