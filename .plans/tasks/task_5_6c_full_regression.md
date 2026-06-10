# Task 5.6c — Deploy: Full Regression Verification

## Estado Atual

- **Situação**: Não iniciada
- **Task pai**: [Phase 05 — Production Readiness](./phase_05_production_readiness.md) (subtask de Task 5.6)
- **Dependências**: Todas as tasks anteriores (5.1 a 5.6b)
- **Último checkpoint**: N/A
- **Critério explícito de conclusão**: Todos os testes passando (unit + integration + E2E), build de produção compila, ROADMAP atualizado, `@doc` aprovou

## Objetivo

Executar verificação completa de regressão: testes, type checks, build, documentação. Não declarar fase concluída sem tudo verde.

## Escopo

- Rodar todos os testes: `vitest --project unit && vitest --project integration`
- Rodar testes E2E: `npm run test:e2e`
- Rodar `tsc --noEmit` em backend e frontend
- Verificar build de produção: `npm run build`
- Atualizar ROADMAP.md com status final da fase
- Invocar `@doc` para revisar documentação
- Garantir estado limpo com `docker compose down -v` + `up`

## Fora de Escopo

- Modificar código funcional
- Criar novas features
- Refatorar

## Arquivos Permitidos para Modificação

- `README.md` (se @doc apontar problemas)
- `ROADMAP.md` (atualizar status)
- `ARCHITECTURE.md`, `DECISIONS.md` (se @doc recomendar)

## Checklist de Implementação

- [ ] Rodar `vitest --project unit && vitest --project integration`
- [ ] Rodar `npm run test:e2e`
- [ ] Rodar `npx tsc --noEmit` no backend
- [ ] Rodar `npx tsc -b --noEmit` no frontend
- [ ] Rodar `npm run build` no root
- [ ] Rodar `docker compose down -v && docker compose -f docker-compose.prod.yml up --build -d`
- [ ] Verificar manualmente fluxos: login, register, criar deck, criar card, revisar, analytics
- [ ] Atualizar `ROADMAP.md` com status "Phase 05 — concluída"
- [ ] Invocar `@doc` para revisar documentação
- [ ] Corrigir problemas apontados pelo @doc (se houver)

## Critérios de Aceitação

- Todos os testes (unit + integration + E2E) passam
- Build de produção compila sem erros
- Docker Compose prod sobe sem erros
- Fluxos manuais verificados
- ROADMAP reflete estado final do projeto
- `@doc` aprova documentação

## Comandos de Verificação

```bash
# Type checks
cd backend && npx tsc --noEmit && cd ..
cd frontend && npx tsc -b --noEmit && cd ..

# Tests
npx vitest --project unit
npx vitest --project integration
npm run test:e2e

# Build
npm run build

# Docker
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=20 backend
```

## Definition of Done

- [ ] Todos os testes verdes
- [ ] Build de produção OK
- [ ] Docker compose prod funcional
- [ ] ROADMAP atualizado
- [ ] `@doc` aprovou
- [ ] Fluxos manuais verificados
- [ ] Fase marcada como concluída

## Commit Sugerido

```
chore(release): complete Phase 05 — Production Readiness
```
