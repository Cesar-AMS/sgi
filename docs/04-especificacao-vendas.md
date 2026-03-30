# Especificação Funcional — Vendas

## 1. Objetivo deste documento
Este documento descreve o módulo **Vendas**, responsável por conduzir a oportunidade comercial até o fechamento da venda de um imóvel.

O objetivo é definir:
- a finalidade do módulo
- suas responsabilidades
- os fluxos principais
- os dados envolvidos
- as regras de negócio iniciais
- a base para implementação no frontend e backend

---

## 2. Contexto no negócio
O módulo de Vendas é o núcleo da geração de receita da empresa.

A empresa atua principalmente com:
- venda de imóveis
- empreendimentos próprios
- comissão comercial
- atendimento consultivo e personalizado
- fechamento presencial

Na operação atual:
- o lead entra por múltiplos canais
- evolui no atendimento
- quando qualificado, segue para negociação
- a proposta acontece presencialmente
- o fechamento também acontece presencialmente
- depois disso, a operação segue para contrato, repasse e financeiro pós-venda

---

## 3. Objetivo do módulo
O módulo deve permitir que a empresa:

- acompanhe oportunidades comerciais
- registre propostas
- relacione cliente, imóvel e vendedor
- acompanhe negociação
- registre o fechamento da venda
- alimente espelho de vendas e comissão
- encaminhe a venda para formalização contratual

---

## 4. Escopo do módulo
Este módulo cobre:

- criação de oportunidade comercial
- vínculo com lead qualificado
- vínculo com cliente
- vínculo com empreendimento/unidade/imóvel
- proposta comercial
- negociação
- status da venda
- fechamento da venda
- espelho de vendas

Este módulo **não** cobre:
- emissão de contrato
- gestão documental detalhada
- repasse financeiro contratual
- boletos e cobranças pós-venda
- folha de pagamento
- parametrizações administrativas globais

---

## 5. Principais atores
Os principais usuários do módulo são:

- vendedor
- gerente
- coordenador
- administrador
- diretoria (consulta/indicadores)

---

## 6. Objetos principais do módulo

### 6.1 Oportunidade
Representa uma chance comercial ativa vinculada a um lead ou cliente.

### 6.2 Proposta
Representa a oferta comercial apresentada ao cliente.

### 6.3 Venda
Representa o fechamento efetivo do negócio.

### 6.4 Reserva
Representa o bloqueio ou intenção avançada sobre determinada unidade, quando aplicável.

### 6.5 Espelho de Vendas
Representa a consolidação operacional/comercial das vendas realizadas.

---

## 7. Dados principais da oportunidade

### 7.1 Dados mínimos sugeridos
- lead de origem (quando houver)
- cliente
- vendedor responsável
- empreendimento
- unidade/imóvel
- data de abertura
- status atual
- observações comerciais

---

## 7.2 Dados comerciais sugeridos
- valor de tabela
- valor ofertado
- desconto aplicado
- tipo de proposta
- condição de pagamento
- observação de negociação
- gerente responsável
- origem comercial

---

## 8. Entrada no módulo de Vendas
A entrada no módulo de vendas pode ocorrer por:

- conversão de lead qualificado
- abertura manual de oportunidade por usuário com permissão

### Regra sugerida
Sempre que possível, a venda deve nascer de uma conversão de lead, para manter rastreabilidade do funil.

---

## 9. Status da oportunidade/venda
Sugestão inicial de status:

- Em negociação
- Proposta apresentada
- Aguardando retorno
- Em análise de perfil
- Aprovada para fechamento
- Fechada
- Cancelada
- Perdida

---

## 10. Regras gerais de status
- uma oportunidade criada entra inicialmente em **Em negociação**
- quando houver proposta formal, pode ir para **Proposta apresentada**
- se depender de resposta do cliente, pode ir para **Aguardando retorno**
- quando depender de validação comercial/perfil, pode ir para **Em análise de perfil**
- quando estiver pronta para conclusão presencial, pode ir para **Aprovada para fechamento**
- após conclusão, vai para **Fechada**
- caso a negociação seja encerrada sem venda, vai para **Perdida**
- se houver desistência, problema operacional ou inviabilização, pode ir para **Cancelada**

