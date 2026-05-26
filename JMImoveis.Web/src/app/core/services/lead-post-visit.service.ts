import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import {
  LeadPostVisit,
  LeadPostVisitFilters,
  LeadPostVisitListItem,
  LeadPostVisitRequest,
  LeadPostVisitStatus,
} from 'src/app/models/lead-post-visit';

@Injectable({ providedIn: 'root' })
export class LeadPostVisitService {
  private readonly baseUrl = `${BACKEND_API_URL}api/LeadPostVisit`;

  constructor(private http: HttpClient) {}

  list(filters: LeadPostVisitFilters = {}): Observable<LeadPostVisitListItem[]> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<LeadPostVisitListItem[]>(this.baseUrl, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  getByLeadId(leadId: number): Observable<LeadPostVisit> {
    return this.http.get<LeadPostVisit>(`${this.baseUrl}/lead/${leadId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  createOrGetByLeadId(leadId: number, payload: LeadPostVisitRequest): Observable<LeadPostVisit> {
    return this.http.post<LeadPostVisit>(`${this.baseUrl}/lead/${leadId}`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  updateByLeadId(leadId: number, payload: LeadPostVisitRequest): Observable<LeadPostVisit> {
    return this.http.put<LeadPostVisit>(`${this.baseUrl}/lead/${leadId}`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  updateStatus(id: number, status: LeadPostVisitStatus): Observable<LeadPostVisit> {
    return this.http.patch<LeadPostVisit>(
      `${this.baseUrl}/${id}/status`,
      { status },
      { headers: this.getAuthHeaders() }
    );
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  }
}
