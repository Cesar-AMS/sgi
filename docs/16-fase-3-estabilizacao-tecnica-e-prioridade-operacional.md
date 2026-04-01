# Fase 3 - Abertura Controlada de Novo Dominio Operacional

## 1. Objetivo da fase
Esta fase existe para usar a base mais limpa deixada pela Fase 2 para abrir um novo fluxo operacional real no sistema.

O foco agora nao e continuar fazendo limpeza transversal por inercia.

O foco e:
- escolher um dominio de negocio prioritario
- recortar um fluxo pequeno e utilizavel
- entregar esse fluxo fim a fim
- documentar claramente o que ficou fora

---

## 2. Prioridades da fase

### Prioridade principal
Abrir um novo dominio operacional com recorte pequeno, caminho oficial e uso real.

### Prioridade secundaria
Usar a base mais limpa da Fase 2 sem perder coerencia entre frontend, backend e documentacao.

---

## 3. Como esta fase deve funcionar
Esta fase deve seguir este metodo:

1. escolher 1 dominio prioritario
2. definir 1 recorte pequeno do fluxo principal
3. abrir 1 caminho oficial
4. entregar o fluxo fim a fim
5. documentar a divida sem travar o avanco

Na pratica, isso significa:
- tela oficial
- service oficial
- backend oficial
- persistencia real
- retorno utilizavel
- sem trilhas paralelas confusas

---

## 4. O que entra nesta fase
- abrir um novo fluxo operacional real, e nao apenas fazer limpeza tecnica
- definir claramente o que entra no primeiro recorte e o que fica fora
- entregar entrada, processamento, persistencia e retorno
- usar cortes pequenos, mas subordinados a um objetivo de produto
- manter documentacao atualizada para registrar o que ja ficou bom o suficiente

---

## 5. O que fica fora desta fase
- continuar reduzindo `ApiService` por inercia
- continuar backend hygiene sem relacao com o fluxo escolhido
- reabrir dominios ja considerados bons o suficiente sem necessidade operacional clara
- abrir o dominio inteiro de uma vez
- refatoracao estrutural grande antes do primeiro fluxo real funcionar

---

## 6. Criterio de sucesso
Esta fase sera considerada concluida quando:

- existir um novo fluxo de negocio realmente utilizavel no sistema
- esse fluxo tiver caminho oficial no frontend e no backend
- a persistencia estiver funcionando
- o recorte principal estiver utilizavel de ponta a ponta
- a divida restante estiver documentada sem impedir o uso real

---

## 7. Estado de partida
Ao entrar nesta fase:

- a Fase 1 de consolidacao por dominio foi encerrada
- a Fase 2 de consolidacao transversal foi encerrada
- o frontend transversal esta bom o suficiente no escopo tratado
- o backend local terminou a Fase 2 com build limpo
- os dominios principais ja tem caminho oficial e divida documentada

---

## 8. Dominio escolhido
O primeiro dominio escolhido para abrir a Fase 3 foi:

- Analise de Perfil e Credito

Justificativa:
- vem antes de Contratos e Repasse na cadeia de valor
- conversa direto com Atendimento e Vendas
- cria base de decisao comercial antes da abertura de contrato
- reduz o risco de abrir contrato cedo demais sem trilha minima de elegibilidade

Sequencia recomendada dentro da fase:
- primeiro recorte: Analise de Perfil e Credito
- segundo recorte: Contratos e Repasse

Importante:
- o dominio nao deve ser aberto inteiro
- a fase deve comecar por um recorte minimo fim a fim

---

## 9. Primeiro recorte entregue
O primeiro recorte entregue na Fase 3 foi:

- vinculo com oportunidade
- cadastro da analise de perfil
- registro de restricoes e observacoes
- parecer da analise
- status simples:
  - pendente
  - em analise
  - aprovado
  - reprovado

Esse recorte ja foi tratado como bom o suficiente para:
- abrir caminho oficial
- criar uso real
- conectar atendimento e vendas
- deixar contratos para uma fase seguinte

---

## 10. Estado atual do primeiro recorte
O recorte minimo ja foi mapeado e o esqueleto oficial ja foi aberto.

Estado atual da abertura:

1. rota frontend oficial: `/jm/credit-analysis/:saleId`
2. componente oficial: `CreditAnalysisComponent`
3. service oficial no frontend: `CreditAnalysisService`
4. trilha oficial no backend:
   - `CreditAnalysisController`
   - `ICreditAnalysisService`
   - `CreditAnalysisService`
   - `ICreditAnalysisRepository`
   - `CreditAnalysisRepository`
5. entidade oficial: `CreditAnalysis`
6. cliente principal carregado automaticamente a partir da oportunidade
7. navegacao oficial aberta a partir da tela de venda
8. navegacao operacional tambem aberta a partir da visao geral de Vendas
9. a tela ja exibe contexto de leitura da oportunidade, resumo comercial e metadados da propria analise

Leitura pratica:
- o primeiro recorte de Credito ja pode ser tratado como suficiente nesta etapa
- o proximo movimento da Fase 3 deve abrir o segundo recorte operacional

---

## 11. Segundo recorte entregue
O segundo recorte entregue na Fase 3 foi:

- Contract

Estado atual desse segundo recorte:
- rota frontend oficial: `/jm/contracts/:saleId`
- componente oficial: `ContractComponent`
- service oficial no frontend: `ContractService`
- trilha oficial no backend:
  - `ContractController`
  - `IContractService`
  - `ContractService`
  - `IContractRepository`
  - `ContractRepository`
- entidade oficial: `Contract`
- navegacao inicial aberta a partir da tela de venda e da visao geral de Vendas
- unicidade canonicamente ancorada por `saleId`

Leitura pratica:
- o primeiro recorte de Contract ja pode ser tratado como bom o suficiente nesta etapa
- o dominio deve ficar pausado ate existir necessidade operacional clara de assinatura, arquivo real ou workflow juridico mais profundo

---

## 12. Terceiro recorte entregue
O terceiro recorte entregue na Fase 3 foi:

- Repasse

Estado atual desse terceiro recorte:
- rota frontend oficial: `/jm/constructor-transfer/:saleId`
- componente oficial: `ConstructorTransferComponent`
- service oficial no frontend: `ConstructorTransferService`
- trilha oficial no backend:
  - `ConstructorTransferController`
  - `IConstructorTransferService`
  - `ConstructorTransferService`
  - `IConstructorTransferRepository`
  - `ConstructorTransferRepository`
- entidade oficial: `ConstructorTransfer`
- navegacao inicial aberta a partir da tela de venda e da visao geral de Vendas
- unicidade ancorada por `saleId`
- valor base reaproveitado a partir de `valueToConstructor`

Leitura pratica:
- Credito ja esta bom o suficiente
- Contract ja esta bom o suficiente
- Repasse ja esta muito perto de bom o suficiente neste primeiro corte
- o proximo movimento da Fase 3 nao precisa abrir nova trilha antes de decidir se este terceiro recorte ja pode ser pausado
