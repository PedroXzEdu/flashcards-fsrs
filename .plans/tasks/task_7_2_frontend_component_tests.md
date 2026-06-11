# Task 7.2 — Testes de Componentes Frontend

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 07 — Test Coverage Expansion](./phase_07_test_coverage.md)
- **Dependências**: Nenhuma

## Objetivo

Criar testes para 7 componentes frontend atualmente sem cobertura.

## Componentes sem Teste

| Componente | Arquivo | Complexidade |
|---|---|---|
| ActivityHeatmap | `frontend/src/components/ActivityHeatmap.tsx` | Média (requer dados mockados) |
| DailyQueue | `frontend/src/components/DailyQueue.tsx` | Média (render condicional) |
| EmptyState | `frontend/src/components/EmptyState.tsx` | Baixa (props simples) |
| ImportModal | `frontend/src/components/ImportModal.tsx` | Alta (upload, estados) |
| Layout | `frontend/src/components/Layout.tsx` | Média (header, nav, children) |
| RichTextEditor | `frontend/src/components/RichTextEditor.tsx` | Alta (Tiptap wrapper) |
| ShareModal | `frontend/src/components/ShareModal.tsx` | Média (toggle, cópia link) |

## Fora de Escopo

- Testes de integração com backend real
- Testes E2E
- Refatorar componentes

## Arquivos Permitidos para Modificação

- `frontend/src/components/__tests__/ActivityHeatmap.test.tsx` (novo)
- `frontend/src/components/__tests__/DailyQueue.test.tsx` (novo)
- `frontend/src/components/__tests__/EmptyState.test.tsx` (novo)
- `frontend/src/components/__tests__/ImportModal.test.tsx` (novo)
- `frontend/src/components/__tests__/Layout.test.tsx` (novo)
- `frontend/src/components/__tests__/RichTextEditor.test.tsx` (novo)
- `frontend/src/components/__tests__/ShareModal.test.tsx` (novo)

## Checklist de Implementação

- [ ] 1. EmptyState — renderizar com diferentes props (título, descrição, ação)
- [ ] 2. Layout — renderizar com header, nav, children
- [ ] 3. DailyQueue — renderizar cards pendentes e estado vazio
- [ ] 4. ActivityHeatmap — renderizar com dados mockados e loading state
- [ ] 5. ShareModal — testar toggle, cópia de link, fechamento
- [ ] 6. ImportModal — testar upload, loading, erro, success
- [ ] 7. RichTextEditor — testar renderização inicial (Tiptap mock)
- [ ] 8. Rodar `npx vitest` no frontend

## Critérios de Aceitação

- Mínimo 1 teste por componente (2+ para componentes complexos)
- Testes focam em comportamento, não implementação
- Todos passando

## Comandos de Verificação

```bash
npx vitest --project frontend
```

## Definition of Done

- [ ] 7 componentes com testes
- [ ] Testes passando
- [ ] `npx tsc -b --noEmit` passando
- [ ] `@reviewer` aprovou
