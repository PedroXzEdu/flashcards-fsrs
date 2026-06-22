---
id: "T07.05"
phase: "P07"
title: "Verificação Final de Regressão"
status: "pending"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 07.05 — Verificação Final de Regressão

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 07 — Preparação Final TCC](./phase_07_preparacao_final_tcc.md)
- **Dependências**: T07.01, T07.02, T07.03, T07.04

## Objetivo

Executar verificação completa de regressão antes da entrega final: build, testes, Docker, e fluxos críticos.

## Escopo

- Rodar build completo (backend + frontend)
- Rodar todos os testes
- Verificar Docker compose
- Verificar 5 fluxos críticos manualmente

## Fora de Escopo

- Testes de performance
- Pen test

## Arquivos Permitidos para Modificação

- Nenhum (apenas verificação)

## Regression Risks

- (Listar riscos de regressão específicos desta task)

## Validation Scope

### Manual

- (Listar fluxos manuais para validação)

### Automated

- `npx tsc --noEmit`
- Build
- Testes relevantes

## Checklist de Implementação

- [ ] 1. Rodar `docker compose build` (sem erros)
- [ ] 2. Rodar `docker compose up` (servidor sobe)
- [ ] 3. Executar `npx tsc --noEmit` (backend)
- [ ] 4. Executar `npx tsc -b --noEmit` (frontend)
- [ ] 5. Executar `npx vitest --project unit` (backend)
- [ ] 6. Executar `npx vitest run` (frontend)
- [ ] 7. Verificar manualmente os 5 fluxos:
  - [ ] Registro/Login
  - [ ] Criar baralho
  - [ ] Criar card com rich text
  - [ ] Revisar (again/hard/good/easy)
  - [ ] Dashboard analytics
- [ ] 8. Verificar theme escuro

## Critérios de Aceitação

- Build passa
- Testes passam
- Docker compose funciona
- Nenhum fluxo crítico quebrado

## Comandos de Verificação

```bash
docker compose build
docker compose up -d
```

## Definition of Done

- [ ] Build verificado
- [ ] Testes passando
- [ ] Fluxos manuais OK
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
