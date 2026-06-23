# DECISIONS — FlashFSRS

> Registro de decisões técnicas não-óbvias, trade-offs e justificativas.
> Baseado no código real, não em intenções.

---

## 1. Raw SQL (`pg`) em vez de Prisma ORM

### Contexto

Projeto precisava de banco relacional. Prisma é o ORM mais comum no ecossistema Node/TS.

### Escolha

`pg` (driver PostgreSQL) + SQL manual em repositories.

### Justificativa

- Controle total sobre queries (especialmente estatísticas com `FILTER`, window functions, JOINs complexos)
- Zero overhead de abstração
- Evita complexidade de schema generation e migrations do Prisma
- FSRS exige queries específicas (due ordering, filtros por state, agregações)

### Trade-offs

- Sem type-safety automático nas queries (escrita manual de tipos)
- Migrations são SQL puro (sem versionamento automático)
- Mais verboso para CRUD simples

### Quando revisitar

Se o número de tabelas crescer muito ou se migration manual se tornar gargalo.

---

## 2. Express em vez de NestJS / Fastify

### Contexto

API HTTP para flashcards. Alternativas populares: NestJS (opinionated, decorators), Fastify (mais rápido).

### Escolha

Express 5.

### Justificativa

- Simplicidade: sem decorators, DI, modules
- Ecossistema maduro de middleware (helmet, cors, rate-limit, compression)
- Código explícito e rastreável
- Tamanho do projeto não justifica complexidade de NestJS

### Trade-offs

- Sem validação/decorators nativos de rota
- Performance inferior ao Fastify (irrelevante para este volume)
- Express 5 ainda tem menos exemplos que 4.x

### Quando revisitar

Se performance de rota se tornar gargalo (improvável).

---

## 3. Monólito Modular em vez de Microsserviços

### Contexto

Projeto solo com prazo acadêmico.

### Escolha

Single backend Express com separação por camadas (controller/service/repository).

### Justificativa

- Zero latência de rede entre camadas
- Deploy único
- Transações ACID entre decks/cards/review_logs (essencial para FSRS)
- Sem overhead de comunicação, descoberta, filas

### Trade-offs

- Acoplamento: toda funcionalidade no mesmo processo
- Escalabilidade vertical apenas
- Se crescer muito, fica difícil separar

### Quando revisitar

Se houver necessidade de times independentes ou escalar componentes separadamente.

---

## 4. `ts-fsrs` em vez de implementação própria

### Contexto

FSRS-5 é o algoritmo de spaced repetition.

### Escolha

Biblioteca `ts-fsrs` v5.3.2 (mantida pela comunidade FSRS).

### Justificativa

- Implementação correta e testada do FSRS-5
- Evita erro matemático em formulação de estabilidade/dificuldade
- Atualizações futuras do algoritmo (FSRS-6, etc.)
- API clara: `fsrs()`, `f.repeat()`, `createEmptyCard()`

### Trade-offs

- Dependência externa (risco de breaking change)
- Personalização limitada dos parâmetros (usa `generatorParameters()` default)
- ~~Sem suporte a parâmetros por deck (uniforme global)~~ → Parâmetros por deck implementados via `deck_fsrs_params` + `createFSRS(overrides?)`

### Quando revisitar

~~Se precisar de parâmetros FSRS customizados por deck ou se a biblioteca parar de ser mantida.~~
→ Se a biblioteca `ts-fsrs` parar de ser mantida ou se houver breaking change que exija migração para implementação própria.

---

## 5. Docker Compose como Ambiente Padrão

### Contexto

Ambiente de desenvolvimento e execução.

### Escolha

Docker Compose com 5 serviços: frontend, backend, db, db-test, tools.

### Justificativa

- PostgreSQL versionado e isolado
- Mesma versão de Node (20) em todos os ambientes
- Zero configuração de banco local
- Container `tools` para scripts/diagnóstico
- Volume de uploads persistido

### Trade-offs

