# Visão Geral do Projeto

## 1. Nome provisório do projeto
**Sistema de Gestão Comercial Imobiliária**

---

## 2. Objetivo do sistema
Este sistema tem como objetivo centralizar e organizar a operação comercial de uma empresa do setor imobiliário, com foco em **captação de leads, atendimento, vendas, análise de perfil, formalização de contratos e acompanhamento financeiro pós-venda**.

O projeto busca dar suporte à operação da empresa de forma integrada, permitindo que diferentes setores trabalhem em conjunto dentro de uma mesma plataforma, com maior controle, rastreabilidade e produtividade.

---

## 3. Contexto do negócio
A empresa atua principalmente com **venda de imóveis**, não trabalhando com locação nem administração imobiliária.

O modelo de negócio é fortemente orientado à **conversão comercial**, com entrada de leads por múltiplos canais, atendimento ativo, análise de perfil do cliente e fechamento presencial.

Além disso, a empresa possui um diferencial competitivo na **personalização da proposta comercial**, inclusive em cenários de clientes com restrições financeiras, desde que o perfil e o contexto permitam tratamento viável.

---

## 4. Principais fontes de receita
A principal fonte de receita da empresa está em:

- vendas de imóveis
- comissões comerciais
- empreendimentos próprios
- conversão de leads em vendas

---

## 5. Canais de entrada de leads
Os leads podem entrar na operação por diferentes origens, incluindo:

- ações de rua
- marketplace
- redes sociais
- impulsionamento com Meta Ads
- atendimento presencial na recepção
- indicação

Esses canais tornam o processo de captação e qualificação de leads uma parte crítica da operação.

---

## 6. Fluxo principal do negócio
O fluxo principal da empresa pode ser resumido da seguinte forma:

1. O lead entra por um dos canais de captação
2. O lead é atendido por agentes de atendimento, gerentes ou coordenadores
3. O atendimento evolui até que o lead esteja apto para negociação
4. A proposta comercial acontece presencialmente
5. O fechamento da venda também ocorre presencialmente
6. Após o fechamento, o financeiro assume o pós-venda com boletos, cobranças e acompanhamentos financeiros

---

## 7. Áreas da empresa envolvidas na operação
Atualmente, as principais áreas/departamentos envolvidos no sistema são:

- Comercial
- Atendimento
- Financeiro
- Jurídico
- RH
- Marketing
- Administração
- Pós-venda
- TI

---

## 8. Usuários do sistema
Os perfis de uso mais relevantes para o sistema são:

- Administrador
- Vendedor
- SDR / atendimento
- Gerente
- Financeiro
- RH
- Diretoria
- TI

Cada perfil possui responsabilidades e níveis de acesso diferentes, o que exige uma estrutura clara de autenticação, autorização e permissões.

---

## 9. Stack atual do projeto
O projeto atualmente já possui uma base em desenvolvimento com a seguinte stack:

### Frontend
- Angular

### Backend
- ASP.NET / .NET

### Banco de dados
- MySQL

---

## 10. Módulos já existentes no sistema
Atualmente já existem, ao menos em nível de interface e estrutura inicial, os seguintes módulos:

- Dashboard
- Atendimento com leads
- Vendas
- Empreendimentos
- Clientes
- Finanças
- RH
- Administração

Esses módulos já servem como base visual e funcional inicial, mas ainda precisam ser refinados e melhor organizados conforme a modelagem de domínio.

---

# Domínio e Subdomínios

## 11. Domínio principal
O domínio principal do sistema é:

**Operação de Vendas Imobiliárias**

Esse domínio representa o coração do negócio da empresa, concentrando os processos ligados à captação, conversão e formalização da venda de imóveis.

---

## 12. Classificação dos subdomínios
Para orientar melhor a arquitetura do sistema, os subdomínios foram classificados em:

- **Core**: onde está o maior valor e diferencial competitivo
- **Supporting**: áreas de apoio importantes para o funcionamento do core
- **Generic**: áreas administrativas e comuns à maioria dos sistemas corporativos

---

## 13. Core Subdomains

### 13.1 Leads e Atendimento
Responsável por captar, registrar, distribuir e acompanhar leads desde a entrada até sua evolução comercial.

**Inclui:**
- origem do lead
- cadastro inicial
- qualificação
- histórico de atendimento
- status
- distribuição entre responsáveis

