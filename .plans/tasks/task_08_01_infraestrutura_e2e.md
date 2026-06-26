---
id: "T08.01"
phase: "P08"
title: "Infraestrutura E2E e Configuração Global"
status: "pending"
priority: "high"
estimate: "1-2 days"
depends_on: []
---

# Task 08.01 — Infraestrutura E2E e Configuração Global

## Estado Atual

- **Situação**: Playwright config sem `webServer`, sem global setup, sem storage state
- **Config atual**: `e2e/playwright.config.ts` (22 linhas) — apenas chromium, workers=1, sem timeouts customizados
- **Helpers**: `uniqueUser()` + `sampleApkgPath()` apenas

## Objetivo

Criar infraestrutura E2E sólida que permita `npm run test:e2e` funcionar de forma autônoma (sobe stack via Docker, executa testes, derruba stack).

## Escopo

1. Adicionar `webServer` ao `playwright.config.ts` para iniciar `docker compose up -d` antes dos testes
2. Criar `e2e/global-setup.ts` — registrar usuário fixo, salvar `storageState` em `e2e/.auth/user.json`
3. Criar `e2e/global-teardown.ts` — opcionalmente limpar dados de teste
4. Atualizar `playwright.config.ts` para usar `globalSetup`, `globalTeardown`, `storageState`
5. Adicionar `e2e/helpers/auth.ts` com `authTest` fixture que já usa storageState
6. Adicionar timeouts realistas por projeto (30s para navegação, 15s para elementos)
7. Adicionar `.env.e2e` com URLs e credenciais do ambiente de teste
8. Verificar que `tsc --noEmit` passa nos arquivos `e2e/`
9. Rodar `npm run test:e2e` existente para validar que não quebrou nada

## Fora de Escopo

- Migrar para Docker Compose service dedicado para E2E
- Adicionar Firefox/WebKit (fazer apenas chromium por ora)
- CI/CD pipeline

## Arquivos Permitidos para Modificação

- `e2e/playwright.config.ts`
- `e2e/helpers.ts` (estender)
- `e2e/global-setup.ts` (novo)
- `e2e/global-teardown.ts` (novo)
- `e2e/helpers/auth.ts` (novo)
- `e2e/.env.e2e` (novo)

## Regression Risks

- Mudar `playwright.config.ts` pode quebrar `npm run test:e2e` existente se a config ficar inválida
- `webServer` com `docker compose` pode falhar se o Docker não estiver rodando (deve ser fail soft com warning)

## Validation Scope

### Automated

- `tsc --noEmit` no diretório `e2e/`
- `npm run test:e2e` — todos os 10 testes existentes devem passar verdes

### Manual

- Rodar `npm run test:e2e` sem Docker rodando — deve dar warning claro
- Rodar `npm run test:e2e` com Docker rodando — deve subir e executar

## Checklist de Implementação

- [ ] 1. Criar `e2e/.env.e2e` com variáveis de ambiente para E2E
- [ ] 2. Criar `e2e/global-setup.ts` com registro de usuário fixo e salvamento de storageState
- [ ] 3. Criar `e2e/global-teardown.ts` (pode ser no-op inicialmente)
- [ ] 4. Criar `e2e/helpers/auth.ts` com fixture `authTest` usando storageState
- [ ] 5. Atualizar `playwright.config.ts` com `webServer`, `globalSetup`, `globalTeardown`, `storageState`, timeouts
- [ ] 6. Executar `tsc --noEmit` no diretório `e2e/` para garantir tipagem correta
- [ ] 7. Rodar todos os testes existentes e verificar que continuam passando
- [ ] 8. Invocar `@reviewer`

## Critérios de Aceitação

- `npm run test:e2e` funciona sem intervenção manual (sobe stack se necessário)
- Global setup registra usuário e salva storageState
- Testes existentes (auth, review, analytics, share, import) continuam verdes
- `authTest` fixture está disponível para testes que não precisam de registro próprio
- `tsc --noEmit` passa sem erros

## Comandos de Verificação

```bash
npx tsc --noEmit --project e2e/tsconfig.json
npm run test:e2e
```

## Definition of Done

- [ ] `webServer` configurado
- [ ] Global setup com storageState funcional
- [ ] `authTest` fixture criada
- [ ] `tsc --noEmit` passa
- [ ] 10 testes existentes verdes
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).
