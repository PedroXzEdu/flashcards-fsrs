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

- **Início**: Fase não iniciada
- **Progresso**: 0/2 tasks

## Critério de Conclusão da Fase

- Todas as 2 microtasks concluídas
- Navegação manual dos fluxos afetados (review, import, dashboard)
- `@reviewer` aprovou

## Checklist da Fase

- [ ] 8.1 Dead code + ImportApi refactor
- [ ] 8.2 UX fixes
- [ ] Revisão de código realizada
- [ ] Critérios de aceitação validados