- Consumo de recursos (RAM/CPU)
- Hot reload via polling (CHOKIDAR_USEPOLLING) — mais lento
- Complexidade adicional se o dev já tem Node/PostgreSQL local

### Status atual

O projeto está deployado em produção via Vercel (frontend) + Render (backend + PostgreSQL). Docker Compose permanece como ambiente de desenvolvimento padrão (idêntico ao descrito acima). A produção ativa não usa Docker — `docker-compose.prod.yml` é mantido como alternativa para deploy autogerenciado.

### Quando revisitar

Condição atingida. Docker Compose é agora exclusivamente ambiente de desenvolvimento. Se o projeto precisar de ambientes de staging/QA adicionais ou se houver necessidade de replicar produção localmente, revisitar configuração de serviços Docker.

---

## 6. JWT Stateless (sem Refresh Token)

### Contexto

Autenticação de usuários.

### Escolha

JWT com 7 dias de expiry, armazenado em localStorage, sem refresh token.

### Justificativa

- Simplicidade: sem endpoint de refresh, sem rotação de tokens
- 7 dias é razoável para um projeto de estudo/flashcards
- Sem Redis/session store no backend

### Trade-offs

- Token roubado vale por 7 dias (sem revogação)
- localStorage vulnerável a XSS (mitigado por sanitização no frontend)
- Sem single logout (token continua válido até expirar)
- Sem refresh, usuário precisa re-logar após expiry

### Quando revisitar

Se houver requisito de segurança mais rígido (produção real com dados sensíveis).

---

## 7. Rich Text Preservado no Backend (com sanitização)

### Contexto

Cards tem campos front/back com formatação rich text (negrito, itálico, listas, KaTeX).

### Escolha

Backend armazena HTML sanitizado (TEXT columns) usando `isomorphic-dompurify` antes de persistir. Frontend também sanitiza na renderização (defense-in-depth).

### Justificativa

- Preserva formatação segura (tags permitidas: negrito, itálico, listas, imagens, MathML/KaTeX)
- Defesa em camadas: backend filtra antes de persistir, frontend reforça na renderização
- Tags e atributos não-permitidos são removidos, não apenas escapados
- URLs maliciosas (javascript:) são removidas via DOMPurify

### Trade-offs

- Banco contém HTML (poluição visual em queries diretas)
- Perda mínima de fidelidade (tags não-permitidas são removidas)
- Custo de processamento adicional em cada escrita (create/update/import)
- Dependência adicional: `isomorphic-dompurify`

### Quando revisitar

Se houver necessidade de ajustar a lista de tags/atributos permitidos.

---

## 8. Sanitização em Camadas (Frontend + Backend)

### Contexto

XSS prevention no rich text dos cards.

### Escolha

Backend sanitiza com `isomorphic-dompurify` antes de persistir (`sanitizeHtml.ts`). Frontend reforça na renderização (`CardContent.tsx`). Defesa em camadas.

### Justificativa

- Backend agora também sanitiza, eliminando o risco de XSS via chamadas diretas à API
- Frontend continua sanitizando na renderização como segunda camada (redundância segura)
- Tags permitidas mantidas idênticas nos dois lados: 27 tags HTML + MathML + 10 atributos
- URLs restritas a http, https, data:image, paths relativos

### Trade-offs

- Duas configurações de sanitização para manter sincronizadas (backend DOMPurify + frontend manual)
- Custo de processamento adicional em cada escrita
- `dangerouslySetInnerHTML` ainda necessário no frontend (mas com entrada sanitizada duas vezes)

### Quando revisitar

Se houver alteração na lista de tags/atributos permitidos — ambos os lados devem ser atualizados em conjunto.

---

## 9. Tailwind + Catppuccin em vez de Component Library

### Contexto

Sistema de design para o frontend.

### Escolha

Tailwind CSS v4 + Catppuccin theme (Mocha dark / Latte light) + CSS variables customizadas + ícones Lucide.

### Justificativa

