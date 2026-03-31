# Mapa Residual do ApiService

## 1. Objetivo deste documento
Este documento registra onde o `ApiService` ainda aparece na base e como esses usos devem ser classificados dentro da Fase 2.

O objetivo nao e remover tudo de uma vez.

O objetivo e separar o que hoje e:
- fachada legada aceitavel
- uso ainda justificavel temporariamente
- uso que merece sair para service de dominio
- uso paralelo ou fora do foco atual

---

## 2. Leitura executiva
O `ApiService` continua sendo a maior divida transversal do frontend.

Mesmo depois da consolidacao por dominios, ele ainda aparece em:
- fluxos oficiais que dependem de lookups auxiliares
- telas paralelas ainda nao consolidadas
- trilhas legadas de compatibilidade
- modulos fora do foco principal de negocio

Isso significa que a Fase 2 nao precisa "apagar o ApiService".

Ela precisa:
- reduzir o uso indevido
- assumir explicitamente o que e fachada legada
- priorizar apenas os pontos que ainda atrapalham a clareza arquitetural

---

## 3. Fachada legada aceitavel por enquanto
Estes casos ainda podem continuar usando `ApiService` sem urgencia de corte:

- [propostas.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/propostas/propostas.component.ts)
  - o `ApiService` ja funciona como fachada legada para `ProposalsService`
- [leads.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/leads/leads.component.ts)
  - uso residual para lookups auxiliares de usuarios
- [leads-details.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/leads-details/leads-details.component.ts)
  - uso residual auxiliar, sem quebrar o caminho oficial de `LeadsService`
- [desistencias.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/vendas/desistencias/desistencias.component.ts)
  - continua com dependencia auxiliar, mas a trilha principal de propostas ja saiu para `ProposalsService`

---

## 4. Uso temporariamente justificavel
Estes pontos ainda usam `ApiService`, mas o uso e compreensivel dentro do recorte atual:

- [visao-geral.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/vendas/visao-geral/visao-geral.component.ts)
  - o fluxo principal esta no `SalesService`
  - `ApiService` ainda serve como provedor de lookups auxiliares
- [vendas-new.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/vendas/vendas-new/vendas-new.component.ts)
  - a venda principal ja esta em `SalesService`
  - `ApiService` segue para apoios e dependencias nao isoladas
- [cadastro.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/empreendimentos/cadastro/cadastro.component.ts)
  - o fluxo principal esta em `EnterprisesService`
  - o apoio de construtora tambem ja saiu para `EnterprisesService`
- [gerais.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/configuracoes/gerais/gerais.component.ts)
  - `AdminAccessService` ja cobre usuarios, cargos, filiais, formas de pagamento, categorias, centro de custo e plano de contas
  - `ApiService` ainda sustenta apenas abas e lookups auxiliares restantes do componente inchado
- [contas-receber.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/financeiro/contas-receber/contas-receber.component.ts)
  - o fluxo principal ja saiu para `AccountsReceivableService`
  - `ApiService` ficou apenas para lookups auxiliares
- [contas-pagar.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/financeiro/contas-pagar/contas-pagar.component.ts)
  - o fluxo principal ja saiu para `AccountsPayableService`
  - `ApiService` ficou apenas para lookups auxiliares
- [construtora.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/empreendimentos/construtora/construtora.component.ts)
  - o fluxo principal ja saiu para `EnterprisesService`
  - `ApiService` deixou de ser necessario nessa tela
- [accounts-receivable.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/financeiro/accounts-receivable/accounts-receivable.component.ts)
  - o fluxo principal ja estava em `AccountsReceivableService`
  - o uso residual de `ApiService` para filiais saiu para `AdminAccessService`

---

## 5. Pontos que merecem sair do ApiService
Estes sao os melhores candidatos da Fase 2 para novos cortes pequenos:

- [gerais.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/configuracoes/gerais/gerais.component.ts)
  - segue como concentrador de abas administrativas
  - ainda carrega parte relevante do uso residual do `ApiService`, sobretudo alguns lookups auxiliares e o restante nao consolidado do componente

---

## 6. Fluxos paralelos ou fora do foco atual
Estes pontos nao devem puxar a fase inteira agora:

- [visitas.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/visitas/visitas.component.ts)
  - ainda mistura `ApiService` com `VisitasApiService`
  - merece revisao propria quando Atendimento voltar a ser priorizado

- [comparecimentos.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/comparecimentos/comparecimentos.component.ts)
  - fluxo paralelo, nao prioritario nesta etapa

- [espelho.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/empreendimentos/espelho/espelho.component.ts)
  - mistura empreendimentos com fluxo comercial
  - nao e o melhor alvo transversal agora

- [admin-empreendimento.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/empreendimentos/admin-empreendimento/admin-empreendimento.component.ts)
  - subfluxo fora do caminho oficial principal

- [crm.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/dashboards/crm/crm.component.ts)
- [create.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/invoices/create/create.component.ts)
- [modal-venda.component.ts](/c:/Users/Giovana/OneDrive/Área%20de%20Trabalho/producao/JM/JMImoveis.Web/src/app/pages/project/modal-venda/modal-venda.component.ts)
  - trilhas fora do foco principal da consolidacao transversal

---

## 7. Recomendacao pratica
Se a equipe quiser seguir pela melhor relacao entre risco e ganho, a ordem mais sensata e:

1. assumir explicitamente `ApiService` como fachada legada nos pontos que ja estao estabilizados
2. revisar telas financeiras secundarias que ainda nao tenham service oficial claro
3. decidir se vale mais um corte em `gerais.component.ts` ou se o componente ja esta bom o suficiente para a Fase 2
4. deixar visitas, comparecimentos, espelho e dashboards paralelos para cortes proprios futuros

---

## 8. Conclusao
O `ApiService` ainda nao e um problema porque "existe".

Ele e um problema apenas quando:
- concorre com service oficial do dominio
- embaralha o caminho oficial
- dificulta entender onde um fluxo realmente mora

Na Fase 2, a prioridade correta e atacar so esses pontos.
