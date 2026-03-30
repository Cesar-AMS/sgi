# Guia de Execução com Codex

## 1. Objetivo deste documento
Este documento define como o projeto deve ser conduzido com apoio do Codex, para que a implementação aconteça de forma controlada, incremental e alinhada à documentação.

O objetivo é evitar:
- tarefas grandes demais e mal definidas
- mudanças sem rastreabilidade
- código gerado sem contexto
- refatorações perigosas
- quebra de consistência entre frontend, backend e domínio

---

## 2. Papel do Codex no projeto
Neste projeto, o Codex deve ser usado como apoio para:

- analisar o repositório atual
- mapear estrutura existente
- implementar tarefas pequenas e bem definidas
- criar arquivos novos
- editar módulos específicos
- propor refatorações localizadas
- gerar DTOs, services, controllers e componentes
- acelerar a execução técnica

O Codex **não** deve ser usado como substituto de direção arquitetural sem referência documental.

---

## 3. Papel da documentação
Antes de pedir implementação ao Codex, a tarefa deve estar apoiada em pelo menos um destes elementos:

- visão de domínio
- context map
- arquitetura modular
- especificação funcional do módulo
- backlog inicial

A documentação serve como base de verdade do projeto.

---

## 4. Regra principal de execução
Cada tarefa enviada ao Codex deve ser:

- pequena
- específica
- verificável
- limitada a um contexto
- alinhada a um documento existente

---

## 5. Ordem de trabalho recomendada
A execução recomendada do projeto com Codex deve seguir este fluxo:

1. consultar a documentação do módulo
2. definir a próxima etapa pequena
3. escrever um prompt objetivo
4. pedir ao Codex apenas aquela etapa
5. revisar resultado
6. ajustar ou refinar
7. atualizar documentação, se necessário
8. seguir para a próxima etapa

---

## 6. Tipos de tarefa ideais para o Codex
O Codex tende a funcionar melhor quando recebe tarefas como:

- mapear projeto atual
- criar entidade
- criar DTOs
- criar repository
- criar service
- criar controller
- criar tela Angular
- criar componente específico
- adicionar filtro em listagem
- criar endpoint isolado
- implementar validação
- refatorar módulo pontual
- padronizar nomenclatura em área específica

---

## 7. Tipos de tarefa que devem ser evitadas
Evitar prompts como:

- “refatora o sistema inteiro”
- “organiza tudo em DDD”
- “faz todo o backend”
- “faz todo o frontend”
- “corrige tudo”
- “reestrutura o projeto completo sem quebrar nada”

Esses pedidos geram alto risco de respostas grandes demais, inconsistentes ou pouco seguras para aplicar direto.

---

## 8. Formato ideal de prompt
Um bom prompt para o Codex deve conter:

- contexto do módulo
- objetivo da etapa
- limite da tarefa
- arquivos ou áreas para mexer
- o que não deve ser alterado
- critério de entrega

---

## 9. Estrutura recomendada de prompt
Modelo sugerido:

```text
Contexto:
[qual módulo/contexto estamos trabalhando]

Objetivo:
[o que precisa ser implementado]

Escopo:
[o que deve ser criado/alterado]

Restrições:
[o que não deve ser mexido]

Critérios de entrega:
[o que precisa estar pronto ao final]