- Tema consistente com 28 cores do Catppuccin
- Zero dependência de component library (Material, Chakra, etc.)
- Controle total sobre cada pixel
- CSS variables permitem tema dark/light sem JS pesado
- Lucide para ícones (leve, tree-shakeable)

### Trade-offs

- Mais CSS manual para component library features (modais, tooltips, skeleton)
- Sem acessibilidade garantida de fábrica
- Sem design system consistente além das cores (espaçamentos, tipografia, sombras são manuais)

### Quando revisitar

Se a equipe crescer e precisar de consistência mais rigorosa.

---

## 10. Fetch API em vez de Axios

### Contexto

HTTP client no frontend.

### Escolha

`fetch` nativo encapsulado em `api/client.ts`.

### Justificativa

- Zero dependência (nativo do browser)
- API moderna e estável
- Wrapper próprio é mais leve que Axios para as necessidades do projeto
- Interceptors desnecessários para este volume de chamadas

### Trade-offs

- Wrapper manual para erro handling (Axios já faz)
- Sem timeout nativo (fetch não aborta por tempo sem AbortController)
- Sem progresso de upload nativo

### Quando revisitar

Se precisar de upload com progresso ou timeout consistente.

---

## 11. CSP em `reportOnly`

### Contexto

Content Security Policy para segurança contra XSS.

### Escolha

Helmet com CSP configurado, mas em modo `reportOnly`.

### Justificativa

- Política restritiva (`'self'` para scripts, fontes, conexões)
- `unsafe-inline` para estilos (necessário para Tiptap/inline styles do React)
- `reportOnly` permite identificar violações sem quebrar funcionalidade existente
- Fase de hardening: primeiro descobre o que quebra, depois aplica

### Trade-offs

- CSP não é enforced — violações são logadas mas não bloqueadas
- Pode dar falsa sensação de segurança
- `unsafe-inline` para styles reduz efetividade

### Quando revisitar

Quando o projeto estiver em produção e todas as violações conhecidas forem resolvidas.

---

## 12. Rate Limiting Granular por Rota

### Contexto

Proteção contra abuso.

### Escolha

4 rate limiters diferentes, aplicados por rota específica (não global).

### Justificativa

- Auth (10/15min): protege login/register contra brute force
- Create deck (20/15min): evita spam de baralhos
- Create card (100/15min): uso normal de estudo
- Import (5/15min): operação pesada, evita abuso de upload

### Trade-offs

- Mais código que um limiter global
- Precisa revisar limites conforme uso real
- Sem rate limit em GET (cards, reviews) — risco menor

### Quando revisitar

Se houver evidência de abuso em rotas não-limitadas.

---

## 13. Zod Middleware Validation

### Contexto

Validação de request body nas rotas.

### Escolha

Middleware `validate(bodySchema?, querySchema?)` que aplica Zod schemas no `req.body` e/ou `req.query`.

### Justificativa

- Separa validação do controller
- Erros de validação caem no `errorHandler` e retornam 400 com detalhes
- Schemas reutilizáveis (ex: cardSchema usado em create e update, querySchemas para paginação e analytics)
- Tipos inferidos automaticamente dos schemas
- Query params agora validados pelo mesmo middleware (segundo argumento opcional)

### Trade-offs

- Path params ainda exigem validação manual ou middleware separado
- Mensagens de erro em PT-BR hardcoded nos schemas

### Quando revisitar

Se precisar validar path params com o mesmo padrão de middleware.

---

## 14. Controller → Service → Repository Pattern

### Contexto

Organização do backend.

### Escolha

Três camadas separadas: controller (HTTP), service (business), repository (SQL).

### Justificativa

- Testabilidade: services testáveis sem HTTP
- Separação de responsabilidades clara
- Substituir SQL por outro banco = só trocar repositories
- Transações coordenadas nos services com `PoolClient`

### Trade-offs

- Mais arquivos/boilerplate que controllers gordos
- Inconsistências existentes (cardController, reviewLogsController, priorityQueueService) — ver ARCHITECTURE.md
- Repository precisa aceitar `PoolClient` opcional para transações

