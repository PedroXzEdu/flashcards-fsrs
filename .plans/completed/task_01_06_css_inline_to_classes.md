---
id: "T01.06"
phase: "P01"
title: "Mover CSS Inline para Componentes Base"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 01.06 — Mover CSS Inline para Componentes Base

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 01 — Refatoração Frontend](./phase_01_refatoracao_frontend.md)
- **Dependências**: Tasks 01.01 a 01.05 (recomendado, não obrigatório)

## Objetivo

Criar componentes-base estilizados (`Card`, `FormField`, `Badge`, `PageSection`) para substituir os `style={{}}` mais repetidos nos componentes extraídos.

## Escopo

- Criar `frontend/src/components/ui/Card.tsx` — container com bg, border, shadow, padding, borderRadius
- Criar `frontend/src/components/ui/FormField.tsx` — label + input estilizado
- Criar `frontend/src/components/ui/Badge.tsx` — badge de estado com cor
- Criar `frontend/src/components/ui/PageSection.tsx` — seção com título opcional
- Substituir padrões repetidos nos novos componentes

## Fora de Escopo

- Refatorar TODO o CSS inline do projeto (apenas os padrões mais repetidos)
- Migrar para CSS Modules ou Styled Components
- Mudar o tema visual

## Arquivos Permitidos para Modificação

- `frontend/src/components/ui/Card.tsx` (novo)
- `frontend/src/components/ui/FormField.tsx` (novo)
- `frontend/src/components/ui/Badge.tsx` (novo)
- `frontend/src/components/ui/PageSection.tsx` (novo)
- Componentes extraídos nas tasks 01.01-01.05

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

- [ ] 1. Criar `Card.tsx` — props: `variant?: 'default' | 'elevated'`, `padding?: string`, `children`
- [ ] 2. Criar `FormField.tsx` — props: `label: string`, `error?: string`, `children` (input/textarea)
- [ ] 3. Criar `Badge.tsx` — props: `variant: 'new' | 'learning' | 'review' | 'relearning'`, `children`
- [ ] 4. Criar `PageSection.tsx` — props: `title?: string`, `actions?: ReactNode`, `children`
- [ ] 5. Substituir nos componentes: CardListItem, DeckCard, CreateDeckForm, CardForm, BulkCreateForm
- [ ] 6. Rodar `npx tsc -b --noEmit`

## Critérios de Aceitação

- Padrões visuais repetidos substituídos por componentes
- Nenhuma mudança visual perceptível
- Type check passando

## Comandos de Verificação

```bash
cd frontend && npx tsc -b --noEmit
npx vitest run
```

## Definition of Done

- [ ] 4 componentes UI criados
- [ ] Padrões repetidos substituídos
- [ ] `tsc -b --noEmit` passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