---

## 11. Regras de negócio iniciais

### 11.1 Criação de oportunidade
- a oportunidade deve estar vinculada a cliente ou lead convertido
- a oportunidade deve possuir vendedor responsável
- a oportunidade deve possuir data de abertura
- a oportunidade deve iniciar com status válido

---

### 11.2 Proposta
- uma oportunidade pode ter uma ou mais propostas ao longo da negociação
- a proposta deve registrar valor, condição e observações
- a proposta deve ficar associada à oportunidade
- a proposta deve manter histórico para rastreabilidade

---

### 11.3 Vínculo com empreendimento/unidade
- a venda deve estar vinculada a um produto comercial válido
- a unidade/imóvel deve existir no contexto de Empreendimentos e Imóveis
- a oportunidade não deve avançar com produto inexistente
- uma unidade reservada ou vendida não deve ser oferecida como disponível

---

### 11.4 Fechamento
- o fechamento é presencial
- uma venda fechada deve registrar data do fechamento
- uma venda fechada deve registrar responsáveis envolvidos
- uma venda fechada deve disparar efeitos para contratos, financeiro e comissão

---

### 11.5 Perda ou cancelamento
- uma oportunidade perdida não deve ser apagada
- motivo de perda/cancelamento deve ser registrado
- oportunidades perdidas devem continuar acessíveis para consulta e análise comercial

---

## 12. Casos de uso principais

### 12.1 Criar oportunidade
**Ator:** vendedor / gerente / administrador

**Fluxo básico:**
1. usuário acessa módulo de vendas
2. seleciona cliente ou lead convertido
3. seleciona empreendimento/unidade
4. define vendedor responsável
5. adiciona observação inicial
6. salva
7. sistema cria oportunidade

---

### 12.2 Registrar proposta
**Ator:** vendedor / gerente

**Fluxo básico:**
1. usuário acessa oportunidade
2. informa dados da proposta
3. salva proposta
4. sistema registra proposta no histórico da negociação

---

### 12.3 Atualizar status da negociação
**Ator:** vendedor / gerente / administrador

**Fluxo básico:**
1. usuário acessa oportunidade
2. altera status
3. informa observação, quando necessário
4. sistema registra a alteração

---

### 12.4 Registrar fechamento
**Ator:** gerente / coordenador / administrador

**Fluxo básico:**
1. usuário acessa oportunidade aprovada
2. confirma fechamento
3. sistema registra venda como fechada
4. sistema prepara integração com contrato, financeiro e comissão

---

### 12.5 Consultar vendas
**Ator:** vendedor / gerente / diretoria / administrador

**Fluxo básico:**
1. usuário acessa listagem
2. aplica filtros
3. visualiza oportunidades e vendas fechadas
4. acessa detalhes da venda

---

## 13. Filtros da listagem
A listagem de vendas/oportunidades deve suportar inicialmente:

- cliente
- vendedor
- gerente
- status
- empreendimento
- unidade/imóvel
- data inicial
- data final

Filtros futuros:
- faixa de valor
- origem do lead
- tipo de proposta
- motivo de perda

---

## 14. Ordenação e visualização
A listagem deve permitir:

- ordenação por data de abertura
- ordenação por cliente
- ordenação por status
- ordenação por vendedor
- ordenação por valor

Campos visíveis inicialmente:
- cliente
- empreendimento/unidade
- vendedor
- status
- valor da proposta principal
- data de abertura

---

## 15. Tela de detalhes da oportunidade/venda
A tela de detalhes deve reunir:

- dados do cliente
- origem do lead, quando houver
- dados do empreendimento/unidade
- dados do vendedor
- propostas registradas
- status da oportunidade
- histórico da negociação
- ações rápidas

### Ações rápidas sugeridas
- editar oportunidade
- registrar proposta
- alterar status
- registrar observação
- fechar venda
- marcar como perdida/cancelada

---

## 16. Permissões iniciais
Sugestão inicial de permissões:

