---
id: "T06.02"
phase: "P06"
title: "Criar Página de Deck Vazio (Empty State)"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 06.02 — Criar Página de Deck Vazio (Empty State)

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 06 — Features Futuras](./phase_06_features_futuras.md)
- **Dependências**: Nenhuma

## Objetivo

Criar componente de empty state para quando um deck não tem cards ainda, com CTA para criar o primeiro card.

## Locais a Modificar

| # | Arquivo | O que fazer |
|---|---------|-------------|
| 1 | `frontend/src/components/EmptyDeckState.tsx` (novo) | Componente de empty state |
| 2 | `frontend/src/pages/decks/DeckPage.tsx` | Renderizar EmptyDeckState quando cards.length === 0 |

## Fora de Escopo

- Alterar layout do DeckPage (T01.03)
- Criar onboarding tutorial

## Arquivos Permitidos para Modificação

- `frontend/src/components/EmptyDeckState.tsx` (novo)
- `frontend/src/pages/decks/DeckPage.tsx` (mudança mínima)

## Regression Risks

- (Listar riscos de regressão específicos desta task)

## Validation Scope

### Manual

- (Listar fluxos manuais para validação)

### Automated

- `npx tsc --noEmit`
- Build
- Testes relevantes

## Checklist de Implementação

- [x] 1. Criar `EmptyDeckState.tsx` com:
  - Mensagem amigável "Este baralho está vazio"
  - Botão "Criar primeiro card" chamando `onCreateCard`
  - Ícone ilustrativo (FileText)
  - (Opcional) Botão "Importar .apkg" via `onImportApkg`
- [x] 2. Substituir `EmptyState` por `EmptyDeckState` no `DeckPage.tsx`
- [x] 3. Rodar `npx tsc -b --noEmit` — passou

## Critérios de Aceitação

- Empty state visível quando deck não tem cards
- CTA funcional
- Tema escuro funcional

## Comandos de Verificação

```bash
cd frontend && npx tsc -b --noEmit
npx vitest run
```

## Definition of Done

- [x] Componente criado
- [x] Integrado ao DeckPage (substitui EmptyState)
- [x] `tsc` passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
