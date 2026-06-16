# Task 02.02 — Tipar `data: any` em ReviewLogRepository

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 02 — Qualidade de Código e Tipagem](./phase_02_qualidade_tipagem.md)
- **Dependências**: Nenhuma

## Objetivo

Substituir `data: any` por interface `CreateReviewLogInput` em `reviewLogRepository.ts`.

## Locais a Modificar

| # | Arquivo | Linha | Uso atual | Tipo sugerido |
|---|---------|-------|-----------|---------------|
| 1 | `backend/src/repositories/reviewLogRepository.ts` | 5 | `create(client: PoolClient, data: any)` | `CreateReviewLogInput { user_id: number; card_id: number; rating: number; state: number; stability: number; difficulty: number; elapsed_days: number; scheduled_days: number; review: Date }` |

## Fora de Escopo

- Tipar retorno do método
- Refatorar lógica

## Arquivos Permitidos para Modificação

- `backend/src/repositories/reviewLogRepository.ts`

## Checklist de Implementação

- [ ] 1. Definir interface `CreateReviewLogInput` (pode ser no próprio arquivo)
- [ ] 2. Tipar parâmetro `data` do método `create`
- [ ] 3. Verificar chamada em `reviewService.submitReview` — garantir que passa os campos corretos
- [ ] 4. Rodar `npx tsc --noEmit` e testes

## Critérios de Aceitação

- `data: any` substituído por interface
- Type check passando

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
npx vitest --project unit
```

## Definition of Done

- [ ] Interface criada
- [ ] `any` substituído
- [ ] `tsc --noEmit` passando
- [ ] Testes passando
- [ ] `@reviewer` aprovou
