import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';

export type EmployeeDetails = {
  id?: number;
  userId?: number;
  rg?: string | null;
  rgIssueDate?: string | null;
  rgIssuer?: string | null;
  rgState?: string | null;
  birthDate?: string | null;
  birthCity?: string | null;
  birthState?: string | null;
  nationality?: string | null;
  maritalStatus?: string | null;
  spouseName?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  educationLevel?: string | null;
  educationStatus?: string | null;
  ctpsNumber?: string | null;
  ctpsSeries?: string | null;
  ctpsState?: string | null;
  ctpsIssueDate?: string | null;
  pisPasep?: string | null;
  voterTitle?: string | null;
  voterZone?: string | null;
  voterSection?: string | null;
  reservistNumber?: string | null;
  reservistCategory?: string | null;
  firstJob?: boolean | null;
  salary?: number | string | null;
  functionName?: string | null;
  monthlyWorkload?: number | string | null;
  weeklyWorkload?: number | string | null;
  dayOff?: string | null;
  experienceContractDays?: number | string | null;
  experienceExtensionDays?: number | string | null;
  transportVoucherDiscount?: number | string | null;
  workScheduleNotes?: string | null;
  hasDependents?: boolean | null;
  dependentNotes?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type EmployeeDetailsResponse = {
  message?: string;
  data?: EmployeeDetails;
};

@Injectable({ providedIn: 'root' })
export class EmployeeDetailsService {
  private readonly url = `${BACKEND_API_URL}api/employee-details`;

  constructor(private http: HttpClient) {}

  private get authHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }

  getByUserId(userId: number): Observable<EmployeeDetails> {
    return this.http.get<EmployeeDetails>(`${this.url}/user/${userId}`, {
      headers: this.authHeaders,
    });
  }

  create(details: EmployeeDetails): Observable<EmployeeDetails> {
    return this.http.post<EmployeeDetailsResponse>(this.url, details, {
      headers: this.authHeaders,
    }).pipe(map((response) => response.data ?? details));
  }

  upsertByUserId(userId: number, details: EmployeeDetails): Observable<EmployeeDetails> {
    return this.http.put<EmployeeDetailsResponse>(`${this.url}/user/${userId}`, details, {
      headers: this.authHeaders,
    }).pipe(map((response) => response.data ?? details));
  }
}
