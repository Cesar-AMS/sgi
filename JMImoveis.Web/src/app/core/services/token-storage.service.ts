import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth-token';
const LEGACY_TOKEN_KEY = 'token';
const USER_KEY = 'currentUser';
const LEGACY_USER_KEY = 'authUser';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor() { }

  signOut(): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.removeItem(LEGACY_USER_KEY);
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(LEGACY_USER_KEY);
  }

  public saveToken(token: string): void {
    const normalizedToken = this.normalizeToken(token);
    if (!normalizedToken) {
      return;
    }

    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, normalizedToken);
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
    window.localStorage.setItem(LEGACY_TOKEN_KEY, normalizedToken);
  }

  public getToken(): string | null {
    const candidates = [
      this.extractToken(this.getUser()),
      this.extractToken(this.getLegacyUser()),
      this.normalizeToken(window.sessionStorage.getItem(TOKEN_KEY)),
      this.normalizeToken(window.localStorage.getItem(LEGACY_TOKEN_KEY))
    ].filter((token): token is string => !!token);

    const validToken = candidates.find(token => !this.isJwtExpired(token));
    if (validToken) {
      return validToken;
    }

    return candidates[0] ?? null;
  }

  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.sessionStorage.removeItem(LEGACY_USER_KEY);
    window.sessionStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user));
    window.localStorage.removeItem(LEGACY_USER_KEY);
    window.localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user));

    const token = this.extractToken(user);
    if (token) {
      this.saveToken(token);
    }
  }

  public getUser(): any {
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }

    const sessionUser = window.sessionStorage.getItem(USER_KEY);
    if (sessionUser) {
      return JSON.parse(sessionUser);
    }

    return {};
  }

  private getLegacyUser(): any {
    const localUser = window.localStorage.getItem(LEGACY_USER_KEY);
    if (localUser) {
      return JSON.parse(localUser);
    }

    const sessionUser = window.sessionStorage.getItem(LEGACY_USER_KEY);
    if (sessionUser) {
      return JSON.parse(sessionUser);
    }

    return {};
  }

  public hasAuthenticatedUser(): boolean {
    const user = this.getUser();
    return !!(user && Object.keys(user).length > 0);
  }

  private extractToken(user: any): string | null {
    return this.normalizeToken(
      user?.token
      ?? user?.Token
      ?? user?.accessToken
      ?? user?.access_token
      ?? user?.jwt
      ?? user?.jwtToken
    );
  }

  private normalizeToken(token: unknown): string | null {
    if (typeof token !== 'string') {
      return null;
    }

    let normalizedToken = token.trim();
    if (!normalizedToken || normalizedToken === 'null' || normalizedToken === 'undefined') {
      return null;
    }

    if (
      (normalizedToken.startsWith('"') && normalizedToken.endsWith('"'))
      || (normalizedToken.startsWith("'") && normalizedToken.endsWith("'"))
    ) {
      normalizedToken = normalizedToken.slice(1, -1).trim();
    }

    return normalizedToken.replace(/^Bearer\s+/i, '').trim() || null;
  }

  private isJwtExpired(token: string): boolean {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(this.toBase64(parts[1])));
      if (!payload?.exp) {
        return false;
      }

      return payload.exp * 1000 <= Date.now();
    } catch {
      return false;
    }
  }

  private toBase64(value: string): string {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    return padding ? base64 + '='.repeat(4 - padding) : base64;
  }
}
