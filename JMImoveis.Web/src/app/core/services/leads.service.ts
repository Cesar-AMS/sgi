import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import {
  LeadActivity,
  LeadFilter,
  LeadSchedule,
  UpdateLeadScheduleStatusRequest,
} from 'src/app/models/ContaBancaria';
import {
  CreateLeadActivityRequest,
  CreateLeadRequest,
  Lead,
} from 'src/app/models/lead';

@Injectable({ providedIn: 'root' })
export class LeadsService {
  private readonly baseUrl = `${BACKEND_API_URL}api/Leads`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  }

  getLeads(filter: LeadFilter): Observable<Lead[]> {
    return this.http.post<Lead[]>(`${this.baseUrl}/report`, filter, {
      headers: this.getAuthHeaders(),
    });
  }

  getLeadById(id: number): Observable<Lead> {
    return this.http.get<Lead>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  createLead(payload: CreateLeadRequest): Observable<unknown> {
    return this.http.post(this.baseUrl, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  updateLead(lead: Lead): Observable<void> {
    return this.http.patch<void>(this.baseUrl, lead, {
      headers: this.getAuthHeaders(),
    });
  }

  getActivitiesByLead(leadId: number): Observable<LeadActivity[]> {
    return this.http.get<LeadActivity[]>(`${this.baseUrl}/${leadId}/activities`, {
      headers: this.getAuthHeaders(),
    });
  }

  addActivity(
    leadId: number,
    payload: CreateLeadActivityRequest
  ): Observable<LeadActivity> {
    return this.http.post<LeadActivity>(
      `${this.baseUrl}/${leadId}/activities`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  getSchedulesByLead(
    leadId: number,
    typeSchedule: string
  ): Observable<LeadSchedule[]> {
    return this.http.get<LeadSchedule[]>(
      `${this.baseUrl}/${leadId}/schedules?typeSchedule=${typeSchedule}`,
      { headers: this.getAuthHeaders() }
    );
  }

  createSchedule(payload: unknown): Observable<LeadSchedule> {
    return this.http.post<LeadSchedule>(`${this.baseUrl}/schedule`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  createScheduleV3(leadId: number, payload: unknown): Observable<LeadSchedule> {
    return this.http.post<LeadSchedule>(
      `${this.baseUrl}/${leadId}/schedule/v2`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  updateScheduleStatus(
    leadId: number,
    scheduleId: number,
    payload: UpdateLeadScheduleStatusRequest
  ): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/${leadId}/schedules/${scheduleId}/status`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }
}
