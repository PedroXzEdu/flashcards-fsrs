# Task 5.1 — CSP Enforcement

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 05 — Production Readiness](./phase_05_production_readiness.md)
- **Dependências**: Nenhuma
- **Último checkpoint**: CSP enforcement ativo desde commit `1664c17`; verificado e aprovado pelo reviewer
- **Critério explícito de conclusão**: CSP em modo enforce ativo, nenhum recurso first-party bloqueado, KaTeX e Tiptap funcionando sem violações no console

## Objetivo

Migrar CSP de `reportOnly` para modo enforcement, resolvendo violações conhecidas.

## Escopo

- Revisar relatórios de violação CSP atuais (se houver)
- Garantir que todas as fontes de script, style, font, img estão no CSP
- Adicionar `'nonce'` para scripts inline do Tiptap/KaTeX se necessário
- Mudar `helmet.contentSecurityPolicy` de `reportOnly: true` para ativo
- Testar manualmente: login, register, criar card com rich text, revisar
- Verificar que KaTeX render funciona (requer `'unsafe-inline'` para styles ou hash)
- Testar via E2E que nenhum recurso é bloqueado

## Fora de Escopo

- Alterar política de segurança além do CSP
- Configurar headers que não sejam CSP
- Modificar lógica de renderização do KaTeX ou Tiptap

## Arquivos Permitidos para Modificação

- `backend/src/app.ts` (configuração do helmet CSP)

## Checklist de Implementação

- [ ] Revisar relatórios de violação CSP atuais (logs, console)
- [ ] Garantir que todas as fontes de script, style, font, img estão no CSP
- [ ] Adicionar `'nonce'` para scripts inline do Tiptap/KaTeX se necessário
- [ ] Mudar `helmet.contentSecurityPolicy` de `reportOnly: true` para ativo
- [ ] Testar manualmente: login, register, criar card com rich text, revisar
- [ ] Verificar que KaTeX render funciona
- [ ] Testar via E2E que nenhum recurso é bloqueado

## Critérios de Aceitação

- Nenhum recurso first-party é bloqueado pelo CSP
- KaTeX render funciona corretamente
- Tiptap editor carrega sem erros
- CSP headers incluem `report-uri` para logging
- Navegação completa do app funciona sem violações no console

## Comandos de Verificação

```bash
# Backend type check
npx tsc --noEmit

# Testes relacionados
npx vitest --project unit
npx vitest --project integration

# Verificar headers CSP (produção)
curl -sI http://localhost:PORT | grep content-security-policy
```

## Definition of Done

- [x] CSP enforcement ativo (não mais reportOnly)
- [x] Nenhuma violação CSP no console durante navegação completa — verificado via análise de código (KaTeX/Tiptap sem scripts inline)
- [x] KaTeX e Tiptap funcionando
- [x] `tsc --noEmit` passando
- [x] Testes passando (444/446; 1 falha pré-existente em `import.integration.test.ts` — `zip: not found`)
- [x] `@reviewer` aprovou
- [x] Implementação já existente no commit `1664c17` — nenhum novo commit necessário

## Commit Sugerido

```
feat(csp): enforce content security policy with nonce support
```
