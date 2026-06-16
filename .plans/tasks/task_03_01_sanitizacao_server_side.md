# Task 03.01 — Adicionar Sanitização Server-Side com DOMPurify

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 03 — Segurança e Hardening](./phase_03_seguranca_hardening.md)
- **Dependências**: Nenhuma

## Objetivo

Adicionar sanitização de HTML no backend usando `isomorphic-dompurify`, aplicando antes de persistir `front` e `back` dos cards.

## Locais a Modificar

| # | Arquivo | Função | Onde sanitizar |
|---|---------|--------|----------------|
| 1 | `backend/src/utils/sanitizeHtml.ts` (novo) | `sanitizeHtml(html: string): string` | Função de sanitização |
| 2 | `backend/src/services/cardService.ts` | `create`, `update` | Antes de chamar repository |
| 3 | `backend/src/services/importService.ts` | `createDeckFromAnki` | Antes de importar cards |
| 4 | `backend/src/services/deckImportService.ts` | `importSharedDeck` | Ao copiar cards do deck compartilhado |

## Fora de Escopo

- Modificar sanitização existente no frontend (vai continuar atuando como segunda camada)
- Alterar schemas Zod (já limitam tamanho)

## Arquivos Permitidos para Modificação

- `backend/package.json`
- `backend/src/utils/sanitizeHtml.ts` (novo)
- `backend/src/services/cardService.ts`
- `backend/src/services/importService.ts` (se existir)
- `backend/src/services/deckImportService.ts`

## Checklist de Implementação

- [ ] 1. Instalar `isomorphic-dompurify` no backend: `npm install isomorphic-dompurify`
- [ ] 2. Criar `sanitizeHtml.ts` com mesma lista de tags/atributos permitidos que o frontend
- [ ] 3. Aplicar em `cardService.create` e `cardService.update`
- [ ] 4. Aplicar em deckImportService (import de decks compartilhados)
- [ ] 5. Testar que HTML seguro (negrito, lista, KaTeX) é preservado
- [ ] 6. Rodar `npx tsc --noEmit` e testes

```typescript
// Exemplo de sanitizeHtml.ts
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["a", "b", "blockquote", "br", "code", "div", "em",
  "h1", "h2", "h3", "hr", "i", "img", "li", "ol", "p", "pre", "span",
  "strong", "sub", "sup", "u", "ul", "math", "mrow", "mi", "mn", "mo",
  "msup", "mfrac", "annotation", "semantics"];

const ALLOWED_ATTR = ["alt", "class", "href", "src", "style", "title",
  "width", "height", "aria-hidden", "controls", "xmlns"];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
```

## Critérios de Aceitação

- `<script>` tags são removidas de front/back ao criar/editar card
- HTML seguro é preservado
- Testes existentes continuam passando

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
npx vitest --project unit
```

## Definition of Done

- [ ] `isomorphic-dompurify` instalado
- [ ] `sanitizeHtml` criado e aplicado
- [ ] `tsc --noEmit` passando
- [ ] Testes passando
- [ ] `@reviewer` aprovou
