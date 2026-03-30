# Status do Domínio — Atendimento / Leads

## 1. Objetivo deste documento
Este documento registra o estado atual de consolidação do domínio **Atendimento**, com foco específico em **Leads**.

O objetivo é documentar:
- o que já foi consolidado
- qual é o caminho oficial no frontend
- qual é o caminho oficial no backend
- quais fluxos principais já estão cobertos
- quais pendências ainda existem
- quais melhorias futuras são desejáveis, mas não bloqueantes

---

## 2. Contexto do domínio
Dentro do sistema, o domínio **Atendimento** representa a porta de entrada da operação comercial.

Sua organização funcional esperada é:

```text
Atendimento
├─ Leads
│  └─ Listagem
└─ Agendamento

LeadsService
  -> leads.component.ts
  -> leads-details.component.ts


LeadsController
  -> LeadService
    -> LeadRepository

