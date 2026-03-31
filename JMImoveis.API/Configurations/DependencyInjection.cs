using JMImoveisAPI.Interfaces;
using JMImoveisAPI.Repositories;
using JMImoveisAPI.Services;

namespace JMImoveisAPI.Configurations
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDependencyInjection(this IServiceCollection services)
        {
            services.AddSingleton<DapperContext>();
            services.AddScoped<IAccountBankRepository, AccountBankRepository>();
            services.AddScoped<IAccountPlainRepository, AccountPlainRepository>();
            services.AddScoped<IAtosRepository, AtosRepository>();
            services.AddScoped<IAjudaDeCustoRepository, AjudaDeCustoRepository>();
            services.AddScoped<IApartamentosRepository, ApartamentosRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<ICargoRepository, CargoRepository>();
            services.AddScoped<ICargoService, CargoService>();
            services.AddScoped<ICentroCustoRepository, CentroCustoRepository>();
            services.AddScoped<IClienteRepository, ClienteRepository>();
            services.AddScoped<IClienteService, ClienteService>();
            services.AddScoped<IConstrutoraRepository, ConstrutoraRepository>();
            services.AddScoped<ICustoPessoalRepository, CustoPessoalRepository>();
            services.AddScoped<IDesistenciaRepository, DesistenciaRepository>();
            services.AddScoped<IEmpreendimentoRepository, EmpreendimentoRepository>();
            services.AddScoped<IFormaPagamentoRepository, FormaPagamentoRepository>();
            services.AddScoped<IFormasPagamentoRepository, FormasPagamentoRepository>();
            services.AddScoped<IFormasPagamentoService, FormasPagamentoService>();
            services.AddScoped<IFilialRepository, FilialRepository>();
            services.AddScoped<IFilialService, FilialService>();
            services.AddScoped<IIntermediariasRepository, IntermediariasRepository>();
            services.AddScoped<INotificacaoRepository, NotificacaoRepository>();
            services.AddScoped<IParcelasRepository, ParcelasRepository>();
            services.AddScoped<IParcelaRepository, ParcelaRepository>();
            services.AddScoped<IPlanoDePgtoRepository, PlanoDePgtoRepository>();
            services.AddScoped<ITipoPagamentoRepository, TipoPagamentoRepository>();
            services.AddScoped<IUsuarioRepository, UsuarioRepository>();
            services.AddScoped<IVendaRepository, VendaRepository>();
            services.AddScoped<IVisitasRepository, VisitasRepository>();
            services.AddScoped<IReceivableRepository, ReceivableRepository>();
            services.AddScoped<ILeadRepository, LeadRepository>();
            services.AddScoped<ILeadService, LeadService>();
            services.AddScoped<ISaleCustomerRepository, SaleCustomerRepository>();
            services.AddScoped<IDashboardSalesRepository, DashboardSalesRepository>();
            services.AddScoped<IAccountsReceivableRepository, AccountsReceivableRepository>();
            services.AddScoped<IAccountsReceivableService, AccountsReceivableService>();
            services.AddScoped<IAccountsPayableRepository, AccountsPayableRepository>();
            services.AddScoped<IAccountsPayableService, AccountsPayableService>();
            services.AddScoped<IFinancialService, FinancialService>();

            services.AddScoped<IProposalService, ProposalService>();
            services.AddScoped<IVendaCriacaoService, VendaCriacaoService>();
            services.AddScoped<IVendaConsultaService, VendaConsultaService>();
            services.AddScoped<IVendaGestaoService, VendaGestaoService>();

            // Serviços (exemplo com UsuarioService)

            services.AddScoped<IUsuarioAuthService, UsuarioAuthService>();
            services.AddScoped<IUsuarioResetPasswordService, UsuarioResetPasswordService>();
            services.AddScoped<IUsuarioGestaoService, UsuarioGestaoService>();
            services.AddScoped<IUsuarioConsultaService, UsuarioConsultaService>();
            services.AddScoped<IUsuarioMenuService, UsuarioMenuService>();
            services.AddScoped<IUsuarioService, UsuarioService>();
            services.AddScoped<IFinanceIntegrationService, FinanceIntegrationService>();

            return services;
        }
    }
}
