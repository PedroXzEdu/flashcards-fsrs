---
id: "phase_07_test_coverage"
title: "Test Coverage Expansion"
status: "completed"
priority: "medium"
type: "phase-completed"
---

# Phase 07 — Test Coverage Expansion

> **Arquivo índice / master.** Cada task abaixo tem seu próprio arquivo de microtask com detalhes completos.

## Objetivo

Expandir a cobertura de testes para áreas críticas atualmente sem teste: middleware bruteForce, componentes frontend (7), API layer (5 arquivos), hooks e contextos.

## Escopo

- Criar testes para `bruteForce.ts` (middleware sem cobertura)
- Criar testes para 7 componentes frontend sem teste
- Criar testes para API layer (5 arquivos)
- Criar testes para hooks e contextos restantes

## Fora de Escopo

- Tipar `any` em testes existentes
- Adicionar testes E2E (fase separada)
- Refatorar componentes para testabilidade

## Pré-requisitos

- Phase 06 concluída
- `tsc --noEmit` passando em backend e frontend
- Docker Compose rodando para testes de integração

## Tasks (Índice)

| ID | Microtask | Arquivo | Dependências |
|---|---|---|---|
| 7.1 | Testes do bruteForce.ts | [`task_7_1_bruteforce_tests.md`](./task_7_1_bruteforce_tests.md) | — |
| 7.2 | Testes de componentes frontend | [`task_7_2_frontend_component_tests.md`](./task_7_2_frontend_component_tests.md) | — |
| 7.3 | Testes da API layer e contextos | [`task_7_3_api_context_tests.md`](./task_7_3_api_context_tests.md) | — |

## Ordem de Execução

```
7.1 → 7.2 → 7.3
```

Tasks sem dependência podem ser executadas em paralelo.

## Riscos e Pontos de Atenção

- Testes de componentes com rich text (Tiptap) podem exigir mocks mais elaborados
- `bruteForce.ts` tem estado in-memory — testar isolamento entre execuções
- API layer usa `fetch` — requer mock do `global.fetch`

## Estado Atual

- **Concluída**: Todas as 3 tasks finalizadas
- **Progresso**: 3/3 tasks

## Critério de Conclusão da Fase

- Todas as 3 microtasks concluídas
- Cobertura de testes aumentada sem perda de qualidade
- `@reviewer` aprovou

## Checklist da Fase

- [x] 7.1 Testes bruteForce.ts
- [x] 7.2 Testes componentes frontend
- [x] 7.3 Testes API layer e contextos
- [x] Revisão de código realizada
- [x] Critérios de aceitação validados


## Phase Completion Policy

Quando toda task da fase estiver completa:

1. Verificar que todas as tasks estão marcadas como concluídas
2. Verificar que os Success Metrics foram atingidos
3. Verificar que não há achados de revisão em aberto
4. Marcar a fase como `completed` no frontmatter
5. Mover o arquivo da fase para `.plans/completed/`
6. Mover todos os arquivos de task associados para `.plans/completed/`
7. Criar um commit de conclusão

Apenas após o arquivamento a próxima fase pode começar.


## Planning Source of Truth

Regras:

- `AGENTS.md` define a política de execução
- Arquivos de fase definem o progresso atual do roadmap
- Arquivos de task definem o escopo de implementação
- Fases concluídas são registros históricos em `.plans/completed/`
- Trabalho ativo sempre vem de `.plans/tasks/`
- Trabalho arquivado sempre vive em `.plans/completed/`

