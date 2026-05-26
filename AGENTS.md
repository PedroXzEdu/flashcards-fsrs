## Project Overview

Flashcards application using FSRS (spaced repetition).

Current status:

> Stable MVP under incremental hardening and UX improvements.

Primary goal:

> Production-minimum stability with controlled regressions.

---

## Stack

### Frontend

- React 19
- Vite
- TypeScript

### Backend

- Node.js
- Express
- TypeScript

### Database

- PostgreSQL

### Infrastructure

- Docker Compose
- Node 20

---

## Architecture Principles

Prefer:

- small localized changes
- incremental improvements
- low regression risk
- stable behavior
- production-safe defaults
- consistency with existing code

Avoid:

- broad refactors
- architecture rewrites
- overengineering
- unnecessary abstractions
- microservices
- CQRS
- changing working flows

Important:

If a feature already works, prefer hardening over rewriting.

---

## Development Philosophy

Work in small iterations:

1. analyze
2. implement minimal change
3. validate
4. regression check
5. commit
6. move to next step

Never batch unrelated changes together.

Always prioritize stability over elegance.

---

## Current Priorities

### High Priority

- UX improvements (incremental)
- observability
- E2E regression prevention

### Medium Priority

- performance improvements
- database indexes
- batch operations

### Low Priority

- cosmetic refactors
- architecture cleanup

---

## Backend Rules

### API Contract

Preserve standardized response shape:

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Human readable message"
}
```

Do not introduce inconsistent response formats.

---

### Security Baseline (Already Implemented)

Already completed:

- env validation
- helmet
- restricted CORS
- auth rate limit
- backend sanitization
- .apkg upload hardening

**Additional rule:**

- Do not expose secrets, tokens, credentials, or sensitive environment data in logs, code, outputs, or documentation. Mask sensitive info when necessary.

Avoid reworking these unless fixing a bug.

---

### Environment Variables

Source of truth:

- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- JWT_SECRET

Optional:

- PORT
- CORS_ORIGIN

Do NOT migrate to DATABASE_URL unless explicitly requested.

---

### Database

Prefer repository pattern.

Avoid:

- spreading raw SQL randomly
- mixing query logic into controllers

---

### FSRS Rules

FSRS review flow is WORKING.

Do NOT refactor or rewrite FSRS logic unless fixing a confirmed bug.

Protected working flows:

- due queue
- preview again/hard/good/easy
- submit review
- review logs
- analytics

Regression risk here is considered HIGH.

---

### Upload Rules (.apkg)

Import flow currently works.

Do NOT rewrite import logic.

Only apply minimal hardening or bug fixes.

---

## Frontend Rules

Prefer:

- minimal UI changes
- localized component edits
- theme consistency
- Portuguese language consistency
- accessibility improvements
- responsive-safe changes

Avoid:

- redesigns
- replacing UI system
- changing UX patterns globally
- broad styling rewrites

---

### Forms

Always explicitly define button type:

Use:

```html
<button type="button"></button>
```

for non-submit actions.

Avoid implicit submit behavior.

---

### Theme

Dark mode must remain functional.

Avoid hardcoded light-only colors.

Prefer existing CSS variables/theme tokens already used by the app.

---

### Language

Primary language:

> Portuguese (pt-BR)

Keep UI terminology consistent.

Avoid mixing English and Portuguese in user-facing UI.

---

## Validation Requirements

Before considering work complete:

### Backend

Run:

```bash
npx tsc --noEmit
npm run build
npx vitest run
```

### Frontend

Run:

```bash
npm run build
npx tsc -b --noEmit
```

---

## Manual Validation

For functional changes:

Verify affected flow manually.

Examples:

- login
- register
- create deck
- rename deck
- create card
- review FSRS
- analytics
- import .apkg
- share/unshare

Never assume functionality works without validation.

---

## Regression Policy

If a regression appears:

1. stop unrelated work
2. isolate root cause
3. apply minimal fix
4. validate affected flow
5. continue roadmap

Do NOT pile new changes on top of a broken feature.

---

## Change Scope Rules

Unless explicitly requested:

DO NOT:

- refactor broadly
- rename files unnecessarily
- change API contracts
- modify unrelated code
- rewrite working logic
- introduce new architecture patterns

Prefer:

> minimal diff, maximum stability

---

## Expected Agent Behavior

When proposing changes:

1. explain root cause
2. implement smallest viable fix
3. list files changed
4. explain regression risks
5. validate build/tests
6. preserve existing behavior

If uncertain:

Prefer conservative changes.

Do not optimize prematurely.

---

## Troubleshooting & Change Discipline

1. **Don’t fight recurring errors blindly**: if the same error appears twice after attempted fixes, stop and reassess.
2. **Document state and behavior**: before changing code, record observed behavior, attempted fixes, and hypotheses about root causes.
3. **Fail-fast and isolate**: stop immediately if build or tests fail, and address issues locally rather than acumulatively.
4. **Research and compare solutions**: check multiple credible sources (including official documentation), compare trade-offs, and pick the simplest reliable fix.
5. **Validate thoroughly**: run automated tests and perform minimal manual verification in affected flows to confirm root cause is resolved.
6. **Prefer minimal, incremental changes**: avoid broad refactors or premature optimizations.
7. **Maintain a record of attempts**: keep a log of recurring errors and fixes to aid future troubleshooting and prevent repeated cycles.

---

## ROADMAP.md

[`ROADMAP.md`](./ROADMAP.md) é o único documento de roadmap e status do projeto.

**Quando atualizar:**

- funcionalidade concluída ou removida
- mudança arquitetural relevante
- dívida técnica descoberta que merece registro
- prioridades mudam significativamente

**Quando NÃO atualizar:**

- correções triviais (digitação, formatação, refactor menor)
- tarefas do dia — não é um quadro de sprint

Mantenha curto e honesto. Um roadmap desatualizado é pior que nenhum.

---

## ARCHITECTURE.md

[`ARCHITECTURE.md`](./ARCHITECTURE.md) é o mapa real da estrutura do projeto.

**Quando atualizar:**

- estrutura de pastas muda (novo diretório relevante, reorganização)
- responsabilidades de camada mudam
- nova camada/layer aparece
- fluxo importante muda (review, import, share)
- inconsistências conhecidas são corrigidas

**Quando NÃO atualizar:**

- rename trivial de arquivo
- refactor pequeno que não altera responsabilidade
- adição de componente isolado

Mantenha sincronizado com o código. Uma architecture desatualizada engana mais que ajuda.

---

## DECISIONS.md

[`DECISIONS.md`](./DECISIONS.md) é o registro de decisões técnicas não-óbvias e trade-offs.

**Quando atualizar:**

- decisão técnica não-óbvia é tomada
- trade-off relevante surge (ex: escolha entre duas abordagens)
- mudança arquitetural altera ou invalida uma decisão anterior
- nova dependência significativa é adicionada

**Quando NÃO atualizar:**

- bugfix trivial
- detalhe irrelevante (versão de patch, formatação)
- preferência estética sem impacto técnico

Cada decisão deve ter: contexto, escolha, justificativa, trade-offs, e quando revisitar. Se uma decisão for revertida, marque como obsoleta, não apague.