### Quando revisitar

Se as inconsistências forem corrigidas e o padrão estiver consolidado.

---

## 15. Testes de Frontend com vitest + testing-library

### Contexto

Estratégia de testes.

### Escolha

Testes unitários nos services e middlewares do backend. Testes de integração (controller → service → repo real com PostgreSQL) rodando via Vitest workspace (`vitest --project integration`). Testes de frontend com `vitest` + `@testing-library/react` + `jsdom` para componentes, contextos e hooks. Zero testes E2E.

### Justificativa

- Lógica de negócio crítica está no backend (FSRS, transações, queries)
- Testes de integração validam o pipeline completo contra banco real, detectando regressões que unit tests não pegam
- Vitest workspace permite projects separados (unit + integration) com configs distintas
- testing-library incentiva testar comportamento (não implementação)
- jsdom permite testar renderização React sem browser real

### Trade-offs

- Testes de integração exigem `db-test` Docker rodando (porta 5433)
- Sem testes de snapshot ou regressão visual
- jsdom não cobre rendering real (layout, scroll, eventos complexos)
- Service tests usam banco real (não mockam repositórios) — mais integração que unitário

### Quando revisitar

Se surgirem regressões no frontend não detectadas pelos testes atuais, ou quando houver necessidade de testes E2E com Playwright/Cypress.

---

## 16. Subagent `@doc` para Revisão de Documentação

### Contexto

O fluxo de desenvolvimento não tinha um passo dedicado a verificar se ROADMAP.md, ARCHITECTURE.md e DECISIONS.md precisavam de atualização após mudanças no código. O `@reviewer` cobre qualidade de código, mas não avalia documentação.

### Escolha

Subagent `@doc` em `.opencode/agents/doc.md`, invocado manualmente antes do commit (passo 7 do fluxo de desenvolvimento). Read-only, modelado após o `@reviewer`.

### Justificativa

- Separa responsabilidades: reviewer cuida de código, doc cuida de documentação
- Invocação sob demanda evita ruído em commits triviais
- Regras de "quando atualizar" já existiam no AGENTS.md — o agente apenas as aplica
- Read-only elimina risco de corrupção acidental da documentação
- Mesmo padrão do `@reviewer` (subagent, terminal, sem recursão)

### Trade-offs

- Um agente a mais para invocar manualmente no fluxo
- Se a invocação for esquecida, a documentação continua desatualizada (mesmo problema de antes)
- O agente pode errar ao classificar mudanças como triviais vs estruturais (falso negativo)

### Quando revisitar

Se o agente for ignorado consistentemente ou se a documentação continuar desatualizada apesar dele, considerar automatizar a verificação no CI ou fundir com o `@reviewer`.

---

## 17. E2E Tests com Playwright

### Contexto

O projeto tinha testes unitários e de integração no backend, e testes de componentes no frontend. Faltavam testes E2E para validar fluxos completos (auth, review, import) contra o stack real rodando via Docker Compose.

### Escolha

Playwright com Chromium, testes em `e2e/`, configurado via `e2e/playwright.config.ts`. Três suites:

- **auth.spec.ts** — registro, login, logout, rotas protegidas
- **review.spec.ts** — criar baralho, criar cards em lote, revisar 3 cards, verificar tela de conclusão
- **import.spec.ts** — importar .apkg gerado programaticamente via `better-sqlite3`

### Justificativa

- Cobre os flows críticos que testes unitários/integração não validam (frontend + backend integrados)
- Chromium é suficiente para o escopo (sem necessidade de cross-browser)
- Fixture .apkg gerada em `e2e/helpers/generate-apkg.mjs` — evita binário grande no repositório
- Testes rodam contra Docker Compose (mesmo ambiente de dev), sem necessidade de mocks
- Playwright foi escolhido sobre Cypress por: API mais limpa, execução headless por padrão, melhor integração com TypeScript

