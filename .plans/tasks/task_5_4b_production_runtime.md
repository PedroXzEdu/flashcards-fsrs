# Task 5.4b — Build: Production Runtime

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 05 — Production Readiness](./phase_05_production_readiness.md) (subtask de Task 5.4)
- **Dependências**: Task 5.4a (Build Pipeline)
- **Último checkpoint**: Implementado no commit `1664c17` — logger JSON em produção, VITE_API_URL configurável
- **Critério explícito de conclusão**: `NODE_ENV=production` usa logger JSON (não pretty-print), `VITE_API_URL` configurável, logs verbose desativados

## Objetivo

Configurar o comportamento runtime do backend em produção.

## Escopo

- Garantir que `NODE_ENV=production` desativa logs verbose e pretty-print
- Configurar logger para formato JSON em produção
- Verificar que `VITE_API_URL` é usado corretamente pelo frontend buildado

## Fora de Escopo

- Pipeline de build (task 5.4a)
- Docker (task 5.5a/5.5b)
- Variáveis de ambiente de produção (task 5.6b)

## Arquivos Permitidos para Modificação

- `backend/src/config/logger.ts`
- `frontend/vite.config.ts` (se necessário para VITE_API_URL)

## Checklist de Implementação

- [ ] Verificar `backend/src/config/logger.ts` — se `NODE_ENV=production`, usar JSON logger
- [ ] Desativar pretty-print em produção
- [ ] Desativar logs verbose em produção
- [ ] Verificar que `VITE_API_URL` é injetado via `import.meta.env.VITE_API_URL`
- [ ] Garantir que frontend buildado usa a variável corretamente

## Critérios de Aceitação

- `NODE_ENV=production` usa logger JSON (não pretty-print)
- Logs verbose desativados em produção
- `VITE_API_URL` configurável via env no build

## Comandos de Verificação

```bash
# Backend type check
npx tsc --noEmit

# Testar logger
NODE_ENV=production npx ts-node src/server.ts 2>&1 | head -5

# Verificar se saída é JSON
NODE_ENV=production node backend/dist/server.js 2>&1 | head -1 | python3 -m json.tool
```

## Definition of Done

- [x] Logger JSON em produção (`logger.ts`: `pino-pretty` apenas em dev, JSON nativo do pino em prod)
- [x] Pretty-print apenas em dev
- [x] VITE_API_URL funcional (`client.ts:1`, `decks.ts:2` com `import.meta.env.VITE_API_URL ?? "http://localhost:3000"`)
- [x] `tsc --noEmit` passando
- [x] `@reviewer` aprovou
- [x] Commit criado (`1664c17`)

## Commit Sugerido

```
chore(build): configure production runtime (JSON logger, no verbose, VITE_API_URL)
```
