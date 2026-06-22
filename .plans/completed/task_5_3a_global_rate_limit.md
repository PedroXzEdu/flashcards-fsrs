---
id: "task_5_3a_global_rate_limit"
title: "Hardening: Global Rate Limit"
status: "completed"
priority: "medium"
type: "phase-completed"
---

# Task 5.3a — Hardening: Global Rate Limit

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 05 — Production Readiness](./phase_05_production_readiness.md) (subtask de Task 5.3)
- **Dependências**: Nenhuma
- **Último checkpoint**: Implementado no commit `1664c17`
- **Critério explícito de conclusão**: Rate limit global (1000 requests/15min) implementado, exceto em NODE_ENV=test

## Objetivo

Adicionar rate limit global como fallback de segurança.

## Escopo

- Implementar middleware de rate limit global (1000 requests/15min)
- Desabilitar rate limit em `NODE_ENV=test`
- Retornar 429 quando limite excedido
- Integrar ao pipeline de middlewares do Express

## Fora de Escopo

- Rate limit por rota específica
- Brute force protection no login
- Headers de segurança
- Configuração de CSP

## Arquivos Permitidos para Modificação

- `backend/src/app.ts` (aplicar middleware)
- `backend/src/middlewares/rateLimiter.ts` (criar ou modificar)

## Checklist de Implementação

- [ ] Criar/configurar middleware de rate limit global em `backend/src/middlewares/rateLimiter.ts`
- [ ] Configurar limite: 1000 requests por 15 minutos
- [ ] Ignorar rate limit quando `NODE_ENV=test`
- [ ] Aplicar middleware no `app.ts` (antes das rotas)
- [ ] Testar via supertest que 429 é retornado após exceder limite

## Critérios de Aceitação

- Rate limit global retorna 429 após 1000 requests em 15min
- Rate limiters não atrapalham testes (NODE_ENV=test)
- Mensagem de erro clara no 429

## Comandos de Verificação

```bash
# Backend type check
npx tsc --noEmit

# Testes
npx vitest --project unit
npx vitest --project integration

# Teste manual via curl (ajustar limite para testar)
```

## Definition of Done

- [x] Rate limit global implementado (`globalRateLimiter` em `rateLimiter.ts` + aplicado em `app.ts`)
- [x] 429 retornado corretamente
- [x] NODE_ENV=test ignora rate limit
- [x] `tsc --noEmit` passando
- [x] Testes passando (tests específicos em `rateLimiter.test.ts`)
- [x] `@reviewer` aprovou
- [x] Commit criado (`1664c17`)

## Commit Sugerido

```
feat(security): add global rate limit middleware (1000 req/15min)
```

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
