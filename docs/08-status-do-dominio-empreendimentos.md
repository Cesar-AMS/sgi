# Status do Dominio - Empreendimentos

## 1. Objetivo deste documento
Este documento registra o estado atual de consolidacao do dominio **Empreendimentos**.

O objetivo e documentar:
- o que ja foi consolidado
- qual e o caminho oficial no frontend
- qual e o caminho oficial no backend
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

---

## 5. Caminho oficial atual no backend
O caminho oficial atual de Empreendimentos no backend e:

- controller oficial: `EmpreendimentoController`
- service oficial: `IEmpreendimentoService -> EmpreendimentoService`
- repository oficial: `IEmpreendimentoRepository -> EmpreendimentoRepository`
- controller oficial para construtora: `ConstrutoraController`
- service oficial para construtora: `IConstrutoraService -> ConstrutoraService`
- repository oficial para construtora: `IConstrutoraRepository -> ConstrutoraRepository`

Responsabilidades ja cobertas nesse caminho:
- listar empreendimentos
- buscar empreendimento por id
- listar unidades por empreendimento
- listar unidades ativas por empreendimento
- lookup por construtora
- criar empreendimento
- atualizar empreendimento
- soft delete e hard delete
- listar construtoras
- buscar construtora por id
- criar construtora
- atualizar construtora
- soft delete e hard delete de construtora

Os contratos HTTP e rotas atuais foram preservados nesse recorte.

---

## 6. Estado atual da consolidacao
Pela regua adotada no projeto, Empreendimentos esta assim neste momento:

- `1 caminho oficial`
  - atendido no frontend por `CadastroComponent -> EnterprisesService`
  - atendido no backend por `EmpreendimentoController -> IEmpreendimentoService -> EmpreendimentoService`
  - atendido no backend para construtora por `ConstrutoraController -> IConstrutoraService -> ConstrutoraService`
- `fluxo principal funcionando`
  - atendido para listagem, criacao e edicao do empreendimento
  - atendido no backend para consulta, manutencao e operacoes centrais do recorte
  - atendido no backend para o subfluxo principal de construtora
- `responsabilidades principais separadas`
  - atendido de forma inicial, com a tela oficial deixando de depender do `ApiService` no nucleo do fluxo
  - atendido no backend com controller, service e repository separados para empreendimento e construtora
- `divida restante documentada`
  - atendido neste documento

---

## 7. Divida restante assumida
Permanece como divida conhecida, mas nao bloqueante neste recorte:

- `ConstrutoraComponent` ainda nao foi consolidado no mesmo service oficial
- `AdminEmpreendimentoComponent` ainda segue fora do recorte principal
- `EspelhoComponent` mistura unidades com fluxo comercial e ainda nao deve ser tratado como caminho oficial de Empreendimentos
- `ApiService` ainda contem metodos de empreendimentos e construtoras por compatibilidade
- `ApartamentController` ainda segue em `Controller -> Repository`
- o backend ainda possui inconsistencias de nomenclatura como `Apartament`
- ainda existem queries interpoladas em partes do repository de Empreendimentos e Unidades
- `ConstrutoraRepository` ainda possui `HardDeleteAsync` nao implementado

---

## 8. Proximo passo recomendado
O proximo passo seguro quando Empreendimentos voltar a ser priorizado e um destes:

1. consolidar `ConstrutoraComponent` no frontend no mesmo caminho oficial, por meio de `EnterprisesService` ou de um `BuildersService`
2. abrir `Apartament` somente se houver necessidade operacional clara
3. ou encerrar Empreendimentos como bom o suficiente neste escopo atual e seguir para outro dominio mais prioritario

O melhor criterio para decidir e:
- se o uso operacional principal estiver concentrado em cadastro de empreendimento, o recorte atual pode ser pausado
- se nao houver demanda real de unidades/espelho no backend, vale pausar o dominio sem abrir `Apartament`
