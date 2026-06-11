# Phase 06 — Type Hardening

> **Arquivo índice / master.** Cada task abaixo tem seu próprio arquivo de microtask com detalhes completos.

## Objetivo

Reduzir o uso de `any` no código de produção, ativar opções strict no frontend, e remover supressões ESLint desnecessárias para melhorar a segurança de tipo em toda a codebase.

## Escopo

- Tipar `any` em 6 locais no backend (produção)
- Adicionar `noUnusedLocals`, `noUnusedParameters`, `strictNullChecks` no frontend `tsconfig.app.json`
- Remover `console.log` em produção
- Resolver ou justificar supressões ESLint (6 locais)

## Fora de Escopo

- Tipar `any` em arquivos de teste (133+ casts — fase separada)
- Refatorar arquitetura dos middlewares ou services
- Mudar comportamento de runtime

## Pré-requisitos

- Phase 05 concluída
- `tsc --noEmit` passando em backend e frontend

## Tasks (Índice)

| ID | Microtask | Arquivo | Dependências | Status |
|---|---|---|---|---|---|
| 6.1 | Tipar `any` em produção (backend) | [`task_6_1_production_any_types.md`](./task_6_1_production_any_types.md) | — | ✅ |
| 6.2 | Frontend tsconfig strict options | [`task_6_2_frontend_tsconfig_strict.md`](./task_6_2_frontend_tsconfig_strict.md) | — | ✅ |
| 6.3 | Remover `console.log` e supressões ESLint | [`task_6_3_eslint_cleanup.md`](./task_6_3_eslint_cleanup.md) | — | ✅ |

## Ordem de Execução

```
6.1 → 6.2 → 6.3
```

Tasks sem dependência podem ser executadas em paralelo.

## Riscos e Pontos de Atenção

- 6.1 requer atenção para não quebrar assinaturas de repositório (tipos devem refletir o schema real)
- 6.2 pode expor erros latentes no frontend — compilar e testar imediatamente
- 6.3 requer verificação de que supressões ESLint eram realmente desnecessárias

## Estado Atual

- **Início**: Fase não iniciada
- **Progresso**: 3/3 tasks

## Critério de Conclusão da Fase

- Todas as 3 microtasks concluídas e verificadas
- `tsc --noEmit` passando em backend e frontend
- `@reviewer` aprovou

## Checklist da Fase

- [x] 6.1 Tipar `any` em produção (backend)
- [x] 6.2 Frontend tsconfig strict
- [x] 6.3 ESLint cleanup
- [x] Revisão de código realizada
- [x] Critérios de aceitação validados
