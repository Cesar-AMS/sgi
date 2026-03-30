# Especificação Funcional — Vendas

## 1. Objetivo deste documento
Este documento descreve o módulo **Vendas**, responsável por conduzir a oportunidade comercial até o fechamento da venda de um imóvel.

O objetivo é definir:
- a finalidade do módulo
- suas responsabilidades
- os fluxos principais
- os dados envolvidos
- as regras de negócio iniciais
- a relação com Atendimento
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
- evolui no Atendimento
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

## 5. Relação com Atendimento
O módulo de Vendas recebe insumos do contexto de Atendimento.

A navegação funcional esperada do sistema até a entrada em Vendas é:

```text
Atendimento
├─ Leads
│  └─ Listagem
└─ Agendamento
      ↓
Vendas

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

/pages/project/vendas/
├─ opportunities-list/
├─ opportunity-create/
├─ opportunity-detail/
├─ sales-list/
├─ sales-detail/
├─ proposta/
├─ propostas/
└─ components/

VendaController -> VendaService -> VendaRepository

VendaController
  -> VendaConsultaService
  -> VendaCriacaoService
  -> VendaGestaoService
  -> VendaRepository

  