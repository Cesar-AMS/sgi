# Context Map

## 1. Objetivo deste documento
Este documento descreve o mapa de contextos do sistema, mostrando como os principais módulos do negócio se relacionam dentro do domínio de **Operação de Vendas Imobiliárias**.

O objetivo é criar clareza sobre:
- os limites de cada contexto
- as responsabilidades de cada módulo
- o fluxo principal da operação
- as integrações entre áreas do sistema
- a organização funcional da navegação do sistema

---

## 2. Domínio principal
**Operação de Vendas Imobiliárias**

Este domínio representa a atividade central da empresa: captar leads, atender, qualificar, negociar, vender imóveis, formalizar contratos e acompanhar o financeiro pós-venda.

---

## 3. Classificação dos contextos

### Core Contexts
São os contextos centrais do negócio, onde está a maior geração de valor e o principal diferencial competitivo da empresa.

- Atendimento
- Vendas
- Análise de Perfil e Crédito
- Contratos e Repasse

### Supporting Contexts
São contextos que sustentam a operação principal, fornecendo dados, estrutura e apoio ao fluxo comercial.

- Clientes
- Empreendimentos e Imóveis
- Financeiro Pós-venda
- Comissões e Resultado Comercial

### Generic Contexts
São contextos corporativos e administrativos, necessários para o funcionamento do sistema, mas que não representam o diferencial principal do negócio.

- Dashboard
- RH
- Administração e Acessos
- TI / Suporte Técnico

---

## 4. Visão geral do fluxo principal
O fluxo central do negócio ocorre da seguinte forma:

1. O lead entra por um canal de captação
2. O lead é tratado dentro do contexto de Atendimento
3. O atendimento evolui por meio de leads, atividades e agendamentos
4. A oportunidade comercial evolui para negociação em Vendas
5. O perfil do cliente é analisado
6. A venda é formalizada
7. O contrato e o repasse são processados
8. O financeiro realiza o pós-venda
9. As comissões e os resultados comerciais são consolidados

---

## 5. Mapa textual dos contextos

```text
[Atendimento]
      ↓
[Vendas]
      ↓
[Análise de Perfil e Crédito]
      ↓
[Contratos e Repasse]
      ↓
[Financeiro Pós-venda]
      ↓
[Comissões e Resultado Comercial]

[Clientes] <-> [Atendimento]
[Clientes] <-> [Vendas]
[Clientes] <-> [Análise de Perfil e Crédito]
[Clientes] <-> [Contratos e Repasse]
[Clientes] <-> [Financeiro Pós-venda]

[Empreendimentos e Imóveis] -> [Vendas]

[Administração e Acessos] -> todos os contextos
[Dashboard] <- recebe dados dos principais contextos
[RH] -> contexto corporativo interno
[TI / Suporte Técnico] -> sustentação da plataforma

Atendimento
  -> Vendas
  -> Análise de Perfil e Crédito
  -> Contratos e Repasse
  -> Financeiro Pós-venda
  -> Comissões e Resultado Comercial

  Clientes
  -> apoia Atendimento, Vendas, Crédito, Contratos e Financeiro

Empreendimentos e Imóveis
  -> apoia Vendas

Administração e Acessos
  -> controla acesso de todos os contextos

Dashboard
  -> consolida dados dos contextos principais

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

