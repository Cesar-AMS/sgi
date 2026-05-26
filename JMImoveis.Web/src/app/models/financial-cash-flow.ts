export type CashFlowGroupBy = 'day' | 'month';

export interface CashFlowSummary {
  expectedInflow: number;
  expectedOutflow: number;
  expectedBalance: number;
  realizedInflow: number;
  realizedOutflow: number;
  realizedBalance: number;
  openInflow: number;
  openOutflow: number;
  projectionInflow: number;
  projectionOutflow: number;
  receivableCount: number;
  payableCount: number;
}

export interface CashFlowPeriod {
  period: string;
  periodStart: string;
  periodEnd: string;
  expectedInflow: number;
  expectedOutflow: number;
  expectedBalance: number;
  realizedInflow: number;
  realizedOutflow: number;
  realizedBalance: number;
  openInflow: number;
  openOutflow: number;
  projectionInflow: number;
  projectionOutflow: number;
}

export interface CashFlowResponse {
  from: string;
  to: string;
  groupBy: CashFlowGroupBy;
  summary: CashFlowSummary;
  periods: CashFlowPeriod[];
}
