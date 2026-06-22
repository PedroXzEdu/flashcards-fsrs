---
id: "task_6_2_frontend_tsconfig_strict"
title: "Frontend tsconfig Strict Options"
status: "completed"
priority: "medium"
type: "phase-completed"
---

# Task 6.2 — Frontend tsconfig Strict Options

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 06 — Type Hardening](./phase_06_type_hardening.md)
- **Dependências**: Nenhuma

## Objetivo

Ativar `noUnusedLocals`, `noUnusedParameters` e `strictNullChecks` no `tsconfig.app.json` do frontend, alinhando com o backend.

## Locais a Modificar

- `frontend/tsconfig.app.json` — adicionar flags ausentes

## Fora de Escopo

- Alterar tsconfig.json (root) ou tsconfig.node.json
- Modificar tsconfig do backend
- Refatorar componentes para compatibilidade

## Arquivos Permitidos para Modificação

- `frontend/tsconfig.app.json`
- Arquivos `.ts/.tsx` que precisarem de ajustes mínimos para compilar com as novas flags

## Checklist de Implementação

- [ ] 1. Adicionar `noUnusedLocals: true` ao `compilerOptions`
- [ ] 2. Adicionar `noUnusedParameters: true` ao `compilerOptions`
- [ ] 3. Adicionar `strictNullChecks: true` ao `compilerOptions`
- [ ] 4. Rodar `npx tsc -b --noEmit` e corrigir erros
- [ ] 5. Verificar se `strict: true` já cobre algumas flags (evitar duplicação)

## Critérios de Aceitação

- `npx tsc -b --noEmit` passa sem erros
- Nenhum unused local/parameter no código de produção
- Nulos são tratados adequadamente

## Comandos de Verificação

```bash
npx tsc -b --noEmit
```

## Definition of Done

- [ ] Flags strict ativadas e compilando
- [ ] `npx tsc -b --noEmit` passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
