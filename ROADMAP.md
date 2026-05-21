# ROADMAP — FlashFSRS

> Projeto solo · TCC · FSRS · Prazo acadêmico limitado

---

## Status Atual

MVP funcional com as features principais entregues. O que falta é
**consistência e acabamento**, não funcionalidade nova.

---

## Funcionalidades Concluídas

- [x] Autenticação (register/login JWT + rate limit)
- [x] CRUD de baralhos
- [x] CRUD de cards com editor rich text + KaTeX
- [x] Sistema de revisão FSRS (preview + submit + transaction)
- [x] Fila diária de revisão (due cards ordenados por risco)
- [x] Importação .apkg (extração ZIP + SQLite Anki + mídia)
- [x] Compartilhamento de baralhos (token + preview + import)
- [x] Estatísticas (heatmap, streak, retenção, curva de esquecimento)
- [x] Dashboard com métricas globais
- [x] Tema dark/light (Catppuccin)
- [x] Logging estruturado (Pino + requestId)
- [x] Docker Compose (frontend + backend + db)
- [x] Testes unitários (auth, deck, review services)
- [x] Lazy loading no frontend
- [x] Error boundary

---

## Dívida Técnica (itens reais, não teoria)

### Consistência

- `cardController`, `reviewLogsController`, `importController` tratam
  erro inline (`res.status(500).json({ error })`) em vez de usar o
  error handler centralizado com `next(err)`
- Isso gera formato de resposta inconsistente:
  `{ error }` vs `{ success: false, error }`
- `importController` retorna dados sem wrapper `{ success, data }`
- `getSharedDeckPreview` assinado como `AuthRequest` mesmo sendo rota
  pública (não quebra, mas é impreciso)

### Acabamento

- `console.log` de debug no `server.ts` (3 ocorrências)
- Hardcoded `http://localhost:3000` no `client.ts` e `decks.ts`
- Erros do backend misturam PT e EN
- `.env` do frontend não existe (ninguém criou o arquivo de exemplo)
- README menciona Prisma ORM (não usado — é raw SQL)
- README mostra `DATABASE_URL` mas o sistema usa variáveis separadas
- `AnalyticsPage.tsx` existe mas não está roteada (dead code)

### Funcional

- `new_cards_per_day` salvo no banco e editável na UI, mas ignorado
  pelo backend na query de due cards
- Sem índice em `cards.due` — a query mais frequente do sistema faz
  scan sequencial

---

## Prioridades Imediatas (antes da escrita do TCC)

1. ✅ Padronizar error handling (inline → centralizado)
2. ✅ Substituir URL hardcoded por `VITE_API_URL`
3. ✅ Remover `console.log` de debug
4. ✅ Padronizar mensagens de erro para PT-BR
5. ✅ Corrigir `new_cards_per_day` (bug real)
6. ✅ Adicionar índice em `cards.due`
7. ✅ Corrigir README (Prisma → raw SQL, `.env` exemplo correto)
8. ✅ Remover/rotear AnalyticsPage.tsx
9. ✅ Criar `.env.example` para frontend e backend

---

## Melhorias Futuras (pós-TCC, se quiser)

- Testes E2E (Puppeteer/Playwright)
- Deploy real (VPS ou Railway)
- PWA completo (já tem config base)
- Modo offline
- Sistema de tags
- Gamificação
- Sincronização em tempo real

---

## Idéias Relacionadas ao TCC/FSRS (para a monografia)

- Comparar retenção FSRS vs SM-2 com dados simulados
- Analisar correlação entre `stability` e acertos reais
- Medir impacto do `new_cards_per_day` na taxa de retenção
- Visualizar curva de esquecimento real vs predita pelo FSRS
- Estudar distribuição de ratings por estado do card (New/Learning/Review)
- Analisar a evolução da `difficulty` ao longo das revisões