### Trade-offs

- Requer Docker Compose rodando (frontend + backend + db)
- Rate limiting do backend pode afetar testes se reexecutados muitas vezes sem restart
- Testes são sequenciais (1 worker) para evitar concorrência no banco
- Sem cobertura de cross-browser (apenas Chromium)
- O teste de import gera .apkg com `zip` CLI (requer disponível no sistema)

### Quando revisitar

Se surgirem regressões nos flows cobertos, ou quando houver necessidade de expandir para flows adicionais (compartilhamento, analytics). Se os testes se tornarem lentos, considerar parallelização com múltiplos workers e banco isolado.

---

## 18. Custom In-Memory Metrics Collector em vez de Prometheus Client

### Contexto

Precisava-se de métricas de requisição (contadores, histograma de duração, erros) e métricas de negócio (decks criados, cards criados, revisões, imports). Alternativas: `prom-client` (padrão Prometheus), `express-prom-bundle`, ou armazenar métricas em tabela PostgreSQL.

### Escolha

Classe `MetricsCollector` customizada em `backend/src/middlewares/metrics.ts`, armazenando em memória (Maps de runtime), exposta via `GET /metrics` em JSON simples.

### Justificativa

- Zero dependências externas (sem `prom-client`, sem biblioteca extra)
- Dados efêmeros são aceitáveis para MVP — métricas resetam ao restart, mas não há SLAs que exijam persistência
- JSON simples é mais fácil de consumir que formato Prometheus para o escopo atual
- Controle total sobre estrutura dos dados (histograma com buckets customizados, métricas de negócio acopladas)
- Fácil de substituir por Prometheus client no futuro sem quebrar API (basta mudar o formato de saída)

### Trade-offs

- Métricas resetam ao reiniciar o servidor (sem histórico entre restarts)
- Sem formato padrão Prometheus — não pode ser coletado automaticamente por um scraper Prometheus sem adaptador
- Histograma em memória pode crescer se houver muitas rotas dinâmicas (mitigado usando `req.route.path` em vez de `req.path`)
- Sem labels/tags avançadas (apenas método + rota)
- Único processo: se horizontal scaling for implementado, cada instância tem métricas isoladas

### Quando revisitar

Se houver necessidade de métricas históricas, monitoramento contínuo (Grafana), ou deploy em produção com múltiplas instâncias — migrar para `prom-client` com exportação Prometheus real e scraper externo.

---

## 19. Multi-stage Docker + nginx para produção

### Contexto

O ambiente de dev usa `docker compose up` com Vite dev server e hot reload. Produção precisa de build otimizado, static serving e proxy reverso.

### Escolha

`Dockerfile` (backend) e `Dockerfile.frontend` (frontend) separados com multi-stage build. Frontend servido por nginx:alpine. API proxy via nginx com roteamento por método HTTP + header `X-Requested-With`.

### Justificativa

- nginx é mais eficiente que Node.js para servir arquivos estáticos
- Separação de responsabilidades: nginx gerencia compressão, cache, headers de segurança
- Multi-stage reduz drasticamente o tamanho da imagem final (devDependencies isoladas no stage de build)
- Três stages no backend: deps (`npm ci --omit=dev`), build (compilação TS), runtime (node:20-alpine + tini)

### Trade-offs

- Complexidade adicional: duas Dockerfiles + nginx.conf + docker-compose.prod.yml
- nginx adiciona uma camada de proxy (latência mínima, mas mais um ponto de falha)
- Precisa sincronizar rotas do nginx com as rotas reais do backend (risco de mismatch)

### Status atual

A produção ativa migrou para PaaS — frontend no Vercel (static serving + SPA routing gerenciados pela plataforma) e backend no Render. O nginx + Docker descrito acima não é mais usado em produção. A configuração Docker + nginx é mantida como alternativa autogerenciada em `docker-compose.prod.yml` e documentada para referência.

### Quando revisitar

