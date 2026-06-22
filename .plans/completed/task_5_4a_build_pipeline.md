---
id: "task_5_4a_build_pipeline"
title: "Build: Pipeline"
status: "completed"
priority: "medium"
type: "phase-completed"
---

# Task 5.4a — Build: Pipeline

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 05 — Production Readiness](./phase_05_production_readiness.md) (subtask de Task 5.4)
- **Dependências**: Nenhuma
- **Último checkpoint**: Implementado no commit `1664c17` — build verificado: `npm run build` compila ambos sem erros
- **Critério explícito de conclusão**: `npm run build` no root compila backend + frontend sem erros, frontend em `dist/` (~500KB gzipped), backend em `dist/`

## Objetivo

Configurar o pipeline de build de produção para frontend e backend.

## Escopo

- Verificar `vite build` no frontend — minificação, tree-shaking, chunk splitting
- Verificar `tsc` no backend — compilação para `dist/`
- Adicionar script `build` no backend (`tsc`)
- Garantir que `npm run build` no root faz build de ambos
- Validar que `npm run preview` (frontend) funciona apontando para API real

## Fora de Escopo

- Configuração de runtime de produção (NODE_ENV, logger) — task 5.4b
- Docker build — task 5.5a
- Variáveis de ambiente de produção — task 5.6b

## Arquivos Permitidos para Modificação

- `backend/package.json`
- `frontend/package.json`
- `package.json` (root)
- `frontend/vite.config.ts`

## Checklist de Implementação

- [ ] Verificar script `build` no `backend/package.json` (`tsc`)
- [ ] Adicionar script `build` se ausente
- [ ] Verificar `vite build` no frontend — configurar chunk splitting se necessário
- [ ] Garantir `npm run build` no root executa build de backend + frontend
- [ ] Verificar que `frontend/dist/` é gerado (~500KB gzipped)
- [ ] Verificar que `backend/dist/` é gerado
- [ ] Testar `npm run preview` (frontend) com API real

## Critérios de Aceitação

- `npm run build` no root compila backend + frontend sem erros
- Frontend buildado em `frontend/dist/` (~500KB gzipped)
- Backend compilado em `backend/dist/`
- `npm run preview` funciona

## Comandos de Verificação

```bash
# Build completo
npm run build

# Verificar artefatos
ls -la frontend/dist/
ls -la backend/dist/

# Preview
cd frontend && npx vite preview --port 4173
```

## Definition of Done

- [x] `npm run build` funciona no root (roda backend + frontend sequencialmente)
- [x] Artefatos de build gerados (frontend/dist com PWA, backend/dist com JS compilado)
- [x] Preview do frontend funcional (`vite preview`)
- [x] `tsc --noEmit` passando (backend)
- [x] `tsc -b --noEmit` passando (frontend)
- [x] `@reviewer` aprovou
- [x] Commit criado (`1664c17`)

## Commit Sugerido

```
chore(build): configure production build pipeline for frontend and backend
```

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
