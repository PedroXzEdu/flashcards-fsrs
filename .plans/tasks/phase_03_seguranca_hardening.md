---
id: "P03"
title: "Segurança e Hardening"
status: "pending"
priority: "high"
estimate: "1 week"
depends_on: []
---

# Fase 03 — Segurança e Hardening

## Objetivo
Eliminar riscos de segurança identificados na análise: sanitização server-side para rich text, CSP enforcement e validação adicional de entrada.

## Justificativa
Atualmente, o rich text dos cards é sanitizado apenas no frontend (`CardContent.tsx`). Se alguém chamar a API diretamente com `<script>`, o dado vai para o banco. Embora o frontend oficial sanitize na renderização, qualquer outro cliente ou futura integração pode estar vulnerável. Para um TCC que se propõe a ser "production-ready", isso precisa ser endereçado.

## Valor Técnico
Alto — segurança é um dos critérios mais valorizados em bancas de TCC.

## Esforço Estimado
Médio (1 semana)

## Dependências
Nenhuma

## Success Metrics

- Sanitização server-side com DOMPurify aplicada em cardService e importService
- CSP em modo enforce (não mais reportOnly)
- Validação de query params centralizada via middleware Zod
- Path params validados como números inteiros positivos
- Headers de segurança revisados e completos
- Nenhuma regressão em fluxos existentes


---

## Tarefas

### [ ] [T03.01 — Adicionar sanitização server-side com DOMPurify](./task_03_01_sanitizacao_server_side.md)

**Descrição:** Adicionar `isomorphic-dompurify` (ou `dompurify` + `jsdom`) como dependência e sanitizar `front` e `back` no backend antes de persistir.

**Motivação:** Decisão documentada em `DECISIONS.md` (item 8) mas o risco é real. Sanitizar no backend adiciona uma camada de defesa. O frontend continua sanitizando também (defense-in-depth).

**Impacto:** Alto

**Estimativa:** 4-6 horas

**Subtarefas:**
- [ ] Instalar `isomorphic-dompurify` no backend
- [ ] Criar `backend/src/utils/sanitizeHtml.ts` com configuração DOMPurify (mesmas tags permitidas que no frontend)
- [ ] Aplicar sanitização em `cardService.create`, `cardService.update`, `deckImportService` (import .apkg)
- [ ] Atualizar `DECISIONS.md` para refletir a mudança
- [ ] Testar que HTML seguro (negrito, itálico, KaTeX) é preservado

---

### [ ] [T03.02 — Ativar CSP enforcement (sair de reportOnly)](./task_03_02_csp_enforce.md)

**Descrição:** Mudar CSP de reportOnly para enforce, ajustando a política conforme necessário.

**Motivação:** CSP em reportOnly loga violações mas não bloqueia. Para um sistema que alega ser production-ready, CSP precisa ser enforce. A fase de hardening já identificou as violações.

**Impacto:** Médio

**Estimativa:** 2-4 horas

**Subtarefas:**
- [ ] Testar extensivamente o frontend com CSP enforce em ambiente dev
- [ ] Identificar recursos que precisam de exceções (ex: `img-src`, `font-src`)
- [ ] Aplicar configuração enforce em `app.ts`
- [ ] Manter `reportUri` para monitoramento contínuo
- [ ] Atualizar `DECISIONS.md` (item 11)

---

### [ ] [T03.03 — Adicionar validação de query params nas rotas](./task_03_03_validacao_query_params.md)

**Descrição:** Criar middleware de validação para query params (ex: `page`, `limit`, `months`, `days`) usando Zod.

**Motivação:** Atualmente, query params são validados manualmente nos controllers com `parseInt` e `Math.max/min`. Um middleware padronizado centraliza e reduz erro.

**Impacto:** Médio

**Estimativa:** 2-3 horas

**Subtarefas:**
- [ ] Estender `validate.ts` para aceitar schema opcional de query: `validate(bodySchema, querySchema?)`
- [ ] Aplicar nas rotas que usam query params:
  - `GET /decks/:id/cards` (page, limit)
  - `GET /analytics/*` (months, days)
  - `GET /review-logs/*`