Condição atingida — produção migrou para Vercel + Render. O multi-stage Docker + nginx é agora uma alternativa opcional. Revisitar se houver necessidade de reverter para deploy autogerenciado ou se a configuração de PaaS atual mostrar limitações (ex: necessidade de custom headers, proxy rules).

---

## 20. Brute Force Protection in-memory

### Contexto

Proteção contra ataques de força bruta no login, além do rate limit existente (`authRateLimiter`: 10 req/15min).

### Escolha

Middleware `bruteForce.ts` com armazenamento em `Map<string, Record>` (memória do processo). 5 tentativas falhas consecutivas em 15min → bloqueio de 30min por IP. Reset automático após login bem-sucedido (status 200).

### Justificativa

- Complementa o rate limiter: rate limit protege volume, brute force protege contra tentativas de senha
- Em memória é suficiente para MVP — dados resetam ao restart, aceitável para o escopo
- Evita dependência externa (Redis, banco de dados) para um recurso de segurança
- Cleanup periódico a cada 60s remove registros expirados

### Trade-offs

- Bloqueios não persistem entre restarts do servidor
- Apenas por IP (não por usuário) — atacante em mesma NAT afeta outros usuários
- Escala: Map em memória não funciona com múltiplas instâncias (horizontal scaling)

### Quando revisitar

Se houver deploy multi-instância ou necessidade de persistência de bloqueios entre restarts — migrar para Redis ou tabela no PostgreSQL.

---

## 21. Global Rate Limiter (defense-in-depth)

### Contexto

4 rate limiters granulares existiam (auth, createDeck, createCard, import), mas sem proteção global contra abuso em rotas não-limitadas.

### Escolha

`globalRateLimiter` (1000 req/15min) aplicado antes dos limiters granulares no pipeline de middlewares, com exceção do `/health` e `NODE_ENV=test`.

### Justificativa

- Defense-in-depth: se um limiter granular for mal configurado ou surgir um novo endpoint sem limiter, o global atua como rede de segurança
- `/health` excluído para permitir monitoramento externo sem risco de rate limit
- Ignorado em testes (`NODE_ENV=test`) para não interferir em suítes que fazem muitas requisições

### Trade-offs

- Pode mascarar problemas de configuração de limiters granulares (devs podem não perceber que um endpoint específico está desprotegido)
- 1000 req/15min é generoso — ataques DDoS de baixo volume passam
- Duas camadas de rate limit adicionam complexidade de debug quando 429 aparece

### Quando revisitar

Se houver evidência de abuso específico em rotas não-limitadas (GET /decks, GET /cards) — ajustar limites ou adicionar limiters granulares adicionais.

---

## 22. JSON Logger em Produção

### Contexto

Logger usava `pino-pretty` (formatação colorida para terminal) em todos os ambientes.

### Escolha

`NODE_ENV=production` → pino em modo JSON puro (sem transporte pretty). `NODE_ENV!=production` → `pino-pretty` formatado com timestamp e cores.

### Justificativa

- Logs JSON são parseáveis por ferramentas de produção (ELK, Datadog, Papertrail, Grafana Loki)
- pino-pretty é útil apenas para desenvolvimento local (legibilidade humana)
- Mudança minimal: condicional `isDev` no `logger.ts` decide se usa transporte pretty

### Trade-offs

- JSON é menos legível em `docker logs` direto (sem pipeline de formatação)
- Operador de produção precisa de ferramenta de log aggregation para visualizar

### Quando revisitar

Se houver investimento em observabilidade — adicionar pino-transport para envio remoto (ex: pino-datadog, pino-loki).

---

## 23. PWA com Service Worker Manual

### Contexto

PWA adicionado para tornar o app instalável e funcional offline. Alternativas: gerar SW automático via `vite-plugin-pwa` com `injectRegister: 'auto'`.

### Escolha

`injectRegister: null` (registro manual do SW em `main.tsx` via `registerSW()`), `navigateFallback: "/offline.html"`, caching NetworkFirst para rotas de API, CacheFirst para assets estáticos.

