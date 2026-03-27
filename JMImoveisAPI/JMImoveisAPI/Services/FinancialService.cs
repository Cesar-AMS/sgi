using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using JMImoveisAPI.Repositories;
using MySqlConnector;
using System.Data;

namespace JMImoveisAPI.Services
{
    public class FinancialService : IFinancialService
    {
        private readonly DapperContext _context;
        private ISaleCustomerRepository _saleCustomerRepository;

        public FinancialService(DapperContext context, ISaleCustomerRepository saleCustomerRepository)
        {
            _context = context;
            _saleCustomerRepository = saleCustomerRepository;
        }

        private static DateTime GetNextFifth(DateTime referenceDate)
        {
            var firstNextMonth = new DateTime(referenceDate.Year, referenceDate.Month, 1).AddMonths(1);
            return new DateTime(firstNextMonth.Year, firstNextMonth.Month, 5);
        }

        public async Task GenerateAccountsForSaleAsync(long saleId)
        {
            await using var conn = await _context.OpenConnectionAsync();
            using var tx = conn.BeginTransaction();

            // 1) Buscar venda
            var sale = await conn.QuerySingleOrDefaultAsync<SaleV2>(
                @"SELECT * FROM jmoficial.sales WHERE id = @Id",
                new { Id = saleId }, tx);

            if (sale == null)
                throw new Exception($"Venda {saleId} não encontrada.");

            // 2) Buscar parcelas da venda
            var parcels = (await conn.QueryAsync<ParcelV2>(
                @"SELECT id, `number`, value, `date`, observations, source_type, source_id, status, `type`
              FROM jmoficial.parcels
              WHERE source_id = @SaleId
                AND source_type = 'App\\Models\\Sale\\Sale'",
                new { SaleId = saleId }, tx)).ToList();

            var receivables = new List<AccountReceivableV2>();
            var payables = new List<AccountPayableV2>();

            var now = DateTime.UtcNow;

            // ---------- CONTAS A RECEBER ----------

            // Entrada (Ato) à vista, se existir e não estiver parcelado
            if (sale.StartValue > 0 && !parcels.Any(p => p.Type == "ACT"))
            {
                receivables.Add(new AccountReceivableV2
                {
                    SaleId = sale.Id.Value,
                    UserId = null, // imobiliária (pode ser branch_id se quiser)
                    CreateDate = now,
                    DueDate = sale.SelledAt.Date,
                    PayDate = null,
                    Description = $"Entrada (Ato) - Venda {sale.Id}",
                    Status = "WAITING",
                    Amount = sale.StartValue,
                    PendingAmount = sale.StartValue,
                    Category = "ATO",
                    ParcelNumber = null,
                    Observations = null
                });
            }

            // Parcelas da venda (inclusive ACT parcelado)
            foreach (var p in parcels)
            {
                bool isPaid = string.Equals(p.Status, "PAID", StringComparison.OrdinalIgnoreCase);

                receivables.Add(new AccountReceivableV2
                {
                    SaleId = sale.Id.Value,
                    UserId = null, // imobiliária
                    CreateDate = now,
                    DueDate = p.Date.Date,
                    PayDate = isPaid ? p.Date.Date : null,
                    Description = $"Parcela {p.Number} - Venda {sale.Id}",
                    Status = isPaid ? "PAID" : "WAITING",
                    Amount = p.Value,
                    PendingAmount = isPaid ? 0 : p.Value,
                    Category = p.Type == "ACT" ? "ATO" : "PARCELA",
                    ParcelNumber = p.Number,
                    Observations = p.Observations
                });
            }

            // ---------- CONTAS A PAGAR ----------

            DateTime dueDateCommissions = GetNextFifth(sale.SelledAt.Date);

            // 1) Repasse para Construtora
            if (sale.ValueToConstructor > 0)
            {
                payables.Add(new AccountPayableV2
                {
                    SaleId = sale.Id.Value,
                    UserId = sale.EnterpriseId, // ou construtora_id quando você tiver
                    CreateDate = now,
                    DueDate = dueDateCommissions,
                    PayDate = null,
                    Description = $"Repasse Construtora - Venda {sale.Id}",
                    Status = "WAITING", // assume que ainda não foi pago
                    Amount = sale.ValueToConstructor,
                    PendingAmount = sale.ValueToConstructor,
                    Category = "CONSTRUTORA",
                    Observations = null
                });
            }

            // 2) Comissão Corretor
            if (sale.RealtorComission > 0 && sale.RealtorId > 0)
            {
                bool isPaid = string.Equals(sale.RealtorComissionStatus, "PAID", StringComparison.OrdinalIgnoreCase);

                payables.Add(new AccountPayableV2
                {
                    SaleId = sale.Id.Value,
                    UserId = sale.RealtorId,
                    CreateDate = now,
                    DueDate = dueDateCommissions,
                    PayDate = isPaid ? dueDateCommissions : null,
                    Description = $"Comissão Corretor - Venda {sale.Id}",
                    Status = isPaid ? "PAID" : "WAITING",
                    Amount = sale.RealtorComission,
                    PendingAmount = isPaid ? 0 : sale.RealtorComission,
                    Category = "COMISSAO_CORRETOR",
                    Observations = null
                });
            }
            // 2b) Comissão Corretor 2
            if (sale.RealtorComissionTwo > 0 && sale.RealtorIdTwo.HasValue)
            {
                bool isPaidTwo = string.Equals(sale.RealtorComissionStatusTwo, "PAID", StringComparison.OrdinalIgnoreCase);

                payables.Add(new AccountPayableV2
                {
                    SaleId = sale.Id.Value,
                    UserId = sale.RealtorIdTwo.Value,
                    CreateDate = now,
                    DueDate = dueDateCommissions,
                    PayDate = isPaidTwo ? dueDateCommissions : null,
                    Description = $"Comissão Corretor 2 - Venda {sale.Id}",
                    Status = isPaidTwo ? "PAID" : "WAITING",
                    Amount = sale.RealtorComissionTwo.Value,
                    PendingAmount = isPaidTwo ? 0 : sale.RealtorComissionTwo.Value,
                    Category = "COMISSAO_CORRETOR",  // mesma categoria, muda só o UserId
                    Observations = null
                });
            }

            // 3) Comissão Gerente
            if (sale.ManagerComission > 0 && sale.ManagerId.HasValue)
            {
                bool isPaid = string.Equals(sale.ManagerComissionStatus, "PAID", StringComparison.OrdinalIgnoreCase);

                payables.Add(new AccountPayableV2
                {
                    SaleId = sale.Id.Value,
                    UserId = sale.ManagerId.Value,
                    CreateDate = now,
                    DueDate = dueDateCommissions,
                    PayDate = isPaid ? dueDateCommissions : null,
                    Description = $"Comissão Gerente - Venda {sale.Id}",
                    Status = isPaid ? "PAID" : "WAITING",
                    Amount = sale.ManagerComission,
                    PendingAmount = isPaid ? 0 : sale.ManagerComission,
                    Category = "COMISSAO_GERENTE",
                    Observations = null
                });
            }

            // 3b) Comissão Gerente 2
            if (sale.ManagerComissionTwo > 0 && sale.ManagerId.HasValue)
            {
                bool isPaidTwo = string.Equals(sale.ManagerComissionStatusTwo, "PAID", StringComparison.OrdinalIgnoreCase);

                payables.Add(new AccountPayableV2
                {
                    SaleId = sale.Id.Value,
                    UserId = sale.ManagerId.Value,    // aqui você pode ter um ManagerIdTwo separado no futuro se quiser
                    CreateDate = now,
                    DueDate = dueDateCommissions,
                    PayDate = isPaidTwo ? dueDateCommissions : null,
                    Description = $"Comissão Gerente 2 - Venda {sale.Id}",
                    Status = isPaidTwo ? "PAID" : "WAITING",
                    Amount = sale.ManagerComissionTwo.Value,
                    PendingAmount = isPaidTwo ? 0 : sale.ManagerComissionTwo.Value,
                    Category = "COMISSAO_GERENTE",
                    Observations = null
                });
            }


            // 4) Comissão Coordenador
            if (sale.CoordenatorComission > 0 && sale.CoordenatorId.HasValue)
            {
                bool isPaid = string.Equals(sale.CoordenatorComissionStatus, "PAID", StringComparison.OrdinalIgnoreCase);

                payables.Add(new AccountPayableV2
                {
                    SaleId = sale.Id.Value,
                    UserId = sale.CoordenatorId.Value,
                    CreateDate = now,
                    DueDate = dueDateCommissions,
                    PayDate = isPaid ? dueDateCommissions : null,
                    Description = $"Comissão Coordenador - Venda {sale.Id}",
                    Status = isPaid ? "PAID" : "WAITING",
                    Amount = sale.CoordenatorComission.Value,
                    PendingAmount = isPaid ? 0 : sale.CoordenatorComission.Value,
                    Category = "COMISSAO_COORDENADOR",
                    Observations = null
                });
            }

            // 4b) Comissão Coordenador 2
            if (sale.CoordenatorComissionTwo > 0 && sale.CoordenatorIdTwo.HasValue)
            {
                bool isPaidTwo = string.Equals(sale.CoordenatorComissionStatusTwo, "PAID", StringComparison.OrdinalIgnoreCase);

                payables.Add(new AccountPayableV2
                {
                    SaleId = sale.Id.Value,
                    UserId = sale.CoordenatorIdTwo.Value,
                    CreateDate = now,
                    DueDate = dueDateCommissions,
                    PayDate = isPaidTwo ? dueDateCommissions : null,
                    Description = $"Comissão Coordenador 2 - Venda {sale.Id}",
                    Status = isPaidTwo ? "PAID" : "WAITING",
                    Amount = sale.CoordenatorComissionTwo.Value,
                    PendingAmount = isPaidTwo ? 0 : sale.CoordenatorComissionTwo.Value,
                    Category = "COMISSAO_COORDENADOR",
                    Observations = null
                });
            }


            // 5) Comissão Financeiro
            if (sale.FinancialComission > 0)
            {
                bool isPaid = string.Equals(sale.FinancialComissionStatus, "PAID", StringComparison.OrdinalIgnoreCase);

                payables.Add(new AccountPayableV2
                {
                    SaleId = sale.Id.Value,
                    UserId = sale.BranchId,  // aqui você pode trocar para um financial_id quando existir
                    CreateDate = now,
                    DueDate = dueDateCommissions,
                    PayDate = isPaid ? dueDateCommissions : null,
                    Description = $"Comissão Financeiro - Venda {sale.Id}",
                    Status = isPaid ? "PAID" : "WAITING",
                    Amount = sale.FinancialComission.Value,
                    PendingAmount = isPaid ? 0 : sale.FinancialComission.Value,
                    Category = "COMISSAO_FINANCEIRO",
                    Observations = null
                });
            }

            const string insertReceivableSql = @"
            INSERT INTO jmoficial.accounts_receivable
                (SaleId, UserId, CreateDate, DueDate, PayDate, Description, Status,
                 Amount, PendingAmount, Category, ParcelNumber, Observations)
            VALUES
                (@SaleId, @UserId, @CreateDate, @DueDate, @PayDate, @Description, @Status,
                 @Amount, @PendingAmount, @Category, @ParcelNumber, @Observations);";

            const string insertPayableSql = @"
            INSERT INTO jmoficial.accounts_payable
                (SaleId, UserId, CreateDate, DueDate, PayDate, Description, Status,
                 Amount, PendingAmount, Category, Observations)
            VALUES
                (@SaleId, @UserId, @CreateDate, @DueDate, @PayDate, @Description, @Status,
                 @Amount, @PendingAmount, @Category, @Observations);";

            if (receivables.Any())
                await conn.ExecuteAsync(insertReceivableSql, receivables, tx);

            if (payables.Any())
                await conn.ExecuteAsync(insertPayableSql, payables, tx);

            await tx.CommitAsync();
        }


