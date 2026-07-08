---
id: "T08.02"
phase: "P08"
title: "Autenticação: Cenários de Borda"
status: "completed"
priority: "high"
estimate: "1 day"
depends_on: ["T08.01"]
---

# Task 08.02 — Autenticação: Cenários de Borda

## Estado Atual

- **Testes existentes**: `e2e/auth.spec.ts` com 5 testes (register, login, logout, 2x protected route)
- **Cobertura**: Apenas fluxo feliz. Nenhum teste de validação ou erro.

## Objetivo

Expandir a cobertura de autenticação para cobrir formulários, validações, erros e persistência de sessão.

## Escopo

1. **Validação de formulário de registro**:
   - Nome vazio → mensagem de erro visível
   - Email inválido → mensagem de erro visível
   - Senha muito curta → mensagem de erro visível
   - Senha sem caractere especial → mensagem de erro visível (se aplicável)

2. **Email duplicado no registro**:
   - Registrar com email já existente → mensagem de erro "email já cadastrado"

3. **Login inválido**:
   - Email não cadastrado → mensagem de erro
   - Senha incorreta → mensagem de erro
   - Campos vazios → mensagem de erro

4. **Persistência de sessão**:
   - Registrar → recarregar página → ainda logado
   - Navegar para outra aba → ainda logado

5. **Proteção de rotas** (estender):
   - `/decks/:id` sem auth → redirect para login
   - `/decks/:id/review` sem auth → redirect para login
   - `/stats` sem auth → redirect para login (já testado, refatorar para usar storageState)

## Fora de Escopo

- Reset de senha (não implementado no app)
- Refresh token (não implementado)
- Autenticação OAuth/social

## Arquivos Permitidos para Modificação

- `e2e/auth.spec.ts` (expandir)
- `e2e/helpers/auth.ts` (se precisar de fixtures adicionais)

## Regression Risks

- Alterar `auth.spec.ts` pode quebrar se seletores de erro mudarem
- Tests de validação dependem de mensagens exatas no frontend

## Validation Scope

### Automated

- `tsc --noEmit`
- Todos os testes de auth passando (existentes + novos)

### Manual

- Verificar visualmente se mensagens de erro são legíveis

## Checklist de Implementação

- [x] 1. Adicionar testes de validação de formulário de registro (empty name, invalid email, short password)
- [x] 2. Adicionar teste de email duplicado
- [x] 3. Adicionar testes de login inválido (non-existent email, wrong password, empty fields)
- [x] 4. Adicionar testes de persistência de sessão (page reload, new tab)
- [x] 5. Adicionar testes de proteção de rotas restantes (/decks/:id, /decks/:id/review)
- [x] 6. Refatorar: session persistence tests usam `authTest` fixture; validação/form usa `test` normal
- [x] 7. Executar `tsc --noEmit` e `npm run test:e2e` — 16 auth tests verdes
- [x] 8. Invocar `@reviewer`

## Critérios de Aceitação

- 8+ testes de autenticação no total
- Validação de formulário coberta (3 cenários)
- Login inválido coberto (3 cenários)
- Persistência de sessão coberta (2 cenários)
- Proteção de rotas estendida
- Todos os testes verdes

## Comandos de Verificação

```bash
npx tsc --noEmit --project e2e/tsconfig.json
npm run test:e2e -- --grep "Auth"
```

## Definition of Done

- [ ] 8+ testes implementados e verdes
- [ ] Validações de formulário cobertas
- [ ] Login inválido coberto
- [ ] Sessão persistente coberta
- [ ] `@reviewer` aprovou

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).
