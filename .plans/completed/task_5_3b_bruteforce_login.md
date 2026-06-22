---
id: "task_5_3b_bruteforce_login"
title: "Hardening: Brute Force Protection (Login)"
status: "completed"
priority: "medium"
type: "phase-completed"
---

# Task 5.3b — Hardening: Brute Force Protection (Login)

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 05 — Production Readiness](./phase_05_production_readiness.md) (subtask de Task 5.3)
- **Dependências**: Nenhuma (pode ser feito em paralelo com 5.3a e 5.3c)
- **Último checkpoint**: Implementado no commit `1664c17`
- **Critério explícito de conclusão**: Após 5 tentativas falhas de login em 15min, IP bloqueado por 30min. Reset após login bem-sucedido.

## Objetivo

Implementar brute force protection na rota de login.

## Escopo

- Implementar proteção in-memory (Map) para tentativas de login
- Após 5 falhas consecutivas em 15min, bloquear IP por 30min
- Resetar contagem após login bem-sucedido
- Aplicar middleware na rota de login

## Fora de Escopo

- Rate limit global (task 5.3a)
- Headers de segurança (task 5.3c)
- Persistência em banco de dados (in-memory é aceitável)
- Proteção em outras rotas além de login

## Arquivos Permitidos para Modificação

- `backend/src/middlewares/bruteForce.ts` (novo)
- `backend/src/middlewares/rateLimiter.ts` (se reutilizar estrutura)
- `backend/src/controllers/authController.ts` (resetar contagem no sucesso)
- `backend/src/app.ts` (aplicar middleware na rota de login)

## Checklist de Implementação

- [ ] Criar `backend/src/middlewares/bruteForce.ts` com lógica in-memory
- [ ] Configurar: 5 tentativas falhas → bloqueio de 30min por IP
- [ ] Janela de 15min para contagem de tentativas
- [ ] Resetar contagem após login bem-sucedido (no controller)
- [ ] Aplicar middleware na rota POST /api/auth/login
- [ ] Testar via supertest: 5 falhas → bloqueio, sucesso → reset

## Critérios de Aceitação

- Brute force: 5 falhas de login consecutivas bloqueiam IP por 30min
- Brute force é resetado após login bem-sucedido
- Resposta com status 429 e mensagem clara quando bloqueado
- Armazenamento in-memory (não persiste entre restart — aceitável)

## Comandos de Verificação

```bash
# Backend type check
npx tsc --noEmit

# Testes
npx vitest --project unit
npx vitest --project integration
```

## Definition of Done

- [x] Middleware de brute force criado (`backend/src/middlewares/bruteForce.ts`)
- [x] 5 falhas → bloqueio 30min (MAX_ATTEMPTS=5, BLOCK_MS=30min)
- [x] Login bem-sucedido → reset (escuta status 200 no evento finish)
- [x] `tsc --noEmit` passando
- [x] Testes passando
- [x] `@reviewer` aprovou
- [x] Commit criado (`1664c17`)

## Commit Sugerido

```
feat(security): add brute force protection on login (5 attempts, 30min block)
```

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
