import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateLeadDistributionAgentRequest,
  LeadDistributionAgent,
  ToggleLeadDistributionAgentRequest,
  UpdateLeadDistributionAgentRequest,
} from 'src/app/models/lead-distribution-agent';
import { BACKEND_API_URL } from './backend-api-url';

@Injectable({ providedIn: 'root' })
export class LeadDistributionAgentService {
  private readonly baseUrl = `${BACKEND_API_URL}api/lead-distribution-agents`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  }

  list(): Observable<LeadDistributionAgent[]> {
    return this.http.get<LeadDistributionAgent[]>(this.baseUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  create(payload: CreateLeadDistributionAgentRequest): Observable<LeadDistributionAgent> {
    return this.http.post<LeadDistributionAgent>(this.baseUrl, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  update(id: number, payload: UpdateLeadDistributionAgentRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  toggle(id: number, isActive: boolean): Observable<void> {
    const payload: ToggleLeadDistributionAgentRequest = { isActive };
    return this.http.patch<void>(`${this.baseUrl}/${id}/toggle`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
