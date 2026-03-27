import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MenuItem } from 'src/app/layouts/sidebar/menu.model';
import { BACKEND_API_URL } from './backend-api-url';

@Injectable({ providedIn: 'root' })
export class UserMenuService {
  private readonly baseUrl = `${BACKEND_API_URL}api/usuario`;

  constructor(private http: HttpClient) {}

  getUserMenu(userId: number) {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/me/${userId}`);
  }

  updateUserMenu(userId: number, menu: MenuItem[]) {
    return this.http.put(`${this.baseUrl}/users/${userId}/menu`, menu);
  }
}
