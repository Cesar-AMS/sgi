import { Injectable } from '@angular/core';
import { User } from 'src/app/store/Authentication/auth.models';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  constructor(private tokenStorageService: TokenStorageService) {}

  getCurrentUser(): User | null {
    const user = this.tokenStorageService.getUser();
    return user && Object.keys(user).length > 0 ? user : null;
  }

  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return typeof user?.id === 'number' ? user.id : null;
  }

  getToken(): string | null {
    return this.tokenStorageService.getToken();
  }

  setSession(user: User | null): void {
    if (!user) {
      this.clearSession();
      return;
    }

    this.tokenStorageService.saveUser(user);
  }

  hasSession(): boolean {
    return this.tokenStorageService.hasAuthenticatedUser();
  }

  clearSession(): void {
    this.tokenStorageService.signOut();
  }
}
