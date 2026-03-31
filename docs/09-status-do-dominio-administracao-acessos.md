# Status do Dominio - Administracao e Acessos

## 1. Objetivo deste documento
Este documento registra o estado atual de consolidacao do dominio **Administracao e Acessos**.

O objetivo e documentar:
- o que ja foi consolidado
- qual e o caminho oficial atual no frontend
- o que ainda permanece como compatibilidade
- quais pendencias ainda existem
- qual deve ser o proximo passo quando o dominio voltar a ser priorizado

---

## 2. Contexto do dominio
Dentro do sistema, o dominio **Administracao e Acessos** representa a governanca operacional da plataforma.

Neste momento, o recorte principal consolidado e:

```text
Administracao
|- Filiais
|- Usuarios
|- Cargos

AdminAccessService
  -> GeraisComponent
```

Este recorte cobre o nucleo administrativo mais direto do modulo atual de configuracoes.

---

## 3. Caminho oficial atual no frontend
O caminho oficial atual de Administracao e Acessos no frontend e:

- rota atual: `/jm/settings`
- componente oficial do recorte atual: `GeraisComponent`
- service oficial do recorte atual: `AdminAccessService`

Responsabilidades ja cobertas nesse caminho:
- listar filiais
- criar filial
- editar filial
- excluir filial
- listar usuarios por status
- buscar usuario por id
- criar usuario
- atualizar usuario
- listar cargos
- buscar cargo por id
- criar cargo

---

## 4. Compatibilidade mantida
Nesta fase, a consolidacao foi mantida com baixo risco.

Por isso:
- `ApiService` continua preservado
- `GeraisComponent` continua concentrando outras abas administrativas
- `UserMenuService` continua separado para menu por usuario
- nao houve mudanca de contrato HTTP
- nao houve mudanca de rota
- nao houve mudanca no backend

---

## 5. Estado atual da consolidacao
Pela regua adotada no projeto, Administracao e Acessos esta assim neste recorte:

- `1 caminho oficial`
  - atendido de forma inicial para filiais, usuarios e cargos por `GeraisComponent -> AdminAccessService`
- `fluxo principal funcionando`
  - atendido para o nucleo de filiais, usuarios e cargos
- `responsabilidades principais separadas`
  - atendido de forma inicial, com filiais, usuarios e cargos deixando de depender diretamente do `ApiService`
- `divida restante documentada`
  - atendido neste documento

---

## 6. Divida restante assumida
Permanece como divida conhecida, mas nao bloqueante neste recorte:

- `GeraisComponent` ainda concentra muitas responsabilidades
- filiais, categorias, centro de custo, plano de contas e formas de pagamento ainda usam `ApiService`
- o fluxo de permissoes continua baseado em menu por usuario e ainda nao representa RBAC completo
- backend de usuarios ja possui service estruturado, mas cargos ainda seguem controller + repository
- ainda nao existe separacao formal de Perfis, Permissoes e overrides por usuario

---

## 7. Proximo passo recomendado
O proximo passo seguro quando Administracao e Acessos voltar a ser priorizado e um destes:

1. extrair mais um subfluxo de `GeraisComponent`, como `Filiais`
2. consolidar o fluxo de menu/permissao por usuario com um service mais explicito no frontend
3. ou encerrar este dominio como bom o suficiente neste escopo inicial e seguir para o proximo dominio prioritario

O melhor criterio para decidir e:
- se a operacao estiver mais pressionada por cadastro administrativo, vale extrair mais uma aba
- se o sistema ja estiver estavel para uso, este recorte pode ser pausado sem prejuizo imediato
