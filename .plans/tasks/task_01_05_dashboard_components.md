# Task 01.05 — Extrair Componentes do DashboardPage

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 01 — Refatoração Frontend](./phase_01_refatoracao_frontend.md)
- **Dependências**: Nenhuma

## Objetivo

Dividir `DashboardPage.tsx` (881 linhas) em ~5 componentes independentes.

## Escopo

- Criar `frontend/src/components/StreakCards.tsx`
- Criar `frontend/src/components/WorkloadChart.tsx`
- Criar `frontend/src/components/dashboard/DeckCard.tsx`
- Criar `frontend/src/components/dashboard/DeckList.tsx`
- Criar `frontend/src/components/dashboard/CreateDeckForm.tsx`

## Fora de Escopo

- Mudar lógica de carregamento de dados
- Alterar layout da página

## Arquivos Permitidos para Modificação

- `frontend/src/components/StreakCards.tsx` (novo)
- `frontend/src/components/WorkloadChart.tsx` (novo)
- `frontend/src/components/dashboard/DeckCard.tsx` (novo)
- `frontend/src/components/dashboard/DeckList.tsx` (novo)
- `frontend/src/components/dashboard/CreateDeckForm.tsx` (novo)
- `frontend/src/pages/decks/DashboardPage.tsx`

## Checklist de Implementação

- [ ] 1. Criar `StreakCards.tsx` — cards de streak atual, maior sequência, dias estudados
- [ ] 2. Criar `WorkloadChart.tsx` — gráfico de barras com previsão de revisões + seletor de dias
- [ ] 3. Criar `DeckCard.tsx` — card individual com título, descrição, contagem, due badge, botão excluir
- [ ] 4. Criar `DeckList.tsx` — grid com loading (skeleton), empty state, lista de DeckCards
- [ ] 5. Criar `CreateDeckForm.tsx` — formulário com título, descrição, submit/cancel
- [ ] 6. Substituir JSX inline em DashboardPage
- [ ] 7. Extrair `fillWorkloadDays` e `WorkloadTooltip` para dentro de WorkloadChart
- [ ] 8. Rodar `npx tsc -b --noEmit`

## Critérios de Aceitação

- DashboardPage reduzido para ~200-300 linhas
- Todos os subcomponentes funcionam independentemente
- Streak, workload, lista de decks e formulário intactos

## Comandos de Verificação

```bash
cd frontend && npx tsc -b --noEmit
npx vitest run
```

## Definition of Done

- [ ] 5 componentes criados
- [ ] DashboardPage reduzido
- [ ] `tsc -b --noEmit` passando
- [ ] `@reviewer` aprovou
