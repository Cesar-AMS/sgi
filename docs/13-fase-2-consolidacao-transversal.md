# Fase 2 - Consolidacao Transversal e Preparacao Operacional

## 1. Objetivo da fase
Esta fase existe para consolidar transversalmente a base que ja foi organizada por dominio na fase anterior.

O foco agora nao e abrir novos dominios, e sim:
- alinhar frontend, backend e documentacao
- reduzir divida transversal
- preparar a base para a proxima prioridade operacional

---

## 2. Prioridades da fase

### Prioridade principal
Alinhar a base transversal do sistema ao que ja foi consolidado por dominio.

### Prioridade secundaria
Preparar backend e estrutura tecnica para as proximas funcionalidades reais, sem abrir dominios ainda nao implementados.

---

## 3. O que entra nesta fase
- reduzir dependencia residual do `ApiService` no frontend
- revisar e padronizar nomenclaturas inconsistentes
- limpar e alinhar documentacao principal e backlog incremental
- revisar coerencia entre menu, rotas e caminhos oficiais
- atacar warnings e hygiene do backend com baixo risco
- continuar alinhando backend aos dominios ja consolidados somente quando houver ganho transversal claro
- revisar compatibilidades legadas para decidir o que permanece como fachada e o que pode ser encerrado

---

## 4. O que fica fora desta fase
- abrir dominios sem base real, como Analise de Perfil e Credito
- abrir Contratos e Repasse como modulo novo
- refatoracao estrutural grande do projeto inteiro
- mudanca de contratos HTTP publicos sem necessidade
- reescrita ampla de frontend ou backend
- mudancas cosmeticas sem impacto arquitetural relevante

---

## 5. Criterio de sucesso
Esta fase sera considerada concluida quando:

- os caminhos oficiais dos dominios ja consolidados estiverem coerentes entre frontend, backend e documentacao
- a divida transversal principal estiver visivel, controlada e registrada
- o `ApiService` estiver mais reduzido ou claramente assumido como fachada legada
- o backend estiver mais estavel nos pontos que ja entraram em consolidacao
- a documentacao estiver pronta para orientar a proxima fase sem ambiguidade

---

## 6. Sequencia recomendada
1. revisao transversal do frontend e da documentacao
2. revisao transversal do backend e dos warnings de baixo risco
3. fechamento das compatibilidades legadas mais importantes
4. definicao explicita da fase seguinte com foco operacional

---

## 7. Estado de partida
Ao entrar nesta fase, os dominios tratados como bons o suficiente na fase anterior sao:

- Atendimento / Leads
- Vendas
- Clientes
- Empreendimentos
- Administracao e Acessos
- RH
- Financeiro Pos-venda
- Comissoes e Resultado Comercial

Tambem ficou definido que os dominios abaixo nao devem ser abertos sem base real suficiente:

- Analise de Perfil e Credito
- Contratos e Repasse

---

## 8. Leitura pratica
Esta fase nao existe para abrir mais frentes pequenas por inercia.

Ela existe para transformar a consolidacao feita ate aqui em uma base:
- mais coerente
- mais previsivel
- mais estavel
- mais preparada para a proxima prioridade real do sistema

---

## 9. Ponto de chegada atual
Neste momento:

- o frontend da Fase 2 ja pode ser tratado como bom o suficiente neste escopo transversal
- o `ApiService` perdeu os residuos mais importantes em Empreendimentos, Financeiro e no nucleo administrativo
- o backend hygiene de baixo risco chegou a build limpo no ambiente local

---

## 10. Atualizacao incremental desta fase
Os cortes ja executados na Fase 2 foram:

- migracao de [construtora.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/empreendimentos/construtora/construtora.component.ts) para `EnterprisesService`
- migracao de [contas-receber.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/financeiro/contas-receber/contas-receber.component.ts) para `AccountsReceivableService` no fluxo principal
- migracao de [contas-pagar.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/financeiro/contas-pagar/contas-pagar.component.ts) para `AccountsPayableService` no fluxo principal
- retirada do uso residual de `ApiService` em [accounts-receivable.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/financeiro/accounts-receivable/accounts-receivable.component.ts), com lookup de filiais migrado para `AdminAccessService`
- retirada do apoio residual de construtora em [cadastro.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/empreendimentos/cadastro/cadastro.component.ts), com criacao e recarga passando por `EnterprisesService`
- validacao de [accounts-payable.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/financeiro/accounts-payable/accounts-payable.component.ts), confirmando que a tela ja nao depende de `ApiService`
- migracao dos blocos de formas de pagamento, categorias, centro de custo e plano de contas em [gerais.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/configuracoes/gerais/gerais.component.ts) para `AdminAccessService`
- migracao de [centro-custo.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/financeiro/centro-custo/centro-custo.component.ts) para `CostCenterAnalysisService`
- migracao de [contas-contabeis.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/financeiro/contas-contabeis/contas-contabeis.component.ts) para `AccountAnalysisService`, com lookups em `AdminAccessService`
- blocos sucessivos de backend hygiene de baixo risco em services, controllers, repositories e entidades simples, incluindo [UsuarioAuthService.cs](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.API/Services/UsuarioAuthService.cs), [FinancialService.cs](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.API/Services/FinancialService.cs), [ReceivableRepository.cs](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.API/Repositories/ReceivableRepository.cs), [VendaRepository.cs](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.API/Repositories/VendaRepository.cs), [Venda.cs](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.API/Entities/Venda.cs) e [SaleV2.cs](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.API/Entities/SaleV2.cs)
- fechamento do ruido estrutural de build em [JMImoveis.API.csproj](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.API/JMImoveis.API.csproj), deixando o build local em `0 warnings` e `0 errors`

Leitura pratica desta atualizacao:
- o `ApiService` perdeu os usos indevidos mais importantes no frontend
- os services oficiais ficaram mais coerentes com o caminho real das telas
- os lookups auxiliares permaneceram controlados, sem abrir refatoracao grande
- o backend hygiene reduziu os warnings do build de `84` para `0` no ambiente local, sem mudar contratos HTTP nem abrir refatoracao estrutural
- o frontend da Fase 2 ja pode ser tratado como suficiente e pausado com seguranca

---

## 11. Proximo corte recomendado desta fase
O proximo corte mais coerente agora e um destes:

1. encerrar formalmente a Fase 2 como suficiente
2. so depois abrir uma nova fase com prioridade explicita, em vez de seguir empilhando cortes pequenos
3. quando fizer sentido, tratar separadamente upgrade de runtime e politica de auditoria de pacotes
