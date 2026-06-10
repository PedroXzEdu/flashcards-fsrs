# Task 5.2c — PWA: Offline Page

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 05 — Production Readiness](./phase_05_production_readiness.md) (subtask de Task 5.2)
- **Dependências**: Task 5.2b (Service Worker)
- **Último checkpoint**: Implementado no commit `1664c17`
- **Critério explícito de conclusão**: App offline mostra página informativa (não tela branca) quando sem conectividade

## Objetivo

Adicionar página offline básica para quando o usuário estiver sem conexão.

## Escopo

- Criar página offline (HTML estático ou gerado via SW)
- Configurar service worker para servir offline page quando offline
- Garantir que navegação offline exibe conteúdo informativo

## Fora de Escopo

- Modificar manifest ou ícones
- Cache de dados do usuário para uso offline
- Sincronização offline de cards/respostas

## Arquivos Permitidos para Modificação

- `frontend/vite.config.ts` (config PWA — offline page)
- `frontend/index.html` ou novo arquivo `frontend/offline.html`

## Checklist de Implementação

- [ ] Criar página offline informativa (ex: "Você está offline. Conecte-se à internet para usar o FlashFSRS.")
- [ ] Configurar `vite-plugin-pwa` com opção `offlinePage` ou custom `workbox.navigateFallback`
- [ ] Garantir que o SW serve a página offline quando `navigate` falha
- [ ] Testar offline via DevTools > Network > Offline
- [ ] Verificar que não aparece tela branca

## Critérios de Aceitação

- App offline mostra página informativa (não tela branca)
- Mensagem clara para o usuário sobre falta de conectividade
- Navegação offline não crasha o app

## Comandos de Verificação

```bash
# Frontend type check
npx tsc -b --noEmit

# Build
npx vite build

# Teste manual: DevTools > Network > Offline, recarregar página
```

## Definition of Done

- [x] Offline page criada e servida pelo SW (`frontend/public/offline.html` + `navigateFallback: "/offline.html"`)
- [x] Teste offline bem-sucedido (sem tela branca)
- [x] `tsc -b --noEmit` passando
- [x] `@reviewer` aprovou
- [x] Commit criado (`1664c17`)

## Commit Sugerido

```
feat(pwa): add offline fallback page for when network is unavailable
```
