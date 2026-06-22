---
id: "T07.04"
phase: "P07"
title: "Limpeza Final de Código"
status: "pending"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 07.04 — Limpeza Final de Código

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 07 — Preparação Final TCC](./phase_07_preparacao_final_tcc.md)
- **Dependências**: Todas as tasks anteriores

## Objetivo

Remover comentários temporários, `console.log` esquecidos, código comentado e arquivos não utilizados.

## Escopo

- Procurar `console.log` no backend e frontend
- Procurar código comentado (blocos grandes)
- Remover imports não utilizados
- Verificar se há arquivos órfãos

## Fora de Escopo

- Refatoração de código funcional
- Mudanças em lógica de negócio

## Arquivos Permitidos para Modificação

- Qualquer arquivo de código (backend/frontend)

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

- [ ] 1. Rodar `grep -rn "console.log"` no backend e frontend
- [ ] 2. Remover logs que não são de erro legítimo
- [ ] 3. Procurar blocos de código comentados (>3 linhas)
- [ ] 4. Rodar linter
- [ ] 5. Rodar `npx tsc --noEmit` nos dois projetos

## Critérios de Aceitação

- Nenhum `console.log` de debug
- Nenhum bloco grande de código comentado
- Type check passando

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
cd frontend && npx tsc -b --noEmit
```

## Definition of Done

- [ ] Logs de debug removidos
- [ ] Código comentado removido
- [ ] `tsc` passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
