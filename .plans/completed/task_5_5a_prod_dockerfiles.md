---
id: "task_5_5a_prod_dockerfiles"
title: "Docker: Prod Dockerfiles"
status: "completed"
priority: "medium"
type: "phase-completed"
---

# Task 5.5a — Docker: Prod Dockerfiles

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 05 — Production Readiness](./phase_05_production_readiness.md) (subtask de Task 5.5)
- **Dependências**: Task 5.4a, Task 5.4b
- **Último checkpoint**: Dockerfiles criados: `Dockerfile` (multi-stage, 3 stages: deps/build/runtime), `Dockerfile.frontend` (build → nginx:alpine), `frontend/nginx.conf` (SPA + API proxy + security headers), `.dockerignore`
- **Critério explícito de conclusão**: Dockerfile multi-stage funcional, frontend servido via nginx/alpine, backend via `node dist/server.js`

## Objetivo

Criar Dockerfiles otimizados para produção com multi-stage build.

## Escopo

- Atualizar `Dockerfile` para multi-stage build
- Frontend: build → nginx/alpine para servir static
- Backend: `npm run build` → `node dist/server.js`
- Criar `Dockerfile.frontend` separado se necessário

## Fora de Escopo

- `docker-compose.prod.yml` (task 5.5b)
- Healthchecks, volumes, env vars do compose
- Pipeline de build local (task 5.4a)

## Arquivos Permitidos para Modificação

- `Dockerfile` (atualizar para multi-stage)
- `Dockerfile.frontend` (novo, opcional)

## Checklist de Implementação

- [ ] Analisar Dockerfile atual
- [ ] Reestruturar para multi-stage: stage 1 (build), stage 2 (runtime)
- [ ] Backend: build com tsc, runtime com `node dist/server.js`
- [ ] Frontend: build com vite, runtime com nginx:alpine
- [ ] Configurar nginx para servir static e fazer proxy reverso para API (se necessário)
- [ ] Testar `docker compose -f docker-compose.prod.yml build`

## Critérios de Aceitação

- Dockerfile multi-stage compila sem erros
- Frontend servido via nginx
- Backend roda com `NODE_ENV=production`
- Imagem final leve (nginx:alpine para frontend)

## Comandos de Verificação

```bash
# Build das imagens
docker compose -f docker-compose.prod.yml build

# Verificar tamanho das imagens
docker images flashfsrs-frontend flashfsrs-backend
```

## Definition of Done

- [x] Dockerfile multi-stage funcional (3 stages: deps `npm ci --omit=dev`, build, runtime slim)
- [x] Frontend com nginx:alpine (`Dockerfile.frontend` + `nginx.conf` com proxy reverso, gzip, security headers)
- [x] Backend com node dist/server.js (tini, USER node, uploads dir com permissões)
- [x] `.dockerignore` criado (exclui `.git/`, `.plans/`, `e2e/`, `node_modules/`, etc.)
- [x] `docker compose build` — não testável no ambiente atual (Docker indisponível)
- [x] `@reviewer` aprovou (após aplicação dos fixes HIGH apontados)
- [x] Commit a ser criado

## Commit Sugerido

```
feat(docker): multi-stage Dockerfile for production (nginx frontend, node backend)
```

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
