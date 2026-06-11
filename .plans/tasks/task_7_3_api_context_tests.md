# Task 7.3 — Testes da API Layer e Contextos

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 07 — Test Coverage Expansion](./phase_07_test_coverage.md)
- **Dependências**: Nenhuma

## Objetivo

Criar testes para a camada de API do frontend (5 arquivos) e contextos sem cobertura.

## Alvos sem Teste

### API Layer
| Arquivo | Funções |
|---|---|
| `frontend/src/api/client.ts` | `apiRequest()`, `apiGet()`, `apiPost()`, `apiPut()`, `apiDelete()` |
| `frontend/src/api/auth.ts` | `login()`, `register()`, `logout()` |
| `frontend/src/api/cards.ts` | `getCards()`, `createCard()`, `batchCreateCards()`, `updateCard()`, `deleteCard()` |
| `frontend/src/api/decks.ts` | `getDecks()`, `createDeck()`, `getDeck()`, `updateDeck()`, `deleteDeck()`, `shareDeck()`, `getSharedPreview()`, `importSharedDeck()` + `importApi` |
| `frontend/src/services/analyticsApi.ts` | `getStats()`, `getHeatmap()`, `getGlobalStats()` |

### Contextos
| Arquivo | Testes existentes |
|---|---|
| `frontend/src/contexts/ToastContext.tsx` | Nenhum |
| `frontend/src/contexts/AuthContext.tsx` | Sim (AuthContext.test.tsx existe) |
| `frontend/src/contexts/ThemeContext.tsx` | Sim (ThemeContext.test.tsx existe) |

### Hooks
| Hook | Testes existentes |
|---|---|
| `frontend/src/hooks/useFocusTrap.ts` | Nenhum |

## Fora de Escopo

- Testes de integração com backend real
- Refatorar API layer ou contextos

## Arquivos Permitidos para Modificação

- `frontend/src/api/__tests__/client.test.ts` (novo)
- `frontend/src/api/__tests__/auth.test.ts` (novo)
- `frontend/src/api/__tests__/cards.test.ts` (novo)
- `frontend/src/api/__tests__/decks.test.ts` (novo)
- `frontend/src/services/__tests__/analyticsApi.test.ts` (novo)
- `frontend/src/contexts/__tests__/ToastContext.test.tsx` (novo)
- `frontend/src/hooks/__tests__/useFocusTrap.test.ts` (novo)

## Checklist de Implementação

- [ ] 1. Testar `client.ts` — sucesso, erro, parsing de resposta
- [ ] 2. Testar `auth.ts` — login, register, logout chamam client corretamente
- [ ] 3. Testar `cards.ts` — CRUD operations
- [ ] 4. Testar `decks.ts` — CRUD + share operations
- [ ] 5. Testar `analyticsApi.ts` — chamadas de estatísticas
- [ ] 6. Testar `ToastContext.tsx` — adicionar/remover toasts, auto-dismiss
- [ ] 7. Testar `useFocusTrap.ts` — foco inicial, ciclo, cleanup
- [ ] 8. Rodar `npx vitest` no frontend

## Critérios de Aceitação

- API layer testada com fetch mockado
- ToastContext testado (add, dismiss, auto-removal)
- useFocusTrap testado (foco inicial e ciclo)
- Todos os testes passando

## Comandos de Verificação

```bash
npx vitest --project frontend
```

## Definition of Done

- [ ] Testes da API layer criados e passando
- [ ] ToastContext testado
- [ ] useFocusTrap testado
- [ ] `npx tsc -b --noEmit` passando
- [ ] `@reviewer` aprovou
