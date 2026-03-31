using Dapper;
using JMImoveisAPI.Configurations;
using JMImoveisAPI.Entities;
using JMImoveisAPI.Interfaces;
using MySqlConnector;
using System.Globalization;

namespace JMImoveisAPI.Services
{
    public class FinanceIntegrationService : IFinanceIntegrationService
    {
        private static DateTime? ParseDateFlexible(string? dt)
        {
            if (string.IsNullOrWhiteSpace(dt)) return null;

            // tenta ISO (YYYY-MM-DD), pt-BR (DD/MM/YYYY) e DateTime
            if (DateTime.TryParseExact(dt, new[] { "yyyy-MM-dd", "dd/MM/yyyy", "yyyy-MM-ddTHH:mm:ss", "dd/MM/yyyy HH:mm:ss" },
                CultureInfo.GetCultureInfo("pt-BR"), DateTimeStyles.AssumeLocal, out var parsed))
                return parsed;

            if (DateTime.TryParse(dt, CultureInfo.GetCultureInfo("pt-BR"), DateTimeStyles.AssumeLocal, out parsed))
                return parsed;

            return null;
        }

        private readonly DapperContext _context;

        public FinanceIntegrationService(DapperContext context)
        {
            _context = context;
        }

        public static DateTime CalcularVencimentoMesSeguinte(DateTime dataBase)
        {
            var proximoMes = dataBase.AddMonths(1);
            return new DateTime(proximoMes.Year, proximoMes.Month, 5, 0, 0, 0, DateTimeKind.Local);
        }

