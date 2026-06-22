---
id: "task_5_2b_service_worker"
title: "PWA: Service Worker"
status: "completed"
priority: "medium"
type: "phase-completed"
---

# Task 5.2b — PWA: Service Worker

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 05 — Production Readiness](./phase_05_production_readiness.md) (subtask de Task 5.2)
- **Dependências**: Task 5.2a (Manifest & Icons)
- **Último checkpoint**: Implementado no commit `1664c17`
- **Critério explícito de conclusão**: Service worker registra sem erros, com estratégia NetworkFirst para API e CacheFirst para assets

## Objetivo

Configurar o service worker com estratégias de cache apropriadas.

## Escopo

- Configurar `vite-plugin-pwa` no `vite.config.ts` para gerar SW
- Estratégia NetworkFirst para chamadas de API
- Estratégia CacheFirst para assets estáticos
- Garantir que o SW registra corretamente no `main.tsx`

## Fora de Escopo

- Criar página offline
- Adicionar/remover ícones ou config manifest
- Modificar lógica de negócio do frontend

## Arquivos Permitidos para Modificação

- `frontend/vite.config.ts` (config PWA — service worker)
- `frontend/src/main.tsx` (register SW)

## Checklist de Implementação

- [ ] Configurar `vite-plugin-pwa` com `registerSW.js` ou injectRegister
- [ ] Definir estratégia NetworkFirst para rotas de API (`/api/*`)
- [ ] Definir estratégia CacheFirst para assets estáticos
- [ ] Configurar runtime caching no workbox
- [ ] Garantir que o registration acontece no `main.tsx` (ou via auto-register)
- [ ] Verificar no DevTools > Application > Service Workers que registrou sem erros

## Critérios de Aceitação

- Service worker registra sem erros
- NetworkFirst aplicado para chamadas de API
- CacheFirst aplicado para assets estáticos
- Navegação funciona com SW ativo
- Sem erros de CORS ou escopo no SW

## Comandos de Verificação

```bash
# Frontend type check
npx tsc -b --noEmit

# Build frontend (deve gerar SW)
npx vite build

# Verificar que o SW foi gerado em frontend/dist/
ls -la frontend/dist/sw* 2>/dev/null || ls -la frontend/dist/ | grep -i worker
```

## Definition of Done

- [x] Service worker gerado no build (vite-plugin-pwa via workbox)
- [x] Registro do SW sem erros no console (`main.tsx`: registerSW com onOfflineReady)
- [x] Estratégias de cache configuradas (NetworkFirst para API routes, globPatterns para assets estáticos)
- [x] `tsc -b --noEmit` passando
- [x] `@reviewer` aprovou
- [x] Commit criado (`1664c17`)

## Commit Sugerido

```
feat(pwa): configure service worker with NetworkFirst and CacheFirst strategies
```

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
