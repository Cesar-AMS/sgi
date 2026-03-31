# Status do Dominio - RH

## 1. Objetivo deste documento
Este documento registra o estado atual de consolidacao do dominio **RH**.

O objetivo e documentar:
- o que ja foi consolidado
- qual e o caminho oficial atual no frontend
- o que ainda permanece como compatibilidade
- quais pendencias ainda existem
- qual deve ser o proximo passo quando o dominio voltar a ser priorizado

---

## 2. Contexto do dominio
Dentro do sistema, o dominio **RH** representa os fluxos internos de pessoas ja visiveis na navegacao atual.

Neste momento, o recorte principal consolidado e:

```text
RH
|- Controle de Funcionarios
|- Controle de Faltas
|- Folha de Pagamentos
|- Ferias
|- Controle de Uniforme

HrService
  -> ControleFuncionariosComponent
  -> ControleFaltasComponent
  -> FolhaPagamentosComponent
  -> FeriasComponent
  -> ControleUniformeComponent
```

Este recorte cobre a camada frontend inicial do dominio com um caminho oficial unico para os dados exibidos nessas telas.

---

## 3. Caminho oficial atual no frontend
O caminho oficial atual de RH no frontend e:

- rotas oficiais:
  - `/jm/rh/controle-funcionarios`
  - `/jm/rh/controle-faltas`
  - `/jm/rh/folha-pagamentos`
  - `/jm/rh/ferias`
  - `/jm/rh/controle-uniforme`
- service oficial do recorte: `HrService`

Responsabilidades ja cobertas nesse caminho:
- listar dados de controle de funcionarios
- listar dados de faltas
- listar dados de folha
- listar dados de ferias
- listar dados de uniformes

---

## 4. Compatibilidade mantida
Nesta fase, a consolidacao foi mantida com baixo risco.

Por isso:
- nao houve mudanca de rota
- nao houve mudanca de contrato HTTP
- nao houve mudanca no backend
- o recorte atual continua baseado em dados mockados no frontend
- o dominio ainda nao depende de service HTTP dedicado

---

## 5. Estado atual da consolidacao
Pela regua adotada no projeto, RH esta assim neste recorte:

- `1 caminho oficial`
  - atendido no frontend por `HrService` consumido pelas telas oficiais do modulo
- `fluxo principal funcionando`
  - atendido para exibicao e navegacao das telas principais do dominio
- `responsabilidades principais separadas`
  - atendido de forma inicial, com os dados deixando de ficar espalhados pelos componentes
- `divida restante documentada`
  - atendido neste documento

---

## 6. Divida restante assumida
Permanece como divida conhecida, mas nao bloqueante neste recorte:

- o dominio ainda nao possui backend oficial dedicado para RH
- os dados atuais sao mockados e centralizados no frontend
- ainda nao existe definicao de persistencia para faltas, folha, ferias e uniformes
- ainda nao foi decidido se RH deve receber um segundo corte antes de ser pausado

---

## 7. Proximo passo recomendado
O proximo passo seguro quando RH voltar a ser priorizado e um destes:

1. documentar RH como bom o suficiente neste escopo atual e pausar o dominio
2. fazer mais um corte pequeno para separar melhor um subfluxo especifico, como faltas ou folha
3. iniciar a base backend do dominio somente quando houver necessidade operacional concreta

O melhor criterio para decidir e:
- se o objetivo imediato for arquitetura e navegacao, o recorte atual ja sustenta pausa segura
- se a operacao precisar registrar dados reais de RH, o proximo passo deve ser criar a primeira trilha backend do dominio
