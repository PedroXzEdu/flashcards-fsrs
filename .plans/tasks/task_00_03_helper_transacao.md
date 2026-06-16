# Task 00.03 — Helper de Transação Reutilizável

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 00 — Correções Rápidas](./phase_00_correcoes_rapidas.md)
- **Dependências**: Nenhuma

## Objetivo

Criar função `withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>` que encapsula `pool.connect()`, `BEGIN`, `COMMIT`, `ROLLBACK` e `release()`. Refatorar `reviewService.submitReview` para usar o helper.

## Locais a Modificar

| # | Arquivo | Linhas | Problema |
|---|---------|--------|----------|
| 1 | `backend/src/services/reviewService.ts` | 67-121 | Transação manual com risco de `client` não liberado se `BEGIN` falhar |
| 2 | (futuro) `backend/src/services/importService.ts` | — | Possível uso similar |

## Fora de Escopo

- Refatorar a lógica de review ou import
- Criar testes para o helper (será testado pelos testes existentes de submitReview)

## Arquivos Permitidos para Modificação

- `backend/src/utils/transaction.ts` (novo)
- `backend/src/services/reviewService.ts`

## Checklist de Implementação

- [ ] 1. Criar `backend/src/utils/transaction.ts` com:
  ```typescript
  import { pool, PoolClient } from "../database/db";

  export async function withTransaction<T>(
    fn: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
  ```
- [ ] 2. Refatorar `reviewService.submitReview` para usar `withTransaction`
- [ ] 3. Garantir que `client.release()` sempre seja chamado
- [ ] 4. Rodar `npx tsc --noEmit` e testes

## Critérios de Aceitação

- Transação funciona corretamente (COMMIT em sucesso, ROLLBACK em erro)
- `client.release()` sempre chamado
- Testes de submitReview continuam passando

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
npx vitest --project unit
```

## Definition of Done

- [ ] Helper criado
- [ ] `reviewService.submitReview` refatorado
- [ ] `tsc --noEmit` passando
- [ ] Testes passando
- [ ] `@reviewer` aprovou
