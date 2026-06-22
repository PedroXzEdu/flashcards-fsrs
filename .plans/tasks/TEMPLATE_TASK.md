---
id: TXX.XX
phase: PXX
title: Nome da Tarefa
status: pending
priority: high|medium|low
estimate: X-Yh
depends_on: []
---

# Task XX.XX — Nome da Tarefa

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase XX — Nome](./phase_XX_nome.md)
- **Dependências**: Nenhuma

## Objetivo

Descrição clara do objetivo.

## Locais a Modificar

| # | Arquivo | O que fazer |
|---|---------|-------------|
| 1 | `caminho/do/arquivo` | Descrição da mudança |

## Fora de Escopo

- O que não será feito nesta task

## Arquivos Permitidos para Modificação

- `caminho/do/arquivo`

## Regression Risks

- Risco 1
- Risco 2
- Risco 3

## Validation Scope

### Manual

- Fluxo A
- Fluxo B

### Automated

- `npx tsc --noEmit`
- `npx vitest --project unit`
- Build

## Checklist de Implementação

- [ ] 1. Passo 1
- [ ] 2. Passo 2

## Critérios de Aceitação

- Critério 1
- Critério 2

## Comandos de Verificação

```bash
comando de verificação 1
comando de verificação 2
```

## Definition of Done

- [ ] Implementação finalizada
- [ ] `tsc --noEmit` passando
- [ ] Testes passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
