import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';

import { Permission, PermissionsService } from '../services/permissions.service';
import { SessionService } from '../session/session.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard {
  private cachedUserId?: number;
  private cachedPermissionKeys?: Set<string>;

  constructor(
    private permissionsService: PermissionsService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | boolean | UrlTree {
    const permissionKey = route.data?.['permissionKey'] as string | undefined;

    if (!permissionKey) {
      return true;
    }

    const userId = this.resolveCurrentUserId();
    if (!userId) {
      return this.router.createUrlTree(['/jm/dashboard']);
    }

    if (this.cachedUserId === userId && this.cachedPermissionKeys) {
      return this.hasPermission(this.cachedPermissionKeys, permissionKey)
        ? true
        : this.router.createUrlTree(['/jm/dashboard']);
    }

    return this.permissionsService.getUserEffectivePermissions(userId).pipe(
      map((permissions) => {
        const permissionKeys = this.extractPermissionKeys(permissions);
        this.cachedUserId = userId;
        this.cachedPermissionKeys = permissionKeys;

        return this.hasPermission(permissionKeys, permissionKey)
          ? true
          : this.router.createUrlTree(['/jm/dashboard']);
      }),
      catchError(() => of(true))
    );
  }

  private hasPermission(permissionKeys: Set<string>, permissionKey: string): boolean {
    return permissionKeys.has('sistema.admin.total') || permissionKeys.has(permissionKey);
  }

  private extractPermissionKeys(permissions: Permission[] | null | undefined): Set<string> {
    const keys = new Set<string>();

    for (const permission of permissions ?? []) {
      const key = permission.permissionKey ?? permission.permission_key;
      if (key) {
        keys.add(key);
      }
    }

    return keys;
  }

  private resolveCurrentUserId(): number | null {
    const sessionUserId = this.sessionService.getCurrentUserId();
    if (sessionUserId) {
      return sessionUserId;
    }

    const storedUserId =
      this.extractUserIdFromStorage('currentUser') ??
      this.extractUserIdFromStorage('authUser');

    if (storedUserId) {
      return storedUserId;
    }

    return this.extractUserIdFromToken(localStorage.getItem('token'));
  }

  private extractUserIdFromStorage(key: string): number | null {
    const raw = localStorage.getItem(key) ?? sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }

    try {
      const user = JSON.parse(raw);
      return this.normalizeUserId(
        user?.id ??
        user?.Id ??
        user?.userId ??
        user?.user_id ??
        user?.sub
      );
    } catch {
      return null;
    }
  }

  private extractUserIdFromToken(token: string | null): number | null {
    if (!token) {
      return null;
    }

    const normalizedToken = token.replace(/^Bearer\s+/i, '').trim();
    const payload = normalizedToken.split('.')[1];

    if (!payload) {
      return null;
    }

    try {
      const json = JSON.parse(atob(this.toBase64(payload)));
      return this.normalizeUserId(
        json?.id ??
        json?.Id ??
        json?.userId ??
        json?.user_id ??
        json?.nameid ??
        json?.sub
      );
    } catch {
      return null;
    }
  }

  private normalizeUserId(value: unknown): number | null {
    const id = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private toBase64(value: string): string {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    return padding ? base64 + '='.repeat(4 - padding) : base64;
  }
}
