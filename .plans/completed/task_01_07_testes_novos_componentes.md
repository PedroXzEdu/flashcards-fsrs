---
id: "T01.07"
phase: "P01"
title: "Adicionar Testes para Componentes Extraídos"
status: "completed"
priority: "medium"
estimate: ""
depends_on: []
---

# Task 01.07 — Adicionar Testes para Componentes Extraídos

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 01 — Refatoração Frontend](./phase_01_refatoracao_frontend.md)
- **Dependências**: Tasks 01.01 a 01.05

## Objetivo

Escrever testes com `@testing-library/react` para os componentes extraídos nas tasks anteriores. Foco nos componentes críticos: RatingButtons, ReviewCard, DeckCard, CardForm.

## Escopo

- Testar renderização básica e interações dos componentes extraídos
- Seguir padrão dos testes existentes (ex: `Button.test.tsx`, `ConfirmModal.test.tsx`)

## Fora de Escopo

- Testes de integração (serão mantidos os existentes)
- Testes de snapshot
- Cobertura 100% — priorizar componentes críticos

## Arquivos Permitidos para Modificação

- `frontend/src/components/__tests__/RatingButtons.test.tsx` (novo)
- `frontend/src/components/__tests__/ReviewCard.test.tsx` (novo)
- `frontend/src/components/__tests__/DeckCard.test.tsx` (novo)
- `frontend/src/components/__tests__/CardForm.test.tsx` (novo)

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

- [ ] 1. `RatingButtons.test.tsx`: renderiza 4 botões, chama onRate com valor correto, mostra scheduled_days do preview
- [ ] 2. `ReviewCard.test.tsx`: renderiza front, simula clique para virar, mostra back
- [ ] 3. `DeckCard.test.tsx`: renderiza título, descrição, card_count, due badge; clique no lixo chama onDelete
- [ ] 4. `CardForm.test.tsx`: submit com campos válidos, erro sem front, modo edição preenche campos
- [ ] 5. Rodar `npx vitest run` no frontend

```typescript
// Exemplo de teste para RatingButtons
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RatingButtons } from "../review/RatingButtons";

describe("RatingButtons", () => {
  it("renderiza 4 botões de rating", () => {
    render(<RatingButtons onRate={vi.fn()} preview={null} submitting={false} />);
    expect(screen.getByText("De novo")).toBeTruthy();
    expect(screen.getByText("Difícil")).toBeTruthy();
    expect(screen.getByText("Bom")).toBeTruthy();
    expect(screen.getByText("Fácil")).toBeTruthy();
  });

  it("chama onRate com valor 1 ao clicar em 'De novo'", () => {
    const onRate = vi.fn();
    render(<RatingButtons onRate={onRate} preview={null} submitting={false} />);
    fireEvent.click(screen.getByText("De novo"));
    expect(onRate).toHaveBeenCalledWith(1);
  });
});
```

## Critérios de Aceitação

- Pelo menos 4 arquivos de teste criados
- Todos os testes passam
- Cobertura mínima dos componentes extraídos

## Comandos de Verificação

```bash
cd frontend && npx vitest run
```

## Definition of Done

- [ ] Testes dos 4 componentes criados
- [ ] Todos os testes passando
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
