# Task 04.04 — Consolidar Queries do `getGlobalStats`

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 04 — Performance e Banco](./phase_04_performance_banco.md)
- **Dependências**: Nenhuma

## Objetivo

Analisar e possivelmente combinar as 4 queries separadas de `getGlobalStats` (cards, reviews, decks, daily) em uma única CTE.

## Locais a Modificar

| # | Arquivo | Linhas | Queries atuais |
|---|---------|--------|----------------|
| 1 | `backend/src/repositories/reviewLogRepository.ts` | 127-183 | 4 queries independentes |

## Fora de Escopo

- Mudar formato da resposta da API (manter compatibilidade)
- Refatorar o frontend

## Arquivos Permitidos para Modificação

- `backend/src/repositories/reviewLogRepository.ts`

## Checklist de Implementação

- [ ] 1. Analisar se as 4 queries podem ser combinadas com CTE
- [ ] 2. Se viável e a query resultante for legível, refatorar:
  ```sql
  WITH cards_stats AS (
    SELECT COUNT(*) AS total_cards, ...
    FROM cards WHERE deck_id IN (SELECT id FROM decks WHERE user_id = $1)
  ),
  reviews_stats AS ( ... ),
  decks_stats AS ( ... ),
  daily_stats AS ( ... )
  SELECT ... FROM cards_stats, reviews_stats, decks_stats, daily_stats
  ```
- [ ] 3. Se a CTE ficar ilegível ou não trouxer ganho real, documentar decisão e pular
- [ ] 4. Rodar `npx tsc --noEmit` e testes

## Critérios de Aceitação

- Ou queries consolidadas, ou decisão documentada
- Testes de global stats continuam passando

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
npx vitest --project unit
```

## Definition of Done

- [ ] Queries analisadas
- [ ] Consolidado ou decisão documentada
- [ ] `tsc --noEmit` passando
- [ ] `@reviewer` aprovou
