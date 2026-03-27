namespace JMImoveisAPI.Entities
{
    public class SaleV2
    {
        public long? Id { get; set; }
        public decimal UnitValue { get; set; }                  // unit_value
        public decimal StartValue { get; set; }                 // start_value (ato)
        public decimal ValueToConstructor { get; set; }         // value_to_constructor
        public decimal PercentageToRealtor { get; set; }        // percentage_to_realtor
        public decimal PercentageToManager { get; set; }        // percentage_to_manager
        public int ParcelsStart { get; set; }                   // parcels_start
        public decimal RealtorComission { get; set; }           // realtor_comission
        public decimal RealtorComissionRemaining { get; set; }  // realtor_comission_remaining
        public string RealtorComissionStatus { get; set; }      // realtor_comission_status
        public decimal ManagerComission { get; set; }           // manager_comission
        public decimal ManagerComissionRemaining { get; set; }  // manager_comission_remaining
        public string ManagerComissionStatus { get; set; }      // manager_comission_status
        public bool? GenerateNotification { get; set; } = false;       // generate_notification
        public DateTime? NotificatedDate { get; set; }          // notificated_date
        public decimal? NetEarnings { get; set; }                // net_earnings
        public decimal? GrossEarnings { get; set; }              // gross_earnings
        public string? ContractPath { get; set; }                // contract_path
        public string Status { get; set; }                      // status
        public long BranchId { get; set; }                      // branch_id
        public long EnterpriseId { get; set; }                  // enterprise_id
        public long UnitId { get; set; }                        // unit_id
        public long RealtorId { get; set; }                     // realtor_id
        public long? ManagerId { get; set; }                    // manager_id
        public long? CoordenatorId { get; set; }                // coordenator_id
        public long? PaymentTypesId { get; set; }                // payment_types_id
        public DateTime SelledAt { get; set; }                  // selled_at
        public DateTime? DeletedAt { get; set; }                // deleted_at
        public DateTime? CreatedAt { get; set; }                 // created_at
        public DateTime? UpdatedAt { get; set; }                 // updated_at
        public decimal? ValueToRealstate { get; set; }           // value_to_realstate
        public decimal? PercentageToRealstate { get; set; }      // percentage_to_realstate
        public decimal? PercentageToFinancial { get; set; }      // percentage_to_financial
        public decimal? FinancialComission { get; set; }         // financial_comission
        public string? FinancialComissionStatus { get; set; }    // financial_comission_status
        public decimal? PercentageToTax { get; set; }            // percentage_to_tax
        public decimal? TaxComission { get; set; }               // tax_comission
        public string? TaxComissionStatus { get; set; }          // tax_comission_status
        public string? ContractNumber { get; set; }              // contract_number
        public decimal? PercentageToCoordenator { get; set; }    // percentage_to_coordenator
        public decimal? CoordenatorComission { get; set; }       // coordenator_comission
        public string? CoordenatorComissionStatus { get; set; }  // coordenator_comission_status

        public long? RealtorIdTwo { get; set; }                   // realtor_id_two
        public decimal? RealtorComissionTwo { get; set; }          // realtor_comission_two
        public decimal? RealtorComissionRemainingTwo { get; set; } // realtor_comission_remaining_two
        public string? RealtorComissionStatusTwo { get; set; }     // realtor_comission_status_two

        // ---- SEGUNDO GERENTE ----
        public decimal? ManagerComissionTwo { get; set; }          // manager_comission_two
        public decimal? ManagerComissionRemainingTwo { get; set; } // manager_comission_remaining_two
        public string? ManagerComissionStatusTwo { get; set; }     // manager_comission_status_two

        // ---- SEGUNDO COORDENADOR ----
        public long? CoordenatorIdTwo { get; set; }               // coordenator_id_two
        public decimal? PercentageToCoordenatorTwo { get; set; }   // percentage_to_coordenator_two
        public decimal? PercentageToRealtorTwo { get; set; }       // percentage_to_realtor_two
        public decimal? PercentageToManagerTwo { get; set; }       // percentage_to_manager_two
        public decimal? CoordenatorComissionTwo { get; set; }      // coordenator_comission_two
        public string? CoordenatorComissionStatusTwo { get; set; } // coordenator_comission_status_two

    }

}
