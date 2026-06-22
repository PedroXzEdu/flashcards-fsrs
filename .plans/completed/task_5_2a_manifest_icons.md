---
id: "task_5_2a_manifest_icons"
title: "PWA: Manifest & Icons"
status: "completed"
priority: "medium"
type: "phase-completed"
---

# Task 5.2a — PWA: Manifest & Icons

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 05 — Production Readiness](./phase_05_production_readiness.md) (subtask de Task 5.2)
- **Dependências**: Nenhuma
- **Último checkpoint**: Implementado no commit `1664c17`
- **Critério explícito de conclusão**: Manifest.json configurado com todos os campos obrigatórios, ícones 192x192 e 512x512 presentes, meta tags atualizadas

## Objetivo

Configurar o manifest.json e ícones PWA para que o app seja instalável.

## Escopo

- Verificar `manifest.json` gerado pelo `vite-plugin-pwa` — ícones, nome, short_name, theme_color
- Adicionar ícones PWA (pelo menos 192x192 e 512x512) em `frontend/public/`
- Atualizar meta tags e theme-color no `index.html`
- Verificar via Lighthouse PWA audit (ou Chrome DevTools > Application > Manifest)

## Fora de Escopo

- Configurar service worker
- Criar página offline
- Alterar lógica de registro do SW

## Arquivos Permitidos para Modificação

- `frontend/vite.config.ts` (config PWA — manifest)
- `frontend/public/icons/*` (novos arquivos de ícone)
- `frontend/index.html` (meta tags, theme-color)

## Checklist de Implementação

- [ ] Verificar configuração atual do manifest no vite.config.ts
- [ ] Garantir `name`, `short_name`, `start_url`, `display`, `theme_color`, `icons` no manifest
- [ ] Adicionar ícones 192x192 e 512x512 em `frontend/public/icons/`
- [ ] Atualizar `<meta name="theme-color">` no index.html
- [ ] Atualizar `<link rel="apple-touch-icon">` se aplicável
- [ ] Testar via DevTools > Application > Manifest
- [ ] Verificar que "Add to Home Screen" funciona

## Critérios de Aceitação

- Lighthouse PWA audit passa em todos os checks de "Installable"
- Manifest contém `name`, `short_name`, `icons`, `start_url`, `display`, `theme_color`
- Ícones aparecem corretamente no prompt de instalação
- Meta tags de theme-color presentes no HTML

## Comandos de Verificação

```bash
# Frontend type check
npx tsc -b --noEmit

# Build frontend
npx vite build

# Lighthouse CI ou inspeção manual via DevTools
```

## Definition of Done

- [x] manifest.json configurado corretamente (`vite.config.ts`: name, short_name, start_url, display, theme_color, icons)
- [x] Ícones 192x192 e 512x512 no repositório (`frontend/public/pwa-192x192.png`, `pwa-512x512.png`)
- [x] Meta tags atualizadas (`index.html`: theme-color, apple-touch-icon, apple-mobile-web-app-*)
- [x] Lighthouse "Installable" checks passing
- [x] `tsc -b --noEmit` passando
- [x] `@reviewer` aprovou
- [x] Commit criado (`1664c17`)

## Commit Sugerido

```
feat(pwa): configure manifest, icons and meta tags for installability
```

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
