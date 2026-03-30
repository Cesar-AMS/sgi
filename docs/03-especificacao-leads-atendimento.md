# Especificação Funcional — Leads e Atendimento

## 1. Objetivo deste documento
Este documento descreve o módulo **Leads e Atendimento**, que representa a porta de entrada da operação comercial no sistema.

O objetivo é definir com clareza:
- a finalidade do módulo
- suas responsabilidades
- os principais fluxos
- os dados envolvidos
- as regras de negócio iniciais
- as bases para implementação no frontend e backend

---

## 2. Contexto no negócio
O módulo de Leads e Atendimento é responsável por receber, registrar, organizar e acompanhar os leads que entram na empresa por diferentes canais de captação.

Esse módulo é estratégico porque ele inicia o fluxo comercial e impacta diretamente a conversão em vendas.

Na operação atual da empresa, os leads podem chegar por:
- ação de rua
- marketplace
- redes sociais
- impulsionamento com Meta Ads
- atendimento presencial na recepção
- indicação

O atendimento pode ser realizado por:
- agentes de atendimento
- gerentes
- coordenadores

---

## 3. Objetivo do módulo
O módulo deve permitir que a empresa:

- registre novos leads
- saiba de onde vieram
- distribua o atendimento
- acompanhe a evolução do lead
- mantenha histórico de interações
- identifique leads prontos para negociação
- encaminhe leads para o processo de vendas

---

## 4. Escopo do módulo
Este módulo cobre:

- cadastro de lead
- origem do lead
- dados básicos de contato
- responsável pelo atendimento
- status do lead
- observações
- histórico de interações
- atualização da situação do lead
- filtro e pesquisa de leads
- conversão do lead em oportunidade comercial

Este módulo **não** cobre:
- fechamento da venda
- emissão de contrato
- cálculo de comissão
- cobrança pós-venda
- folha de pagamento
- parametrizações administrativas globais

---

## 5. Principais atores
Os principais usuários do módulo são:

- SDR / atendimento
- vendedor
- gerente
- coordenador
- administrador

---

## 6. Objetos principais do módulo

### 6.1 Lead
Representa uma pessoa interessada em adquirir imóvel por meio da operação da empresa.

### 6.2 Origem do Lead
Representa o canal de onde o lead veio.

### 6.3 Atendimento
Representa o acompanhamento realizado pela equipe sobre o lead.

### 6.4 Histórico de Atendimento
Representa registros cronológicos das interações feitas com o lead.

### 6.5 Responsável
Representa o usuário da operação que está cuidando do lead.

---

## 7. Dados principais do Lead

### 7.1 Dados cadastrais mínimos
Os campos iniciais sugeridos para cadastro do lead são:

- nome completo
- telefone principal
- telefone secundário (opcional)
- e-mail (opcional)
- CPF (opcional em fase inicial, conforme regra da operação)
- origem do lead
- observação inicial
- responsável pelo atendimento
- data de cadastro

---

## 7.2 Dados comerciais iniciais
Além dos dados básicos, o sistema pode armazenar:

- interesse principal
- empreendimento de interesse
- faixa de valor pretendida
- observação comercial
- prioridade
- estágio atual do lead

---

## 8. Origem do lead
O sistema deve permitir classificar o lead por origem.

### Origens iniciais sugeridas
- Ação de rua
- Marketplace
- Redes sociais
- Meta Ads
- Recepção presencial
- Indicação
- Outros

Essa lista pode ser inicialmente fixa ou parametrizável futuramente.

---

## 9. Status do lead
O lead precisa evoluir por etapas.  
Uma proposta inicial de status é:

- Novo
- Em atendimento
- Aguardando retorno
- Qualificado
- Não qualificado
- Convertido em oportunidade
- Perdido

---

## 10. Regras gerais de status
- todo lead novo começa com status **Novo**
- ao iniciar o tratamento, pode ir para **Em atendimento**
- quando depende de retorno do cliente, pode ir para **Aguardando retorno**
- quando o lead está apto para avançar comercialmente, pode ir para **Qualificado**
- quando o lead não se encaixa na operação, pode ir para **Não qualificado**
- quando for enviado para o fluxo comercial, pode ir para **Convertido em oportunidade**
- quando a chance for encerrada, pode ir para **Perdido**

---

## 11. Regras de negócio iniciais

### 11.1 Cadastro de lead
- todo lead deve possuir nome e telefone principal
- todo lead deve possuir origem
- todo lead deve possuir data de cadastro
- todo lead deve nascer com status inicial
- o sistema deve registrar quem criou o lead

---

### 11.2 Distribuição de atendimento
- um lead pode ser atribuído a um responsável
- o responsável pode ser alterado por usuários com permissão
- a troca de responsável deve ficar registrada em histórico futuramente

---

### 11.3 Histórico
- toda interação relevante deve poder ser registrada
- o histórico deve ser cronológico
- o histórico não deve ser apagado sem rastreabilidade
- alterações importantes de status devem idealmente gerar histórico

---

### 11.4 Conversão para oportunidade
- apenas leads qualificados devem ser convertidos em oportunidade
- ao converter, o lead não deve perder seu histórico
- a conversão deve gerar vínculo com o módulo de vendas
- o status do lead deve refletir a conversão

---

### 11.5 Perda de lead
- o sistema deve permitir marcar lead como perdido
- deve existir motivo de perda, ao menos em campo livre inicialmente
- um lead perdido não deve sumir da base
- leads perdidos devem continuar consultáveis por filtros

---

## 12. Casos de uso principais

### 12.1 Cadastrar lead
**Ator:** atendimento / SDR / administrador