- [ ] Remover validação manual dos controllers

---

### [ ] [T03.04 — Adicionar validação de `card_id` e `deck_id` nas rotas](./task_00_01_validar_path_params.md)

**Descrição:** Aplicar validação dos path params como números inteiros positivos via middleware Zod.

**Motivação:** (mesma da T00.01 — listada aqui para planejamento)

**Impacto:** Médio

**Estimativa:** 1-2 horas

**Subtarefas:**
- [ ] Ver T00.01 na Fase 00 (pode ser feita aqui ou lá)

---

### [ ] [T03.05 — Revisar headers de segurança](./task_03_04_revisar_headers_seguranca.md)

**Descrição:** Verificar se todos os headers de segurança recomendados estão presentes (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy).

**Motivação:** Helmet já adiciona vários, mas vale verificar se a configuração cobre todos os casos.

**Impacto:** Baixo

**Estimativa:** 1 hora

**Subtarefas:**
- [ ] Verificar headers atuais com `curl -I http://localhost:3000/health`
- [ ] Adicionar `referrerPolicy` e `permissionsPolicy` no helmet config se ausentes
- [ ] Testar que não quebram funcionalidades existentes

## Task Completion Policy

A task é considerada completa apenas quando TODAS as condições abaixo são verdadeiras:

1. Implementação finalizada
2. Validação concluída (`tsc --noEmit`, testes)
3. Revisão (`@reviewer`) executada
4. Achados da revisão corrigidos ou justificados
5. Arquivo da task atualizado (status, frontmatter)
6. Arquivo da fase atualizado (checklist)
7. Commit criado

Fluxo obrigatório:

```
Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task
```

A próxima task NÃO DEVE começar antes do commit da atual.


## Phase Completion Policy

Quando toda task da fase estiver completa:

1. Verificar que todas as tasks estão marcadas como concluídas
2. Verificar que os Success Metrics foram atingidos
3. Verificar que não há achados de revisão em aberto
4. Marcar a fase como `completed` no frontmatter
5. Mover o arquivo da fase para `.plans/completed/`
6. Mover todos os arquivos de task associados para `.plans/completed/`
7. Criar um commit de conclusão

Apenas após o arquivamento a próxima fase pode começar.


## Planning Source of Truth

Regras:

- `AGENTS.md` define a política de execução
- Arquivos de fase definem o progresso atual do roadmap
- Arquivos de task definem o escopo de implementação
- Fases concluídas são registros históricos em `.plans/completed/`
- Trabalho ativo sempre vem de `.plans/tasks/`
- Trabalho arquivado sempre vive em `.plans/completed/`


## Task Completion Policy

A task é considerada completa apenas quando TODAS as condições abaixo são verdadeiras:

1. Implementação finalizada
2. Validação concluída (`tsc --noEmit`, testes)
3. Revisão (`@reviewer`) executada
4. Achados da revisão corrigidos ou justificados
5. Arquivo da task atualizado (status, frontmatter)
6. Arquivo da fase atualizado (checklist)
7. Commit criado

Fluxo obrigatório:

```
Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task
```

A próxima task NÃO DEVE começar antes do commit da atual.


## Phase Completion Policy

Quando toda task da fase estiver completa:

1. Verificar que todas as tasks estão marcadas como concluídas
2. Verificar que os Success Metrics foram atingidos
3. Verificar que não há achados de revisão em aberto
4. Marcar a fase como `completed` no frontmatter
5. Mover o arquivo da fase para `.plans/completed/`
6. Mover todos os arquivos de task associados para `.plans/completed/`
7. Criar um commit de conclusão

Apenas após o arquivamento a próxima fase pode começar.


## Planning Source of Truth

Regras:

- `AGENTS.md` define a política de execução
- Arquivos de fase definem o progresso atual do roadmap
- Arquivos de task definem o escopo de implementação
- Fases concluídas são registros históricos em `.plans/completed/`
- Trabalho ativo sempre vem de `.plans/tasks/`
- Trabalho arquivado sempre vive em `.plans/completed/`

