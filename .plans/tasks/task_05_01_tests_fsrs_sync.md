# Task 05.01 — Adicionar Testes para `syncWithFSRS`

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 05 — Evolução do FSRS](./phase_05_evolucao_fsrs.md)
- **Dependências**: Nenhuma

## Objetivo

Adicionar testes unitários para o fluxo de sincronização entre o frontend (FSRS.js) e o backend (`fsrsService.ts`).

## Locais a Modificar

| # | Arquivo | O que testar |
|---|---------|--------------|
| 1 | `backend/__tests__/unit/fsrsService.sync.test.ts` (novo) | Cenários de sync |
| 2 | `backend/__tests__/unit/fsrsService.review.test.ts` (novo) | Cenários de review |

## Fora de Escopo

- Modificar a lógica de sincronização (a menos que testes revelem bugs)
- Testes de integração (apenas unitários)

## Arquivos Permitidos para Modificação

- `backend/__tests__/unit/fsrsService.sync.test.ts` (novo)
- `backend/__tests__/unit/fsrsService.review.test.ts` (novo)

## Checklist de Implementação

- [ ] 1. Estudar `fsrsService.ts` e `fsrsServiceSync.ts` para entender o fluxo
- [ ] 2. Criar `fsrsService.sync.test.ts` testando:
  - Sync com card novo (sem revisões anteriores)
  - Sync com card já revisado
  - Sync com `latest_state` nulo
  - Sync com estado inválido/parcial
- [ ] 3. Criar `fsrsService.review.test.ts` testando:
  - Cada botão (again/hard/good/easy)
  - Transição de Learning → Review
  - Relearning
- [ ] 4. Rodar `npx vitest --project unit`

## Critérios de Aceitação

- Pelo menos 8 cenários testados
- Cobertura dos principais caminhos de sync/review
- Testes passando

## Comandos de Verificação

```bash
cd backend && npx vitest --project unit
```

## Definition of Done

- [ ] Testes de sync criados
- [ ] Testes de review criados
- [ ] Todos passando
- [ ] `@reviewer` aprovou
