import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth-token';
const LEGACY_TOKEN_KEY = 'token';
const USER_KEY = 'currentUser';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor() { }

  signOut(): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }

  public saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
    window.localStorage.setItem(LEGACY_TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return window.localStorage.getItem(LEGACY_TOKEN_KEY)
      ?? window.sessionStorage.getItem(TOKEN_KEY);
  }

  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));

    if (user?.token) {
      this.saveToken(user.token);
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

  public hasAuthenticatedUser(): boolean {
    const user = this.getUser();
    return !!(user && Object.keys(user).length > 0);
  }
}
