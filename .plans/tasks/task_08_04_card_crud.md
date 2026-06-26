---
id: "T08.04"
phase: "P08"
title: "Gerenciamento de Flashcards (CRUD)"
status: "pending"
priority: "high"
estimate: "2-3 days"
depends_on: ["T08.01", "T08.03"]
---

# Task 08.04 — Gerenciamento de Flashcards (CRUD)

## Estado Atual

- **Testes existentes**: `review.spec.ts` cria cards via bulk import como passo intermediário, mas não testa CRUD de cards
- **Cobertura indireta**: Nenhum teste específico para criação via editor Tiptap, edição, exclusão ou paginação

## Objetivo

Criar testes E2E para operações CRUD de flashcards: criação (bulk + editor), edição, exclusão, paginação, validação.

## Escopo

1. **Criar cards em lote (bulk import)**:
   - Formato válido "Front \| Back" → cards criados e visíveis
   - Formato inválido → mensagem de erro
   - Linhas em branco → ignoradas ou erro (conforme comportamento atual)
   - Limite de cards por lote (se aplicável)

2. **Criar card individual (editor Tiptap)**:
   - Clicar "Novo card" → editor abre
   - Preencher front e back → card criado
   - Validação: front vazio → mensagem de erro
   - Validação: back vazio → mensagem de erro
   - Fechar editor sem salvar → card não criado

3. **Editar card**:
   - Clicar no card → editor abre com dados existentes
   - Modificar front → salvar → alteração persiste
   - Modificar back → salvar → alteração persiste
   - Cancelar edição → card mantém dados originais

4. **Excluir card**:
   - Excluir card → desaparece da lista
   - Excluir último card → estado vazio aparece

5. **Paginação** (se implementada):
   - Criar muitos cards → navegar entre páginas
   - Ordenação dos cards

## Fora de Escopo

- Testar formatação rich text do Tiptap (negrito, itálico, fórmulas KaTeX)
- Testar upload de imagem no card
- Testar arrastar/reordenar cards

## Arquivos Permitidos para Modificação

- `e2e/card.spec.ts` (novo)

## Regression Risks

- Editor Tiptap tem seletores complexos — pode quebrar com upgrades de versão
- Modal do bulk import pode ter seletores que mudam com refatoração
- **Alto risco**: componente `DeckPage` (1239 linhas, já identificado para refatoração) contém toda a lógica de cards. Refatorações futuras podem quebrar os testes.

## Validation Scope

### Automated

- `tsc --noEmit`
- `npm run test:e2e -- --grep "Card"`

### Manual

- Verificar criação via editor Tiptap manualmente
- Verificar paginação manualmente (se aplicável)

## Checklist de Implementação

- [ ] 1. Criar `e2e/card.spec.ts` com describe "Card Management"
- [ ] 2. Implementar testes de criação em lote (válido + inválido)
- [ ] 3. Implementar testes de criação individual (editor Tiptap)
- [ ] 4. Implementar teste de edição de card
- [ ] 5. Implementar teste de exclusão de card
- [ ] 6. Implementar teste de paginação (se aplicável)
- [ ] 7. Implementar teste de estado vazio (excluir todos)
- [ ] 8. Executar `tsc --noEmit` e `npm run test:e2e`
- [ ] 9. Invocar `@reviewer`

## Critérios de Aceitação

- 5+ testes de gerenciamento de cards
- Criação em lote coberta (2 cenários)
- Criação individual coberta (3 cenários)
- Edição coberta (3 cenários)
- Exclusão coberta (2 cenários)
- Estado vazio coberto
- Todos os testes verdes

## Comandos de Verificação

```bash
npx tsc --noEmit --project e2e/tsconfig.json
npm run test:e2e -- --grep "Card"
```

## Definition of Done

- [ ] 5+ testes implementados e verdes
- [ ] Bulk import coberto
- [ ] Editor Tiptap coberto
- [ ] Edição e exclusão cobertas
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).
