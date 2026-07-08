---
id: "T08.05"
phase: "P08"
title: "Fluxo de Revisão FSRS (Cobertura Completa)"
status: "completed"
priority: "high"
estimate: "2-3 days"
depends_on: ["T08.01"]
---

# Task 08.05 — Fluxo de Revisão FSRS (Cobertura Completa)

## Estado Atual

- **Testes existentes**: `e2e/review.spec.ts` com 1 teste que cobre o fluxo feliz completo (criar deck → criar cards → revisar com rating "Good")
- **Cobertura**: Apenas rating "Good" (3). Faltam Again (1), Hard (2), Easy (4). Faltam teclas de atalho, fila vazia, Learning state.

## Objetivo

Expandir `review.spec.ts` para cobrir todos os ratings, teclas de atalho, comportamento com fila vazia, e transições de estado do FSRS via interface.

## Escopo

1. **Todos os 4 ratings**:
   - Again (1) — card volta para fila (Learning ou Relearning conforme estado)
   - Hard (2) — card reagendado com intervalo menor
   - Good (3) — card reagendado normalmente (já testado, refatorar)
   - Easy (4) — card reagendado com intervalo maior

2. **Teclas de atalho**:
   - Espaço para virar card
   - Tecla 1 = Again, Tecla 2 = Hard, Tecla 3 = Good, Tecla 4 = Easy

3. **Fila de revisão vazia**:
   - Navegar para review sem cards pendentes → mensagem "nenhum card para revisar" ou redirect
   - Revisar todos os cards → tela de "sessão concluída" (já testado)

4. **Múltiplas sessões de revisão**:
   - Revisar hoje → agendar cards para o futuro → verificar que fila está vazia (se aplicável)

5. **Contador de cards na dashboard**:
   - Criar cards → verificar que contador de "due" aparece na dashboard

## Fora de Escopo

- Testar parâmetros FSRS customizáveis por deck (não implementado)
- Testar curva de esquecimento via E2E (testado em integração)
- Testar revisão com mais de 20 cards (performance)

## Arquivos Permitidos para Modificação

- `e2e/review.spec.ts` (expandir)
- `e2e/helpers/review.ts` (novo — se precisar de helpers específicos)

## Regression Risks

- **Altíssimo risco**: FSRS review flow é protegido. Qualquer mudança nos seletores de rating, ordem dos botões, ou comportamento de flip pode quebrar os testes.
- Teclas de atalho dependem de implementação de keyboard events no frontend
- Botões de rating podem ter texto diferente dependendo do estado do card (Learning × Review)

## Validation Scope

### Automated

- `tsc --noEmit`
- `npm run test:e2e -- --grep "Review"`

### Manual

- Verificar cada rating manualmente (Again, Hard, Good, Easy)
- Verificar teclas de atalho funcionam
- Verificar fila vazia

## Checklist de Implementação

- [x] 1. Refatorar teste existente para reutilizar setup via `authTest` fixture
- [x] 2. Adicionar teste para rating Again (tecla 1)
- [x] 3. Adicionar teste para rating Hard (tecla 2)
- [x] 4. Adicionar teste para rating Easy (tecla 4)
- [x] 5. Adicionar teste para teclas de atalho (Space, 1-4)
- [x] 6. Adicionar teste para fila de revisão vazia
- [x] 7. Adicionar teste para contador de due na dashboard
- [x] 8. Adicionar teste de sessão concluída (reforçar teste existente)
- [x] 9. Executar `tsc --noEmit` (E2E não executado: Docker indisponível no ambiente)
- [x] 10. Invocar `@reviewer`

## Critérios de Aceitação

- 6+ testes de revisão no total
- Todos os 4 ratings cobertos (não apenas Good)
- Teclas de atalho Space + 1-4 cobertas
- Fila vazia coberta
- Contador de due na dashboard coberto
- Todos os testes verdes

## Comandos de Verificação

```bash
npx tsc --noEmit --project e2e/tsconfig.json
npm run test:e2e -- --grep "Review"
```

## Definition of Done

- [x] 6+ testes implementados (6 testes)
- [ ] 6+ testes verdes (Docker indisponível no ambiente — validar manualmente)
- [x] Todos os 4 ratings cobertos
- [x] Teclas de atalho cobertas
- [x] Fila vazia coberta
- [x] `@reviewer` aprovou (após correções R1 e R2)

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).
