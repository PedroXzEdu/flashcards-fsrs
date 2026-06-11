# Task 7.1 — Testes do bruteForce.ts

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 07 — Test Coverage Expansion](./phase_07_test_coverage.md)
- **Dependências**: Nenhuma

## Objetivo

Criar testes unitários para o middleware `bruteForce.ts`, que é o único middleware sem cobertura (exporta `_resetAttempts` para teste, mas não há arquivo de teste).

## Escopo

- Testar bloqueio após 5 tentativas falhas
- Testar reset após login bem-sucedido
- Testar cleanup periódico
- Testar IPs diferentes não se afetarem
- Testar que requisições bem-sucedidas resetam contagem

## Fora de Escopo

- Testes de integração (apenas unitários, mockando req/res)
- Persistência entre restarts (in-memory por design)

## Arquivos Permitidos para Modificação

- `backend/src/middlewares/__tests__/bruteForce.test.ts` (novo)

## Checklist de Implementação

- [ ] 1. Criar `backend/src/middlewares/__tests__/bruteForce.test.ts`
- [ ] 2. Testar: 5 falhas consecutivas → bloqueio (429)
- [ ] 3. Testar: IP diferente não é bloqueado
- [ ] 4. Testar: login 200 reseta contagem
- [ ] 5. Testar: cleanup periódico remove registros expirados
- [ ] 6. Testar: `_resetAttempts` limpa estado
- [ ] 7. Rodar `npx vitest --project unit`

## Critérios de Aceitação

- Mínimo 4 testes para o middleware
- Cobertura dos cenários críticos (bloqueio, reset, isolamento)
- Testes passando isoladamente

## Comandos de Verificação

```bash
npx vitest --project unit -t bruteForce
```

## Definition of Done

- [ ] Testes criados e passando
- [ ] `tsc --noEmit` passando
- [ ] `@reviewer` aprovou
