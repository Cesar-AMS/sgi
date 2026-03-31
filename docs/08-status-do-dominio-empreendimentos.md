# Status do Dominio - Empreendimentos

## 1. Objetivo deste documento
Este documento registra o estado atual de consolidacao do dominio **Empreendimentos**.

O objetivo e documentar:
- o que ja foi consolidado
- qual e o caminho oficial no frontend
- o que ainda permanece como compatibilidade
- quais pendencias ainda existem
- qual deve ser o proximo passo quando Empreendimentos voltar a ser priorizado

---

## 2. Contexto do dominio
Dentro do sistema, o dominio **Empreendimentos** representa o cadastro estrutural do produto imobiliario.

Neste momento, o recorte principal consolidado e:

```text
Empreendimentos
|- Empreendimentos

EnterprisesService
  -> CadastroComponent
```

Este recorte cobre o fluxo principal de cadastro e manutencao do empreendimento.

---

## 3. Caminho oficial atual no frontend
O caminho oficial atual de Empreendimentos no frontend e:

- rota oficial: `/jm/empreendimentos`
- componente oficial: `CadastroComponent`
- service oficial: `EnterprisesService`

Responsabilidades ja cobertas nesse caminho:
- listar empreendimentos
- abrir empreendimento por id
- criar empreendimento
- atualizar empreendimento
- carregar construtoras como lookup de apoio

---

## 4. Compatibilidade mantida
Nesta fase, a consolidacao foi mantida com baixo risco.

Por isso:
- `ApiService` continua preservado
- o subfluxo de Construtora dentro de `CadastroComponent` ainda usa `ApiService`
- nao houve mudanca de contrato HTTP
- nao houve mudanca de rota
- nao houve mudanca no backend

---

## 5. Estado atual da consolidacao
Pela regua adotada no projeto, Empreendimentos esta assim neste momento:

- `1 caminho oficial`
  - atendido no frontend por `CadastroComponent -> EnterprisesService`
- `fluxo principal funcionando`
  - atendido para listagem, criacao e edicao do empreendimento
- `responsabilidades principais separadas`
  - atendido de forma inicial, com a tela oficial deixando de depender do `ApiService` no nucleo do fluxo
- `divida restante documentada`
  - atendido neste documento

---

## 6. Divida restante assumida
Permanece como divida conhecida, mas nao bloqueante neste recorte:

- `ConstrutoraComponent` ainda nao foi consolidado no mesmo service oficial
- `AdminEmpreendimentoComponent` ainda segue fora do recorte principal
- `EspelhoComponent` mistura unidades com fluxo comercial e ainda nao deve ser tratado como caminho oficial de Empreendimentos
- `ApiService` ainda contem metodos de empreendimentos e construtoras por compatibilidade
- o backend de Empreendimentos ainda nao foi consolidado com service de aplicacao dedicado

---

## 7. Proximo passo recomendado
O proximo passo seguro quando Empreendimentos voltar a ser priorizado e um destes:

1. consolidar `ConstrutoraComponent` no mesmo caminho oficial, por meio de `EnterprisesService` ou de um `BuildersService`
2. ou encerrar Empreendimentos como bom o suficiente neste escopo atual e seguir para outro dominio mais prioritario

O melhor criterio para decidir e:
- se o uso operacional principal estiver concentrado em cadastro de empreendimento, o recorte atual pode ser pausado
- se construtoras forem parte frequente da operacao, vale fazer mais um corte pequeno antes de encerrar o dominio
