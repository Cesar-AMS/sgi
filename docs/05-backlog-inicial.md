# Backlog Inicial do Projeto

## 1. Objetivo deste documento
Este documento organiza o backlog inicial do sistema, transformando a visão de domínio, o context map e as especificações funcionais em uma ordem prática de implementação.

O objetivo é orientar a evolução do projeto com foco em:
- prioridade de negócio
- redução de risco técnico
- ganho incremental
- clareza para uso com Codex
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
2. Leads e Atendimento
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
- padronizar convenções de DTOs
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

## Fase 1 — Leads e Atendimento (MVP funcional)
Objetivo: construir o primeiro módulo central do negócio com fluxo completo e utilizável.

### Itens de backend
- criar entidade Lead
- criar entidade OrigemLead
- criar entidade LeadHistorico
- criar DTOs de request e response
- criar repository de lead
- criar service de lead
- criar endpoints de cadastro, listagem, detalhe e edição
- criar endpoint de alteração de status
- criar endpoint de registro de interação
- criar endpoint de conversão para oportunidade

### Itens de frontend
- criar tela de listagem de leads
- criar filtros por nome, origem, status, responsável e período
- criar tela de cadastro de lead
- criar tela de detalhe de lead
- criar ação de editar lead
- criar ação de alterar status
- criar timeline/histórico de interações
- criar ação de converter em oportunidade

### Itens de regra
- definir status iniciais
- validar obrigatoriedade de nome, telefone e origem
- registrar data de cadastro
- manter histórico das interações
- impedir conversão de lead sem qualificação, se regra for aplicada

### Entregáveis
- módulo funcional de Leads e Atendimento
- fluxo utilizável da entrada até conversão em oportunidade

### Prioridade
**Muito alta**

---

## Fase 2 — Vendas (MVP funcional)
Objetivo: estruturar o núcleo comercial da empresa após a entrada dos leads.

### Itens de backend
- criar entidade Oportunidade
- criar entidade Proposta
- criar entidade Venda
- criar histórico da oportunidade
- criar DTOs de vendas
- criar endpoints de oportunidade
- criar endpoint de proposta
- criar endpoint de fechamento
- criar endpoint de perda/cancelamento
- criar consulta de vendas fechadas
- criar espelho inicial de vendas

### Itens de frontend
- criar listagem de oportunidades
- criar tela de detalhe da oportunidade
- criar cadastro de oportunidade
- criar formulário de proposta
- criar alteração de status
- criar tela de vendas fechadas
- criar visualização de espelho de vendas

### Itens de regra
- oportunidade deve estar ligada a lead convertido ou cliente
- proposta deve manter histórico
- fechamento deve exigir dados mínimos
- venda fechada deve preparar integração com próximos módulos

### Entregáveis
- módulo funcional de vendas
- fluxo de oportunidade até fechamento

### Prioridade
**Muito alta**

---

## Fase 3 — Clientes
Objetivo: centralizar dados cadastrais do cliente de forma consistente.

### Itens
- criar entidade Cliente
- criar entidades auxiliares de contato e endereço
- criar listagem de clientes
- criar cadastro de cliente
- criar detalhe do cliente
- vincular cliente a lead, oportunidade e venda
- definir regra de reaproveitamento cadastral
- evitar duplicidade de cliente

### Entregáveis
- base de clientes reutilizável nos demais módulos

### Prioridade
**Alta**

---

## Fase 4 — Empreendimentos e Imóveis
Objetivo: estruturar o catálogo comercial da empresa.

### Itens
- criar entidade Empreendimento
- criar entidade Imovel/Unidade
- criar status de disponibilidade
- criar cadastro de empreendimento
- criar cadastro de unidade
- criar listagem de unidades
- permitir vínculo com oportunidade e venda
- impedir uso de unidade indisponível

### Entregáveis
- módulo de produto comercial estruturado

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
- criar entidade Cobranca
- criar entidade Parcela
- criar entidade Recebimento
- criar entidade Boleto (ou representação equivalente)
- criar listagem financeira por cliente
- criar acompanhamento de recebimentos
- criar status de inadimplência
- criar filtros financeiros

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
- criar gestão de usuários
- criar perfis de acesso
- criar permissões por módulo
- criar auditoria básica
- restringir telas e ações conforme perfil

### Entregáveis
- base de segurança e governança

### Prioridade
**Alta**
> Observação: parte disso pode ser antecipada parcialmente nas fases iniciais se já for necessária para uso real.

---

## Fase 10 — RH
Objetivo: organizar processos internos de pessoas.

### Itens
- cadastro de funcionários
- cargos
- salários
- benefícios
- folha
- estoque de uniformes

### Entregáveis
- módulo corporativo de RH

### Prioridade
**Média**

---

## Fase 11 — TI / Suporte Técnico
Objetivo: dar suporte interno e técnico à plataforma.

### Itens
- painel técnico
- chamados internos
- controle técnico de usuários/equipamentos, se aplicável
- logs operacionais
- monitoramento administrativo

### Entregáveis
- módulo corporativo de TI

### Prioridade
**Média**

---

## Fase 12 — Dashboard consolidado
Objetivo: consolidar visão gerencial da operação.

### Itens
- indicadores de leads
- indicadores de vendas
- indicadores financeiros
- indicadores de comissão
- visão resumida por perfil
- cards com métricas
- gráficos e totais consolidados

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
- padronizar DTOs
- padronizar responses
- padronizar tratamento de erro
- padronizar logs
- criar validações
- criar mapeamentos
- reduzir código duplicado
- revisar organização de services e repositories

### Frontend
- padronizar estrutura de features
- padronizar componentes reutilizáveis
- padronizar serviços HTTP
- padronizar tratamento de loading e erro
- padronizar formulários
- padronizar navegação
- melhorar consistência visual

### Banco de dados
- revisar nomes de tabelas e colunas
- revisar chaves e relacionamentos
- evitar duplicidade de entidades
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

# 6. Ordem de uso com Codex
Sugestão prática de execução com Codex:

### Etapa 1
Pedir diagnóstico do projeto atual

### Etapa 2
Pedir implementação do módulo Leads e Atendimento em pequenas partes

### Etapa 3
Revisar com base na documentação

### Etapa 4
Atualizar documentação conforme o módulo for ficando pronto

### Etapa 5
Seguir para Vendas e repetir o processo

---

# 7. Sprint sugerida inicial
Uma sprint inicial prática poderia ser:

## Sprint 1
- diagnóstico técnico do projeto
- padronização mínima
- cadastro e listagem de leads

## Sprint 2
- detalhe de lead
- alteração de status
- histórico de interação

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
- Leads e Atendimento estiver funcional
- Vendas estiver funcional
- clientes e imóveis estiverem integrados
- a arquitetura estiver mais previsível
- a documentação acompanhar a implementação
- o trabalho com Codex estiver orientado por escopo e não por improviso

---

# 9. Resumo executivo
O backlog inicial do projeto foi estruturado para seguir o fluxo real da empresa e reduzir o risco de construir funcionalidades desconectadas da operação.

A prioridade máxima está em:
- criar uma base técnica consistente
- estruturar Leads e Atendimento
- estruturar Vendas

Esses módulos devem servir como base para os demais contextos, permitindo que o sistema cresça de forma incremental, documentada e alinhada ao domínio do negócio.