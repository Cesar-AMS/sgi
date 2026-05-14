import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';

export type ExternalCollaboratorDetails = {
  id?: number;
  userId?: number;
  startDate?: string | null;
  endDate?: string | null;
  contractFileName?: string | null;
  contractFilePath?: string | null;
  contractContentType?: string | null;
  contractSize?: number | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ExternalCollaboratorDetailsResponse = {
  message?: string;
  data?: ExternalCollaboratorDetails;
};

@Injectable({ providedIn: 'root' })
export class ExternalCollaboratorDetailsService {
  private readonly url = `${BACKEND_API_URL}api/external-collaborator-details`;

  constructor(private http: HttpClient) {}

  private get authHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }

  getByUserId(userId: number): Observable<ExternalCollaboratorDetails> {
    return this.http.get<ExternalCollaboratorDetails>(`${this.url}/user/${userId}`, {
      headers: this.authHeaders,
    });
  }

  upsertByUserId(userId: number, details: ExternalCollaboratorDetails): Observable<ExternalCollaboratorDetails> {
    return this.http.put<ExternalCollaboratorDetailsResponse>(`${this.url}/user/${userId}`, details, {
      headers: this.authHeaders,
    }).pipe(map((response) => response.data ?? details));
  }

  uploadContract(userId: number, file: File): Observable<ExternalCollaboratorDetails> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ExternalCollaboratorDetailsResponse>(`${this.url}/user/${userId}/contract`, formData, {
      headers: this.authHeaders,
    }).pipe(map((response) => response.data ?? {}));
  }

  downloadContract(userId: number): Observable<Blob> {
    return this.http.get(`${this.url}/user/${userId}/contract`, {
      headers: this.authHeaders,
      responseType: 'blob',
    });
  }
}
