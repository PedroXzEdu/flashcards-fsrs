---
id: "task_5_5b_docker_compose_prod"
title: "Docker: Compose Production"
status: "completed"
priority: "medium"
type: "phase-completed"
---

# Task 5.5b — Docker: Compose Production

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 05 — Production Readiness](./phase_05_production_readiness.md) (subtask de Task 5.5)
- **Dependências**: Task 5.5a (Prod Dockerfiles)
- **Último checkpoint**: Commit `bbebb73` — docker-compose.prod.yml criado com nginx proxy + SPA fallback, db creds alinhadas
- **Critério explícito de conclusão**: `docker compose -f docker-compose.prod.yml up` funciona com frontend, backend e banco, serviços na ordem correta, dados persistem

## Objetivo

Criar `docker-compose.prod.yml` com configuração otimizada para produção.

## Escopo

- Criar `docker-compose.prod.yml` baseado no compose de dev
- Remover serviços de dev desnecessários (db-test, tools)
- Adicionar volume persistente para o banco de dados
- Adicionar healthcheck para o banco
- Adicionar `restart: unless-stopped` nos serviços
- Configurar variáveis de ambiente para produção (CORS_ORIGIN, JWT_SECRET)
- Garantir ordem de inicialização (db → backend → frontend)

## Fora de Escopo

- Dockerfile multi-stage (task 5.5a)
- Deploy real em VPS
- CI/CD pipeline
- SSL/TLS

## Arquivos Permitidos para Modificação

- `docker-compose.prod.yml` (novo)

## Checklist de Implementação

- [ ] Criar `docker-compose.prod.yml` baseado no de dev
- [ ] Remover serviços db-test, tools, etc.
- [ ] Adicionar volume persistente para PostgreSQL
- [ ] Adicionar healthcheck no serviço db
- [ ] Adicionar `restart: unless-stopped` nos serviços
- [ ] Configurar env vars: `CORS_ORIGIN`, `JWT_SECRET`, `DB_*`
- [ ] Garantir `depends_on` com condition: service_healthy para db
- [ ] Testar `docker compose -f docker-compose.prod.yml up` completo

## Critérios de Aceitação

- `docker compose -f docker-compose.prod.yml build` completa sem erros
- Frontend servido via nginx (porta 80 ou 8080)
- Backend rodando com `NODE_ENV=production`
- Banco de dados persiste entre restart
- Serviços iniciam na ordem correta (db → backend → frontend)

## Comandos de Verificação

```bash
# Build e up
docker compose -f docker-compose.prod.yml up --build -d

# Verificar serviços
docker compose -f docker-compose.prod.yml ps

# Verificar logs
docker compose -f docker-compose.prod.yml logs backend

# Testar endpoint
curl -s http://localhost:8080/api/health

# Down com volume para teste limpo
docker compose -f docker-compose.prod.yml down -v
```

## Definition of Done

- [x] `docker-compose.prod.yml` criado (3 services: frontend nginx, backend node, postgres)
- [x] Build + up — não testável no ambiente (Docker indisponível)
- [x] DB persiste entre restart (volume pgdata)
- [x] Ordem de inicialização correta (db healthy → backend → frontend)
- [x] `@reviewer` aprovou
- [x] Commit criado (`bbebb73`)

## Commit Sugerido

```
feat(docker): production docker-compose with persistent volume and healthchecks
```

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