        public async Task RegisterSaleFinancialsAsync(VendasV2 sale, FinanceMappingOptions opt)
        {
            await using var conn = await _context.OpenConnectionAsync();
            using var tran = await conn.BeginTransactionAsync();

            try
            {
                var now = DateTime.Now;

                // ===================== RECEIVABLES =====================

                // 3.1 Acts (ATOS) -> sempre cost_center_id = 1
                var receivables = new List<Receivable>();

                if (sale.Acts != null)
                {
                    int n = 1;
                    foreach (var act in sale.Acts)
                    {
                        if (act == null || act.Value is null) continue;

                        receivables.Add(new Receivable
                        {
                            SeriesId = opt.SeriesIdReceivables,
                            InstallmentNo = act.Parcel ?? n,
                            Amount = act.Value,
                            Description = $"Ato {(act.Parcel ?? n)} - {sale.ContractNumber ?? $"Venda {sale.Id}"}",
                            CompetenceDate = act.Date ?? sale.SelledAt ?? now,
                            DueDate = act.Date ?? sale.SelledAt ?? now,
                            Received = false,
                            ReceivedDate = act.Status == "PAID" ? act.Date : null,
                            CategoryId = opt.CategoryActs,
                            AccountId = 1,
                            ClientId = opt.ClientId ?? sale.CustomerId,
                            CostCenterId = 4, // ADM
                            Reference = $"SALE:{sale.Id}",
                            Notes = act.Observations,
                            CreatedAt = now,
                            UpdatedAt = now,
                            Recurrencing = false,
                            Periodic = null,
                            Parcelas = act.Parcel,
                            Status = act.Status ?? "WAITING",
                            TypeParcel = "ACT"
                        });
                        n++;
                    }
                }

                // 3.2 Parcelas do Cliente (venda) -> Receivables
                void AddInstallmentsAsReceivables(List<Installaments?>? list, string label)
                {
                    if (list == null) return;
                    int n = 1;
                    foreach (var ins in list)
                    {
                        if (ins == null || ins.VlrInstallament is null) { n++; continue; }

                        var due = ParseDateFlexible(ins.DueDate) ?? sale.ParcelsStart ?? now;

                        receivables.Add(new Receivable
                        {
                            SeriesId = opt.SeriesIdReceivables,
                            InstallmentNo = ins.Id ?? n,
                            Amount = ins.VlrInstallament,
                            Description = $"{label} {(ins.Id ?? n)} - {sale.ContractNumber ?? $"Venda {sale.Id}"}",
                            CompetenceDate = sale.SelledAt ?? now,
                            DueDate = due,
                            Received = (ins.Status?.Equals("PAID", StringComparison.OrdinalIgnoreCase) ?? false),
                            ReceivedDate = ParseDateFlexible(ins.DtPayment),
                            CategoryId = opt.CategoryInstallments,
                            AccountId = 2,
                            ClientId = opt.ClientId ?? sale.CustomerId,
                            CostCenterId = 4, // se quiser atrelar a outro CC, ajuste aqui
                            Reference = $"SALE:{sale.Id}",
                            Notes = ins.Obs,
                            CreatedAt = now,
                            UpdatedAt = now,
                            Recurrencing = false,
                            Periodic = null,
                            Parcelas = ins.Id,
                            Status = ins.Status ?? "WAITING",
                            TypeParcel = label == "Intermediária" ? "INT" : "PAR"
                        });
                        n++;
                    }
                }

                AddInstallmentsAsReceivables(sale.Parcelas, "Parcela");
                AddInstallmentsAsReceivables(sale.Intermediarias, "Intermediária");

                // 3.3 Comissão da Imobiliária (ValueToRealstate) – caso venha valor único e você queira um único título
                if ((sale.ValueToRealstate ?? 0m) > 0m && (sale.Parcelas == null || sale.Parcelas.Count == 0))
                {
                    receivables.Add(new Receivable
                    {
                        SeriesId = opt.SeriesIdReceivables,
                        InstallmentNo = 1,
                        Amount = sale.ValueToRealstate,
                        Description = $"Comissão Imobiliária - {sale.ContractNumber ?? $"Venda {sale.Id}"}",
                        CompetenceDate = sale.SelledAt ?? now,
                        DueDate = sale.ParcelsStart ?? sale.SelledAt ?? now,
                        Received = false,
                        ReceivedDate = null,
                        CategoryId = opt.CategoryInstallments, // ou outra categoria específica p/ comissão da imobiliária
                        AccountId = opt.AccountReceivables,
                        ClientId = opt.ClientId ?? sale.CustomerId,
                        CostCenterId = 4,
                        Reference = $"SALE:{sale.Id}",
                        Notes = null,
                        CreatedAt = now,
                        UpdatedAt = now,
                        Recurrencing = false,
                        Periodic = null,
                        Parcelas = 1,
                        Status = "WAITING"
                    });
                }

                // ===================== PAYABLES =====================

                var payables = new List<Payable>();
                
                Payable SinglePayable(decimal? amount, string desc, int categoryId, DateTime? due, string? status) => new Payable
                {
                    SeriesId = opt.SeriesIdPayables,
                    InstallmentNo = 1,
                    Amount = amount,
                    Description = desc,
                    CompetenceDate = sale.SelledAt ?? now,
                    DueDate = CalcularVencimentoMesSeguinte(now),
                    Paid = (status?.Equals("PAID", StringComparison.OrdinalIgnoreCase) ?? false),
                    PaidDate = null,
                    CategoryId = categoryId,
                    AccountId = opt.AccountPayables,
                    ClientId = null,
                    CostCenterId = 4,
                    Reference = $"SALE:{sale.Id}",
                    Notes = null,
                    CreatedAt = now,
                    UpdatedAt = now,
                    Recurrencing = false,
                    Periodic = null,
                    Parcelas = 1,
                    Status = status ?? "WAITING"
                };

                // 3.4 Comissão CORRETOR (parcelada)
                if (sale.PlainCorretor != null && sale.PlainCorretor.Count > 0)
                {
                    int n = 1;
                    foreach (var ins in sale.PlainCorretor)
                    {
                        if (ins == null || ins.VlrInstallament is null) { n++; continue; }
                        var due = ParseDateFlexible(ins.DueDate) ?? sale.ParcelsStart ?? now;

                        payables.Add(new Payable
                        {
                            SeriesId = opt.SeriesIdPayables,
                            InstallmentNo = ins.Id ?? n,
                            Amount = ins.VlrInstallament,
                            Description = $"Comissão Corretor {(ins.Id ?? n)} - {sale.Corretor ?? "Corretor"}",
                            CompetenceDate = sale.SelledAt ?? now,
                            DueDate = due,
                            Paid = (ins.Status?.Equals("PAID", StringComparison.OrdinalIgnoreCase) ?? false),
                            PaidDate = ParseDateFlexible(ins.DtPayment),
                            CategoryId = opt.CategoryRealtor,
                            AccountId = opt.AccountPayables,
                            ClientId = null,
                            CostCenterId = 4,
                            Reference = $"SALE:{sale.Id}",
                            Notes = ins.Obs,
                            CreatedAt = now,
                            UpdatedAt = now,
                            Recurrencing = false,
                            Periodic = null,
                            Parcelas = ins.Id,
                            Status = ins.Status ?? "WAITING"
                        });
                        n++;
                    }
                }
                else if ((sale.RealtorComission) > 0m)
                {
                    // NÃO PARCELADA – 1 título
                    payables.Add(SinglePayable(
                        sale.RealtorComission,
                        $"Comissão Corretor - {sale.Corretor ?? "Corretor"}",
                        opt.CategoryRealtor,
                        sale.ParcelsStart ?? sale.SelledAt,
                        sale.RealtorComissionStatus
                    ));
                }

                // 3.5 Comissão GERENTE (parcelada)
                if (sale.PlainManager != null && sale.PlainManager.Count > 0)
                {
                    int n = 1;
                    foreach (var ins in sale.PlainManager)
                    {
                        if (ins == null || ins.VlrInstallament is null) { n++; continue; }
                        var due = ParseDateFlexible(ins.DueDate) ?? sale.ParcelsStart ?? now;

                        payables.Add(new Payable
                        {
                            SeriesId = opt.SeriesIdPayables,
                            InstallmentNo = ins.Id ?? n,
                            Amount = ins.VlrInstallament,
                            Description = $"Comissão Gerente {(ins.Id ?? n)} - {sale.Gerente ?? "Gerente"}",
                            CompetenceDate = sale.SelledAt ?? now,
                            DueDate = due,
                            Paid = (ins.Status?.Equals("PAID", StringComparison.OrdinalIgnoreCase) ?? false),
                            PaidDate = ParseDateFlexible(ins.DtPayment),
                            CategoryId = opt.CategoryManager,
                            AccountId = opt.AccountPayables,
                            ClientId = null,
                            CostCenterId = 4,
                            Reference = $"SALE:{sale.Id}",
                            Notes = ins.Obs,
                            CreatedAt = now,
                            UpdatedAt = now,
                            Recurrencing = false,
                            Periodic = null,
                            Parcelas = ins.Id,
                            Status = ins.Status ?? "WAITING"
                        });
                        n++;
                    }
                }
                else if ((sale.ManagerComission) > 0m)
                {
                    // NÃO PARCELADA – 1 título
                    payables.Add(SinglePayable(
                        sale.ManagerComission,
                        $"Comissão Gerente - {sale.Gerente ?? "Gerente"}",
                        opt.CategoryManager,
                        sale.ParcelsStart ?? sale.SelledAt,
                        sale.ManagerComissionStatus
                    ));
                }


                // 3.6 Comissão FINANCEIRA (valor único se não parcelar)
                if ((sale.FinancialComission ?? 0m) > 0m)
                {
                    payables.Add(SinglePayable(
                        sale.FinancialComission,
                        "Comissão Financeira",
                        opt.CategoryFinancial,
                        sale.ParcelsStart ?? sale.SelledAt,
                        sale.FinancialComissionStatus
                    ));
                }

                // ===================== PERSISTÊNCIA =====================

                const string insertReceivableSql = @"INSERT INTO jm.receivables
                                                    (series_id, installment_no, amount, description, competence_date, due_date,
                                                     received, received_date, category_id, account_id, client_id, cost_center_id,
                                                     reference, notes, created_at, updated_at, recurrencing, periodic, parcelas, status)
                                                    VALUES
                                                    (@SeriesId, @InstallmentNo, @Amount, @Description, @CompetenceDate, @DueDate,
                                                     @Received, @ReceivedDate, @CategoryId, @AccountId, @ClientId, @CostCenterId,
                                                     @Reference, @Notes, @CreatedAt, @UpdatedAt, @Recurrencing, @Periodic, @Parcelas, @Status);";

                const string insertPayableSql = @"INSERT INTO jm.payables
                                                    (series_id, installment_no, amount, description, competence_date, due_date,
                                                     paid, paid_date, category_id, account_id, client_id, cost_center_id,
                                                     reference, notes, created_at, updated_at, recurrencing, periodic, parcelas, status)
                                                    VALUES
                                                    (@SeriesId, @InstallmentNo, @Amount, @Description, @CompetenceDate, @DueDate,
                                                     @Paid, @PaidDate, @CategoryId, @AccountId, @ClientId, @CostCenterId,
                                                     @Reference, @Notes, @CreatedAt, @UpdatedAt, @Recurrencing, @Periodic, @Parcelas, @Status);";

                // bulk insert (cada objeto vira um EXEC de insert)
                if (receivables.Count > 0)
                    await conn.ExecuteAsync(insertReceivableSql, receivables, tran);

                if (payables.Count > 0)
                    await conn.ExecuteAsync(insertPayableSql, payables, tran);

                await tran.CommitAsync();
            }
            catch
            {
                await tran.RollbackAsync();
                throw;
            }
        }
    }
}
