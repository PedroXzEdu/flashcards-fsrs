# Task 5.5b — Docker: Compose Production

## Estado Atual

- **Situação**: Não iniciada
- **Task pai**: [Phase 05 — Production Readiness](./phase_05_production_readiness.md) (subtask de Task 5.5)
- **Dependências**: Task 5.5a (Prod Dockerfiles)
- **Último checkpoint**: N/A
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

- [ ] `docker-compose.prod.yml` criado
- [ ] Build + up funciona sem erros
- [ ] DB persiste entre restart
- [ ] Ordem de inicialização correta
- [ ] `@reviewer` aprovou
- [ ] Commit criado

## Commit Sugerido

```
feat(docker): production docker-compose with persistent volume and healthchecks
```
