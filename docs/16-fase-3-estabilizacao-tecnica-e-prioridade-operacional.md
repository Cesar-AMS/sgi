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
O dominio escolhido para abrir a Fase 3 e:

- Analise de Perfil e Credito

Justificativa:
- vem antes de Contratos e Repasse na cadeia de valor
- conversa direto com Atendimento e Vendas
- cria base de decisao comercial antes da abertura de contrato
- reduz o risco de abrir contrato cedo demais sem trilha minima de elegibilidade

Ordem recomendada:
- Fase 3: Analise de Perfil e Credito
- fase seguinte: Contratos e Repasse

Importante:
- o dominio nao deve ser aberto inteiro
- a fase deve comecar por um recorte minimo fim a fim

---

## 9. Recorte inicial recomendado
O recorte inicial recomendado para abrir o dominio e:

- vinculo com oportunidade
- cadastro da analise de perfil
- registro de restricoes e observacoes
- parecer da analise
- status simples:
  - pendente
  - em analise
  - aprovado
  - reprovado

Esse recorte ja e suficiente para:
- abrir caminho oficial
- criar uso real
- conectar atendimento e vendas
- deixar contratos para uma fase seguinte

---

## 10. Proximo passo recomendado
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

Proximo passo recomendado:
- enriquecer o primeiro fluxo de uso real sem ampliar demais o escopo inicial