**Fluxo básico:**
1. usuário acessa tela de cadastro
2. informa dados mínimos
3. escolhe origem
4. define responsável, quando aplicável
5. salva
6. sistema registra lead com status inicial

---

### 12.2 Listar leads
**Ator:** atendimento / gerente / vendedor / administrador

**Fluxo básico:**
1. usuário acessa tela de listagem
2. visualiza leads cadastrados
3. usa filtros por nome, telefone, origem, status, responsável e período
4. acessa detalhes do lead desejado

---

### 12.3 Atualizar lead
**Ator:** atendimento / gerente / administrador

**Fluxo básico:**
1. usuário abre detalhes do lead
2. altera dados permitidos
3. salva
4. sistema registra atualização

---

### 12.4 Registrar interação
**Ator:** atendimento / vendedor / gerente

**Fluxo básico:**
1. usuário abre lead
2. registra observação ou interação
3. sistema adiciona item no histórico com data e responsável

---

### 12.5 Alterar status
**Ator:** atendimento / gerente / administrador

**Fluxo básico:**
1. usuário abre lead
2. escolhe novo status
3. informa observação se necessário
4. sistema atualiza status
5. sistema registra histórico da alteração

---

### 12.6 Converter lead em oportunidade
**Ator:** gerente / vendedor / atendimento com permissão

**Fluxo básico:**
1. usuário acessa lead qualificado
2. aciona conversão
3. sistema valida elegibilidade
4. sistema cria vínculo com fluxo de vendas
5. sistema altera status do lead

---

## 13. Filtros da listagem
A listagem de leads deve suportar inicialmente filtros como:

- nome
- telefone
- origem
- status
- responsável
- data inicial
- data final

No futuro, pode incluir:
- empreendimento de interesse
- faixa de valor
- prioridade
- canal específico de campanha

---

## 14. Ordenação e visualização
A listagem deve permitir:

- ordenação por data de cadastro
- ordenação por nome
- ordenação por status
- ordenação por responsável

Campos visíveis inicialmente:
- nome
- telefone
- origem
- status
- responsável
- data de cadastro

---

## 15. Tela de detalhes do lead
A tela de detalhes deve reunir:

- dados cadastrais
- origem
- responsável
- status
- observações
- histórico cronológico
- ações rápidas

### Ações rápidas sugeridas
- editar lead
- alterar status
- registrar interação
- reatribuir responsável
- converter em oportunidade

---

## 16. Permissões iniciais
Sugestão inicial de permissões:

### Atendimento / SDR
- criar lead
- editar lead
- registrar interação
- alterar status permitidos
- visualizar leads próprios ou da equipe, conforme regra

### Vendedor
- visualizar leads atribuídos
- registrar interação
- avançar lead, se permitido

### Gerente / Coordenador
- visualizar todos os leads da equipe
- redistribuir responsáveis
- alterar status
- converter lead em oportunidade

### Administrador
- acesso total ao módulo

---

## 17. Entidades iniciais sugeridas

### 17.1 Lead
Campos sugeridos:
- Id
- Nome
- TelefonePrincipal
- TelefoneSecundario
- Email
- Cpf
- OrigemLeadId
- ResponsavelId
- StatusLead
- ObservacaoInicial
- InteressePrincipal
- EmpreendimentoInteresseId
- FaixaValorPretendida
- DataCadastro
- CriadoPorUsuarioId
- AtualizadoEm

---

### 17.2 OrigemLead
Campos sugeridos:
- Id
- Nome
- Ativo

---

### 17.3 LeadHistorico
Campos sugeridos:
- Id
- LeadId
- TipoRegistro
- Descricao
- StatusAnterior
- NovoStatus
- CriadoPorUsuarioId
- CriadoEm

---

### 17.4 LeadResponsavelHistorico
Opcional em primeira versão, mas recomendado posteriormente.

Campos sugeridos:
- Id
- LeadId
- ResponsavelAnteriorId
- ResponsavelNovoId
- AlteradoPorUsuarioId
- AlteradoEm

---

## 18. DTOs iniciais sugeridos

### Requests
- CreateLeadRequest
- UpdateLeadRequest
- ChangeLeadStatusRequest
- AddLeadInteractionRequest
- ConvertLeadToOpportunityRequest

### Responses
- LeadResponse
- LeadListItemResponse
- LeadDetailResponse
- LeadHistoryItemResponse
- LeadOriginResponse

---

## 19. Endpoints iniciais sugeridos

### Leads
```text
GET    /api/leads
GET    /api/leads/{id}
POST   /api/leads
PUT    /api/leads/{id}
PATCH  /api/leads/{id}/status
POST   /api/leads/{id}/interacoes
POST   /api/leads/{id}/converter

GET    /api/leads/origens

PATCH  /api/leads/{id}/responsavel

/Modules/LeadsAtendimento/
├─ Controllers/
│  └─ LeadsController.cs
├─ Services/
│  ├─ LeadService.cs
│  └─ LeadHistoryService.cs
├─ Repositories/
│  ├─ LeadRepository.cs
│  └─ LeadHistoryRepository.cs
├─ Entities/
│  ├─ Lead.cs
│  ├─ OrigemLead.cs
│  └─ LeadHistorico.cs
├─ Dtos/
│  ├─ Requests/
│  └─ Responses/
├─ Interfaces/
└─ Mappers/

/features/leads-atendimento/
├─ pages/
│  ├─ leads-list/
│  ├─ lead-create/
│  └─ lead-detail/
├─ components/
│  ├─ lead-form/
│  ├─ lead-filters/
│  ├─ lead-status-badge/
│  └─ lead-history-timeline/
├─ services/
│  └─ lead.service.ts
├─ models/
├─ enums/
├─ leads-atendimento-routing.module.ts
└─ leads-atendimento.module.ts

