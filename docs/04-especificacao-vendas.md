# Especificacao Funcional - Vendas

## 1. Objetivo deste documento
Este documento descreve o modulo **Vendas**, responsavel por conduzir a oportunidade comercial ate o fechamento da venda de um imovel.

O objetivo e definir:
- a finalidade do modulo
- suas responsabilidades
- os fluxos principais
- os dados envolvidos
- as regras de negocio iniciais
- a relacao com Atendimento
- a base para implementacao no frontend e backend

---

## 2. Contexto no negocio
O modulo de Vendas e o nucleo da geracao de receita da empresa.

Na operacao atual:
- o lead entra por multiplos canais
- evolui no Atendimento
- quando qualificado, segue para negociacao
- a proposta acontece presencialmente
- o fechamento tambem acontece presencialmente
- depois disso, a operacao segue para contrato, repasse e financeiro pos-venda

---

## 3. Objetivo do modulo
O modulo deve permitir que a empresa:
- acompanhe oportunidades comerciais
- relacione cliente, imovel e vendedor
- acompanhe negociacao
- registre proposta principal no fluxo
- registre o fechamento da venda

---

## 4. Escopo desta fase de consolidacao
Nesta fase, o recorte oficial de Vendas ficou limitado ao fluxo principal transacional:
- oportunidade
- detalhe da oportunidade
- proposta principal apenas como etapa conceitual do fluxo
- mudanca de status
- fechamento inicial

Ficam fora desta fase:
- dashboard
- espelho de vendas
- desistencias
- corretor e view-corretor
- consolidacao completa de propostas
- refatoracao do acoplamento com Financeiro

---

## 5. Relacao com Atendimento
O modulo de Vendas recebe insumos do contexto de Atendimento.

A navegacao funcional esperada ate a entrada em Vendas e:

```text
Atendimento
|- Leads
|  |- Listagem
|- Agendamento
   |
   v
Vendas
```

---

## 6. Caminho oficial atual no frontend
O caminho oficial atual de Vendas no frontend e:

### Listagem oficial
- componente: `VisaoGeralComponent`
- rota: `/jm/vendas/visao-geral`
- responsabilidade: listar oportunidades e abrir o detalhe/edicao

### Detalhe, criacao e edicao oficiais
- componente: `VendasNewComponent`
- rotas:
  - `/jm/vendas/new`
  - `/jm/vendas/edit/:id`
- responsabilidade: criar, abrir, editar e fechar o fluxo principal da venda

### Service oficial do fluxo principal
- `SalesService`

Responsabilidades ja centralizadas nesse caminho:
- listagem de oportunidades
- carregamento do detalhe completo
- carregamento de parcels
- carregamento de clientes vinculados
- criacao da venda com parcels
- atualizacao da venda
- atualizacao explicita de status no detalhe da oportunidade
- fechamento explicito da venda no detalhe oficial, reaproveitando o contrato atual de update

---

## 7. Backend atual do fluxo principal
No backend, a trilha principal atual de Vendas e:

```text
VendaController
  -> VendaConsultaService
  -> VendaCriacaoService
  -> VendaGestaoService
  -> IVendaRepository
  -> VendaRepository
```

Esse e o caminho principal atual para o dominio de Vendas.

---

## 8. Propostas no estado atual
Para o subfluxo de propostas dentro de Vendas, o caminho oficial atual ficou assim:

- tela oficial: `PropostasComponent`
- rota oficial: `/jm/vendas/propostas`
- service oficial: `ProposalsService`

Responsabilidades ja centralizadas nesse caminho:
- listar propostas
- abrir detalhe em modal
- aprovar proposta
- criar/atualizar a proposta principal pelo fluxo atual da tela

Trilhas paralelas e divida assumida:
- `/jm/propostas` permanece apenas como redirect de compatibilidade
- `PropostaComponent` em `/jm/vendas/proposta` permanece como legado temporario e tambem redireciona
- `ApiService` mantem metodos de propostas apenas como fachada legada de compatibilidade, delegando para `ProposalsService`
- criacao de venda continua acoplada ao endpoint `api/Financial/sales`

Essas trilhas nao sao o caminho oficial atual de propostas.

---

## 9. Estado atual da consolidacao
Pela regua adotada no projeto, o dominio de Vendas esta assim neste recorte:

- `1 caminho oficial`
  - atendido para o fluxo principal por `VisaoGeralComponent -> VendasNewComponent -> SalesService`
  - atendido para propostas por `PropostasComponent -> ProposalsService`
- `fluxo principal funcionando`
  - atendido para listar, abrir, criar e editar
  - atendido para atualizar status no detalhe oficial
  - atendido para fechamento inicial no detalhe oficial
  - atendido para listar e aprovar propostas no caminho oficial
- `responsabilidades principais separadas`
  - atendido de forma inicial no frontend, com `SalesService` assumindo o nucleo do fluxo
  - atendido de forma inicial para status, com acao explicita no detalhe oficial sem criar contrato HTTP novo
  - atendido de forma inicial para fechamento, com acao explicita no detalhe oficial sem criar endpoint novo
  - atendido de forma inicial para propostas, com `ProposalsService` isolando a tela oficial
  - atendido de forma adicional com `ApiService` servindo apenas como fachada legada, sem concentrar mais a implementacao HTTP de propostas
- `divida restante documentada`
  - atendido neste documento

---

## 10. Proximo passo recomendado
Com o recorte principal atual, o dominio de Vendas ja pode ser considerado consolidado o suficiente para avancar.

Isso significa que, neste escopo:
- existe 1 caminho oficial para oportunidades
- existe 1 caminho oficial para propostas
- o fluxo principal funciona de oportunidade ate fechamento inicial
- as responsabilidades principais ja estao separadas o suficiente
- a divida restante esta documentada

Divida que permanece assumida:
- criacao ainda acoplada ao endpoint `api/Financial/sales`
- backend ainda nao possui um endpoint explicito de fechamento
- `PropostaComponent` continua como legado temporario
- dashboard, espelho, desistencias e corretor continuam fora deste recorte

Proximo passo recomendado:
- encerrar este recorte principal de Vendas como bom o suficiente
- seguir para o proximo dominio prioritario, ou abrir um novo recorte especifico dentro de Vendas apenas se houver necessidade real
