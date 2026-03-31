# Status do Dominio - Financeiro Pos-venda

## 1. Objetivo deste documento
Este documento registra o estado atual de consolidacao do dominio **Financeiro Pos-venda**.

O objetivo e documentar:
- o que ja foi consolidado
- qual e o caminho oficial atual no frontend
- o que ainda permanece como compatibilidade
- quais pendencias ainda existem
- qual deve ser o proximo passo quando o dominio voltar a ser priorizado

---

## 2. Contexto do dominio
Dentro do sistema, o dominio **Financeiro Pos-venda** representa os fluxos financeiros operacionais que acontecem apos o fechamento comercial.

Neste momento, o recorte principal consolidado e:

```text
Financas
|- Contas a Receber
|- Contas a Pagar
|- DRE

AccountsReceivableService
  -> AccountsReceivableComponent

AccountsPayableService
  -> AccountsPayableComponent

DreService
  -> DreComponent
```

Este recorte cobre o nucleo inicial do modulo financeiro com services oficiais por subfluxo.

---

## 3. Caminho oficial atual no frontend
O caminho oficial atual de Financeiro Pos-venda no frontend e:

- rotas oficiais:
  - `/jm/financeiro/contas-receber`
  - `/jm/financeiro/contas-pagar`
  - `/jm/financeiro/dre`
- services oficiais do recorte:
  - `AccountsReceivableService`
  - `AccountsPayableService`
  - `DreService`

Responsabilidades ja cobertas nesse caminho:
- listagem e resumo de contas a receber
- criacao e baixa de contas a receber
- listagem e resumo de contas a pagar
- criacao e baixa de contas a pagar
- carregamento do DRE por periodo

---

## 4. Compatibilidade mantida
Nesta fase, a consolidacao foi mantida com baixo risco.

Por isso:
- nao houve mudanca de rota
- nao houve mudanca de contrato HTTP
- nao houve mudanca no backend
- `ApiService` continua preservado para os fluxos financeiros que ainda nao entraram no caminho oficial
- `FluxoCaixaComponent` e `ProjecaoComponent` continuam fora do recorte principal

---

## 5. Estado atual da consolidacao
Pela regua adotada no projeto, Financeiro Pos-venda esta assim neste recorte:

- `1 caminho oficial`
  - atendido no frontend para receber, pagar e DRE por services dedicados
- `fluxo principal funcionando`
  - atendido para operacao basica de contas a receber, contas a pagar e consulta do DRE
- `responsabilidades principais separadas`
  - atendido de forma inicial, com os subfluxos principais saindo do `ApiService`
- `divida restante documentada`
  - atendido neste documento

---

## 6. Divida restante assumida
Permanece como divida conhecida, mas nao bloqueante neste recorte:

- `FluxoCaixaComponent` ainda usa base local ou mock e nao possui service oficial consolidado
- `ProjecaoComponent` ainda usa base local ou mock e nao possui service oficial consolidado
- `ApiService` ainda contem metodos financeiros legados por compatibilidade
- ainda nao foi decidido se o dominio deve receber mais um corte antes de ser pausado

---

## 7. Proximo passo recomendado
O proximo passo seguro quando Financeiro Pos-venda voltar a ser priorizado e um destes:

1. consolidar `FluxoCaixaComponent` com um service oficial do dominio
2. consolidar `ProjecaoComponent` no mesmo padrao
3. ou encerrar Financeiro Pos-venda como bom o suficiente neste escopo inicial

O melhor criterio para decidir e:
- se a operacao atual depende principalmente de receber, pagar e DRE, o recorte atual ja sustenta pausa segura
- se fluxo de caixa e projecao forem decisivos no uso real, vale fazer mais um corte pequeno antes de encerrar o dominio
