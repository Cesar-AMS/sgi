import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';

export type EmployeeDocument = {
  id?: number;
  userId?: number;
  documentType?: string | null;
  documentLabel?: string | null;
  fileName?: string | null;
  filePath?: string | null;
  contentType?: string | null;
  fileSize?: number | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type EmployeeDocumentResponse = {
  message?: string;
  data?: EmployeeDocument;
};

@Injectable({ providedIn: 'root' })
export class EmployeeDocumentsService {
  private readonly url = `${BACKEND_API_URL}api/employee-documents`;

  constructor(private http: HttpClient) {}

  private get authHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }

  getByUserId(userId: number): Observable<EmployeeDocument[]> {
    return this.http.get<EmployeeDocument[]>(`${this.url}/user/${userId}`, {
      headers: this.authHeaders,
    });
  }

  upload(
    userId: number,
    file: File,
    documentType: string,
    documentLabel?: string | null,
    notes?: string | null
  ): Observable<EmployeeDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    if (documentLabel?.trim()) {
      formData.append('documentLabel', documentLabel.trim());
    }

    if (notes?.trim()) {
      formData.append('notes', notes.trim());
    }

    return this.http.post<EmployeeDocumentResponse>(`${this.url}/user/${userId}`, formData, {
      headers: this.authHeaders,
    }).pipe(map((response) => response.data ?? {}));
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/download`, {
      headers: this.authHeaders,
      responseType: 'blob',
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, {
      headers: this.authHeaders,
    });
  }
}
