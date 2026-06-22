---
id: "task_6_3_eslint_cleanup"
title: "Remover `console.log` e Supressões ESLint"
status: "completed"
priority: "medium"
type: "phase-completed"
---

# Task 6.3 — Remover `console.log` e Supressões ESLint

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 06 — Type Hardening](./phase_06_type_hardening.md)
- **Dependências**: Nenhuma

## Objetivo

Remover `console.log` em produção e resolver ou justificar 6 supressões ESLint.

## Locais a Modificar

### console.log
| Arquivo | Linha | Código |
|---|---|---|
| `frontend/src/main.tsx` | 14 | `console.log("App pronto para uso offline")` |

### ESLint supressões
| Arquivo | Linha | Supressão |
|---|---|---|
| `frontend/src/contexts/ToastContext.tsx` | 1 | `/* eslint-disable react-refresh/only-export-components */` |
| `frontend/src/contexts/AuthContext.tsx` | 66 | `// eslint-disable-next-line react-refresh/only-export-components` |
| `frontend/src/contexts/ThemeContext.tsx` | 43 | `// eslint-disable-next-line react-refresh/only-export-components` |
| `frontend/src/pages/review/ReviewPage.tsx` | 151, 178 | `// eslint-disable-next-line react-hooks/exhaustive-deps` |
| `frontend/src/pages/decks/DeckPage.tsx` | 146 | `// eslint-disable-next-line react-hooks/set-state-in-effect` |

## Fora de Escopo

- Configurar ESLint rules novas
- Refatorar lógica dos componentes

## Arquivos Permitidos para Modificação

- `frontend/src/main.tsx`
- `frontend/src/contexts/ToastContext.tsx`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/contexts/ThemeContext.tsx`
- `frontend/src/pages/review/ReviewPage.tsx`
- `frontend/src/pages/decks/DeckPage.tsx`

## Checklist de Implementação

- [ ] 1. Substituir `console.log` em main.tsx por chamada de logger ou remover
- [ ] 2. Analisar cada supressão ESLint — remover ou justificar com comentário explícito
- [ ] 3. Rodar ESLint para verificar que não há novas violações
- [ ] 4. Rodar `npx tsc -b --noEmit`

## Critérios de Aceitação

- Zero `console.log` em código de produção (exceção: warn/error)
- Mínimo de supressões ESLint, cada uma justificada
- Build e type check passando

## Comandos de Verificação

```bash
npx eslint frontend/src/
npx tsc -b --noEmit
```

## Definition of Done

- [ ] console.log removido
- [ ] Supressões ESLint resolvidas ou justificadas
- [ ] `tsc -b --noEmit` passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
