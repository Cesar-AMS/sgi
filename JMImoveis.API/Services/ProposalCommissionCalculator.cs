using JMImoveisAPI.Entities;
using System.Globalization;
using System.Text;

namespace JMImoveisAPI.Services
{
    public sealed class ProposalCommissionCalculator
    {
        private const decimal CommissionPercentage = 6m;
        private const decimal CommissionRate = CommissionPercentage / 100m;

        public CommissionCalculationResult CalculateAtoParcelas(
            decimal valorImovel,
            IEnumerable<ProposalCondition> condicoes)
        {
            var commissionTotal = decimal.Round(valorImovel * CommissionRate, 2, MidpointRounding.AwayFromZero);
            var commissionBalance = commissionTotal;
            var totalRealEstate = 0m;
            var totalConstructor = 0m;
            var items = new List<CommissionCalculationItem>();

            foreach (var commissionEvent in ExpandirEventos(condicoes))
            {
                var realEstateAmount = 0m;
                var constructorAmount = 0m;

                if (commissionEvent.Classification == CommissionClassification.CommissionAmortization)
                {
                    realEstateAmount = Math.Min(commissionEvent.CustomerAmount, commissionBalance);
                    constructorAmount = commissionEvent.CustomerAmount - realEstateAmount;
                    commissionBalance -= realEstateAmount;
                }
                else
                {
                    constructorAmount = commissionEvent.CustomerAmount;
                }

                totalRealEstate += realEstateAmount;
                totalConstructor += constructorAmount;

                items.Add(new CommissionCalculationItem
                {
                    EventDate = commissionEvent.EventDate,
                    Description = commissionEvent.Description,
                    OriginalDescription = commissionEvent.OriginalDescription,
                    InstallmentNumber = commissionEvent.InstallmentNumber,
                    InstallmentTotal = commissionEvent.InstallmentTotal,
                    CustomerAmount = commissionEvent.CustomerAmount,
                    RealEstateAmount = realEstateAmount,
                    ConstructorAmount = constructorAmount,
                    CommissionBalanceAfter = commissionBalance,
                    Classification = commissionEvent.Classification.ToString(),
                    Observation = commissionEvent.Observation
                });
            }

            return new CommissionCalculationResult
            {
                ValorImovel = valorImovel,
                CommissionPercentage = CommissionPercentage,
                CommissionTotal = commissionTotal,
                TotalRealEstate = totalRealEstate,
                TotalConstructor = totalConstructor,
                CommissionBalanceFinal = commissionBalance,
                Items = items
            };
        }

        private static IEnumerable<CommissionEvent> ExpandirEventos(IEnumerable<ProposalCondition> condicoes)
        {
            return (condicoes ?? Enumerable.Empty<ProposalCondition>())
                .SelectMany((condicao, conditionOrder) => ExpandirCondicao(condicao, conditionOrder))
                .OrderBy(e => e.EventDate.Date)
                .ThenBy(e => e.ConditionOrder)
                .ThenBy(e => e.InstallmentNumber ?? 1)
                .ToList();
        }

        private static IEnumerable<CommissionEvent> ExpandirCondicao(ProposalCondition condicao, int conditionOrder)
        {
            var classification = ClassificarDescricao(condicao.Descricao);
            var baseObservation = ObterObservacaoDescricao(classification);
            var eventDate = ObterVencimento(condicao.Vencimento, out var vencimentoObservation);
            var observation = CombinarObservacoes(baseObservation, vencimentoObservation);
            var quantidade = Math.Max(condicao.Qtde, 1);

            if (EhMensal(condicao.Descricao))
            {
                return Enumerable.Range(0, quantidade)
                    .Select(index => CriarEvento(
                        condicao,
                        conditionOrder,
                        eventDate.AddMonths(index),
                        $"{ObterDescricaoBase(condicao.Descricao, "Mensal")} {index + 1}/{quantidade}",
                        index + 1,
                        quantidade,
                        condicao.ValorParcela,
                        classification.Kind,
                        observation));
            }

            if (EhAnual(condicao.Descricao))
            {
                return Enumerable.Range(0, quantidade)
                    .Select(index => CriarEvento(
                        condicao,
                        conditionOrder,
                        eventDate.AddYears(index),
                        $"{ObterDescricaoBase(condicao.Descricao, "Anual")} {index + 1}/{quantidade}",
                        index + 1,
                        quantidade,
                        condicao.ValorParcela,
                        classification.Kind,
                        observation));
            }

            return new[]
            {
                CriarEvento(
                    condicao,
                    conditionOrder,
                    eventDate,
                    ObterDescricaoBase(condicao.Descricao, "Condição"),
                    null,
                    null,
                    ValorTotalCondicao(condicao),
                    classification.Kind,
                    observation)
            };
        }

        private static CommissionEvent CriarEvento(
            ProposalCondition condicao,
            int conditionOrder,
            DateTime eventDate,
            string description,
            int? installmentNumber,
            int? installmentTotal,
            decimal customerAmount,
            CommissionClassification classification,
            string? observation)
        {
            return new CommissionEvent
            {
                EventDate = eventDate.Date,
                Description = description,
                OriginalDescription = condicao.Descricao,
                InstallmentNumber = installmentNumber,
                InstallmentTotal = installmentTotal,
                CustomerAmount = customerAmount,
                Classification = classification,
                Observation = observation,
                ConditionOrder = conditionOrder
            };
        }

