import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import { Cargos, Filial, Usuarios } from 'src/app/models/ContaBancaria';

@Injectable({ providedIn: 'root' })
export class AdminAccessService {
  private readonly usersUrl = `${BACKEND_API_URL}api/Usuario`;
  private readonly rolesUrl = `${BACKEND_API_URL}api/Cargo`;
  private readonly branchesUrl = `${BACKEND_API_URL}api/Filial`;

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
}
