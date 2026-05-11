using JMImoveisAPI.Entities;
using JMImoveisAPI.Services;

var calculator = new ProposalCommissionCalculator();

ValidarCenarioDiretor(calculator);
ValidarClassificacoesAdicionais(calculator);
ValidarMensalInvalidoEVencimentoAusente(calculator);

Console.WriteLine("Validacao da calculadora de comissionamento concluida com sucesso.");

static void ValidarCenarioDiretor(ProposalCommissionCalculator calculator)
{
    var result = calculator.CalculateAtoParcelas(252000m, new[]
    {
        Condicao("Ato - comissão", 1, 2000m, 2000m, new DateTime(2026, 5, 10)),
        Condicao("Mensal", 36, 1000m, 36000m, new DateTime(2026, 6, 10)),
        Condicao("Anual - JM", 1, 3500m, 3500m, new DateTime(2026, 12, 10)),
        Condicao("Anual - Construtora", 2, 3500m, 7000m, new DateTime(2027, 12, 10)),
        Condicao("Entrega de chaves", 1, 3000m, 3000m, new DateTime(2029, 1, 10)),
        Condicao("Pós obras", 60, 300m, 18000m, new DateTime(2029, 2, 10))
    });

    AssertEqual(15120m, result.CommissionTotal, "Comissao total");
    AssertEqual(15120m, result.TotalRealEstate, "Total imobiliaria");
    AssertEqual(54380m, result.TotalConstructor, "Total construtora");
    AssertEqual(0m, result.CommissionBalanceFinal, "Saldo final comissao");
    AssertEqual(42, result.Items.Count, "Quantidade de eventos");

    var ato = result.Items.Single(i => i.Description == "Ato - comissão");
    AssertEqual(2000m, ato.RealEstateAmount, "Ato para imobiliaria");
    AssertEqual(0m, ato.ConstructorAmount, "Ato para construtora");

    var mensal = result.Items.Where(i => i.OriginalDescription == "Mensal").ToList();
    AssertEqual(36, mensal.Count, "Mensais expandidas");
    AssertEqual(new DateTime(2026, 6, 10), mensal[0].EventDate, "Primeira mensal");
    AssertEqual(new DateTime(2029, 5, 10), mensal[^1].EventDate, "Ultima mensal");

    var anualJm = result.Items.Single(i => i.OriginalDescription == "Anual - JM");
    AssertEqual(new DateTime(2026, 12, 10), anualJm.EventDate, "Data anual JM");
    AssertEqual(3500m, anualJm.RealEstateAmount, "Anual JM para imobiliaria");

    var split = result.Items.Single(i => i.RealEstateAmount > 0m && i.ConstructorAmount > 0m);
    AssertEqual("Mensal 10/36", split.Description, "Evento que divide saldo");
    AssertEqual(620m, split.RealEstateAmount, "Parcela final da imobiliaria");
    AssertEqual(380m, split.ConstructorAmount, "Excedente para construtora");
    AssertEqual(0m, split.CommissionBalanceAfter, "Saldo apos evento dividido");

    var anualConstrutora = result.Items.Where(i => i.OriginalDescription == "Anual - Construtora").ToList();
    AssertEqual(2, anualConstrutora.Count, "Anuais construtora expandidas");
    AssertEqual(0m, anualConstrutora.Sum(i => i.RealEstateAmount), "Anual Construtora nao vai para imobiliaria");
    AssertEqual(7000m, anualConstrutora.Sum(i => i.ConstructorAmount), "Anual Construtora vai para construtora");

    var entrega = result.Items.Single(i => i.OriginalDescription == "Entrega de chaves");
    AssertContains("Regra comercial", entrega.Observation, "Observacao entrega de chaves");

    var posObras = result.Items.Single(i => i.OriginalDescription == "Pós obras");
    AssertEqual(18000m, posObras.ConstructorAmount, "Pos obras evento unico para construtora");
    AssertContains("Pós obras tratado como evento único", posObras.Observation, "Observacao pos obras");
}

static void ValidarClassificacoesAdicionais(ProposalCommissionCalculator calculator)
{
    var result = calculator.CalculateAtoParcelas(100000m, new[]
    {
        Condicao("Financiamento", 1, 10000m, 10000m, new DateTime(2026, 1, 10)),
        Condicao("FGTS", 1, 5000m, 5000m, new DateTime(2026, 2, 10)),
        Condicao("Promoção", 1, 1500m, 1500m, new DateTime(2026, 3, 10)),
        Condicao("Descricao desconhecida", 1, 700m, 700m, new DateTime(2026, 4, 10))
    });

    AssertEqual(0m, result.TotalRealEstate, "Classificacoes adicionais nao amortizam comissao");
    AssertEqual(17200m, result.TotalConstructor, "Classificacoes adicionais vao para construtora");

    AssertContains("Financiamento tratado como evento único", result.Items[0].Observation, "Observacao financiamento");
    AssertContains("Regra comercial", result.Items[1].Observation, "Observacao FGTS");
    AssertContains("Regra comercial", result.Items[2].Observation, "Observacao promocao");
    AssertContains("Descrição não classificada", result.Items[3].Observation, "Observacao desconhecida");
}

static void ValidarMensalInvalidoEVencimentoAusente(ProposalCommissionCalculator calculator)
{
    var result = calculator.CalculateAtoParcelas(10000m, new[]
    {
        Condicao("Mensal", 0, 500m, 0m, default)
    });

    AssertEqual(1, result.Items.Count, "Mensal com qtde zero vira um evento");
    AssertEqual(DateTime.Today, result.Items[0].EventDate, "Fallback de vencimento");
    AssertContains("Vencimento ausente", result.Items[0].Observation, "Observacao vencimento ausente");
}

static ProposalCondition Condicao(string descricao, int qtde, decimal valorParcela, decimal valorTotal, DateTime vencimento)
{
    return new ProposalCondition
    {
        Qtde = qtde,
        Descricao = descricao,
        ValorParcela = valorParcela,
        ValorTotal = valorTotal,
        Vencimento = vencimento
    };
}

static void AssertEqual<T>(T expected, T actual, string message)
{
    if (!EqualityComparer<T>.Default.Equals(expected, actual))
    {
        throw new InvalidOperationException($"{message}. Esperado: {expected}. Obtido: {actual}.");
    }
}

static void AssertContains(string expected, string? actual, string message)
{
    if (actual is null || !actual.Contains(expected, StringComparison.OrdinalIgnoreCase))
    {
        throw new InvalidOperationException($"{message}. Texto esperado: {expected}. Obtido: {actual ?? "<null>"}.");
    }
}
