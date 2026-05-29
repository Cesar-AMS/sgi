import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateLeadInterestRegionRequest,
  LeadInterestRegion,
  ToggleLeadInterestRegionRequest,
  UpdateLeadInterestRegionRequest,
} from 'src/app/models/lead-interest-region';
import { BACKEND_API_URL } from './backend-api-url';

@Injectable({ providedIn: 'root' })
export class LeadInterestRegionService {
  private readonly baseUrl = `${BACKEND_API_URL}api/lead-interest-regions`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  }

  list(): Observable<LeadInterestRegion[]> {
    return this.http.get<LeadInterestRegion[]>(this.baseUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  listActive(): Observable<LeadInterestRegion[]> {
    return this.http.get<LeadInterestRegion[]>(`${this.baseUrl}/active`, {
      headers: this.getAuthHeaders(),
    });
  }

  create(payload: CreateLeadInterestRegionRequest): Observable<LeadInterestRegion> {
    return this.http.post<LeadInterestRegion>(this.baseUrl, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  update(id: number, payload: UpdateLeadInterestRegionRequest): Observable<LeadInterestRegion> {
    return this.http.put<LeadInterestRegion>(`${this.baseUrl}/${id}`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  toggle(id: number, isActive: boolean): Observable<LeadInterestRegion> {
    const payload: ToggleLeadInterestRegionRequest = { isActive };
    return this.http.patch<LeadInterestRegion>(`${this.baseUrl}/${id}/toggle`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  remove(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
