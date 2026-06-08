# Phase 05 — Production Readiness

## Objetivo

Preparar o FlashFSRS para implantação em produção: CSP enforcement, PWA funcional, hardening de segurança, otimização de build, documentação de deploy, e garantia de que o projeto pode rodar com configuração mínima fora do Docker Compose.

## Escopo

- CSP enforcement (mudar de reportOnly para enforce)
- PWA funcional (service worker, manifest, offline page)
- Segurança: rate limit global, brute force protection, headers de segurança adicionais
- Build otimizado (frontend, backend)
- Script de deploy (docker-compose.prod.yml)
- Documentação de deploy no README
- Verificação final de regressão (todos os testes + E2E)

## Fora de Escopo

- Deploy real em VPS ou Railway
- Domínio customizado
- SSL/TLS (delegado ao reverse proxy)
- CI/CD pipeline
- Monitoramento em produção
- Backup automático de banco

## Pré-requisitos

- Fases 01-04 concluídas
- Todos os testes passando (unit, integration, E2E)
- Docker Compose funcional
- `tsc --noEmit` passando em backend e frontend

## Tarefas

### Task 5.1 — CSP enforcement

Migrar CSP de `reportOnly` para modo enforcement, resolvendo violações conhecidas.

#### Subtarefas

- [ ] Revisar relatórios de violação CSP atuais (se houver)
- [ ] Garantir que todas as fontes de script, style, font, img estão no CSP
- [ ] Adicionar `'nonce'` para scripts inline do Tiptap/KaTeX se necessário
- [ ] Mudar `helmet.contentSecurityPolicy` de `reportOnly: true` para ativo
- [ ] Testar manualmente: login, register, criar card com rich text, revisar
- [ ] Verificar que KaTeX render funciona (requer `'unsafe-inline'` para styles ou hash)
- [ ] Testar via E2E que nenhum recurso é bloqueado

#### Critérios de Aceitação

- Nenhum recurso first-party é bloqueado pelo CSP
- KaTeX render funciona corretamente
- Tiptap editor carrega sem erros
- CSP headers incluem `report-uri` para logging
- Navegação completa do app funciona sem violações no console

#### Arquivos Impactados

- `backend/src/app.ts` (configuração do helmet CSP)

---

### Task 5.2 — PWA funcional

Completar configuração PWA para que o app seja instalável e funcione offline minimamente.

#### Subtarefas

- [ ] Verificar `manifest.json` gerado pelo `vite-plugin-pwa` — icones, nome, short_name, theme_color
- [ ] Adicionar ícones PWA (pelo menos 192x192 e 512x512) em `frontend/public/`
- [ ] Configurar service worker com NetworkFirst para API, CacheFirst para assets
- [ ] Adicionar página offline básica (offline.html ou via service worker)
- [ ] Testar via Lighthouse PWA audit (ou Chrome DevTools > Application > Manifest)
- [ ] Verificar que app pode ser instalada ("Add to Home Screen")

#### Critérios de Aceitação

- Lighthouse PWA audit passa em todos os checks de "Installable"
- Manifest contém `name`, `short_name`, `icons`, `start_url`, `display`, `theme_color`
- Service worker registra sem erros
- App offline mostra página informativa (não tela branca)
- Ícones aparecem corretamente no prompt de instalação

#### Arquivos Impactados

- `frontend/vite.config.ts` (config PWA)
- `frontend/public/icons/*` (novos)
- `frontend/src/main.tsx` (register SW)
- `frontend/index.html` (meta tags, theme-color)

---

### Task 5.3 — Hardening de segurança adicional

Adicionar camadas extras de segurança: rate limit global, brute force protection, headers de segurança.

#### Subtarefas

- [ ] Adicionar rate limit global (1000 requests/15min) como fallback — **exceto** em NODE_ENV=test
- [ ] Implementar brute force protection no login: após 5 tentativas falhas em 15min, bloquear IP por 30min (in-memory Map)
- [ ] Verificar headers de segurança: `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` (se HTTPS)
- [ ] Garantir que `helmet` já configura todos (revisar configuração atual)
- [ ] Adicionar `X-Robots-Tag: noindex` em todas as rotas (evitar indexação de conteúdo de estudo)
- [ ] Testar via supertest que headers estão presentes

#### Critérios de Aceitação

- Rate limit global retorna 429 após 1000 requests em 15min
- Brute force: 5 falhas de login consecutivas bloqueiam IP por 30min
- Headers de segurança presentes em todas as respostas
- Brute force é resetado após login bem-sucedido
- Rate limiters não atrapalham testes (NODE_ENV=test)

#### Arquivos Impactados

- `backend/src/app.ts`
- `backend/src/middlewares/rateLimiter.ts`
- `backend/src/middlewares/bruteForce.ts` (novo)
- `backend/src/controllers/authController.ts`

---

### Task 5.4 — Build otimizado

Configurar build de produção para frontend e backend.

#### Subtarefas

