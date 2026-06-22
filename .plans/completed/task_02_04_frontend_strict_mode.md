---
id: "T02.04"
phase: "P02"
title: "Habilitar `strict: true` no Frontend"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 02.04 — Habilitar `strict: true` no Frontend

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 02 — Qualidade de Código e Tipagem](./phase_02_qualidade_tipagem.md)
- **Dependências**: Nenhuma

## Objetivo

Ativar `"strict": true` no `frontend/tsconfig.json` e corrigir todos os erros de tipo resultantes.

## Locais a Modificar

| # | Arquivo | Problema |
|---|---------|----------|
| 1 | `frontend/tsconfig.json` | `"strict": false` (ou ausente) |
| 2 | Múltiplos arquivos .ts/.tsx | Erros de strict mode (null checks, implicit any, etc.) |

## Fora de Escopo

- Refatorar lógica de componentes
- Mudar tsconfig do backend (já deve estar strict)

## Arquivos Permitidos para Modificação

- `frontend/tsconfig.app.json`
- Arquivos .ts/.tsx quebrados pelo strict mode

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

- [ ] 1. Verificar tsconfig atual do frontend (`tsconfig.json`, `tsconfig.app.json`)
- [ ] 2. Ativar `"strict": true`
- [ ] 3. Rodar `npx tsc -b --noEmit` e catalogar todos os erros
- [ ] 4. Corrigir por categoria:
  - `strictNullChecks`: adicionar `| null` ou optional chaining
  - `noImplicitAny`: adicionar tipos explícitos
  - `strictFunctionTypes`: ajustar assinaturas
- [ ] 5. Garantir que `npm run build` passa

## Critérios de Aceitação

- `strict: true` ativo
- `npx tsc -b --noEmit` passa sem erros
- Build de produção funciona

## Comandos de Verificação

```bash
cd frontend && npx tsc -b --noEmit
npm run build
```

## Definition of Done

- [ ] strict mode ativado
- [ ] Erros corrigidos
- [ ] `tsc -b --noEmit` passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
