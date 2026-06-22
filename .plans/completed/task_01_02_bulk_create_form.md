---
id: "T01.02"
phase: "P01"
title: "Extrair Componente `BulkCreateForm`"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 01.02 — Extrair Componente `BulkCreateForm`

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 01 — Refatoração Frontend](./phase_01_refatoracao_frontend.md)
- **Dependências**: Nenhuma

## Objetivo

Extrair o formulário de criação em lote (linhas 976-1096 do `DeckPage.tsx`) em `BulkCreateForm.tsx`.

## Escopo

- Criar `frontend/src/components/BulkCreateForm.tsx`
- Mover lógica de parse (separadores `|` e `\t`, contagem de cards) para o componente
- Substituir bloco `{showBulk && (...)}` em DeckPage

## Fora de Escopo

- Alterar lógica de validação de entrada
- Adicionar preview dos cards antes de criar

## Arquivos Permitidos para Modificação

- `frontend/src/components/BulkCreateForm.tsx` (novo)
- `frontend/src/pages/decks/DeckPage.tsx`

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

- [ ] 1. Criar `BulkCreateForm.tsx` com textarea, botões, contagem de cards detectados
- [ ] 2. Interface: `BulkCreateFormProps { deckId: number, onSuccess: () => void, onCancel: () => void }`
- [ ] 3. Mover lógica de parse (`split("\n").filter(...).map(...)` ) para o componente
- [ ] 4. Manter chamada `cardsApi.createBatch` dentro do componente (ou receber via prop `onSubmit`)
- [ ] 5. Substituir `{showBulk && (...)}` em DeckPage
- [ ] 6. Rodar `npx tsc -b --noEmit`

## Critérios de Aceitação

- Bulk create funciona identicamente ao anterior
- DeckPage reduz em ~120 linhas

## Comandos de Verificação

```bash
cd frontend && npx tsc -b --noEmit
npx vitest run
```

## Definition of Done

- [ ] BulkCreateForm criado
- [ ] DeckPage reduzido
- [ ] `tsc -b --noEmit` passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
