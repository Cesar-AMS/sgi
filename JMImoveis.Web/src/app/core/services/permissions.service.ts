import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, of, shareReplay, tap } from 'rxjs';
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
  private readonly effectivePermissionsCache = new Map<number, Permission[]>();
  private readonly effectivePermissionsRequests = new Map<number, Observable<Permission[]>>();

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
    }).pipe(
      tap(() => this.clearEffectivePermissionsCache())
    );
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
    }).pipe(
      tap(() => this.clearEffectivePermissionsCache(userId))
    );
  }

  getUserEffectivePermissions(userId: number): Observable<Permission[]> {
    const cached = this.effectivePermissionsCache.get(userId);
    if (cached) {
      return of(cached);
    }

    const currentRequest = this.effectivePermissionsRequests.get(userId);
    if (currentRequest) {
      return currentRequest;
    }

    const request = this.http.get<Permission[]>(`${this.apiUrl}/users/${userId}/effective`, {
      headers: this.authHeaders,
    }).pipe(
      tap((permissions) => this.effectivePermissionsCache.set(userId, permissions ?? [])),
      finalize(() => this.effectivePermissionsRequests.delete(userId)),
      shareReplay(1)
    );

    this.effectivePermissionsRequests.set(userId, request);
    return request;
  }

  clearEffectivePermissionsCache(userId?: number): void {
    if (userId) {
      this.effectivePermissionsCache.delete(userId);
      this.effectivePermissionsRequests.delete(userId);
      return;
    }

    this.effectivePermissionsCache.clear();
    this.effectivePermissionsRequests.clear();
  }
}
