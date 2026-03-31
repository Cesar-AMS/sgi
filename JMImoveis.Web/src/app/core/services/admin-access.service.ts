import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import { AccountPlains, Cargos, Categories, CentroCusto, Filial, FormasPagamento, Usuarios } from 'src/app/models/ContaBancaria';

@Injectable({ providedIn: 'root' })
export class AdminAccessService {
  private readonly usersUrl = `${BACKEND_API_URL}api/Usuario`;
  private readonly rolesUrl = `${BACKEND_API_URL}api/Cargo`;
  private readonly branchesUrl = `${BACKEND_API_URL}api/Filial`;
  private readonly paymentMethodsUrl = `${BACKEND_API_URL}api/FormasPagamento`;
  private readonly categoriesUrl = `${BACKEND_API_URL}api/Categories`;
  private readonly costCentersUrl = `${BACKEND_API_URL}api/CentroCusto`;
  private readonly accountPlainsUrl = `${BACKEND_API_URL}api/AccountPlains`;

  constructor(private http: HttpClient) {}

  private get authHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }

  listUsersByStatus(status: string): Observable<Usuarios[]> {
    return this.http.get<Usuarios[]>(`${this.usersUrl}/status/${status}`, {
      headers: this.authHeaders,
    });
  }

  getUserById(id: number): Observable<Usuarios> {
    return this.http.get<Usuarios>(`${this.usersUrl}/${id}`, {
      headers: this.authHeaders,
    });
  }

  createUser(user: Usuarios): Observable<unknown> {
    return this.http.post(this.usersUrl, user, {
      headers: this.authHeaders,
    });
  }

  updateUser(user: Usuarios): Observable<unknown> {
    return this.http.put(this.usersUrl, user, {
      headers: this.authHeaders,
    });
  }

  listRoles(): Observable<Cargos[]> {
    return this.http.get<Cargos[]>(this.rolesUrl, {
      headers: this.authHeaders,
    });
  }

  getRoleById(id: number): Observable<Cargos> {
    return this.http.get<Cargos>(`${this.rolesUrl}/${id}`, {
      headers: this.authHeaders,
    });
  }

  createRole(role: Cargos): Observable<unknown> {
    return this.http.post(this.rolesUrl, role, {
      headers: this.authHeaders,
    });
  }

  listBranches(): Observable<Filial[]> {
    return this.http.get<Filial[]>(this.branchesUrl, {
      headers: this.authHeaders,
    });
  }

  getBranchById(id: number): Observable<Filial> {
    return this.http.get<Filial>(`${this.branchesUrl}/${id}`, {
      headers: this.authHeaders,
    });
  }

  createBranch(branch: Filial): Observable<unknown> {
    return this.http.post(this.branchesUrl, branch, {
      headers: this.authHeaders,
    });
  }

  updateBranch(branch: Filial): Observable<unknown> {
    return this.http.put(this.branchesUrl, branch, {
      headers: this.authHeaders,
    });
  }

  deleteBranch(id: number): Observable<unknown> {
    return this.http.delete(`${this.branchesUrl}/${id}`, {
      headers: this.authHeaders,
    });
  }

  listPaymentMethods(): Observable<FormasPagamento[]> {
    return this.http.get<FormasPagamento[]>(this.paymentMethodsUrl, {
      headers: this.authHeaders,
    });
  }

  getPaymentMethodById(id: number): Observable<FormasPagamento> {
    return this.http.get<FormasPagamento>(`${this.paymentMethodsUrl}/${id}`, {
      headers: this.authHeaders,
    });
  }

  createPaymentMethod(paymentMethod: FormasPagamento): Observable<unknown> {
    return this.http.post(this.paymentMethodsUrl, paymentMethod, {
      headers: this.authHeaders,
    });
  }

  updatePaymentMethod(paymentMethod: FormasPagamento): Observable<unknown> {
    return this.http.put(this.paymentMethodsUrl, paymentMethod, {
      headers: this.authHeaders,
    });
  }

  listCategories(): Observable<Categories[]> {
    return this.http.get<Categories[]>(this.categoriesUrl, {
      headers: this.authHeaders,
    });
  }

  getCategoryById(id: number): Observable<Categories> {
    return this.http.get<Categories>(`${this.categoriesUrl}/${id}`, {
      headers: this.authHeaders,
    });
  }

  createCategory(category: Categories): Observable<unknown> {
    return this.http.post(this.categoriesUrl, category, {
      headers: this.authHeaders,
    });
  }

  updateCategory(id: number, category: Partial<Categories>): Observable<unknown> {
    return this.http.put(`${this.categoriesUrl}/${id}`, category, {
      headers: this.authHeaders,
    });
  }

  listCostCenters(): Observable<CentroCusto[]> {
    return this.http.get<CentroCusto[]>(this.costCentersUrl, {
      headers: this.authHeaders,
    });
  }

  getCostCenterById(id: number): Observable<CentroCusto> {
    return this.http.get<CentroCusto>(`${this.costCentersUrl}/${id}`, {
      headers: this.authHeaders,
    });
  }

  createCostCenter(costCenter: CentroCusto): Observable<unknown> {
    return this.http.post(this.costCentersUrl, costCenter, {
      headers: this.authHeaders,
    });
  }

  listAccountPlains(): Observable<AccountPlains[]> {
    return this.http.get<AccountPlains[]>(this.accountPlainsUrl, {
      headers: this.authHeaders,
    });
  }

  getAccountPlainById(id: number): Observable<AccountPlains> {
    return this.http.get<AccountPlains>(`${this.accountPlainsUrl}/${id}`, {
      headers: this.authHeaders,
    });
  }

  createAccountPlain(accountPlain: AccountPlains): Observable<unknown> {
    return this.http.post(this.accountPlainsUrl, accountPlain, {
      headers: this.authHeaders,
    });
  }
}