        public async Task<long> CreateSaleWithFinancialAsync(SaleV2 sale, IEnumerable<ParcelV2> parcels, List<int> customerIds)
        {
            await using var conn = await _context.OpenConnectionAsync();
            using var tx = conn.BeginTransaction();

            // Inserir venda (exemplo simplificado, ajuste colunas!)
            var saleId = await conn.ExecuteScalarAsync<long>(@"
            INSERT INTO jmoficial.sales
                (unit_value, start_value, value_to_constructor, percentage_to_realtor,
                 percentage_to_manager, parcels_start, realtor_comission,
                 realtor_comission_remaining, realtor_comission_status,
                 manager_comission, manager_comission_remaining, manager_comission_status,
                 generate_notification, notificated_date, net_earnings, gross_earnings,
                 contract_path, status, branch_id, enterprise_id, unit_id,
                 realtor_id, manager_id, payment_types_id, selled_at,
                 deleted_at, created_at, updated_at, value_to_realstate,
                 percentage_to_realstate, percentage_to_financial, financial_comission,
                 financial_comission_status, percentage_to_tax, tax_comission,
                 tax_comission_status, contract_number, coordenator_id,
                 percentage_to_coordenator, coordenator_comission,
                 coordenator_comission_status)
            VALUES
                (@UnitValue, @StartValue, @ValueToConstructor, @PercentageToRealtor,
                 @PercentageToManager, @ParcelsStart, @RealtorComission,
                 @RealtorComissionRemaining, @RealtorComissionStatus,
                 @ManagerComission, @ManagerComissionRemaining, @ManagerComissionStatus,
                 @GenerateNotification, @NotificatedDate, @NetEarnings, @GrossEarnings,
                 @ContractPath, @Status, @BranchId, @EnterpriseId, @UnitId,
                 @RealtorId, @ManagerId, @PaymentTypesId, @SelledAt,
                 @DeletedAt, @CreatedAt, @UpdatedAt, @ValueToRealstate,
                 @PercentageToRealstate, @PercentageToFinancial, @FinancialComission,
                 @FinancialComissionStatus, @PercentageToTax, @TaxComission,
                 @TaxComissionStatus, @ContractNumber, @CoordenatorId,
                 @PercentageToCoordenator, @CoordenatorComission,
                 @CoordenatorComissionStatus);
            SELECT LAST_INSERT_ID();", sale, tx);

            // Inserir parcelas
            const string insertParcelSql = @"
            INSERT INTO jmoficial.parcels
                (`number`, value, `date`, observations, source_type, source_id, status, `type`)
            VALUES
                (@Number, @Value, @Date, @Observations, @SourceType, @SourceId, @Status, @Type);";

            foreach (var p in parcels)
            {
                p.SourceId = saleId;
                p.SourceType = "App\\Models\\Sale\\Sale"; // mesmo padrão da sua base
                await conn.ExecuteAsync(insertParcelSql, p, tx);
            }

            await _saleCustomerRepository.InsertAsync((int)saleId, customerIds, tx);

            await tx.CommitAsync();

            // Gera contas a pagar/receber (rodando fora da tx pra simplificar)
            await GenerateAccountsForSaleAsync(saleId);

            return saleId;
        }

        public async Task<IEnumerable<FinancialHistoryItemV2>> GetFinancialHistoryAsync(DateTime? from = null, DateTime? to = null)
        {
            await using var conn = await _context.OpenConnectionAsync();

            var sql = @"SELECT 'RECEIVE' AS Kind,
                                r.Id,
                                r.SaleId,
                                r.UserId,
                                r.DueDate,
                                r.PayDate,
                                r.Status,
                                r.Amount,
                                r.PendingAmount,
                                r.Category,
                                r.Description
                            FROM jmoficial.accounts_receivable r
                            WHERE (@From IS NULL OR r.DueDate >= @From)
                              AND (@To IS NULL OR r.DueDate <= @To)

                        UNION ALL

                        SELECT 
                            'PAY' AS Kind,
                            p.Id,
                            p.SaleId,
                            p.UserId,
                            p.DueDate,
                            p.PayDate,
                            p.Status,
                            p.Amount,
                            p.PendingAmount,
                            p.Category,
                            p.Description
                        FROM jmoficial.accounts_payable p
                        WHERE (@From IS NULL OR p.DueDate >= @From)
                            AND (@To IS NULL OR p.DueDate <= @To)

                        ORDER BY DueDate, Kind, Id;";

            return await conn.QueryAsync<FinancialHistoryItemV2>(sql, new { From = from, To = to });
        }
    }
}
