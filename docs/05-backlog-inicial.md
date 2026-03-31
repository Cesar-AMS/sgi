# Backlog Inicial do Projeto

## 1. Objetivo deste documento
Este documento organiza o backlog inicial do sistema, transformando a visão de domínio, o context map e as especificações funcionais em uma ordem prática de implementação.

O objetivo é orientar a evolução do projeto com foco em:
- prioridade de negócio
- redução de risco técnico
- ganho incremental
- clareza para execução
- documentação alinhada com implementação

---

## 2. Critérios de priorização
A ordem de prioridade deste backlog considera:

- impacto direto no negócio
- dependência entre módulos
- necessidade de base estrutural
- valor prático para a operação
- redução de retrabalho futuro

---

## 3. Macroordem de implementação
A implementação sugerida para o sistema é:

1. Base técnica e padronização
2. Atendimento
3. Vendas
4. Clientes
5. Empreendimentos e Imóveis
6. Análise de Perfil e Crédito
7. Contratos e Repasse
8. Financeiro Pós-venda
9. Comissões e Resultado Comercial
10. Administração e Acessos
11. RH
12. TI / Suporte Técnico
13. Dashboard consolidado

---

# 4. Backlog por fase

## Fase 0 — Descoberta e padronização técnica
Objetivo: entender o estado atual do projeto e criar base consistente para evolução.

### Itens
- mapear estrutura atual do frontend Angular
- mapear estrutura atual do backend .NET
- mapear endpoints existentes
- mapear tabelas principais do banco MySQL
- identificar módulos prontos, incompletos e duplicados
- identificar inconsistências de nomenclatura
- padronizar convenções básicas de pastas
- padronizar convenções de contratos
- padronizar convenções de rotas
- definir padrão de retorno da API
- definir padrão de tratamento de erro

### Entregáveis
- diagnóstico técnico do projeto atual
- lista de problemas de estrutura
- convenções iniciais documentadas
- base estável para iniciar módulos

### Prioridade
**Muito alta**

---

## Fase 1 — Atendimento (MVP funcional)
Objetivo: construir o primeiro módulo central do negócio com fluxo completo e utilizável.

### Itens de backend
- criar ou consolidar entidade Lead
- consolidar OrigemLead
- consolidar histórico de lead
- consolidar contratos de request e response
- consolidar repository de lead
- consolidar service de lead
- consolidar endpoints de cadastro, listagem, detalhe e edição
- consolidar endpoint de alteração de status
- consolidar endpoint de registro de interação
- consolidar endpoint de agendamento
- consolidar endpoint de atualização de status de agendamento
- consolidar endpoint de conversão para oportunidade

### Itens de frontend
- consolidar tela de listagem de leads
- consolidar filtros por nome, origem, status, responsável e período
- consolidar tela de cadastro de lead
- consolidar tela de detalhe de lead
- consolidar ação de editar lead
- consolidar ação de alterar status
- consolidar timeline/histórico de interações
- consolidar fluxo de agendamento
- consolidar entrada de navegação em:
  - Atendimento
    - Leads
      - Listagem
    - Agendamento

### Itens de regra
- definir status iniciais
- validar obrigatoriedade de nome, telefone e origem
- registrar data de cadastro
- manter histórico das interações
- manter agendamentos vinculados ao lead
- impedir conversão de lead sem qualificação, se a regra for aplicada

### Entregáveis
- módulo funcional de Atendimento
- fluxo utilizável da entrada até conversão em oportunidade
- caminho oficial consolidado de Leads
- agendamento operacional integrado ao atendimento

### Prioridade
**Muito alta**

---

## Fase 2 — Vendas (MVP funcional)
Objetivo: estruturar o núcleo comercial da empresa após a entrada dos leads.

### Itens de backend
- consolidar entidade Oportunidade
- consolidar entidade Proposta
- consolidar entidade Venda
- consolidar histórico da oportunidade
- consolidar contratos de vendas
- consolidar endpoints de oportunidade
- consolidar endpoint de proposta
- consolidar endpoint de fechamento
- consolidar endpoint de perda/cancelamento
- consolidar consulta de vendas fechadas
- consolidar espelho inicial de vendas

