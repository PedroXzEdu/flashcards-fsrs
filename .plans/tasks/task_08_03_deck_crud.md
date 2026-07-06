---
id: "T08.03"
phase: "P08"
title: "Gerenciamento de Baralhos (CRUD)"
status: "completed"
priority: "high"
estimate: "2 days"
depends_on: ["T08.01"]
---

# Task 08.03 — Gerenciamento de Baralhos (CRUD)

## Estado Atual

- **Testes existentes**: Zero testes específicos de gerenciamento de baralhos
- **Cobertura indireta**: `review.spec.ts` cria um deck como parte do fluxo de revisão, mas não testa rename, delete ou validação

## Objetivo

Criar teste E2E completo para operações CRUD de baralhos: criar, renomear, excluir, estado vazio e validação.

## Escopo

1. **Criar baralho**:
   - Criar com título válido → aparece na dashboard
   - Criar com título muito longo → validação (se aplicável)
   - Botão "Novo baralho" abre modal

2. **Renomear baralho**:
   - Navegar para detalhe do deck → cliclar renomear → novo título → persiste após reload

3. **Excluir baralho**:
   - Excluir baralho vazio → desaparece da dashboard
   - Excluir baralho com cards → confirmar exclusão → desaparece
   - Cancelar exclusão → baralho permanece

4. **Estado vazio**:
   - Dashboard sem baralhos → mensagem "nenhum baralho" + CTA para criar
   - Após criar primeiro baralho → estado vazio desaparece

5. **Listagem**:
   - Múltiplos baralhos aparecem na dashboard
   - Ordenação (por data de criação, mais recente primeiro)

## Fora de Escopo

- Ordenação por nome ou personalizada
- Arquivar baralho (não implementado)
- Baralhos aninhados

## Arquivos Permitidos para Modificação

- `e2e/deck.spec.ts` (novo)

## Regression Risks

- Seletores de modal de criar/renomear/excluir podem mudar com refatoração de UI
- Teste de exclusão com cards pode falhar se o fluxo de confirmação mudar
- **Alto risco**: qualquer mudança no componente `DeckPage` ou `DashboardPage` pode quebrar os testes

## Validation Scope

### Automated

- `tsc --noEmit`
- `npm run test:e2e -- --grep "Deck"`

### Manual

- Verificar fluxo de exclusão com cards manualmente (garantir que o modal de confirmação funciona)
- Verificar estado vazio da dashboard visualmente

## Checklist de Implementação

- [x] 1. Criar `e2e/deck.spec.ts` com describe "Deck Management"
- [x] 2. Implementar testes de criação (fluxo feliz + validação)
- [x] 3. Implementar teste de renomear
- [x] 4. Implementar teste de excluir (vazio + com cards + cancelar)
- [x] 5. Implementar teste de estado vazio da dashboard
- [x] 6. Implementar teste de listagem
- [x] 7. Executar `tsc --noEmit` e `npm run test:e2e`
- [x] 8. Invocar `@reviewer`

## Critérios de Aceitação

- 5+ testes de gerenciamento de baralhos
- CRUD completo coberto (criar, ler, renomear, excluir)
- Estado vazio coberto
- Validação de formulário coberta
- Todos os testes verdes

## Comandos de Verificação

```bash
npx tsc --noEmit --project e2e/tsconfig.json
npm run test:e2e -- --grep "Deck"
```

## Definition of Done

- [x] 7 testes implementados e verdes
- [x] CRUD completo coberto (criar, renomear, excluir, listar)
- [x] Estado vazio coberto
- [x] Validação de formulário coberta (título vazio)
- [x] `@reviewer` aprovou (LOW risk)

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).
