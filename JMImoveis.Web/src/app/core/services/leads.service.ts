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
  LeadDocument,
  LeadEtapaAtendimento,
  LeadStatus,
  LeadTransferHistory,
} from 'src/app/models/lead';

export interface BulkTransferLeadsPayload {
  leadIds: number[];
  toUserId: number;
  reason?: string | null;
}

export interface BulkTransferLeadsResult {
  requestedCount: number;
  transferredCount: number;
  skippedCount: number;
  toUserId: number;
  transferredLeadIds: number[];
  skippedLeadIds: number[];
}

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

  createLead(payload: CreateLeadRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  updateLead(lead: Lead): Observable<void> {
    return this.http.patch<void>(this.baseUrl, lead, {
      headers: this.getAuthHeaders(),
    });
  }

  updateLeadStatus(leadId: number, status: LeadStatus): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/${leadId}/status`,
      { status },
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  bulkTransferLeads(payload: BulkTransferLeadsPayload): Observable<BulkTransferLeadsResult> {
    return this.http.post<BulkTransferLeadsResult>(
      `${this.baseUrl}/bulk-transfer`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  updateLeadEtapaAtendimento(
    leadId: number,
    etapaAtendimento: LeadEtapaAtendimento
  ): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/${leadId}/etapa-atendimento`,
      { etapaAtendimento },
      {
        headers: this.getAuthHeaders(),
      }
    );
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

  getLeadDocuments(leadId: number): Observable<LeadDocument[]> {
    return this.http.get<LeadDocument[]>(`${this.baseUrl}/${leadId}/documents`, {
      headers: this.getAuthHeaders(),
    });
  }

  getLeadTransferHistory(leadId: number): Observable<LeadTransferHistory[]> {
    return this.http.get<LeadTransferHistory[]>(`${this.baseUrl}/${leadId}/transfer-history`, {
      headers: this.getAuthHeaders(),
    });
  }

  uploadLeadDocuments(leadId: number, files: File[]): Observable<{ message: string; data: LeadDocument[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    return this.http.post<{ message: string; data: LeadDocument[] }>(
      `${this.baseUrl}/${leadId}/documents`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  updateLeadDocument(
    leadId: number,
    documentId: number,
    payload: { displayName: string; description?: string | null }
  ): Observable<LeadDocument> {
    return this.http.put<LeadDocument>(
      `${this.baseUrl}/${leadId}/documents/${documentId}`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  downloadLeadDocument(leadId: number, documentId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${leadId}/documents/${documentId}/download`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob',
    });
  }

  deleteLeadDocument(leadId: number, documentId: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${leadId}/documents/${documentId}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
