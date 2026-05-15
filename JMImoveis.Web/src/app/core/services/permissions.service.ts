import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Permission {
  id: number;
  permissionKey?: string;
  permission_key?: string;
  name: string;
  description?: string;
  module: string;
  action?: string;
  route?: string;
  isActive?: boolean;
  is_active?: boolean;
}

export interface UserPermissionOverride {
  permissionId: number;
  permission_id?: number;
  effect: 'ALLOW' | 'DENY';
}

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private readonly apiUrl = `${environment.backendApiUrl}permissions`;

  constructor(private http: HttpClient) {}

  private get authHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.apiUrl, {
      headers: this.authHeaders,
    });
  }

  getRolePermissions(roleId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/roles/${roleId}`, {
      headers: this.authHeaders,
    });
  }

  updateRolePermissions(roleId: number, permissionIds: number[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/roles/${roleId}`, {
      permissionIds
    }, {
      headers: this.authHeaders,
    });
  }

  getUserOverrides(userId: number): Observable<UserPermissionOverride[]> {
    return this.http.get<UserPermissionOverride[]>(`${this.apiUrl}/users/${userId}/overrides`, {
      headers: this.authHeaders,
    });
  }

  updateUserOverrides(userId: number, overrides: UserPermissionOverride[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/overrides`, {
      overrides
    }, {
      headers: this.authHeaders,
    });
  }

  getUserEffectivePermissions(userId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/users/${userId}/effective`, {
      headers: this.authHeaders,
    });
  }
}