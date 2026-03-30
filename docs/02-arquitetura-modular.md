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

- Leads e Atendimento
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
No Angular, a organização deve ser feita por **feature modules** ou por **pastas de features**, agrupando componentes, serviços, modelos e rotas por contexto de negócio.

A estrutura deve refletir os módulos do domínio, e não apenas separações técnicas genéricas.

---

## 5.2 Estrutura sugerida do frontend

```text
JMImoveisWeb/
└─ src/
   └─ app/
      ├─ core/
      ├─ shared/
      ├─ layout/
      ├─ features/
      │  ├─ dashboard/
      │  ├─ leads-atendimento/
      │  ├─ vendas/
      │  ├─ analise-perfil-credito/
      │  ├─ contratos-repasse/
      │  ├─ clientes/
      │  ├─ empreendimentos-imoveis/
      │  ├─ financeiro-pos-venda/
      │  ├─ comissoes/
      │  ├─ rh/
      │  ├─ administracao/
      │  └─ ti/
      └─ app-routing.module.ts

      /features/leads-atendimento/
├─ pages/
├─ components/
├─ services/
├─ models/
├─ enums/
├─ leads-atendimento-routing.module.ts
└─ leads-atendimento.module.ts

JMImoveisAPI/
├─ Modules/
│  ├─ LeadsAtendimento/
│  ├─ Vendas/
│  ├─ AnalisePerfilCredito/
│  ├─ ContratosRepasse/
│  ├─ Clientes/
│  ├─ EmpreendimentosImoveis/
│  ├─ FinanceiroPosVenda/
│  ├─ Comissoes/
│  ├─ RH/
│  ├─ Administracao/
│  └─ TI/
├─ Shared/
├─ Infrastructure/
├─ Program.cs
└─ appsettings.json

/Modules/Vendas/
├─ Controllers/
├─ Services/
├─ Repositories/
├─ Entities/
├─ Dtos/
├─ Interfaces/
└─ Mappers/

Controller
  -> Service
    -> Repository
      -> Banco de Dados

Banco de Dados
  -> Repository
    -> Service
      -> Controller
        -> Response DTO

GET    /api/leads
GET    /api/leads/{id}
POST   /api/leads
PUT    /api/leads/{id}
PATCH  /api/leads/{id}/status
POST   /api/leads/{id}/converter

GET    /api/vendas
GET    /api/vendas/{id}
POST   /api/vendas
PUT    /api/vendas/{id}
POST   /api/vendas/{id}/fechar

COMERCIAL
- Leads e Atendimento
- Vendas
- Análise de Perfil

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

