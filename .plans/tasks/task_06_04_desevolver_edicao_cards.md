# Task 06.04 — Implementar Edição Inline de Cards no DeckPage

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 06 — Features Futuras](./phase_06_features_futuras.md)
- **Dependências**: Nenhuma

## Objetivo

Adicionar edição inline dos campos `front` e `back` diretamente na listagem de cards, sem navegar para outra página.

## Locais a Modificar

| # | Arquivo | O que fazer |
|---|---------|-------------|
| 1 | `frontend/src/components/CardInlineEdit.tsx` (novo) | Componente de edição inline |
| 2 | `frontend/src/pages/decks/DeckPage.tsx` | Usar CardInlineEdit em vez de redirecionar |

## Fora de Escopo

- Edição de rich text (apenas texto simples)
- Arrastar para reordenar cards

## Arquivos Permitidos para Modificação

- `frontend/src/components/CardInlineEdit.tsx` (novo)
- `frontend/src/pages/decks/DeckPage.tsx`

## Checklist de Implementação

- [ ] 1. Criar `CardInlineEdit.tsx`:
  - Estado de edição (isEditing)
  - Ao clicar no card, entra em modo edição
  - Campos de texto para front e back
  - Botões Salvar/Cancelar
  - Ao salvar, chama API de update
- [ ] 2. Substituir link de edição no DeckPage
- [ ] 3. Rodar `npx tsc -b --noEmit`

## Critérios de Aceitação

- Edição inline funcional
- Salvar atualiza o card
- Cancelar restaura valor original
- Tema escuro funcional

## Comandos de Verificação

```bash
cd frontend && npx tsc -b --noEmit
npx vitest run
```

## Definition of Done

- [ ] Componente criado
- [ ] Integrado ao DeckPage
- [ ] `tsc` passando
- [ ] `@reviewer` aprovou
