---
id: "T01.01"
phase: "P01"
title: "Extrair Componente `CardForm`"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 01.01 — Extrair Componente `CardForm`

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 01 — Refatoração Frontend](./phase_01_refatoracao_frontend.md)
- **Dependências**: Nenhuma

## Objetivo

Extrair o formulário de criação/edição de card (linhas 869-973 do `DeckPage.tsx`) em um componente `CardForm.tsx` reutilizável.

## Escopo

- Criar `frontend/src/components/CardForm.tsx` com props `initialValues?`, `onSave`, `onCancel`, `saving`, `editMode`
- Substituir bloco `{showForm && (...)}` em DeckPage pelo novo componente
- Garantir que `handleSave` no DeckPage funcione via prop `onSave`

## Fora de Escopo

- Refatorar lógica de validação
- Alterar estilo do formulário
- Criar testes para o componente (será feito na T01.07)

## Arquivos Permitidos para Modificação

- `frontend/src/components/CardForm.tsx` (novo)
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

- [ ] 1. Criar `CardForm.tsx` com o JSX extraído (RichTextEditor duplo, label, botões)
- [ ] 2. Definir interface `CardFormProps { initialValues?: {front:string, back:string}, onSave: (front:string, back:string) => Promise<void>, onCancel: () => void, saving: boolean, editMode?: boolean }`
- [ ] 3. Mover estado `front`, `back`, `saveStatus` para dentro do componente (ou receber via props — decidir)
- [ ] 4. Substituir `{showForm && (...)}` em DeckPage por `<CardForm>`
- [ ] 5. Ajustar `handleSave` para ser passado como `onSave`
- [ ] 6. Rodar `npx tsc -b --noEmit`

## Critérios de Aceitação

- Formulário de card funciona identicamente ao anterior
- DeckPage reduz em ~100 linhas
- Type check passando

## Comandos de Verificação

```bash
cd frontend && npx tsc -b --noEmit
npx vitest run
```

## Definition of Done

- [ ] CardForm criado e funcional
- [ ] DeckPage reduzido
- [ ] `tsc -b --noEmit` passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
