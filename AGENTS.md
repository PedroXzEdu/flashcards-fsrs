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

### Knowledge

- Graphify (knowledge graph do código-fonte)

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

1. analyze (use `graphify query "<pergunta>"` para navegar no grafo de código)
2. implement minimal change
3. `tsc --noEmit` (type check rápido)
4. invoke @reviewer → valida (build + testes) e revisa
5. fix findings if needed
6. regression check
7. invoke @doc → verifica se ROADMAP/ARCHITECTURE/DECISIONS precisam de update
8. commit (Graphify atualiza automaticamente via pre-commit hook)
9. move to next step

> O passo 4 (`invoke @reviewer`) é **OBRIGATÓRIO** — veja a seção Mandatory Review Policy.
> O passo 7 (`invoke @doc`) é **OBRIGATÓRIO** quando há mudanças estruturais (novas pastas, camadas, fluxos, dependências, contratos de API). Opcional para mudanças triviais.

Never batch unrelated changes together.

Always prioritize stability over elegance.

### Before Completion Checklist

Every task MUST pass this checklist before the agent signals completion:

- [ ] `@reviewer` executed (build + testes rodados dentro da review)
- [ ] Reviewer findings addressed (or justified)
- [ ] Regression checklist verified
- [ ] `@doc` invoked (ou justificado por que não necessário)

---

## Mandatory Review Policy

### Rules

- After ANY code, documentation, config, migration, test, or infra change, the primary agent MUST invoke `@reviewer` before completion.
- The primary agent MUST NOT finalize a task without review.
- The primary agent MUST wait for the reviewer's output before suggesting a commit.
- If the reviewer finds MEDIUM/HIGH risk or a potential regression, the primary agent MUST either fix the finding or provide an explicit justification for accepting the risk.
- Only tasks with zero diff (e.g., answering questions, explaining code, debugging without edits) MAY skip review.

### Exceptions

The only valid exceptions for skipping `@reviewer`:

1. No files were changed (zero diff).
2. The change is a revert of a previous commit with no additional modifications.

All other cases require review.

### Recursion Guard

`@reviewer` is a terminal agent — it MUST NOT invoke `@reviewer`, `@task`, or any other agent. It is read-only and never modifies files. This guarantees no infinite review loop.

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
  "error": "Human readable message"
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

Validation (type check, build, tests) runs inside `@reviewer`. Before invoking the reviewer, run only:

### Backend

```bash
npx tsc --noEmit
```

### Frontend

```bash
npx tsc -b --noEmit
```

### E2E

```bash
npm run test:e2e
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
5. run `tsc --noEmit` (type check rápido)
6. invoke @reviewer (roda build + testes e revisa)
7. fix findings if needed (or justify if accepted)
8. invoke @doc → verifica se ROADMAP/ARCHITECTURE/DECISIONS precisam de update
9. preserve existing behavior

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

## Reviewer Subagent (`@reviewer`)

Um subagent especializado em **revisão de código** para o FlashFSRS.

**Como invocar:**

- digite `@reviewer` seguido do escopo da revisão
- ou automaticamente pelo agente primário em tarefas de revisão

**O que ele faz:**

1. detecta regressões (contract mismatch, Docker breakage, FSRS edge cases, SQL risks, regression memory checklist)
2. valida arquitetura (camadas backend/frontend, injeção de lógica em controller, `any`)
3. revisa UX (layout, scroll, botões sem rota, feedback ausente)
4. verifica qualidade (TypeScript strict, ESLint, build, dead code, TODOs)

**O que ele NÃO faz:**

- não modifica arquivos
- não escreve código
- não refatora
- não adiciona dependências

**Formato de saída:**

Toda review segue o formato:

1. **Summary** — veredito geral da análise
2. **Risks** — riscos identificados com severidade (HIGH / MEDIUM / LOW)
3. **Regressions** — regressões confirmadas ou prováveis
4. **Minimal Fix Proposal** — menor correção possível (descritiva, sem implementar)
5. **Validation Checklist** — lista de verificações (tsc, build, lint, testes, Docker, regression checklist)

**Quando usar:**

- antes de commitar uma mudança
- após validar que a funcionalidade funciona
- quando identificar código duvidoso durante implementação

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