### Justificativa

- Registro manual dá controle sobre o ciclo de vida do SW (callback `onOfflineReady`)
- Offline page (`offline.html`) fornece UX consistente em vez de tela branca
- NetworkFirst para API cache garante dados frescos com fallback offline
- CacheFirst para assets com hash imutável (pasta `/assets/`) otimiza carregamento

### Trade-offs

- SW adiciona complexidade de debug (cache pode servir versão antiga durante desenvolvimento)
- Estratégia NetworkFirst para API adiciona latência em conexões lentas (StaleWhileRevalidate pode ser mais adequado)
- `navigateFallback` cobre navegação SPA, mas não cacheia páginas específicas para offline total

### Quando revisitar

Se houver requisito de funcionalidade offline completa (revisar cards sem internet) — migrar para estratégia mais agressiva de cache e sincronização em background.

---

## 25. Parâmetros FSRS por Deck: Tabela Separada + Factory por Request

### Contexto

O FSRS usava `generatorParameters()` fixo (singleton) para todos os decks. Para T05.01, precisava-se de parâmetros customizáveis por baralho (request_retention, maximum_interval, enable_fuzz, enable_short_term, learning_steps, relearning_steps).

### Escolha

Tabela separada `deck_fsrs_params` (PK = deck_id, FK → decks ON DELETE CASCADE). Factory `createFSRS(overrides?)` que mescla defaults com overrides opcionais. `fsrsService.preview/review` aceitam `deckId?` opcional.

### Justificativa

- Tabela separada evita poluir a tabela `decks` com colunas de configuração que só alguns decks usam
- ON DELETE CASCADE limpa automaticamente ao remover o deck
- Factory por request é leve (criação de objeto é barata) e evita cache de instância
- TEXT para steps (com split por vírgula) simplifica o schema PostgreSQL e mantém compatibilidade com `generatorParameters()`
- Fallback implícito: sem registro na tabela → usa defaults do `generatorParameters()` sem branch extra

### Trade-offs

- Tabela separada adiciona query extra opcional no fluxo de revisão (apenas se deck_id é passado)
- learning_steps/relearning_steps armazenados como TEXT exigem parsing (split por vírgula)
- Factory por request recria a instância FSRS a cada preview/review (sem cache)
- Se o número de parâmetros crescer significativamente, tabela separada vs JSONB pode ser revisitado

### Quando revisitar

Se o número de parâmetros FSRS crescer significativamente ou se houver necessidade de validação mais rigorosa dos steps (ex: UI de seleção de intervalos em vez de texto livre).

---

## 24. URLs Absolutas de Mídia Armazenadas no Banco (em vez de Relativas)

### Contexto

Ao importar decks `.apkg` do Anki, `processMidiaRefs()` convertia referências de mídia para caminhos relativos (`/media/foto.png`). Isso assumia que frontend e backend estariam no mesmo origin, o que não é garantido em produção (ex: backend em Render, frontend em Vercel).

### Escolha

`processMidiaRefs()` gera URLs absolutas usando `MEDIA_BASE_URL` como prefixo, resultando em `<img src="https://api.exemplo.com/media/foto.png">` armazenado diretamente no banco.

### Justificativa

- Funciona independentemente do origin do frontend (sem lógica extra de resolução no cliente)
- HTML no banco é auto-contido e renderizável sem pós-processamento
- Frontend não precisa saber resolver caminhos de mídia
- Variável obrigatória força configuração explícita

### Trade-offs

- Se `MEDIA_BASE_URL` mudar, cards importados anteriormente quebram (não há resolução dinâmica)
- Dados do banco contêm referências a um domínio específico, dificultando migração entre ambientes
- Abordagem alternativa (relativas + resolução no frontend) seria mais portátil, mas exigiria pós-processamento

### Quando revisitar

Se houver necessidade de portar dados entre ambientes regularmente — considerar armazenar caminhos relativos e resolver no frontend via `CardContent.tsx`.
