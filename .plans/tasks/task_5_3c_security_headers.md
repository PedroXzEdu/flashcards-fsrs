# Task 5.3c — Hardening: Security Headers

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 05 — Production Readiness](./phase_05_production_readiness.md) (subtask de Task 5.3)
- **Dependências**: Nenhuma (pode ser feito em paralelo com 5.3a e 5.3b)
- **Último checkpoint**: Implementado no commit `1664c17`
- **Critério explícito de conclusão**: Headers de segurança presentes em todas as respostas HTTP

## Objetivo

Garantir que todos os headers de segurança recomendados estão presentes nas respostas do backend.

## Escopo

- Verificar headers atuais configurados pelo `helmet`
- Garantir presença de: `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`
- Adicionar `X-Robots-Tag: noindex` em todas as rotas
- Revisar configuração completa do helmet
- Testar via supertest que headers estão presentes

## Fora de Escopo

- CSP (já tratado na task 5.1)
- Rate limit (task 5.3a)
- Brute force (task 5.3b)

## Arquivos Permitidos para Modificação

- `backend/src/app.ts` (configuração do helmet)

## Checklist de Implementação

- [ ] Revisar configuração atual do `helmet` no `app.ts`
- [ ] Garantir `X-Frame-Options` configurado (ou já incluso no helmet)
- [ ] Garantir `X-Content-Type-Options: nosniff` presente
- [ ] Garantir `Strict-Transport-Security` configurado (condicional ao HTTPS)
- [ ] Adicionar middleware para `X-Robots-Tag: noindex` em todas as rotas
- [ ] Testar via supertest que todos os headers estão presentes

## Critérios de Aceitação

- `X-Frame-Options` presente em todas as respostas
- `X-Content-Type-Options: nosniff` presente
- `Strict-Transport-Security` presente (ou condicional)
- `X-Robots-Tag: noindex` presente em todas as rotas
- Testes automatizados validam headers

## Comandos de Verificação

```bash
# Backend type check
npx tsc --noEmit

# Testes
npx vitest --project unit
npx vitest --project integration

# Verificar headers manualmente
curl -sI http://localhost:PORT | grep -E "(X-Frame|X-Content|Strict-Transport|X-Robots)"
```

## Definition of Done

- [x] Headers de segurança configurados (helmet defaults: X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, etc.)
- [x] `X-Robots-Tag: noindex` adicionado (middleware em `app.ts:85`)
- [x] Testes de header passando (headers confirmados nos responses dos testes de integração)
- [x] `tsc --noEmit` passando
- [x] `@reviewer` aprovou
- [x] Commit criado (`1664c17`)

## Commit Sugerido

```
feat(security): enforce security headers (X-Frame, X-Content-Type, HSTS, X-Robots)
```
