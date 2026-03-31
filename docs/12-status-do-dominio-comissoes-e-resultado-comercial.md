# Status do Dominio - Comissoes e Resultado Comercial

## 1. Objetivo deste documento
Este documento registra o estado atual de consolidacao do dominio **Comissoes e Resultado Comercial**.

O objetivo e documentar:
- o que ja foi consolidado
- qual e o caminho oficial atual no frontend
- qual e o caminho oficial atual no backend
- o que ainda permanece como compatibilidade
- quais pendencias ainda existem
- qual deve ser o proximo passo quando o dominio voltar a ser priorizado

---

## 2. Contexto do dominio
Dentro do sistema, o dominio **Comissoes e Resultado Comercial** representa os fluxos de acompanhamento de resultado por corretor, gerente e composicao comercial.

Neste momento, o recorte principal consolidado e:

```text
Comissoes e Resultado Comercial
|- Painel por corretor e gerente

CommercialResultsService
  -> CorretorComponent
```

Este recorte cobre a trilha operacional mais concreta ja existente no frontend para resultado comercial.

---

## 3. Caminho oficial atual no frontend
O caminho oficial atual de Comissoes e Resultado Comercial no frontend e:

- rota oficial do recorte: `/jm/vendas/corretor`
- componente oficial do recorte: `CorretorComponent`
- service oficial do recorte: `CommercialResultsService`

Responsabilidades ja cobertas nesse caminho:
- carregar resumo comercial por ano, mes e gerente
- listar salarios de corretores
- listar salarios de gerentes
- listar comissoes de corretores
- listar comissoes de gerentes
- listar despesas por filial
- exportar o painel em PDF

---

## 4. Compatibilidade mantida
Nesta fase, a consolidacao foi mantida com baixo risco.

Por isso:
- nao houve mudanca de rota
- nao houve mudanca de contrato HTTP
- `ApiService` continua preservado
- `ComissoesService` continua existindo para a trilha mockada de apresentacao
- `ViewCorretorComponent` ainda segue fora do caminho oficial

---

## 5. Caminho oficial atual no backend
O caminho oficial atual de Comissoes e Resultado Comercial no backend e:

- controller oficial do recorte: `DashboardSalesController`
- service oficial do recorte: `IDashboardSalesService -> DashboardSalesService`
- repository oficial do recorte: `IDashboardSalesRepository -> DashboardSalesRepository`

Responsabilidades ja cobertas nesse caminho:
- vendas por mes
- vendas por corretor
- vendas por gerente
- vendas por coordenador
- vendas por filial

Os contratos HTTP e rotas atuais foram preservados nesse recorte.

---

## 6. Estado atual da consolidacao
Pela regua adotada no projeto, Comissoes e Resultado Comercial esta assim neste recorte:

- `1 caminho oficial`
  - atendido no frontend por `CorretorComponent -> CommercialResultsService`
  - atendido no backend por `DashboardSalesController -> IDashboardSalesService -> DashboardSalesService`
- `fluxo principal funcionando`
  - atendido para carga e visualizacao do painel comercial do recorte
  - atendido no backend para consultas agregadas do painel
- `responsabilidades principais separadas`
  - atendido de forma inicial, com o fluxo oficial deixando de depender diretamente do `ApiService`
  - atendido no backend com controller, service e repository separados
- `divida restante documentada`
  - atendido neste documento

---

## 7. Divida restante assumida
Permanece como divida conhecida, mas nao bloqueante neste recorte:

- `ViewCorretorComponent` ainda usa dados locais e nao participa do caminho oficial
- `ComissoesService` ainda sustenta um fluxo paralelo mockado de apresentacao
- o backend do dominio ainda cobre so o dashboard agregado do recorte
- ainda nao foi decidido se o dominio deve receber um segundo corte antes de ser pausado

---

## 8. Proximo passo recomendado
O proximo passo seguro quando Comissoes e Resultado Comercial voltar a ser priorizado e um destes:

1. consolidar `ViewCorretorComponent` no mesmo caminho oficial
2. revisar a trilha paralela de `ComissoesService` e decidir se ela continua como apoio de apresentacao
3. ou encerrar o dominio como bom o suficiente neste escopo inicial

O melhor criterio para decidir e:
- se a operacao atual depende principalmente do painel por corretor e gerente, o recorte atual ja sustenta pausa segura
- se houver necessidade real de detalhamento individual ou apresentacao executiva integrada, vale mais um corte pequeno antes de encerrar o dominio