- [ ] Verificar `vite build` no frontend — minificação, tree-shaking, chunk splitting
- [ ] Verificar `tsc` no backend — compilação para `dist/`
- [ ] Adicionar script `build` no backend (`tsc`)
- [ ] Garantir que `npm run build` no root faz build de ambos
- [ ] Verificar que `NODE_ENV=production` desativa logs verbose, pretty-print
- [ ] Verificar que frontend buildado usa variáveis de ambiente do Vite (`VITE_API_URL`)
- [ ] Testar com `npm run preview` (frontend) apontando para backend de produção

#### Critérios de Aceitação

- `npm run build` no root compila backend + frontend sem erros
- Frontend buildado em `frontend/dist/` (~500KB gzipped)
- Backend compilado em `backend/dist/`
- `NODE_ENV=production` usa logger JSON (não pretty-print)
- Preview do frontend funciona com API real

#### Arquivos Impactados

- `backend/package.json`
- `frontend/package.json`
- `package.json` (root)
- `frontend/vite.config.ts`
- `backend/src/config/logger.ts`

---

### Task 5.5 — Docker Compose de produção

Criar `docker-compose.prod.yml` com configuração otimizada para produção.

#### Subtarefas

- [ ] Criar `docker-compose.prod.yml` baseado no de dev
- [ ] Serviço frontend: usar imagem multi-stage (build → nginx/alpine para servir static)
- [ ] Serviço backend: usar `npm run build` + `node dist/server.js`
- [ ] Serviço db: adicionar volume persistente, healthcheck
- [ ] Remover services de dev desnecessários (db-test, tools)
- [ ] Adicionar variáveis de ambiente para produção (CORS_ORIGIN, JWT_SECRET)
- [ ] Adicionar `restart: unless-stopped` nos serviços
- [ ] Testar que `docker compose -f docker-compose.prod.yml up` funciona

#### Critérios de Aceitação

- `docker compose -f docker-compose.prod.yml build` completa sem erros
- Frontend servido via nginx (porta 80 ou 8080)
- Backend rodando com `NODE_ENV=production`
- Banco de dados persiste entre restart
- Serviços iniciam na ordem correta (db → backend → frontend)

#### Arquivos Impactados

- `docker-compose.prod.yml` (novo)
- `Dockerfile` (atualizar para multi-stage)
- `Dockerfile.frontend` (novo, opcional) ou usar `Dockerfile` existente

---

### Task 5.6 — Documentação de deploy + verificação final

Documentar procedimento de deploy e executar verificação de regressão completa.

#### Subtarefas

- [ ] Atualizar `README.md` com seção "Deploy" (pré-requisitos, passos, variáveis de ambiente)
- [ ] Criar `.env.prod.example` com variáveis para produção
- [ ] Rodar todos os testes: `vitest --project unit && vitest --project integration`
- [ ] Rodar testes E2E: `npm run test:e2e`
- [ ] Rodar `tsc --noEmit` em backend e frontend
- [ ] Verificar build de produção: `npm run build`
- [ ] Atualizar ROADMAP.md com status final
- [ ] Invocar `@doc` para revisar documentação

#### Critérios de Aceitação

- README.md tem instruções claras de deploy (Docker Compose)
- `.env.prod.example` contém todas as variáveis necessárias
- Todos os testes (unit + integration + E2E) passam
- Build de produção compila sem erros
- ROADMAP reflete estado final do projeto
- `@doc` aprova documentação

#### Arquivos Impactados

- `README.md`
- `.env.prod.example` (novo)
- `ROADMAP.md`
- Potencialmente `ARCHITECTURE.md`, `DECISIONS.md`

---

## Riscos e Pontos de Atenção

- CSP enforcement pode quebrar funcionalidades não testadas — testar exaustivamente
- PWA icons precisam ser gerados ou baixados — certificar-se de que existem no repositório
- Brute force em memória não persiste entre restart (aceitável)
- Docker Compose de produção expõe portas diferentes — documentar
- nginx para frontend requer configuração de proxy reverso para API
- Verificação final deve ser feita com `docker compose down -v` + `up` para garantir estado limpo

## Checklist da Fase

- [ ] Todas as tarefas concluídas
- [ ] Testes implementados
- [ ] Documentação atualizada
- [ ] Revisão de código realizada
- [ ] Critérios de aceitação validados

## Instruções para o Agente Construtor

1. Execute as tarefas na ordem definida (5.1 → 5.2 → 5.3 → 5.4 → 5.5 → 5.6).
2. Não avance para a próxima fase sem concluir os critérios de aceitação.
3. Atualize este documento conforme o progresso.
4. Registre desvios ou decisões arquiteturais relevantes.
5. Gere commits pequenos e focados por tarefa.
6. Após cada task, rode `tsc --noEmit` (backend) ou `tsc -b --noEmit` (frontend) conforme aplicável, e invoque `@reviewer` antes de commitar.
7. **Task 5.6 é a verificação final**: não declare a fase concluída sem todos os testes verdes e `@doc` aprovado.
