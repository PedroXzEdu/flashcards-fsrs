---
id: "T02.06"
phase: "P02"
title: "Limpar TODO, Dead Code e Comentários"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 02.06 — Limpar TODO, Dead Code e Comentários

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 02 — Qualidade de Código e Tipagem](./phase_02_qualidade_tipagem.md)
- **Dependências**: Nenhuma

## Objetivo

Revisar todo o código-fonte em busca de `TODO`, `FIXME`, `console.log` comentados, `debugger` e código morto.

## Escopo

- Buscar `TODO:`, `FIXME:`, `HACK:`, `XXX:` em todo `src/` (backend e frontend)
- Buscar `console.log` (não em testes)
- Buscar `debugger`
- Remover ou resolver cada ocorrência

## Fora de Escopo

- Refatorar lógica adjacente
- Resolver TODOs que exigem mudança de funcionalidade (apenas catalogar)

## Arquivos Permitidos para Modificação

- Qualquer arquivo em `backend/src/` e `frontend/src/`

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

- [ ] 1. Rodar `rg "TODO|FIXME|HACK|XXX" --include="*.ts" --include="*.tsx" src/` no backend e frontend
- [ ] 2. Rodar `rg "console\.(log|debug)" --include="*.ts" --include="*.tsx" src/`
- [ ] 3. Para cada ocorrência:
  - Se for resolvível agora → resolver
  - Se exigir mudança maior → criar issue/task e deixar comentário claro
  - Se for falso positivo → ignorar
- [ ] 4. Rodar `npx tsc --noEmit` e `npx tsc -b --noEmit`

## Critérios de Aceitação

- Nenhum `TODO`, `FIXME` ou `console.log` não justificado
- Type check passando

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
cd frontend && npx tsc -b --noEmit
```

## Definition of Done

- [ ] Código limpo de TODOs/FIXMEs
- [ ] `tsc` passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
