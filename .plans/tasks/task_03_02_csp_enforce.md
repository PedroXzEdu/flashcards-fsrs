# Task 03.02 — Ativar CSP Enforcement

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 03 — Segurança e Hardening](./phase_03_seguranca_hardening.md)
- **Dependências**: Nenhuma

## Objetivo

Mudar CSP de `reportOnly` para modo enforce, ajustando a política conforme necessário.

## Escopo

- Identificar violações CSP atuais (logadas via `/api/csp-report`)
- Ajustar diretivas se necessário
- Remover `reportOnly: true` do helmet config
- Testar que nada quebra

## Fora de Escopo

- Alterar outras configurações de segurança além do CSP
- Modificar política de CORS ou headers

## Arquivos Permitidos para Modificação

- `backend/src/app.ts`

## Checklist de Implementação

- [ ] 1. Verificar logs de violação CSP atuais (via `/api/csp-report`)
- [ ] 2. Se houver violações legítimas, ajustar diretivas (ex: adicionar fontes)
- [ ] 3. Mudar `helmet.contentSecurityPolicy` para modo enforce (sem `reportOnly`)
- [ ] 4. Manter `reportUri` para monitoramento contínuo
- [ ] 5. Testar manualmente: login, register, criar card com rich text, revisar
- [ ] 6. Verificar no console do navegador se há violações
- [ ] 7. Rodar `npx tsc --noEmit` e testes

## Critérios de Aceitação

- CSP ativo (não mais reportOnly)
- Nenhuma funcionalidade quebrada
- KaTeX e Tiptap funcionando sem violações

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
npx vitest --project unit
curl -sI http://localhost:3000/health | grep content-security-policy
```

## Definition of Done

- [ ] CSP enforce ativo
- [ ] Nenhuma violação no console
- [ ] `tsc --noEmit` passando
- [ ] `@reviewer` aprovou
