---
id: "T06.05"
phase: "P06"
title: "Adicionar Paginação na Listagem de Cards"
status: "pending"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 06.05 — Adicionar Paginação na Listagem de Cards

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 06 — Features Futuras](./phase_06_features_futuras.md)
- **Dependências**: T00.02 (pagination schema existente)

## Objetivo

Adicionar paginação na tela do DeckPage, já que o deck pode ter centenas de cards.

## Locais a Modificar

| # | Arquivo | O que fazer |
|---|---------|-------------|
| 1 | `frontend/src/components/Pagination.tsx` (novo) | Componente de paginação |
| 2 | `frontend/src/pages/decks/DeckPage.tsx` | Adicionar paginação nos cards |
| 3 | `frontend/src/api/cards.ts` | Passar page/limit na listagem |

## Fora de Escopo

- Paginação infinita (scroll infinito)
- Ordenação customizada

## Arquivos Permitidos para Modificação

- `frontend/src/components/Pagination.tsx` (novo)
- `frontend/src/pages/decks/DeckPage.tsx`
- `frontend/src/api/cards.ts`

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

- [ ] 1. Criar `Pagination.tsx`:
  - Props: currentPage, totalPages, onPageChange
  - Botões Anterior/Próximo
  - Número da página atual
- [ ] 2. Modificar `api/cards.ts` para aceitar `page` e `limit`
- [ ] 3. Integrar no DeckPage: estado de página, chamar API com paginação
- [ ] 4. Rodar `npx tsc -b --noEmit`

## Critérios de Aceitação

- Paginação funcional no DeckPage
- Navegação entre páginas sem recarregar
- Tema escuro funcional

## Comandos de Verificação

```bash
cd frontend && npx tsc -b --noEmit
npx vitest run
```

## Definition of Done

- [ ] Componente de paginação criado
- [ ] Integrado ao DeckPage
- [ ] `tsc` passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
