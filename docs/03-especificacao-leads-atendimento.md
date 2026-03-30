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

# Especificação Funcional — Atendimento

## 1. Objetivo deste documento
Este documento descreve o módulo **Atendimento**, que representa a porta de entrada da operação comercial no sistema.

O objetivo é definir com clareza:
- a finalidade do módulo
- suas responsabilidades
- os principais fluxos
- os dados envolvidos
- as regras de negócio iniciais
- a organização funcional da navegação
- as bases para implementação no frontend e backend

---

## 2. Contexto no negócio
O módulo de Atendimento é responsável por receber, registrar, organizar e acompanhar os leads que entram na empresa por diferentes canais de captação.

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
- organize agendamentos comerciais
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
- agendamentos de contato e visita
- atualização de status de agendamento
- conversão do lead em oportunidade comercial

Este módulo **não** cobre:
- fechamento da venda
- emissão de contrato
- cálculo de comissão
- cobrança pós-venda
- folha de pagamento
- parametrizações administrativas globais

---

## 5. Organização funcional da navegação
A organização funcional esperada no sistema para este módulo é:

```text
Atendimento
├─ Leads
│  └─ Listagem
└─ Agendamento

GET    /api/leads/{leadId}/schedules
POST   /api/leads/{leadId}/schedules
PATCH  /api/leads/{leadId}/schedules/{scheduleId}/status

GET    /api/leads/origens

/pages/project/atendimento/
├─ leads/
│  └─ leads.component.*
├─ leads-details/
│  ├─ leads-details.component.*
│  └─ components/
│     ├─ lead-summary-section/
│     ├─ lead-activities-section/
│     ├─ lead-agenda-section/
│     └─ lead-visits-section/
└─ agendamento/

LeadsController -> LeadService -> LeadRepository

Atendimento
├─ Leads
│  └─ Listagem
└─ Agendamento

