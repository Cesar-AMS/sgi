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
                @"SELECT
                    id AS Id,
                    unit_value AS UnitValue,
                    start_value AS StartValue,
                    value_to_constructor AS ValueToConstructor,
                    percentage_to_realtor AS PercentageToRealtor,
                    percentage_to_manager AS PercentageToManager,
                    parcels_start AS ParcelsStart,
                    realtor_comission AS RealtorComission,
                    realtor_comission_remaining AS RealtorComissionRemaining,
                    realtor_comission_status AS RealtorComissionStatus,
                    manager_comission AS ManagerComission,
                    manager_comission_remaining AS ManagerComissionRemaining,
                    manager_comission_status AS ManagerComissionStatus,
                    generate_notification AS GenerateNotification,
                    notificated_date AS NotificatedDate,
                    net_earnings AS NetEarnings,
                    gross_earnings AS GrossEarnings,
                    contract_path AS ContractPath,
                    status AS Status,
                    branch_id AS BranchId,
                    enterprise_id AS EnterpriseId,
                    unit_id AS UnitId,
                    realtor_id AS RealtorId,
                    manager_id AS ManagerId,
                    coordenator_id AS CoordenatorId,
                    payment_types_id AS PaymentTypesId,
                    COALESCE(selled_at, created_at, NOW()) AS SelledAt,
                    deleted_at AS DeletedAt,
                    created_at AS CreatedAt,
                    updated_at AS UpdatedAt,
                    value_to_realstate AS ValueToRealstate,
                    percentage_to_realstate AS PercentageToRealstate,
                    percentage_to_financial AS PercentageToFinancial,
                    financial_comission AS FinancialComission,
                    financial_comission_status AS FinancialComissionStatus,
                    percentage_to_tax AS PercentageToTax,
                    tax_comission AS TaxComission,
                    tax_comission_status AS TaxComissionStatus,
                    contract_number AS ContractNumber,
                    percentage_to_coordenator AS PercentageToCoordenator,
                    coordenator_comission AS CoordenatorComission,
                    coordenator_comission_status AS CoordenatorComissionStatus,
                    realtor_id_two AS RealtorIdTwo,
                    realtor_comission_two AS RealtorComissionTwo,
                    realtor_comission_remaining_two AS RealtorComissionRemainingTwo,
                    realtor_comission_status_two AS RealtorComissionStatusTwo,
                    manager_comission_two AS ManagerComissionTwo,
                    manager_comission_remaining_two AS ManagerComissionRemainingTwo,
                    manager_comission_status_two AS ManagerComissionStatusTwo,
                    coordenator_id_two AS CoordenatorIdTwo,
                    percentage_to_coordenator_two AS PercentageToCoordenatorTwo,
                    percentage_to_realtor_two AS PercentageToRealtorTwo,
                    percentage_to_manager_two AS PercentageToManagerTwo,
                    coordenator_comission_two AS CoordenatorComissionTwo,
                    coordenator_comission_status_two AS CoordenatorComissionStatusTwo
                  FROM jmoficial.sales
                  WHERE id = @Id",
                new { Id = saleId }, tx);

            if (sale == null)
                throw new Exception($"Venda {saleId} não encontrada.");

            if (!sale.Id.HasValue)
                throw new Exception($"Venda {saleId} sem identificador válido.");

            var saleIdValue = sale.Id.Value;

            var existingReceivables = await conn.ExecuteScalarAsync<int>(
                @"SELECT COUNT(1)
                  FROM jmoficial.accounts_receivable
                  WHERE SaleId = @SaleId
                    AND Status <> 'CANCELLED'",
                new { SaleId = saleIdValue }, tx);

            var existingCommissions = await conn.ExecuteScalarAsync<int>(
                @"SELECT COUNT(1)
                  FROM jmoficial.accounts_payable
                  WHERE SaleId = @SaleId
                    AND Category LIKE 'COMISSAO_%'
                    AND Status <> 'CANCELLED'",
                new { SaleId = saleIdValue }, tx);

            if (existingReceivables > 0 && existingCommissions > 0)
            {
                tx.Commit();
                return;
            }

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
                    SaleId = saleIdValue,
                    UserId = null, // imobiliária (pode ser branch_id se quiser)
                    CreateDate = now,
                    DueDate = sale.SelledAt.Date,
                    PayDate = null,
                    Description = $"Entrada (Ato) - Venda {saleIdValue}",
                    Status = "WAITING",
                    Amount = sale.StartValue,
                    PendingAmount = sale.StartValue,
                    Category = "ATO",
                    ParcelNumber = null,
                    Observations = string.Empty
                });
            }

            // Parcelas da venda (inclusive ACT parcelado)
            foreach (var p in parcels)
            {
                bool isPaid = string.Equals(p.Status, "PAID", StringComparison.OrdinalIgnoreCase);

                receivables.Add(new AccountReceivableV2
                {
                    SaleId = saleIdValue,
                    UserId = null, // imobiliária
                    CreateDate = now,
                    DueDate = p.Date.Date,
                    PayDate = isPaid ? p.Date.Date : null,
                    Description = $"Parcela {p.Number} - Venda {saleIdValue}",
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
                    SaleId = saleIdValue,
                    UserId = sale.EnterpriseId, // ou construtora_id quando você tiver
                    CreateDate = now,
                    DueDate = dueDateCommissions,
                    PayDate = null,
                    Description = $"Repasse Construtora - Venda {saleIdValue}",
                    Status = "WAITING", // assume que ainda não foi pago
                    Amount = sale.ValueToConstructor,
                    PendingAmount = sale.ValueToConstructor,
                    Category = "CONSTRUTORA",
                    Observations = string.Empty
                });
            }

            // 2) Comissão Corretor
            if (sale.RealtorComission > 0 && sale.RealtorId > 0)
            {
                bool isPaid = string.Equals(sale.RealtorComissionStatus, "PAID", StringComparison.OrdinalIgnoreCase);

                payables.Add(new AccountPayableV2
                {
                    SaleId = saleIdValue,
                    UserId = sale.RealtorId,
                    CreateDate = now,
                    DueDate = dueDateCommissions,
                    PayDate = isPaid ? dueDateCommissions : null,
                    Description = $"Comissão Corretor - Venda {saleIdValue}",
                    Status = isPaid ? "PAID" : "WAITING",
                    Amount = sale.RealtorComission,
                    PendingAmount = isPaid ? 0 : sale.RealtorComission,
                    Category = "COMISSAO_CORRETOR",
                    Observations = string.Empty
                });
            }
            // 2b) Comissão Corretor 2
            if (sale.RealtorComissionTwo > 0 && sale.RealtorIdTwo.HasValue)
            {
                bool isPaidTwo = string.Equals(sale.RealtorComissionStatusTwo, "PAID", StringComparison.OrdinalIgnoreCase);

                payables.Add(new AccountPayableV2
                {
                    SaleId = saleIdValue,
                    UserId = sale.RealtorIdTwo.Value,
                    CreateDate = now,
                    DueDate = dueDateCommissions,
                    PayDate = isPaidTwo ? dueDateCommissions : null,
                    Description = $"Comissão Corretor 2 - Venda {saleIdValue}",
                    Status = isPaidTwo ? "PAID" : "WAITING",
                    Amount = sale.RealtorComissionTwo.Value,
                    PendingAmount = isPaidTwo ? 0 : sale.RealtorComissionTwo.Value,
                    Category = "COMISSAO_CORRETOR",  // mesma categoria, muda só o UserId
                    Observations = string.Empty
                });
            }

            // 3) Comissão Gerente
            if (sale.ManagerComission > 0 && sale.ManagerId.HasValue)
            {
                bool isPaid = string.Equals(sale.ManagerComissionStatus, "PAID", StringComparison.OrdinalIgnoreCase);

                payables.Add(new AccountPayableV2
                {
                    SaleId = saleIdValue,
                    UserId = sale.ManagerId.Value,
                    CreateDate = now,
                    DueDate = dueDateCommissions,
                    PayDate = isPaid ? dueDateCommissions : null,
                    Description = $"Comissão Gerente - Venda {saleIdValue}",
                    Status = isPaid ? "PAID" : "WAITING",
                    Amount = sale.ManagerComission,
                    PendingAmount = isPaid ? 0 : sale.ManagerComission,
                    Category = "COMISSAO_GERENTE",
                    Observations = string.Empty
                });
            }

            // 3b) Comissão Gerente 2
            if (sale.ManagerComissionTwo > 0 && sale.ManagerId.HasValue)
            {
                bool isPaidTwo = string.Equals(sale.ManagerComissionStatusTwo, "PAID", StringComparison.OrdinalIgnoreCase);

                payables.Add(new AccountPayableV2
                {
                    SaleId = saleIdValue,
                    UserId = sale.ManagerId.Value,    // aqui você pode ter um ManagerIdTwo separado no futuro se quiser
                    CreateDate = now,
                    DueDate = dueDateCommissions,
                    PayDate = isPaidTwo ? dueDateCommissions : null,
                    Description = $"Comissão Gerente 2 - Venda {saleIdValue}",
                    Status = isPaidTwo ? "PAID" : "WAITING",
                    Amount = sale.ManagerComissionTwo.Value,
                    PendingAmount = isPaidTwo ? 0 : sale.ManagerComissionTwo.Value,
                    Category = "COMISSAO_GERENTE",
                    Observations = string.Empty
                });
            }


            // 4) Comissão Coordenador
            if (sale.CoordenatorComission > 0 && sale.CoordenatorId.HasValue)
            {
                bool isPaid = string.Equals(sale.CoordenatorComissionStatus, "PAID", StringComparison.OrdinalIgnoreCase);

                payables.Add(new AccountPayableV2
                {
                    SaleId = saleIdValue,
                    UserId = sale.CoordenatorId.Value,
                    CreateDate = now,
                    DueDate = dueDateCommissions,
                    PayDate = isPaid ? dueDateCommissions : null,
                    Description = $"Comissão Coordenador - Venda {saleIdValue}",
                    Status = isPaid ? "PAID" : "WAITING",
                    Amount = sale.CoordenatorComission.Value,
                    PendingAmount = isPaid ? 0 : sale.CoordenatorComission.Value,
                    Category = "COMISSAO_COORDENADOR",
                    Observations = string.Empty
                });
            }

            // 4b) Comissão Coordenador 2
            if (sale.CoordenatorComissionTwo > 0 && sale.CoordenatorIdTwo.HasValue)
            {
                bool isPaidTwo = string.Equals(sale.CoordenatorComissionStatusTwo, "PAID", StringComparison.OrdinalIgnoreCase);

                payables.Add(new AccountPayableV2
                {
                    SaleId = saleIdValue,
                    UserId = sale.CoordenatorIdTwo.Value,
                    CreateDate = now,
                    DueDate = dueDateCommissions,
                    PayDate = isPaidTwo ? dueDateCommissions : null,
                    Description = $"Comissão Coordenador 2 - Venda {saleIdValue}",
                    Status = isPaidTwo ? "PAID" : "WAITING",
                    Amount = sale.CoordenatorComissionTwo.Value,
                    PendingAmount = isPaidTwo ? 0 : sale.CoordenatorComissionTwo.Value,
                    Category = "COMISSAO_COORDENADOR",
                    Observations = string.Empty
                });
            }


            // 5) Comissão Financeiro
            if (sale.FinancialComission > 0)
            {
                bool isPaid = string.Equals(sale.FinancialComissionStatus, "PAID", StringComparison.OrdinalIgnoreCase);

                payables.Add(new AccountPayableV2
                {
                    SaleId = saleIdValue,
                    UserId = sale.BranchId,  // aqui você pode trocar para um financial_id quando existir
                    CreateDate = now,
                    DueDate = dueDateCommissions,
                    PayDate = isPaid ? dueDateCommissions : null,
                    Description = $"Comissão Financeiro - Venda {saleIdValue}",
                    Status = isPaid ? "PAID" : "WAITING",
                    Amount = sale.FinancialComission.Value,
                    PendingAmount = isPaid ? 0 : sale.FinancialComission.Value,
                    Category = "COMISSAO_FINANCEIRO",
                    Observations = string.Empty
                });
            }

            if (existingReceivables > 0)
            {
                receivables.Clear();
            }

            if (existingCommissions > 0)
            {
                payables.Clear();
            }

            foreach (var receivable in receivables)
            {
                receivable.Status = "PROJECAO";
                receivable.PayDate = null;
                receivable.PendingAmount = receivable.Amount;
            }

            foreach (var payable in payables)
            {
                payable.Status = "PROJECAO";
                payable.PayDate = null;
                payable.PendingAmount = payable.Amount;
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