---

### 13.2 Vendas Imobiliárias
Responsável pela transformação de oportunidades em propostas e vendas efetivamente fechadas.

**Inclui:**
- oportunidades
- negociação
- proposta
- fechamento
- espelho de vendas
- vínculo com vendedor/gerente

---

### 13.3 Análise de Perfil e Proposta Personalizada
Subdomínio estratégico ligado ao diferencial da empresa.

A empresa se destaca por facilitar a compra com tratamento personalizado conforme o perfil do cliente, inclusive em casos de restrição financeira ou nome negativado, quando viável.

**Inclui:**
- análise de perfil
- personalização da proposta
- avaliação de restrições
- simulação comercial
- tratamento de exceções

---

### 13.4 Crédito, Contratos e Repasse Comercial
Subdomínio ligado à formalização da venda e sua continuidade operacional.

**Inclui:**
- análise documental
- contratos
- repasse
- apoio à conclusão do processo comercial

---

## 14. Supporting Subdomains

### 14.1 Gestão de Clientes
Responsável pelo cadastro e manutenção das informações do cliente ao longo do processo.

**Inclui:**
- dados pessoais
- documentos
- contatos
- relacionamento com vendas e financeiro

---

### 14.2 Gestão de Empreendimentos e Imóveis
Responsável por organizar o produto comercial ofertado pela empresa.

**Inclui:**
- empreendimentos
- unidades
- status de disponibilidade
- características dos imóveis

---

### 14.3 Financeiro Pós-venda
Responsável por acompanhar a vida financeira da venda após o fechamento.

**Inclui:**
- boletos
- cobranças
- recebimentos
- inadimplência
- acompanhamento financeiro do cliente

---

### 14.4 Comissões e Espelho de Vendas
Responsável pelo controle interno de resultado comercial.

**Inclui:**
- comissão
- regras de cálculo
- espelho de vendas
- consolidação de resultados

---

## 15. Generic Subdomains

### 15.1 Dashboard
Responsável pela visão consolidada da operação.

**Inclui:**
- indicadores
- métricas
- visão gerencial
- resumos operacionais

---

### 15.2 RH
Responsável pelos processos internos de pessoas.

**Inclui:**
- funcionários
- folha de pagamento
- salários
- benefícios
- estoque de uniformes

---

### 15.3 Administração
Responsável pela gestão administrativa do sistema.

**Inclui:**
- usuários
- permissões
- parâmetros
- cadastros administrativos
- auditoria

---

### 15.4 TI
Responsável pela sustentação técnica e administração tecnológica da plataforma.

**Inclui:**
- painel técnico
- suporte interno
- acessos técnicos
- monitoramento
- gestão operacional de tecnologia

---

# Resumo Executivo do Domínio

## 16. Estrutura consolidada

### Domínio principal
**Operação de Vendas Imobiliárias**

### Core Subdomains
- Leads e Atendimento
- Vendas Imobiliárias
- Análise de Perfil e Proposta Personalizada
- Crédito, Contratos e Repasse Comercial

### Supporting Subdomains
- Gestão de Clientes
- Gestão de Empreendimentos e Imóveis
- Financeiro Pós-venda
- Comissões e Espelho de Vendas

### Generic Subdomains
- Dashboard
- RH
- Administração
- TI

---

## 17. Direcionamento arquitetural inicial
A arquitetura do sistema deve evoluir para refletir essa divisão de domínio, evitando acoplamentos indevidos entre áreas de negócio distintas.

Como direcionamento inicial:

- módulos comerciais devem permanecer separados dos módulos corporativos
- regras de vendas não devem ficar misturadas com regras de RH ou administração
- clientes devem ser tratados como um contexto transversal, mas sem absorver regras de venda, crédito ou financeiro
- dashboard deve consolidar informação, e não concentrar regra de negócio
- o sistema deve evoluir em torno dos contextos centrais do negócio antes de expandir módulos acessórios

---

## 18. Próximos documentos recomendados
Após este documento, os próximos artefatos recomendados são:

1. **Context Map**
2. **Arquitetura dos módulos**
3. **Leads e Atendimento - especificação funcional**
4. **Vendas - especificação funcional**
5. **Modelo inicial de entidades por contexto**
6. **Backlog técnico priorizado**