### Itens de frontend
- consolidar listagem de oportunidades
- consolidar tela de detalhe da oportunidade
- consolidar cadastro de oportunidade
- consolidar formulário de proposta
- consolidar alteração de status
- consolidar tela de vendas fechadas
- consolidar visualização de espelho de vendas

### Itens de regra
- oportunidade deve estar ligada a lead convertido ou cliente
- proposta deve manter histórico
- fechamento deve exigir dados mínimos
- venda fechada deve preparar integração com próximos módulos

### Entregáveis
- módulo funcional de vendas
- fluxo de oportunidade até fechamento

### Estado atual do recorte principal
O recorte principal de Vendas já possui um caminho oficial inicial no frontend:
- listagem oficial em `VisaoGeralComponent`
- criação, detalhe e edição oficiais em `VendasNewComponent`
- `SalesService` como service oficial do fluxo principal
- alteração de status já explícita no detalhe oficial
- fechamento inicial já explícito no detalhe oficial

Dívida assumida e documentada nesta fase:
- `PropostasComponent` já é a trilha oficial de propostas
- `PropostaComponent` ainda existe como legado temporário
- `ApiService` ficou apenas como fachada de compatibilidade para propostas
- criação ainda acoplada ao endpoint `api/Financial/sales`
- backend ainda não possui endpoint explícito de fechamento

Conclusão deste recorte:
- o fluxo principal de Vendas já pode ser considerado bom o suficiente neste escopo
- próximos cortes em Vendas só devem acontecer se houver necessidade operacional clara

### Prioridade
**Muito alta**

---

## Fase 3 — Clientes
Objetivo: centralizar dados cadastrais do cliente de forma consistente.

### Itens
- consolidar entidade Cliente
- consolidar estruturas auxiliares de contato e endereço
- consolidar listagem de clientes
- consolidar cadastro de cliente
- consolidar detalhe do cliente
- vincular cliente a lead, oportunidade e venda
- definir regra de reaproveitamento cadastral
- evitar duplicidade de cliente

### Entregáveis
- base de clientes reutilizável nos demais módulos

### Estado atual do recorte principal
O recorte inicial de Clientes já possui um caminho oficial no frontend:
- rota oficial em `/jm/clientes`
- componente oficial em `ClientListComponent`
- `CustomersService` como service oficial do fluxo principal

Fluxos já cobertos nesse caminho:
- listagem de clientes
- criação
- edição
- exclusão
- gestão básica de dependente

Dívida assumida e documentada nesta fase:
- `ApiService` ainda mantém métodos de cliente por compatibilidade
- backend de Clientes ainda não foi consolidado com service de aplicação dedicado
- ainda não existe um documento funcional específico de Clientes no mesmo nível de Vendas

Próximo corte recomendado dentro de Clientes:
- decidir se vale transformar `ApiService` em fachada legada de compatibilidade para cliente
- ou encerrar Clientes como bom o suficiente neste escopo atual

### Prioridade
**Alta**

---

## Fase 4 — Empreendimentos e Imóveis
Objetivo: estruturar o catálogo comercial da empresa.

### Itens
- consolidar entidade Empreendimento
- consolidar entidade Imovel/Unidade
- padronizar nomenclatura do domínio
- consolidar status de disponibilidade
- consolidar cadastro de empreendimento
- consolidar cadastro de unidade
- consolidar listagem de unidades
- permitir vínculo com oportunidade e venda
- impedir uso de unidade indisponível

### Entregáveis
- módulo de produto comercial estruturado

### Estado atual do recorte principal
O recorte inicial de Empreendimentos já possui um caminho oficial no frontend:
- rota oficial em `/jm/empreendimentos`
- componente oficial em `CadastroComponent`
- `EnterprisesService` como service oficial do fluxo principal

Fluxos já cobertos nesse caminho:
- listagem de empreendimentos
- criação
- edição
- carregamento do empreendimento por id

