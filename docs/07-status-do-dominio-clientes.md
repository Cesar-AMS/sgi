# Status do Dominio - Clientes

## 1. Objetivo deste documento
Este documento registra o estado atual de consolidacao do dominio **Clientes**.

O objetivo e documentar:
- o que ja foi consolidado
- qual e o caminho oficial no frontend
- o que ainda permanece como compatibilidade
- quais pendencias ainda existem
- qual deve ser o proximo passo quando Clientes voltar a ser priorizado

---

## 2. Contexto do dominio
Dentro do sistema, o dominio **Clientes** representa a base cadastral reutilizavel pelos demais modulos comerciais.

Sua organizacao funcional atual e:

```text
Clientes
|- Gestao de Clientes

CustomersService
  -> ClientListComponent
```

---

## 3. Caminho oficial atual no frontend
O caminho oficial atual de Clientes no frontend e:

- rota oficial: `/jm/clientes`
- componente oficial: `ClientListComponent`
- service oficial: `CustomersService`

Responsabilidades ja cobertas nesse caminho:
- listar clientes
- criar cliente
- editar cliente
- excluir cliente
- carregar dependente
- vincular dependente

---

## 4. Compatibilidade mantida
Nesta fase, a consolidacao foi mantida com baixo risco.

Por isso:
- `ApiService` continua preservado
- os metodos de cliente no `ApiService` ainda nao foram removidos
- nao houve mudanca de contrato HTTP
- nao houve mudanca de rota
- nao houve mudanca no backend

---

## 5. Estado atual da consolidacao
Pela regua adotada no projeto, Clientes esta assim neste momento:

- `1 caminho oficial`
  - atendido no frontend por `ClientListComponent -> CustomersService`
- `fluxo principal funcionando`
  - atendido para listagem, criacao, edicao, exclusao e dependente
- `responsabilidades principais separadas`
  - atendido de forma inicial, com a tela oficial deixando de depender diretamente do `ApiService`
- `divida restante documentada`
  - atendido neste documento

---

## 6. Divida restante assumida
Permanece como divida conhecida, mas nao bloqueante neste recorte:

- `ApiService` ainda contem metodos de cliente por compatibilidade
- o backend de Clientes ainda nao foi consolidado com camada de aplicacao dedicada
- ainda nao existe documento funcional especifico de Clientes como existe para Vendas
- ainda nao foi decidido se Clientes ja pode ser encerrado como bom o suficiente ou se merece mais um corte pequeno

---

## 7. Proximo passo recomendado
O proximo passo seguro quando Clientes voltar a ser priorizado e um destes:

1. transformar `ApiService` em fachada legada de compatibilidade para cliente, como foi feito em Propostas
2. ou encerrar Clientes como bom o suficiente neste escopo atual, se a operacao nao exigir mais cortes agora

O melhor criterio para decidir e:
- se ainda houver muitos consumidores ativos de cliente fora do caminho oficial, vale fazer a fachada
- se a tela oficial ja estiver sustentando o uso real, Clientes pode ser pausado e o time segue para Empreendimentos
