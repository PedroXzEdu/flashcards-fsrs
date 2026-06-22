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

Work in small iterations following the Standard Workflow.

Never batch unrelated changes together.

Always prioritize stability over elegance.

> **Plan as source of truth:** antes de criar qualquer código, consulte ou atualize os arquivos de planejamento em `.plans/tasks/`. Nenhuma implementação deve começar sem que a fase e tarefa atuais estejam claramente documentadas.

---

## Standard Workflow

This is the canonical process. Every change follows these steps:

1. **Consult plan** — read current phase in `.plans/tasks/` before any implementation
2. **Analyze** — use `graphify query "<question>"` to navigate the code graph
3. **Implement** minimal change
4. **Typecheck** — run `tsc --noEmit`
5. **Invoke @reviewer** — validates (build + tests) and reviews
6. **Address findings** — fix or justify, then regression check
7. **Invoke @doc** — checks if ROADMAP/ARCHITECTURE/DECISIONS/AGENTS need update (mandatory for structural changes, optional for trivial)
8. **Update plan progress** — mark task completed in `.plans/tasks/`, record deviations
9. **Commit** (Graphify updates automatically via pre-commit hook)
10. **Continue** to next step

> Step 5 (`invoke @reviewer`) is **MANDATORY** — see Mandatory Review Policy.
> Step 7 (`invoke @doc`) is **MANDATORY** for structural changes (new directories, layers, flows, dependencies, API contracts, subagents, skills, plugins). Optional for trivial changes.

### Before Completion Checklist

Every task MUST pass this checklist before signaling completion:

- [ ] `@reviewer` executed (build + tests run within review)
- [ ] Reviewer findings addressed (or justified)
- [ ] Regression checklist verified
- [ ] `@doc` invoked (or justified as unnecessary — optional for trivial changes)
- [ ] Plan progress updated in `.plans/tasks/`

---

## Mandatory Review Policy

### Rules

- After ANY code, documentation, config, migration, test, or infra change, the primary agent MUST invoke `@reviewer` before completion.
- The primary agent MUST NOT finalize a task without review.
- The primary agent MUST wait for the reviewer's output before suggesting a commit.
- If the reviewer finds MEDIUM/HIGH risk or a potential regression, the primary agent MUST either fix the finding or provide an explicit justification for accepting the risk.
- `@reviewer` is terminal — it MUST NOT invoke other agents.

### Exceptions

The only valid exceptions for skipping `@reviewer`:

1. No files were changed (zero diff).
2. The change is a revert of a previous commit with no additional modifications.

All other cases require review.

Full reviewer specification: `.opencode/agents/reviewer.md`

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

## Engineering Priority Order

When priorities conflict, higher items take precedence:

1. Correctness
2. Stability
3. Security
4. UX
5. Performance
6. Maintainability
7. Elegance

---

## Decision Heuristics

When multiple valid solutions exist, prefer:

1. Smaller diff
2. Lower regression risk
3. Fewer files changed
4. Existing project patterns
5. Lower operational complexity
6. Simpler implementation
7. Easier rollback

These heuristics never override correctness, security, or stability requirements.

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
- MEDIA_BASE_URL

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

## Subagents

### @reviewer

Specification: `.opencode/agents/reviewer.md`

### @doc

Specification: `.opencode/agents/doc.md`

---

## Tools & MCPs

### Context7

Always use Context7 when you need library or API documentation, implementation details, setup instructions, configuration steps, or code generation related to external libraries and frameworks. Do not wait for the user to explicitly request its use.

---

## Documentation Governance

See `.docs/DOCUMENTATION_POLICY.md`

---

## Troubleshooting

See `.docs/TROUBLESHOOTING.md`
