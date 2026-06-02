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
- Sem suporte a parâmetros por deck (uniforme global)

### Quando revisitar

Se precisar de parâmetros FSRS customizados por deck ou se a biblioteca parar de ser mantida.

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

### Quando revisitar

Se o projeto for deployado em produção (substituir por Dockerfile único ou PaaS).

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

## 7. Rich Text Preservado no Backend (sem strip HTML)

### Contexto

Cards tem campos front/back com formatação rich text (negrito, itálico, listas, KaTeX).

### Escolha

Backend armazena HTML bruto (TEXT columns) sem sanitizar ou fazer strip.

### Justificativa

- Preserva formatação exata do editor Tiptap
- Separação de responsabilidades: backend armazena, frontend sanitiza na renderização
- Zero perda de informação

### Trade-offs

- Banco contém HTML (poluição visual em queries diretas)
- Se outro cliente acessar o dado bruto sem sanitizar, pode ter XSS
- Tamanho maior no banco

### Quando revisitar

Se houver clientes não-frontend consumindo a API (ex: mobile app).

---

## 8. Sanitização no Frontend em vez do Backend

### Contexto

XSS prevention no rich text dos cards.

### Escolha

`CardContent.tsx` faz sanitizeHtml + KaTeX render no frontend. Backend aceita HTML bruto.

### Justificativa

- O backend não sabe o que é HTML "seguro" sem perder formatação
- Frontend controla exatamente como renderiza
- Permite evoluir o editor sem migrar dados
- Tags permitidas: p, a, img, math, semanticos basicos
- URLs restritas a http, https, data:image

### Trade-offs

- Dois lugares de sanitização (se um componente novo esquecer, vaza XSS)
- `dangerouslySetInnerHTML` necessário (mas com entrada sanitizada)
- Backend confia no frontend — se alguém chamar a API direto com script malicioso, o dado vai pro banco

### Quando revisitar

Se houver ingestão de dados de terceiros (ex: API pública, import de fontes não-confiáveis).

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

Middleware `validate(schema)` que aplica Zod schema no `req.body`.

### Justificativa

- Separa validação do controller
- Erros de validação caem no `errorHandler` e retornam 400 com detalhes
- Schemas reutilizáveis (ex: cardSchema usado em create e update)
- Tipos inferidos automaticamente dos schemas

### Trade-offs

- Valida apenas `req.body` (não params/query — precisa de middleware extra)
- Mensagens de erro em PT-BR hardcoded nos schemas

### Quando revisitar

Se precisar validar query params ou path params com o mesmo padrão.

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
