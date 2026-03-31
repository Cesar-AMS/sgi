# Status do Dominio - Clientes

## 1. Objetivo deste documento
Este documento registra o estado atual de consolidacao do dominio **Clientes**.

O objetivo e documentar:
- o que ja foi consolidado
- qual e o caminho oficial no frontend
- qual e o caminho oficial no backend
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

---

## 5. Caminho oficial atual no backend
O caminho oficial atual de Clientes no backend e:

- controller oficial: `ClienteController`
- service oficial: `IClienteService -> ClienteService`
- repository oficial: `IClienteRepository -> ClienteRepository`

Responsabilidades ja cobertas nesse caminho:
- listar clientes
- buscar cliente por id
- criar cliente
- editar cliente
- excluir cliente
- buscar dependentes
- vincular dependentes

Tambem foi reduzido risco tecnico no repository com consultas parameterizadas em pontos sensiveis de busca e dependentes.

---

## 6. Estado atual da consolidacao
Pela regua adotada no projeto, Clientes esta assim neste momento:

- `1 caminho oficial`
  - atendido no frontend por `ClientListComponent -> CustomersService`
  - atendido no backend por `ClienteController -> IClienteService -> ClienteService`
- `fluxo principal funcionando`
  - atendido para listagem, criacao, edicao, exclusao e dependente no frontend e no backend
- `responsabilidades principais separadas`
  - atendido de forma inicial, com a tela oficial deixando de depender diretamente do `ApiService`
  - atendido no backend com controller, service e repository separados
- `divida restante documentada`
  - atendido neste documento

---

## 7. Divida restante assumida
Permanece como divida conhecida, mas nao bloqueante neste recorte:

- `ApiService` ainda contem metodos de cliente por compatibilidade
- ainda nao existe documento funcional especifico de Clientes como existe para Vendas
- ainda nao foi decidido se Clientes backend merece mais um corte pequeno ou se ja pode permanecer pausado
- ainda nao existe camada de validacao/autorizacao mais explicita para operacoes de cliente no backend

---

## 8. Proximo passo recomendado
O proximo passo seguro quando Clientes voltar a ser priorizado e um destes:

1. transformar `ApiService` em fachada legada de compatibilidade para cliente, como foi feito em Propostas
2. ou encerrar Clientes como bom o suficiente neste escopo atual, se a operacao nao exigir mais cortes agora
3. ou fazer um corte pequeno no backend apenas se houver necessidade operacional clara

O melhor criterio para decidir e:
- se ainda houver muitos consumidores ativos de cliente fora do caminho oficial, vale fazer a fachada
- se o fluxo oficial ja estiver sustentando o uso real, Clientes pode ser pausado com seguranca
