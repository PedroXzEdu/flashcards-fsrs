---
id: "T01.04"
phase: "P01"
title: "Extrair Componentes do ReviewPage"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 01.04 — Extrair Componentes do ReviewPage

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 01 — Refatoração Frontend](./phase_01_refatoracao_frontend.md)
- **Dependências**: Nenhuma

## Objetivo

Dividir `ReviewPage.tsx` (818 linhas) em ~5 componentes independentes e refatorar o estado da sessão com `useReducer`.

## Escopo

- Criar `frontend/src/components/review/ReviewHeader.tsx`
- Criar `frontend/src/components/review/RatingButtons.tsx`
- Criar `frontend/src/components/review/ReviewCard.tsx`
- Criar `frontend/src/components/review/ReviewSessionProgress.tsx`
- Criar `frontend/src/components/review/ReviewSessionSummary.tsx`
- Refatorar estado da sessão com `useReducer`

## Fora de Escopo

- Mudar lógica de navegação (teclado, flip)
- Alterar o estilo dos componentes (manter CSS inline por enquanto — será refatorado na T01.06)

## Arquivos Permitidos para Modificação

- `frontend/src/components/review/ReviewHeader.tsx` (novo)
- `frontend/src/components/review/RatingButtons.tsx` (novo)
- `frontend/src/components/review/ReviewCard.tsx` (novo)
- `frontend/src/components/review/ReviewSessionProgress.tsx` (novo)
- `frontend/src/components/review/ReviewSessionSummary.tsx` (novo)
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

- [ ] 1. Criar `ReviewHeader.tsx` — botão sair, dots de progresso, shuffle, tema
- [ ] 2. Criar `RatingButtons.tsx` — 4 botões com preview de dias, hover/pressed states, tooltip
- [ ] 3. Criar `ReviewCard.tsx` — card com flip animation, frente/verso, CardContent
- [ ] 4. Criar `ReviewSessionProgress.tsx` — ProgressBar + dots de histórico
- [ ] 5. Criar `ReviewSessionSummary.tsx` — tela de conclusão com estatísticas
- [ ] 6. Refatorar estado da sessão com `useReducer` (actions: `LOAD_CARDS`, `FLIP`, `RATE`, `NEXT`, `SET_ERROR`, `SET_DONE`)
- [ ] 7. Substituir JSX inline em ReviewPage pelos novos componentes
- [ ] 8. Rodar `npx tsc -b --noEmit` e testar fluxo completo

## Critérios de Aceitação

- ReviewPage reduzido para ~200-300 linhas (apenas coordenação dos subcomponentes)
- Fluxo de revisão completo funciona (carregar → flip → rating → próximo → concluir)
- Teclado (espaço, 1-4) continua funcionando

## Comandos de Verificação

```bash
cd frontend && npx tsc -b --noEmit
npx vitest run
```

## Definition of Done

- [ ] 5 componentes criados
- [ ] useReducer implementado
- [ ] ReviewPage reduzido
- [ ] `tsc -b --noEmit` passando
- [ ] Testes passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
