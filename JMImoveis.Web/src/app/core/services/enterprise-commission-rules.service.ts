import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from './backend-api-url';
import { SessionService } from '../session/session.service';

export interface EnterpriseCommissionRuleItem {
  id?: number;
  ruleId?: number;
  role: string;
  percentage?: number | null;
  fixedAmount?: number | null;
  paymentMode: string;
  paymentDay?: number | null;
  active: boolean;
}

export interface EnterpriseCommissionRule {
  id?: number;
  enterpriseId: number;
  ruleType: string;
  version?: number;
  active: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  atoThreshold?: number | null;
  paymentDay: number;
  directorEnabled: boolean;
  campaignName?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  items: EnterpriseCommissionRuleItem[];
}

@Injectable({ providedIn: 'root' })
export class EnterpriseCommissionRulesService {
  private readonly url = `${BACKEND_API_URL}api/enterprise-commission-rules`;

  constructor(
    private http: HttpClient,
    private sessionService: SessionService
  ) {}

  private get authHeaders(): Record<string, string> {
    const token = this.sessionService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  listByEnterprise(enterpriseId: number): Observable<EnterpriseCommissionRule[]> {
    return this.http.get<EnterpriseCommissionRule[]>(
      `${this.url}/enterprise/${enterpriseId}`,
      { headers: this.authHeaders }
    );
  }

  create(rule: EnterpriseCommissionRule): Observable<EnterpriseCommissionRule> {
    return this.http.post<EnterpriseCommissionRule>(this.url, rule, { headers: this.authHeaders });
  }

  update(id: number, rule: EnterpriseCommissionRule): Observable<EnterpriseCommissionRule> {
    return this.http.put<EnterpriseCommissionRule>(`${this.url}/${id}`, rule, { headers: this.authHeaders });
  }

  deactivate(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.url}/${id}/deactivate`, {}, { headers: this.authHeaders });
  }
}
