import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateLeadSourceRequest,
  LeadSource,
  ToggleLeadSourceRequest,
  UpdateLeadSourceRequest,
} from 'src/app/models/lead-source';
import { BACKEND_API_URL } from './backend-api-url';

@Injectable({ providedIn: 'root' })
export class LeadSourceService {
  private readonly baseUrl = `${BACKEND_API_URL}api/lead-sources`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  }

  list(): Observable<LeadSource[]> {
    return this.http.get<LeadSource[]>(this.baseUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  listActive(): Observable<LeadSource[]> {
    return this.http.get<LeadSource[]>(`${this.baseUrl}/active`, {
      headers: this.getAuthHeaders(),
    });
  }

  create(payload: CreateLeadSourceRequest): Observable<LeadSource> {
    return this.http.post<LeadSource>(this.baseUrl, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  update(id: number, payload: UpdateLeadSourceRequest): Observable<LeadSource> {
    return this.http.put<LeadSource>(`${this.baseUrl}/${id}`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  toggle(id: number, isActive: boolean): Observable<LeadSource> {
    const payload: ToggleLeadSourceRequest = { isActive };
    return this.http.patch<LeadSource>(`${this.baseUrl}/${id}/toggle`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  remove(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