Dívida assumida e documentada nesta fase:
- o subfluxo de Construtora ainda não foi consolidado no mesmo caminho oficial
- `AdminEmpreendimentoComponent` e `EspelhoComponent` continuam fora do recorte principal
- `ApiService` ainda mantém métodos de empreendimentos e construtoras por compatibilidade
- backend de Empreendimentos ainda não foi consolidado com service de aplicação dedicado

Próximo corte recomendado dentro de Empreendimentos:
- decidir se vale consolidar `ConstrutoraComponent`
- ou encerrar Empreendimentos como bom o suficiente neste escopo atual

### Prioridade
**Alta**

---

## Fase 5 — Análise de Perfil e Crédito
Objetivo: representar no sistema o diferencial competitivo da empresa.

### Itens
- criar entidade AnalisePerfil
- criar entidade Simulacao
- criar entidade RestricaoFinanceira
- criar tela de análise de perfil
- registrar observações e tratativas
- permitir simulações
- permitir parecer comercial
- permitir associação com oportunidade

### Regras importantes
- cliente com restrição não é automaticamente eliminado
- sistema deve permitir análise contextual
- proposta pode ser personalizada conforme perfil

### Entregáveis
- módulo estratégico alinhado ao diferencial da empresa

### Prioridade
**Alta**

---

## Fase 6 — Contratos e Repasse
Objetivo: formalizar a venda após o fechamento comercial.

### Itens
- criar entidade Contrato
- criar entidade Documento
- criar entidade Repasse
- criar controle de pendências
- criar tela de acompanhamento contratual
- permitir vínculo com venda fechada
- permitir status documental
- permitir acompanhamento de repasse

### Entregáveis
- início da formalização integrada no sistema

### Prioridade
**Alta**

---

## Fase 7 — Financeiro Pós-venda
Objetivo: controlar a parte financeira após o fechamento.

### Itens
- consolidar entidade Cobranca
- consolidar entidade Parcela
- consolidar entidade Recebimento
- consolidar representação de boleto
- consolidar listagem financeira por cliente
- consolidar acompanhamento de recebimentos
- consolidar status de inadimplência
- consolidar filtros financeiros
- reduzir duplicidade entre trilhas financeiras paralelas

### Entregáveis
- módulo inicial de pós-venda financeiro

### Prioridade
**Alta**

---

## Fase 8 — Comissões e Resultado Comercial
Objetivo: consolidar resultado comercial e remuneração.

### Itens
- criar entidade Comissao
- criar regra de comissão
- criar tela de espelho de vendas
- criar cálculo inicial de comissão
- permitir visão por vendedor
- permitir visão por gerente
- consolidar resultado comercial

### Entregáveis
- módulo inicial de comissões
- espelho de vendas integrado

### Prioridade
**Média/Alta**

---

## Fase 9 — Administração e Acessos
Objetivo: estruturar governança da plataforma.

### Itens
- consolidar gestão de usuários
- consolidar perfis de acesso
- consolidar permissões por módulo
- consolidar auditoria básica
- restringir telas e ações conforme perfil

### Entregáveis
- base de segurança e governança

### Estado atual do recorte principal
O recorte inicial de Administração e Acessos já possui um caminho oficial no frontend para o núcleo de filiais, usuários e cargos:
- rota atual em `/jm/settings`
- componente oficial do recorte em `GeraisComponent`
- `AdminAccessService` como service oficial do núcleo administrativo inicial

Fluxos já cobertos nesse caminho:
- listagem de filiais
- criação, edição e exclusão de filial
- listagem de usuários por status
- criação e edição de usuário
- listagem de cargos
- criação e edição básica de cargo

Dívida assumida e documentada nesta fase:
- `GeraisComponent` ainda concentra muitas abas e responsabilidades
- `ApiService` ainda mantém os demais fluxos administrativos por compatibilidade
- o sistema ainda não possui consolidação completa de Perfis, Permissões e RBAC real neste domínio

Próximo corte recomendado dentro de Administração e Acessos:
- decidir se vale extrair mais uma aba de `GeraisComponent`
- ou encerrar este recorte inicial como bom o suficiente por agora

