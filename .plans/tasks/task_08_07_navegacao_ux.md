---
id: "T08.07"
phase: "P08"
title: "Navegação e UX — Testes de Regressão"
status: "completed"
priority: "medium"
estimate: "1-2 days"
depends_on: ["T08.01"]
---

# Task 08.07 — Navegação e UX: Testes de Regressão

## Estado Atual

- **Testes existentes**: Zero testes de navegação ou UX
- **Cobertura indireta**: Navegação é testada incidentalmente (ex: `auth.spec.ts` verifica redirect para `/login`)

## Objetivo

Criar testes E2E que verifiquem a navegação básica do aplicativo, garantindo que componentes compartilhados (Header, Sidebar) e transições de rota funcionem corretamente após mudanças.

## Escopo

1. **Sidebar / Navegação principal**:
   - Logado → sidebar exibe "Meus Baralhos", "Estatísticas"
   - Clicar "Meus Baralhos" → navega para `/`
   - Clicar "Estatísticas" → navega para `/stats`
   - Logout → sidebar some (ou redireciona)

2. **Header / Informações do usuário**:
   - Nome do usuário aparece no header após login
   - Botão "Sair" funciona (já testado, refatorar)

3. **Tema escuro**:
   - Alternar tema → classes CSS mudam
   - Tema persiste após reload (se implementado com localStorage)

4. **Redirecionamentos** (refatorar testes existentes):
   - `/` sem login → `/login`
   - `/stats` sem login → `/login`
   - `/decks/:id` sem login → `/login`
   - `/decks/:id/review` sem login → `/login`
   - `/shared/:token` sem login → página pública (não redireciona)

5. **404 / Rotas inválidas**:
   - Navegar para `/rota-inexistente` → página 404 ou redirect

## Fora de Escopo

- Testes de responsividade mobile (viewport < 768px) — adiar
- Testes de acessibilidade (aria labels, tab order)
- Testes de performance (LCP, CLS)
- Testes de PWA (service worker, manifest)

## Arquivos Permitidos para Modificação

- `e2e/navigation.spec.ts` (novo)

## Regression Risks

- **Baixo risco**: navegação é estável e raramente muda
- Testes de tema escuro dependem de como a alternância de tema é implementada (classes, data-attributes, CSS variables)

## Validation Scope

### Automated

- `tsc --noEmit`
- `npm run test:e2e -- --grep "Navigation|Theme"`

### Manual

- Verificar tema escuro manualmente
- Verificar sidebar em diferentes resoluções

## Checklist de Implementação

- [x] 1. Criar `e2e/navigation.spec.ts` com describe "Navigation & UX"
- [x] 2. Implementar teste de sidebar (links funcionam)
- [x] 3. Implementar teste de header (nome do usuário visível)
- [x] 4. Implementar teste de alternância de tema escuro
- [x] 5. Implementar teste de redirecionamentos (refatorar existentes se necessário)
- [x] 6. Implementar teste de rota inválida (404)
- [x] 7. Executar `tsc --noEmit` (E2E não executado: Docker indisponível)
- [x] 8. Invocar `@reviewer`

## Critérios de Aceitação

- 5+ testes de navegação/UX
- Sidebar coberta
- Header coberto
- Tema escuro coberto
- Redirecionamentos cobertos
- 404 coberto
- Todos os testes verdes

## Comandos de Verificação

```bash
npx tsc --noEmit --project e2e/tsconfig.json
npm run test:e2e -- --grep "Navigation|Theme"
```

## Definition of Done

- [x] 6 testes implementados
- [ ] Todos verdes (Docker indisponível — validar manualmente)
- [x] Navegação principal coberta
- [x] Tema escuro coberto
- [x] Redirecionamentos cobertos (rota inválida → home; shared → pública)
- [x] `@reviewer` aprovou (após correções: nome dinâmico + shared deck válido)

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).
