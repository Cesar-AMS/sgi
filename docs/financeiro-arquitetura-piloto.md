# Financas - Arquitetura do Piloto

## Base oficial

- accounts_receivable
- accounts_payable

## Base legada/paralela

- receivables
- payables

## Camadas oficiais

- AccountsReceivableController
- AccountsPayableController
- AccountsReceivableService
- AccountsPayableService
- AccountsReceivableRepository
- AccountsPayableRepository
- FinancialService
- ReportsRepository
- ProposalService
- VendaGestaoService

## Camadas legadas

- ReceivablesController
- PayableController
- ReceivableRepository
- FinanceIntegrationService
- VendaRepository, nos pontos que ainda consultam receivables/payables

## Regra para proximas frentes

Toda nova implementacao de Contas a Receber, Contas a Pagar, Comissoes, Fluxo de Caixa e DRE deve usar accounts_receivable/accounts_payable, salvo decisao explicita futura.

Nenhuma nova funcionalidade financeira deve depender de receivables/payables.

## Comissoes oficiais

No piloto financeiro, comissoes oficiais sao lancamentos em accounts_payable.

As categorias oficiais de comissao devem iniciar com COMISSAO_.

Exemplos:

- COMISSAO_CORRETOR
- COMISSAO_GERENTE
- COMISSAO_COORDENADOR
- COMISSAO_FINANCEIRO

A tela de Comissoes deve consumir accounts_payable filtrando categorias COMISSAO_*.

O pagamento de comissao deve usar o fluxo oficial de Contas a Pagar:

- POST /api/accounts-payable/{id}/settle

Edicao e cancelamento de comissao devem respeitar as regras oficiais de Contas a Pagar.

EnterpriseCommissionRules representa regra/parametro de comissao por empreendimento, nao lancamento financeiro.

ProposalCommissionCalculator representa simulacao/resumo da proposta, nao baixa ou pagamento financeiro.

FinancialService e o ponto de materializacao das comissoes em accounts_payable.

Novas comissoes nao devem usar receivables/payables legados.

## Riscos conhecidos

- Divergencia entre dados novos e antigos.
- Relatorios antigos consultando receivables/payables.
- VendaRepository ainda com consultas legadas.
- FinanceIntegrationService ainda gravando em jm.receivables/jm.payables.
- Possibilidade de manutencao futura alterar a base legada por engano se a separacao nao for respeitada.

## Nao alterado nesta frente

- Nenhuma migration.
- Nenhum dado.
- Nenhuma rota.
- Nenhum payload.
- Nenhuma regra de negocio.
- Nenhum frontend.
- Nenhuma permissao.
- Nenhum fluxo de Propostas, Vendas, Atendimento, RH ou Administracao.

## Proxima frente recomendada

Frente 3 - robustecer Contas a Receber oficial usando accounts_receivable.