### Vendedor
- criar oportunidade
- visualizar oportunidades atribuídas
- registrar proposta
- registrar interação comercial
- alterar status permitidos

### Gerente / Coordenador
- visualizar oportunidades da equipe
- alterar vendedor responsável
- aprovar avanço para fechamento
- fechar venda
- marcar perda/cancelamento

### Administrador
- acesso total ao módulo

### Diretoria
- acesso a consulta, relatórios e indicadores

---

## 17. Entidades iniciais sugeridas

### 17.1 Oportunidade
Campos sugeridos:
- Id
- LeadId
- ClienteId
- VendedorId
- GerenteId
- EmpreendimentoId
- ImovelId
- Status
- ObservacaoInicial
- DataAbertura
- CriadoPorUsuarioId
- AtualizadoEm

---

### 17.2 Proposta
Campos sugeridos:
- Id
- OportunidadeId
- ValorTabela
- ValorProposto
- Desconto
- CondicaoPagamento
- TipoProposta
- Observacao
- CriadoPorUsuarioId
- CriadoEm

---

### 17.3 Venda
Campos sugeridos:
- Id
- OportunidadeId
- ClienteId
- EmpreendimentoId
- ImovelId
- VendedorId
- GerenteId
- ValorFechado
- DataFechamento
- StatusFechamento
- CriadoPorUsuarioId

---

### 17.4 OportunidadeHistorico
Campos sugeridos:
- Id
- OportunidadeId
- TipoRegistro
- Descricao
- StatusAnterior
- NovoStatus
- CriadoPorUsuarioId
- CriadoEm

---

### 17.5 EspelhoVenda
Pode começar como visão derivada/consulta e não necessariamente como tabela física na primeira versão.

---

## 18. DTOs iniciais sugeridos

### Requests
- CreateOpportunityRequest
- UpdateOpportunityRequest
- CreateProposalRequest
- ChangeOpportunityStatusRequest
- CloseSaleRequest
- CancelOpportunityRequest
- MarkOpportunityAsLostRequest

### Responses
- OpportunityResponse
- OpportunityListItemResponse
- OpportunityDetailResponse
- ProposalResponse
- SaleResponse
- SaleListItemResponse
- OpportunityHistoryItemResponse

---

## 19. Endpoints iniciais sugeridos

### Oportunidades
```text
GET    /api/vendas/oportunidades
GET    /api/vendas/oportunidades/{id}
POST   /api/vendas/oportunidades
PUT    /api/vendas/oportunidades/{id}
PATCH  /api/vendas/oportunidades/{id}/status
POST   /api/vendas/oportunidades/{id}/propostas
POST   /api/vendas/oportunidades/{id}/fechar
POST   /api/vendas/oportunidades/{id}/perder
POST   /api/vendas/oportunidades/{id}/cancelar

GET    /api/vendas/fechadas
GET    /api/vendas/fechadas/{id}

GET    /api/vendas/espelho

/Modules/Vendas/
├─ Controllers/
│  └─ VendasController.cs
├─ Services/
│  ├─ OpportunityService.cs
│  ├─ ProposalService.cs
│  └─ SaleService.cs
├─ Repositories/
│  ├─ OpportunityRepository.cs
│  ├─ ProposalRepository.cs
│  └─ SaleRepository.cs
├─ Entities/
│  ├─ Oportunidade.cs
│  ├─ Proposta.cs
│  ├─ Venda.cs
│  └─ OportunidadeHistorico.cs
├─ Dtos/
│  ├─ Requests/
│  └─ Responses/
├─ Interfaces/
└─ Mappers/

/features/vendas/
├─ pages/
│  ├─ opportunities-list/
│  ├─ opportunity-create/
│  ├─ opportunity-detail/
│  ├─ sales-list/
│  └─ sales-detail/
├─ components/
│  ├─ opportunity-form/
│  ├─ proposal-form/
│  ├─ sales-filters/
│  ├─ opportunity-status-badge/
│  └─ negotiation-history/
├─ services/
│  └─ vendas.service.ts
├─ models/
├─ enums/
├─ vendas-routing.module.ts
└─ vendas.module.ts

