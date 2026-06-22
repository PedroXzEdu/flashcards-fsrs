---
id: "phase_08_ux_consistency"
title: "UX Consistency & Fixes"
status: "completed"
priority: "medium"
type: "phase-completed"
---

# Phase 08 — UX Consistency & Fixes

> **Arquivo índice / master.** Cada task abaixo tem seu próprio arquivo de microtask com detalhes completos.

## Objetivo

Corrigir inconsistências de UX, remover dead code, alinhar limites de upload, e melhorar feedback visual em operações críticas.

## Escopo

- Remover dead code (`BASE_URL` em decks.ts)
- Corrigir mismatch 100MB vs 50MB no ImportModal
- Adicionar `z-index` ao container de toast
- Adicionar click-outside handler no form "Novo baralho" do Dashboard
- Adicionar spinner visual no botão "Carregar mais"
- Refatorar `setTimeout` frágil na transição de cards de review
- Import Api usando client compartilhado em vez de fetch duplicado

## Fora de Escopo

- Redesign de componentes
- Mudanças arquiteturais amplas
- Novas funcionalidades

## Pré-requisitos

- Phase 07 concluída
- `tsc -b --noEmit` passando no frontend

## Tasks (Índice)

| ID | Microtask | Arquivo | Dependências |
|---|---|---|---|
| 8.1 | Dead code + ImportApi refactor | [`task_8_1_dead_code_import_api.md`](./task_8_1_dead_code_import_api.md) | — |
| 8.2 | UX fixes (z-index, click-outside, spinner, setTimeout) | [`task_8_2_ux_fixes.md`](./task_8_2_ux_fixes.md) | — |

## Ordem de Execução

```
8.1 → 8.2
```

## Riscos e Pontos de Atenção

- Refatorar `setTimeout` no ReviewPage pode introduzir flickering — testar visualmente
- ImportApi refactor requer cuidado para não quebrar upload de .apkg
- Click-outside não deve conflitar com clique no botão "Criar"

## Estado Atual

- **Início**: Fase concluída
- **Progresso**: 2/2 tasks

## Critério de Conclusão da Fase

- Todas as 2 microtasks concluídas
- Navegação manual dos fluxos afetados (review, import, dashboard)
- `@reviewer` aprovou

## Checklist da Fase

- [x] 8.1 Dead code + ImportApi refactor
- [x] 8.2 UX fixes
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

