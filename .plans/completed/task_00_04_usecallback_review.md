---
id: "T00.04"
phase: "P00"
title: "Adicionar `useCallback` no ReviewPage"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 00.04 — Adicionar `useCallback` no ReviewPage

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 00 — Correções Rápidas](./phase_00_correcoes_rapidas.md)
- **Dependências**: Nenhuma

## Objetivo

Envolver `handleFlip` e `handleRate` em `useCallback` no `ReviewPage.tsx` para remover os `eslint-disable-next-line react-hooks/exhaustive-deps`.

## Locais a Modificar

| # | Arquivo | Linhas | Problema |
|---|---------|--------|----------|
| 1 | `frontend/src/pages/review/ReviewPage.tsx` | 154-179 | `useEffect` do teclado com `eslint-disable` porque handlers mudam a cada render |
| 2 | `frontend/src/pages/review/ReviewPage.tsx` | 152 | `eslint-disable-next-line` por dependência de `shuffled` no loadCards |

## Fora de Escopo

- Extrair componentes (Fase 01)
- Mudar lógica de navegação por teclado

## Arquivos Permitidos para Modificação

- `frontend/src/pages/review/ReviewPage.tsx`

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

- [ ] 1. Envolver `handleFlip` com `useCallback` (dependências: `flipped`, `cards`, `index`)
- [ ] 2. Envolver `handleRate` com `useCallback` (dependências: `submitting`, `cards`, `index`, `history`, `reviewed`)
- [ ] 3. Remover `eslint-disable-next-line react-hooks/exhaustive-deps` do useEffect do teclado
- [ ] 4. Analisar o useEffect do `loadCards` (linha 149-152) — documentar por que `shuffled` não deve recarregar, ou refatorar
- [ ] 5. Rodar `npx tsc -b --noEmit` e lint

## Critérios de Aceitação

- Nenhum `eslint-disable` relacionado a hooks no ReviewPage
- Comportamento do teclado mantido (espaço/enter para virar, 1-4 para rating)
- Type check e lint passando

## Comandos de Verificação

```bash
cd frontend && npx tsc -b --noEmit
npx eslint src/pages/review/ReviewPage.tsx
npx vitest run
```

## Definition of Done

- [ ] Handlers estabilizados com `useCallback`
- [ ] `eslint-disable` removidos
- [ ] `tsc -b --noEmit` passando
- [ ] Testes passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