        private static decimal ValorTotalCondicao(ProposalCondition condicao)
        {
            if (condicao.ValorTotal > 0)
            {
                return condicao.ValorTotal;
            }

            return condicao.ValorParcela * Math.Max(condicao.Qtde, 1);
        }

        private static DateTime ObterVencimento(DateTime vencimento, out string? observation)
        {
            if (vencimento == default || vencimento.Year < 1900)
            {
                observation = "Vencimento ausente; data atual usada na simulação";
                return DateTime.Today;
            }

            observation = null;
            return vencimento.Date;
        }

        private static CommissionClassificationInfo ClassificarDescricao(string? descricao)
        {
            var normalized = NormalizarDescricao(descricao);

            if (normalized is "ATOCOMISSAO" or "ATOJM" or "COMISSAO" or "ANUALJM" or "MENSAL")
            {
                return new CommissionClassificationInfo(CommissionClassification.CommissionAmortization, null);
            }

            if (normalized is "ATOCONSTRUTORA" or "ATOCONST" or "ANUALCONST" or "ANUALCONSTRUTORA" or "REPASSECONSTRUTORA")
            {
                return new CommissionClassificationInfo(CommissionClassification.Constructor, null);
            }

            if (normalized == "FINANCIAMENTO")
            {
                return new CommissionClassificationInfo(CommissionClassification.Constructor, "Financiamento tratado como evento único nesta simulação");
            }

            if (normalized == "POSOBRAS")
            {
                return new CommissionClassificationInfo(CommissionClassification.FutureRule, "Pós obras tratado como evento único nesta simulação");
            }

            if (normalized is "FGTS" or "ENTREGADECHAVES" or "PROMOCAO")
            {
                return new CommissionClassificationInfo(CommissionClassification.FutureRule, null);
            }

            return new CommissionClassificationInfo(CommissionClassification.Unclassified, null);
        }

        private static string? ObterObservacaoDescricao(CommissionClassificationInfo classification)
        {
            return classification.Kind switch
            {
                CommissionClassification.FutureRule => classification.Observation ?? "Regra comercial pode exigir conferência futura",
                CommissionClassification.Constructor => classification.Observation,
                CommissionClassification.Unclassified => "Descrição não classificada; conferência futura recomendada",
                _ => classification.Observation
            };
        }

        private static bool EhMensal(string? descricao)
            => NormalizarDescricao(descricao) == "MENSAL";

        private static bool EhAnual(string? descricao)
        {
            var normalized = NormalizarDescricao(descricao);
            return normalized is "ANUALJM" or "ANUALCONST" or "ANUALCONSTRUTORA";
        }

        private static string ObterDescricaoBase(string? descricao, string fallback)
            => string.IsNullOrWhiteSpace(descricao) ? fallback : descricao.Trim();

        private static string? CombinarObservacoes(params string?[] observacoes)
        {
            var validObservations = observacoes
                .Where(o => !string.IsNullOrWhiteSpace(o))
                .Select(o => o!.Trim())
                .Distinct()
                .ToArray();

            return validObservations.Length == 0
                ? null
                : string.Join(" | ", validObservations);
        }

        private static string NormalizarDescricao(string? descricao)
        {
            var normalized = (descricao ?? string.Empty)
                .Trim()
                .ToUpperInvariant()
                .Replace(" ", string.Empty)
                .Replace("-", string.Empty)
                .Replace("_", string.Empty);

            return RemoverAcentos(normalized);
        }

        private static string RemoverAcentos(string text)
        {
            var normalized = text.Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder(capacity: normalized.Length);

            foreach (var c in normalized)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                {
                    builder.Append(c);
                }
            }

            return builder.ToString().Normalize(NormalizationForm.FormC);
        }
    }

    public sealed class CommissionCalculationResult
    {
        public decimal ValorImovel { get; set; }
        public decimal CommissionPercentage { get; set; }
        public decimal CommissionTotal { get; set; }
        public decimal TotalRealEstate { get; set; }
        public decimal TotalConstructor { get; set; }
        public decimal CommissionBalanceFinal { get; set; }
        public IReadOnlyList<CommissionCalculationItem> Items { get; set; } = Array.Empty<CommissionCalculationItem>();
    }

    public sealed class CommissionCalculationItem
    {
        public DateTime EventDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? OriginalDescription { get; set; }
        public int? InstallmentNumber { get; set; }
        public int? InstallmentTotal { get; set; }
        public decimal CustomerAmount { get; set; }
        public decimal RealEstateAmount { get; set; }
        public decimal ConstructorAmount { get; set; }
        public decimal CommissionBalanceAfter { get; set; }
        public string Classification { get; set; } = string.Empty;
        public string? Observation { get; set; }
    }

    internal sealed class CommissionEvent
    {
        public DateTime EventDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? OriginalDescription { get; set; }
        public int? InstallmentNumber { get; set; }
        public int? InstallmentTotal { get; set; }
        public decimal CustomerAmount { get; set; }
        public CommissionClassification Classification { get; set; }
        public string? Observation { get; set; }
        public int ConditionOrder { get; set; }
    }

    internal readonly record struct CommissionClassificationInfo(
        CommissionClassification Kind,
        string? Observation);

    internal enum CommissionClassification
    {
        CommissionAmortization,
        Constructor,
        FutureRule,
        Unclassified
    }
}
