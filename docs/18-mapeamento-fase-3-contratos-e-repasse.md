# Mapeamento da Fase 3 - Contratos e Repasse

## 1. Objetivo do mapeamento
Registrar como abrir o segundo recorte operacional da Fase 3 sem crescer o escopo cedo demais.

Este documento existe para responder:
- qual subdominio deve entrar primeiro
- onde ele sera ancorado
- qual sera a tela oficial inicial
- qual service oficial deve ser aberto
- qual trilha backend minima deve existir
- o que entra e o que fica fora no primeiro corte

---

## 2. Leitura objetiva do estado atual
Hoje o sistema possui apenas sinais parciais de contrato dentro de Vendas.

Os pontos reais existentes sao:
- `contractNumber` em venda
- `contractPath` em venda
- acoes de fechamento comercial que ja pressupoem numero de contrato

Esses sinais sao suficientes para abrir um dominio novo em recorte pequeno, mas ainda nao representam um fluxo proprio de Contratos e Repasse.

Por isso, a recomendacao e:
- abrir primeiro o subfluxo de Contrato
- nao abrir Repasse completo no mesmo passo

---

## 3. Melhor ponto de ancoragem
O melhor ponto de ancoragem inicial e a oportunidade ou venda ja existente.

Vinculo recomendado:
- `saleId` como chave principal do primeiro recorte

Motivo:
- contrato nasce depois da decisao comercial minima
- a relacao com venda ja existe
- evita criar contexto paralelo de cliente, unidade e negociacao

---

## 4. Recorte inicial recomendado
O primeiro recorte deve conter apenas:

- vinculo com `saleId`
- cadastro do contrato
- numero do contrato
- caminho ou referencia do arquivo do contrato
- status simples do contrato
- observacoes basicas

Status simples sugeridos no primeiro corte:
- `PENDENTE`
- `EMITIDO`
- `ASSINADO`

Esse recorte ja e suficiente para:
- abrir tela oficial
- abrir service oficial
- abrir backend oficial
- persistir contrato como entidade propria
- criar uso operacional real sem entrar em repasse financeiro

---

## 5. O que fica fora neste primeiro corte
Para manter a abertura controlada, ficam fora:

- repasse completo
- calendario financeiro de repasse
- workflow juridico
- anexos complexos ou versoes multiplas
- integracao com assinatura externa
- historico completo de alteracoes

---

## 6. Tela oficial inicial recomendada
Tela oficial inicial:
- rota oficial sugerida: `/jm/contracts/:saleId`

Primeira versao da tela:
- cabecalho da venda vinculada
- contexto basico do cliente e da unidade
- formulario do contrato
- estado atual do contrato

Importante:
- a tela deve ser propria do dominio
- nao deve virar extensao inflada da tela de venda

---

## 7. Naming tecnico recomendado
UI, menu e documentacao:
- Contratos e Repasse

Codigo e API:
- entidade: `Contract`
- frontend: `ContractComponent`
- frontend service: `ContractService`
- backend controller: `ContractController`
- backend service: `IContractService` / `ContractService`
- backend repository: `IContractRepository` / `ContractRepository`
- rota API: `/api/contracts`

---

## 8. Leitura pratica
O segundo recorte da Fase 3 deve abrir:

- 1 novo fluxo operacional
- 1 caminho oficial
- 1 tela oficial
- 1 service oficial
- 1 backend oficial

Mas apenas para Contrato.

Repasse deve continuar explicitamente fora deste primeiro passo.

---

## 9. Proximo passo recomendado
Estado atual apos a abertura inicial:

- rota oficial aberta: `/jm/contracts/:saleId`
- tela oficial aberta: `ContractComponent`
- service oficial aberto: `ContractService`
- backend oficial aberto:
  - `ContractController`
  - `IContractService`
  - `ContractService`
  - `IContractRepository`
  - `ContractRepository`
- persistencia propria aberta em `contracts`
- navegacao inicial aberta em Vendas

Leitura pratica:
- `saleId` ja e a chave natural do primeiro recorte
- o contrato ja nasce como registro unico por oportunidade
- repasse continua fora do escopo

Proximo passo recomendado:
1. tratar o primeiro recorte de Contrato como bom o suficiente
2. pausar o dominio ate existir necessidade operacional clara
3. so depois decidir quando abrir Repasse