### Prioridade
**Alta**
> Observação: parte disso pode ser antecipada parcialmente nas fases iniciais se já for necessária para uso real.

---

## Fase 10 — RH
Objetivo: organizar processos internos de pessoas.

### Itens
- consolidar cadastro de funcionários
- consolidar cargos
- consolidar salários
- consolidar benefícios
- consolidar folha
- consolidar estoque de uniformes

### Entregáveis
- módulo corporativo de RH

### Prioridade
**Média**

---

## Fase 11 — TI / Suporte Técnico
Objetivo: dar suporte interno e técnico à plataforma.

### Itens
- consolidar painel técnico
- consolidar chamados internos
- consolidar controle técnico de usuários/equipamentos, se aplicável
- consolidar logs operacionais
- consolidar monitoramento administrativo

### Entregáveis
- módulo corporativo de TI

### Prioridade
**Média**

---

## Fase 12 — Dashboard consolidado
Objetivo: consolidar visão gerencial da operação.

### Itens
- consolidar indicadores de atendimento
- consolidar indicadores de vendas
- consolidar indicadores financeiros
- consolidar indicadores de comissão
- consolidar visão resumida por perfil
- consolidar cards com métricas
- consolidar gráficos e totais gerais

### Regra importante
O dashboard deve **consumir dados dos módulos**, não centralizar a lógica deles.

### Entregáveis
- painel consolidado e gerencial

### Prioridade
**Média**

---

# 5. Backlog técnico transversal

## 5.1 Itens técnicos obrigatórios
Esses itens devem acontecer ao longo das fases, e não apenas em uma etapa isolada.

### Backend
- padronizar contratos
- padronizar responses
- padronizar tratamento de erro
- padronizar logs
- criar validações
- criar mapeamentos
- reduzir código duplicado
- revisar organização de services e repositories
- separar controller, service e repository nos domínios principais

### Frontend
- padronizar estrutura dos domínios
- padronizar componentes reutilizáveis
- padronizar serviços HTTP por domínio
- padronizar tratamento de loading e erro
- padronizar formulários
- padronizar navegação
- melhorar consistência visual

### Banco de dados
- revisar nomes de tabelas e colunas
- revisar chaves e relacionamentos
- evitar duplicidade de estruturas
- garantir integridade mínima dos vínculos principais

---

## 5.2 Itens de qualidade
- revisar nomenclatura em português ou inglês e padronizar
- evitar controllers inchados
- evitar regra de negócio em repository
- evitar tela com lógica excessiva
- garantir rastreabilidade em mudanças críticas
- documentar decisões relevantes

---

# 6. Regra de encerramento por domínio
Um domínio deve ser considerado bom o suficiente para avançar quando atingir estes 4 pontos:

- **1 caminho oficial**
- **fluxo principal funcionando**
- **responsabilidades principais separadas**
- **dívida restante documentada**

### Interpretação prática
Isso significa que o time não deve buscar perfeição antes de seguir para o próximo módulo.

Se o domínio já possui:
- uma rota/tela/serviço/caminho oficial
- o fluxo principal funcionando
- separação mínima entre responsabilidades
- pendências registradas

então ele pode ser considerado consolidado o suficiente para continuar a evolução do sistema.

---

# 7. Sprint sugerida inicial
Uma sprint inicial prática poderia ser:

## Sprint 1
- diagnóstico técnico do projeto
- padronização mínima
- consolidação de Atendimento > Leads > Listagem

## Sprint 2
- detalhe de lead
- alteração de status
- histórico de interação
- agendamento

## Sprint 3
- conversão em oportunidade
- estrutura inicial de vendas
- cadastro e listagem de oportunidade

## Sprint 4
- proposta
- fechamento
- vendas fechadas

---

# 8. Critérios de sucesso do backlog inicial
O backlog inicial será considerado bem executado se:

- o sistema tiver uma base modular mais clara
- Atendimento estiver funcional
- Vendas estiver funcional
- clientes e imóveis estiverem integrados
- a arquitetura estiver mais previsível
- a documentação acompanhar a implementação
- os domínios avançarem sem refatoração infinita

