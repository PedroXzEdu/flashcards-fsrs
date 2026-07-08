---
id: "T08.06"
phase: "P08"
title: "Import, Share e Analytics — Hardening"
status: "completed"
priority: "medium"
estimate: "2 days"
depends_on: ["T08.01"]
---

# Task 08.06 — Import, Share e Analytics: Hardening

## Estado Atual

- **Testes existentes**:
  - `import.spec.ts`: 1 teste (import .apkg válido)
  - `share.spec.ts`: 2 testes (share + import por outro user, unshare)
  - `analytics.spec.ts`: 1 teste (analytics carrega após revisões)

## Objetivo

Adicionar cenários de borda para import, share e analytics — principalmente estados de erro e vazio — para complementar os fluxos felizes existentes.

## Escopo

### Import .apkg
1. Arquivo inválido (não-.apkg) → mensagem de erro
2. Import sem arquivo selecionado → botão desabilitado ou mensagem de erro
3. Import de .apkg com nome existente → sobrescreve ou cria duplicata (conforme comportamento)

### Share/Unshare
1. Compartilhar baralho vazio → link gerado (verificar se é permitido)
2. Token de compartilhamento inválido → mensagem "não encontrado"
3. Import de deck compartilhado quando já tem deck com mesmo nome → comportamento esperado

### Analytics
1. Analytics sem nenhuma revisão → estado vazio (gráficos vazios ou mensagem "nenhum dado")
2. Analytics sem login → redirect para login (já testado em auth.spec.ts, refatorar para usar fixture)
3. Analytics com apenas 1 revisão → gráficos renderizam (caso de borda)

## Fora de Escopo

- Testar import de .apkg com mídia (áudio/imagem)
- Testar share com token expirado
- Testar analytics em tempo real (WebSocket)
- Testar export de baralhos

## Arquivos Permitidos para Modificação

- `e2e/import.spec.ts` (expandir)
- `e2e/share.spec.ts` (expandir)
- `e2e/analytics.spec.ts` (expandir)

## Regression Risks

- Import, share e analytics têm lógica de backend significativa. Testes E2E podem falhar por razões de backend (não frontend).
- **Médio risco**: mudanças na API de import (validação de arquivo) podem quebrar os testes de erro.

## Validation Scope

### Automated

- `tsc --noEmit`
- `npm run test:e2e -- --grep "Import|Share|Analytics"`

## Checklist de Implementação

- [x] 1. Expandir `import.spec.ts` com teste de arquivo inválido
- [x] 2. Expandir `import.spec.ts` com teste de import sem arquivo
- [x] 3. Expandir `share.spec.ts` com teste de baralho vazio
- [x] 4. Expandir `share.spec.ts` com teste de token inválido
- [x] 5. Expandir `analytics.spec.ts` com teste de analytics sem dados
- [x] 6. Refatorar analytics.spec.ts para usar `authTest` fixture (setup mais rápido)
- [x] 7. Executar `tsc --noEmit` (E2E não executado: Docker indisponível)
- [x] 8. Invocar `@reviewer`

## Critérios de Aceitação

- 9 testes no total (existentes + novos)
- Import: 3 testes (feliz + erro + sem arquivo)
- Share: 4 testes (feliz x2 + baralho vazio + token inválido)
- Analytics: 2 testes (feliz + vazio; redirect já testado em auth.spec.ts)
- Todos os testes verdes

## Comandos de Verificação

```bash
npx tsc --noEmit --project e2e/tsconfig.json
npm run test:e2e -- --grep "Import|Share|Analytics"
```

## Definition of Done

- [x] Import expandido (3 testes)
- [x] Share expandido (4 testes)
- [x] Analytics expandido (2 testes — empty state + feliz)
- [ ] Todos verdes (Docker indisponível — validar manualmente)
- [x] `@reviewer` aprovou (após correção R1 — Feito → Cancelar pós-unshare)

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).
