# Mapeamento da Fase 3 - Repasse

## 1. Objetivo do mapeamento
Registrar como abrir o terceiro recorte operacional da Fase 3 sem crescer o escopo cedo demais.

Este documento existe para responder:
- onde Repasse deve ser ancorado
- qual e o menor fluxo utilizavel
- qual naming tecnico deve ser usado
- o que entra no primeiro corte
- o que fica explicitamente fora

---

## 2. Leitura objetiva do estado atual
Hoje nao existe dominio proprio de Repasse implementado.

Os sinais reais existentes no sistema sao:
- `valueToConstructor` na venda
- referencias de UI a "valor a repassar para a construtora"
- referencias espalhadas a repasses de comissao e financeiro dentro do fluxo de Vendas

Esses sinais mostram intencao operacional, mas ainda nao formam uma trilha oficial de Repasse.

Por isso, a recomendacao e:
- abrir um fluxo proprio e pequeno
- nao tentar resolver todo o repasse comercial e financeiro de uma vez

---

## 3. Melhor ponto de ancoragem
O melhor ponto de ancoragem inicial continua sendo a venda ou oportunidade ja existente.

Vinculo recomendado:
- `saleId` como chave principal do primeiro recorte

Motivo:
- o valor base de repasse ja nasce no contexto da venda
- evita criar contexto paralelo de cliente, unidade e negociacao
- conversa bem com os dois recortes ja abertos na Fase 3:
  - `CreditAnalysis`
  - `Contract`

---

## 4. Recorte inicial recomendado
O primeiro recorte deve conter apenas:

- vinculo com `saleId`
- identificacao da construtora vinculada
- valor do repasse
- data planejada do repasse
- status simples
- observacoes basicas

Status simples sugeridos no primeiro corte:
- `PENDENTE`
- `PROGRAMADO`
- `REPASSADO`
- `BLOQUEADO`

Esse recorte ja e suficiente para:
- abrir tela oficial
- abrir service oficial
- abrir backend oficial
- persistir repasse como entidade propria
- criar uso operacional real sem abrir workflow financeiro completo

---

## 5. O que deve ser reaproveitado
Para manter o corte pequeno, o primeiro fluxo deve reaproveitar o que ja existe:

- `saleId` vindo da rota
- valor inicial vindo de `valueToConstructor`
- contexto da venda ja carregado por `SalesService`
- contexto da construtora ja resolvido a partir da venda e do empreendimento, quando isso estiver simples de obter

Importante:
- o primeiro corte nao deve exigir recalculo novo de repasse
- o primeiro corte deve registrar e acompanhar o repasse, nao recalcular toda a venda

---

## 6. O que fica fora neste primeiro corte
Para manter a abertura controlada, ficam fora:

- repasse de corretor
- repasse de gerente
- repasse de coordenador
- repasse do financeiro
- parcelamento do repasse
- conciliacao bancaria
- agenda de pagamentos complexa
- workflow contabil
- multiplos repasses por venda

---

## 7. Naming tecnico recomendado
UI, menu e documentacao:
- Repasse

Codigo e API:
- entidade: `ConstructorTransfer`
- frontend: `ConstructorTransferComponent`
- frontend service: `ConstructorTransferService`
- backend controller: `ConstructorTransferController`
- backend service: `IConstructorTransferService` / `ConstructorTransferService`
- backend repository: `IConstructorTransferRepository` / `ConstructorTransferRepository`
- rota frontend: `/jm/constructor-transfer/:saleId`
- rota API: `/api/constructor-transfers`

Motivo do naming:
- fica curto
- conversa com o vocabulrio tecnico ja existente no projeto:
  - `Constructor`
  - `valueToConstructor`
- evita misturar "repasse", "financeiro" e "comissao" cedo demais

---

## 8. Tela oficial inicial recomendada
Tela oficial inicial:
- rota oficial sugerida: `/jm/constructor-transfer/:saleId`

Primeira versao da tela:
- cabecalho da venda vinculada
- contexto basico da construtora
- valor base de repasse
- formulario do repasse
- estado atual do repasse

Importante:
- a tela deve ser propria do dominio
- nao deve virar extensao inflada da tela de venda
- os campos editaveis devem ficar limitados ao proprio repasse

---

## 9. Leitura pratica
O terceiro recorte da Fase 3 deve abrir:

- 1 novo fluxo operacional
- 1 caminho oficial
- 1 tela oficial
- 1 service oficial
- 1 backend oficial

Mas apenas para repasse minimo da construtora vinculado a `saleId`.

Isso ja gera valor real porque:
- tira Repasse do estado de intencao solta
- ancora o fluxo em um valor que ja existe
- prepara a fase seguinte sem exigir calendario financeiro completo

---

## 10. Estado atual apos a abertura inicial
Estado atual apos a abertura inicial:

- rota oficial aberta: `/jm/constructor-transfer/:saleId`
- tela oficial aberta: `ConstructorTransferComponent`
- service oficial aberto: `ConstructorTransferService`
- backend oficial aberto:
  - `ConstructorTransferController`
  - `IConstructorTransferService`
  - `ConstructorTransferService`
  - `IConstructorTransferRepository`
  - `ConstructorTransferRepository`
- persistencia propria aberta em `constructor_transfers`
- navegacao inicial aberta em Vendas
- valor inicial do repasse reaproveitado a partir de `valueToConstructor`
- contexto da construtora carregado a partir do empreendimento quando disponivel

Leitura pratica:
- `saleId` ja e a chave natural do primeiro recorte
- o repasse ja nasce como registro unico por oportunidade
- o recorte inicial ja esta muito perto de bom o suficiente

Proximo passo recomendado:
1. documentar o recorte como quase consolidado
2. decidir se existe alguma necessidade operacional clara imediata
3. se nao existir, pausar Repasse como bom o suficiente neste primeiro corte
