ATENDIMENTO
- Leads
  - Listagem
- Agendamento

VENDAS
- Oportunidades
- Propostas
- Fechamentos

ANÁLISE
- Perfil e Crédito

FORMALIZAÇÃO
- Contratos e Repasse

CADASTROS E PRODUTO
- Clientes
- Empreendimentos e Imóveis

FINANCEIRO
- Financeiro Pós-venda
- Comissões
- Espelho de Vendas

CORPORATIVO
- RH
- Administração
- TI

GERAL
- Dashboard

# Arquitetura Modular

## 1. Objetivo deste documento
Este documento define a arquitetura modular inicial do sistema, com base no domínio **Operação de Vendas Imobiliárias** e no context map já estabelecido.

O objetivo é criar uma estrutura clara para evolução do projeto, organizando frontend e backend por responsabilidade de negócio, reduzindo acoplamento e facilitando manutenção, crescimento e entendimento da base de código.

---

## 2. Princípios da arquitetura
A arquitetura do sistema deve seguir os seguintes princípios:

- separação por contexto de negócio
- baixo acoplamento entre módulos
- responsabilidades bem definidas
- reutilização controlada
- contratos claros entre frontend e backend
- padronização de DTOs, serviços e endpoints
- crescimento incremental sem quebrar a base existente

---

## 3. Organização geral do sistema
O sistema é composto atualmente por:

- **Frontend:** Angular
- **Backend:** ASP.NET / .NET
- **Banco de dados:** MySQL

A arquitetura deve evoluir para refletir os bounded contexts do negócio, tanto no frontend quanto no backend.

---

## 4. Estrutura modular de negócio

### Core Modules
Módulos centrais da operação:

- Atendimento
- Vendas
- Análise de Perfil e Crédito
- Contratos e Repasse

### Supporting Modules
Módulos de apoio à operação principal:

- Clientes
- Empreendimentos e Imóveis
- Financeiro Pós-venda
- Comissões e Resultado Comercial

### Generic Modules
Módulos corporativos e transversais:

- Dashboard
- RH
- Administração e Acessos
- TI / Suporte Técnico

---

# 5. Arquitetura do Frontend

## 5.1 Diretriz geral
No Angular, a organização deve ser feita por contexto funcional de negócio, agrupando componentes, serviços, modelos e rotas por área do domínio.

A estrutura deve refletir os módulos do negócio, e não apenas separações técnicas genéricas.

---

## 5.2 Estrutura sugerida do frontend

```text
JMImoveisWeb/
└─ src/
   └─ app/
      ├─ core/
      ├─ shared/
      ├─ layout/
      ├─ pages/
      │  └─ project/
      │     ├─ atendimento/
      │     │  ├─ leads/
      │     │  ├─ agendamento/
      │     │  └─ leads-details/
      │     ├─ vendas/
      │     ├─ clientes/
      │     ├─ empreendimentos/
      │     ├─ financeiro/
      │     ├─ rh/
      │     └─ administracao/
      └─ app-routing.module.ts

      Atendimento
├─ Leads
│  └─ Listagem
└─ Agendamento

/pages/project/atendimento/
├─ leads/
│  ├─ leads.component.ts
│  └─ leads.component.html
├─ leads-details/
│  ├─ leads-details.component.ts
│  ├─ leads-details.component.html
│  └─ components/
│     ├─ lead-summary-section/
│     ├─ lead-activities-section/
│     ├─ lead-agenda-section/
│     └─ lead-visits-section/
└─ agendamento/

Controller -> Service -> Repository

JMImoveisAPI/
├─ Controllers/
├─ Entities/
├─ Interfaces/
├─ Repositories/
├─ Services/
├─ Configurations/
├─ Middlewares/
├─ Program.cs
└─ appsettings.json

LeadsController -> LeadService -> LeadRepository

Controller
  -> Service
    -> Repository
      -> Banco de Dados

Banco de Dados
  -> Repository
    -> Service
      -> Controller
        -> Response DTO

ATENDIMENTO
- Leads
  - Listagem
- Agendamento

VENDAS
- Oportunidades
- Propostas
- Fechamentos

ANÁLISE
- Perfil e Crédito

FORMALIZAÇÃO
- Contratos e Repasse

CADASTROS E PRODUTO
- Clientes
- Empreendimentos e Imóveis

FINANCEIRO
- Financeiro Pós-venda
- Comissões
- Espelho de Vendas

CORPORATIVO
- RH
- Administração
- TI

GERAL
- Dashboard

