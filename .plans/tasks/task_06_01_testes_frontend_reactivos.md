# Task 06.01 — Adicionar Testes Frontend para Componentes Reativos

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 06 — Features Futuras](./phase_06_features_futuras.md)
- **Dependências**: Nenhuma

## Objetivo

Adicionar testes unitários para componentes que têm lógica reativa complexa: `AddDeckModal`, `EditDeckModal`, `PasswordStrengthIndicator`.

## Locais a Modificar

| # | Arquivo | O que testar |
|---|---------|--------------|
| 1 | `frontend/src/components/AddDeckModal.test.tsx` (novo) | Submit, validação, cancelar |
| 2 | `frontend/src/components/EditDeckModal.test.tsx` (novo) | Preenchimento, submit, validação |
| 3 | `frontend/src/components/PasswordStrengthIndicator.test.tsx` (novo) | Força da senha para cada nível |

## Fora de Escopo

- Testes E2E (apenas unitários com vitest + testing-library)
- Cobertura 100%

## Arquivos Permitidos para Modificação

- `frontend/src/components/AddDeckModal.test.tsx` (novo)
- `frontend/src/components/EditDeckModal.test.tsx` (novo)
- `frontend/src/components/PasswordStrengthIndicator.test.tsx` (novo)

## Checklist de Implementação

- [ ] 1. Verificar formato dos testes existentes em `frontend/src/__tests__/`
- [ ] 2. Criar `AddDeckModal.test.tsx`:
  - Renderiza com props corretas
  - Submit com nome válido
  - Submit com nome vazio → erro
  - Cancelar → fecha modal
- [ ] 3. Criar `EditDeckModal.test.tsx`:
  - Renderiza com dados do deck
  - Submit atualiza nome
  - Submit com nome vazio → erro
- [ ] 4. Criar `PasswordStrengthIndicator.test.tsx`:
  - Senha vazia → força 0
  - 6 caracteres + maiúscula → força 1
  - 8+ com tudo → força 3
- [ ] 5. Rodar `npx vitest run`

## Critérios de Aceitação

- Pelo menos 8 testes no total
- Testes unitários passando

## Comandos de Verificação

```bash
cd frontend && npx vitest run
npx tsc -b --noEmit
```

## Definition of Done

- [ ] Testes criados e passando
- [ ] `tsc` passando
- [ ] `@reviewer` aprovou
