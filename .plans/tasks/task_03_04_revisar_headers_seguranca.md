# Task 03.04 — Revisar Headers de Segurança

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 03 — Segurança e Hardening](./phase_03_seguranca_hardening.md)
- **Dependências**: Nenhuma

## Objetivo

Verificar se todos os headers de segurança recomendados estão presentes e configurados corretamente.

## Escopo

- Verificar headers atuais do Express com Helmet
- Adicionar `referrerPolicy` e `permissionsPolicy` se ausentes
- Verificar `X-Content-Type-Options`, `X-Frame-Options`, etc.

## Fora de Escopo

- Alterar CSP (T03.02)
- Modificar CORS

## Arquivos Permitidos para Modificação

- `backend/src/app.ts`

## Checklist de Implementação

- [ ] 1. Verificar headers atuais: `curl -sI http://localhost:3000/health | grep -i "^x-\|^referrer\|^permissions"`
- [ ] 2. Adicionar `referrerPolicy: { policy: "strict-origin-when-cross-origin" }` no helmet
- [ ] 3. Adicionar `permissionsPolicy` com restrições recomendadas (geolocation=(), microphone=(), camera=())
- [ ] 4. Verificar se `X-Content-Type-Options: nosniff` está presente (helmet adiciona por default)
- [ ] 5. Testar que nada quebra
- [ ] 6. Rodar `npx tsc --noEmit`

## Critérios de Aceitação

- Headers de segurança recomendados presentes
- Nenhuma funcionalidade quebrada

## Comandos de Verificação

```bash
cd backend && npx tsc --noEmit
curl -sI http://localhost:3000/health
```

## Definition of Done

- [ ] Headers revisados e configurados
- [ ] `tsc --noEmit` passando
- [ ] `@reviewer` aprovou
