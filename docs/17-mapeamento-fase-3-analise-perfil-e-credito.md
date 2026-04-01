# Mapeamento da Fase 3 - Analise de Perfil e Credito

## 1. Objetivo do mapeamento
Registrar onde o recorte inicial de Analise de Perfil e Credito pode ser ancorado no sistema atual, sem inventar acoplamentos desnecessarios.

Este documento existe para responder:
- onde a oportunidade sera vinculada
- qual sera a tela oficial inicial
- qual service oficial sera aberto
- qual trilha oficial do backend sera criada
- quais campos entram no primeiro recorte
- o que fica fora nesta abertura inicial

---

## 2. Leitura objetiva do estado atual
No inicio do mapeamento, nao existia um dominio real de Analise de Perfil e Credito implementado no sistema.

Os sinais encontrados eram apenas indiretos:
- `score` em [crm.model.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/store/CRM/crm.model.ts)
- `perfilRenda` em dados de Empreendimentos
- mencoes textuais a analise em propostas e espelho

Por isso, a Fase 3 abriu um fluxo novo, mas com recorte pequeno e ponto de ancoragem real no sistema.

Estado atual apos a abertura do esqueleto:
- rota dedicada
- tela dedicada
- service dedicado
- controller dedicado
- persistencia dedicada
- cliente carregado automaticamente a partir da oportunidade
- contexto de venda exibido em modo leitura
- navegacao operacional aberta em Vendas

---

## 3. Melhor ponto de ancoragem
O melhor ponto de ancoragem atual e a oportunidade em Vendas.

No frontend:
- [vendas-new.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/vendas/vendas-new/vendas-new.component.ts)
- [sales.service.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/core/services/sales.service.ts)

No backend:
- [VendaController.cs](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.API/Controllers/VendaController.cs)
- trilha atual de `Venda` ja consolidada

Motivo:
- a analise deve acontecer antes de contrato
- ela conversa direto com a oportunidade
- a venda ja possui relacao com cliente e estado comercial

---

## 4. Vinculo inicial recomendado
O recorte inicial deve se vincular a:

- `saleId` como identificador principal da oportunidade

E, quando necessario, consultar:
- cliente vinculado a oportunidade
- dados cadastrais do cliente
- observacoes da propria analise

Base real ja existente:
- [sale.mode.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/models/sale.mode.ts)
- [Cliente.cs](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.API/Entities/Cliente.cs)

Observacao importante:
- o cliente ja possui campos como `profession` e `income`
- esses campos ajudam no contexto da analise, mas nao substituem um registro proprio de analise

---

## 5. Tela oficial inicial
A recomendacao mais segura e abrir uma tela oficial propria, em vez de tentar enfiar toda a analise dentro da tela de venda.

Tela oficial inicial recomendada:
- rota oficial: `/jm/credit-analysis/:saleId`

Primeira versao da tela:
- cabecalho da oportunidade
- dados basicos do cliente
- formulario da analise
- historico simples do parecer atual
- navegacao oficial a partir da tela de venda
- contexto comercial em modo leitura
- metadados simples da propria analise

Motivo:
- evita inchar [vendas-new.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/vendas/vendas-new/vendas-new.component.ts)
- cria caminho oficial claro desde o primeiro corte

---

## 6. Service oficial recomendado no frontend
Service oficial novo:
- `CreditAnalysisService`

Responsabilidades iniciais:
- obter analise por `saleId`
- criar analise
- atualizar analise
- atualizar status e parecer

O `SalesService` pode continuar apenas como apoio para carregar a oportunidade.

Status atual:
- service ja aberto no frontend
- cliente principal da oportunidade ja e carregado automaticamente
- a tela ja exibe resumo comercial sem virar edicao de venda

---

## 7. Trilha oficial recomendada no backend
Trilha oficial inicial recomendada:

- `CreditAnalysisController`
- `ICreditAnalysisService`
- `CreditAnalysisService`
- `ICreditAnalysisRepository`
- `CreditAnalysisRepository`
- entidade propria: `CreditAnalysis`

Essa trilha deve ficar separada de `Venda`, mas vinculada a ela por `saleId`.

Status atual:
- trilha backend minima ja aberta

---

## 8. Recorte inicial do dominio
O primeiro recorte deve conter apenas:

- vinculo com oportunidade
- cadastro da analise de perfil
- registro de restricoes e observacoes
- parecer da analise
- status simples:
  - `PENDENTE`
  - `EM_ANALISE`
  - `APROVADO`
  - `REPROVADO`

Campos minimos sugeridos no primeiro recorte:
- `id`
- `saleId`
- `customerId`
- `status`
- `summary`
- `restrictions`
- `observations`
- `analystName` ou `analystUserId`
- `createdAt`
- `updatedAt`

---

## 9. O que fica fora neste primeiro corte
Para manter a abertura controlada, ficam fora:

- score automatizado
- integracao com bureaus externos
- workflow de aprovacao multipla
- anexos e documentos
- reanalise historica completa
- contrato
- repasse
- decisao financeira detalhada

---

## 10. Leitura pratica
O recorte minimo fim a fim mais coerente para abrir a Fase 3 e:

- oportunidade existente
- tela oficial de analise
- service oficial de analise
- backend oficial de analise
- persistencia propria
- status e parecer simples

Esse recorte ja permite uso real sem tentar abrir Credito inteiro de uma vez.

---

## 11. Proximo passo recomendado
Com esse mapeamento e o esqueleto prontos, o proximo passo correto e:

1. decidir se o primeiro recorte ja pode ser tratado como bom o suficiente
2. ou aplicar uma validacao pequena de dominio que agregue valor real
3. manter fora qualquer ampliacao grande de workflow, anexos ou integracoes externas
