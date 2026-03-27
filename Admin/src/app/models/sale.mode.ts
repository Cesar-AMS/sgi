// src/app/sales/models/sale.model.ts
export interface Sale {
  id?: number;

  unitValue: number;                       // valor apartamento
  startValue: number;                      // valor do ato
  valueToConstructor: number;             // valor construtora

  percentageToRealtor: number;            // %
  percentageToManager: number;            // %
  parcelsStart: number;                    // ??

  realtorComission: number;
  realtorComissionRemaining: number;
  realtorComissionStatus: string;

  managerComission: number;
  managerComissionRemaining: number;
  managerComissionStatus: string;

  generateNotification: boolean;           // 1/0
  notificatedDate?: string | null;         // ISO date

  netEarnings: number;                     // receita líquida
  grossEarnings: number;                   // receita bruta

  contractPath?: string | null;
  status: string;

  branchId: number;                        // filial
  enterpriseId: number;                    // empresa
  unitId: number;                          // unidade

  realtorId: number;                       // corretor 1
  managerId?: number | null;               // gerente 1
  paymentTypesId: number;

  selledAt: string;                        // data da venda
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;

  valueToRealstate: number;               // valor imobiliária
  percentageToRealstate: number;          // %
  percentageToFinancial: number;          // %
  financialComission: number;
  financialComissionStatus: string;

  percentageToTax: number;                // %
  taxComission: number;
  taxComissionStatus: string;

  contractNumber?: string | null;

  coordenatorId?: number | null;
  percentageToCoordenator: number;
  coordenatorComission: number;
  coordenatorComissionStatus: string;

  // ---- Segundo corretor / gerente / coordenador ----
  realtorIdTwo?: number | null;
  realtorComissionTwo: number;
  realtorComissionRemainingTwo: number;
  realtorComissionStatusTwo: string;

  managerComissionTwo: number;
  managerComissionRemainingTwo: number;
  managerComissionSstatusTwo: string;

  coordenatorIdTwo?: number | null;
  percentageToCoordenatorTwo: number;
  percentageToRealtorTwo: number;
  percentageToManagerTwo: number;
  coordenatorComissionTwo: number;
  coordenatorComissionStatusTwo: string;
}