---

## 8.1 Atualizacao incremental - RH
O dominio de RH ja possui um recorte inicial consolidado no frontend.

Caminho oficial atual:
- rotas oficiais em:
  - `/jm/rh/controle-funcionarios`
  - `/jm/rh/controle-faltas`
  - `/jm/rh/folha-pagamentos`
  - `/jm/rh/ferias`
  - `/jm/rh/controle-uniforme`
- `HrService` como service oficial do recorte

Fluxos ja cobertos:
- controle de funcionarios
- controle de faltas
- folha de pagamentos
- ferias
- controle de uniforme

Divida assumida:
- dominio ainda sem backend oficial dedicado
- dados ainda mockados no frontend
- persistencia real ainda nao definida

Proximo corte recomendado:
- decidir se RH ja pode ser pausado como bom o suficiente
- ou fazer mais um corte pequeno em um subfluxo especifico quando houver necessidade operacional

## 8.2 Atualizacao incremental - Financeiro Pos-venda
O dominio de Financeiro Pos-venda ja possui um recorte inicial consolidado no frontend.

Caminho oficial atual:
- rotas oficiais em:
  - `/jm/financeiro/contas-receber`
  - `/jm/financeiro/contas-pagar`
  - `/jm/financeiro/dre`
- services oficiais do recorte:
  - `AccountsReceivableService`
  - `AccountsPayableService`
  - `DreService`

Fluxos ja cobertos:
- contas a receber
- contas a pagar
- DRE por periodo

Divida assumida:
- fluxo de caixa ainda fora do caminho oficial
- projecao ainda fora do caminho oficial
- `ApiService` ainda mantem fluxos financeiros legados por compatibilidade

Proximo corte recomendado:
- decidir se o dominio ja pode ser pausado como bom o suficiente
- ou fazer mais um corte pequeno em fluxo de caixa ou projecao

## 8.3 Atualizacao incremental - Comissoes e Resultado Comercial
O dominio de Comissoes e Resultado Comercial ja possui um recorte inicial consolidado no frontend.

Caminho oficial atual:
- rota oficial em `/jm/vendas/corretor`
- componente oficial do recorte em `CorretorComponent`
- `CommercialResultsService` como service oficial do recorte

Fluxos ja cobertos:
- painel comercial por mes e gerente
- salarios de corretores e gerentes
- comissoes de corretores e gerentes
- despesas por filial
- exportacao em PDF

Divida assumida:
- `ViewCorretorComponent` ainda fora do caminho oficial
- `ComissoesService` ainda sustenta uma trilha paralela mockada de apresentacao

Proximo corte recomendado:
- decidir se vale consolidar `ViewCorretorComponent`
- ou encerrar o dominio como bom o suficiente neste escopo atual

## 8.4 Atualizacao incremental - Administracao e Acessos no backend
O dominio de Administracao e Acessos avancou tambem no backend, sem mudanca de contrato HTTP.

Caminho oficial atual no backend para o recorte:
- `UsuarioController -> IUsuarioService -> UsuarioService`
- `CargoController -> ICargoService -> CargoService`
- `FilialController -> IFilialService -> FilialService`

Fluxos ja cobertos:
- usuarios
- cargos
- filiais
- formas de pagamento

Divida assumida:
- o restante do dominio administrativo ainda nao segue o mesmo padrao de service
- RBAC real completo ainda nao foi consolidado

Proximo corte recomendado:
- decidir se vale seguir no backend de Administracao e Acessos
- ou documentar o recorte atual como suficiente antes de abrir outro backend

# 9. Resumo executivo
O backlog inicial do projeto foi estruturado para seguir o fluxo real da empresa e reduzir o risco de construir funcionalidades desconectadas da operação.

A prioridade máxima está em:
- criar uma base técnica consistente
- estruturar Atendimento
- estruturar Vendas

Esses módulos devem servir como base para os demais contextos, permitindo que o sistema cresça de forma incremental, documentada e alinhada ao domínio do negócio.

