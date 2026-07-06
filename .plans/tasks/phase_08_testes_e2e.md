---
id: "P08"
title: "Testes E2E — Cobertura Completa e Infraestrutura"
status: "pending"
priority: "high"
estimate: "2-3 weeks"
depends_on: []
---

# Fase 08 — Testes E2E: Cobertura Completa e Infraestrutura

## Objetivo

Evoluir a suíte de testes E2E de 5 spec files (10 testes) para cobertura sistemática dos fluxos críticos, com infraestrutura confiável e manutenível.

## Situação Atual

- **5 spec files**: `auth.spec.ts` (5), `review.spec.ts` (1), `analytics.spec.ts` (1), `share.spec.ts` (2), `import.spec.ts` (1)
- **Config**: `e2e/playwright.config.ts` com chromium, workers=1, sem webServer, sem global setup
- **Helpers**: `uniqueUser()` e `sampleApkgPath()` — apenas
- **Padrão**: Cada teste registra um novo usuário (3-5s por registro), sem reaproveitamento de storage state
- **Fixtures**: `sample.apkg` gerado programaticamente via `helpers/generate-apkg.mjs`

## Lacunas Identificadas

### Infraestrutura

| Item | Status | Impacto |
|------|--------|---------|
| `webServer` no config | ❌ Ausente | Testes exigem stack manual |
| Global setup (auth fixture) | ❌ Ausente | Cada teste registra user do zero (~5s perdido por teste) |
| DB seed/reset automático | ❌ Ausente | Dados residuais podem interferir |
| Timeout explícito por teste | ❌ Ausente | Timeout global padrão é insuficiente para fluxos longos |
| Projetos (chromium/firefox/webkit) | ❌ Apenas chromium | Sem cobertura cross-browser |
| `.env.e2e` | ❌ Ausente | Sem configuração específica para E2E |

### Cobertura de Testes

| Área | Status | Gaps |
|------|--------|------|
| **Autenticação** | ⚠️ Parcial | Só fluxo feliz. Faltam: validação de formulário, email duplicado, senha inválida, sessão entre reloads |
| **Deck CRUD** | ❌ Ausente | Criar, renomear, excluir baralho, estado vazio, validação de título |
| **Card CRUD** | ❌ Ausente | Criar (editor + lote), editar, excluir, paginação, estado vazio, validação |
| **Revisão FSRS** | ⚠️ Parcial | Só rating "Good". Faltam: Again/Hard/Easy, teclas 1-4, fila vazia, múltiplas sessões, Learning state |
| **Import .apkg** | ⚠️ Parcial | Só fluxo feliz. Faltam: arquivo inválido, nome duplicado |
| **Share/Unshare** | ⚠️ Parcial | Faltam: baralho vazio compartilhado, token inválido |
| **Analytics** | ⚠️ Parcial | Faltam: analytics sem dados, redirect sem login, analytics por baralho |
| **Navegação/UX** | ❌ Ausente | Sidebar, header, tema escuro, responsivo |

## Justificativa

Apesar do INDEX.md atual listar "Novos testes E2E" como "O que NÃO mexer agora", o projeto está em preparação para TCC e:

1. **Risco de regressão alto** — Fluxos críticos (revisão, compartilhamento, analytics) não têm safeguard E2E
2. **Validação para banca** — Testes E2E são evidência concreta de qualidade para a banca avaliadora
3. **Infraestrutura frágil** — Sem `webServer`, qualquer mudança no ambiente quebra os testes existentes sem aviso
4. **Cobertura concentrada** — 80% dos testes estão em autenticação; fluxos reais (deck, card, revisão) têm 1-2 testes cada

## Esforço Estimado

2-3 semanas (intercalado com outras tarefas da Fase 07)

## Dependências

- Docker Compose funcional (frontend + backend + db + db-test)
- Playwright 1.60+ instalado (`@playwright/test` já em `devDependencies`)

## Success Metrics

- 25+ testes E2E implementados e verdes
- `webServer` configurado: `npm run test:e2e` sozinho sobe e derruba a stack
- Global setup com storage state: testes rodam sem re-registrar a cada execução
- Cobertura mínima por área: Auth (8+), Deck (5+), Card (5+), Review (6+), Import/Share/Analytics (6+)
- Nenhum teste com `test.skip` ou `test.fixme` sem justificativa
- `tsc --noEmit` passa sem erros no diretório `e2e/`

---

## Tarefas

### [x] [T08.01 — Infraestrutura E2E e Configuração Global](./task_08_01_infraestrutura_e2e.md)

**Descrição:** Configurar Playwright com `webServer`, global setup, e fixture de autenticação.

**Motivação:** Sem infraestrutura robusta, os testes são frágeis e lentos. `webServer` garante que `npm run test:e2e` funcione em qualquer ambiente. Global setup com storage state reduz cada teste em ~5s.

**Impacto:** Alto (habilita todos os outros testes)

**Estimativa:** 1-2 dias

---

### [x] [T08.02 — Autenticação: Cenários de Borda](./task_08_02_auth_edge_cases.md)

**Descrição:** Expandir `auth.spec.ts` para cobrir validações, erros e persistência de sessão.

**Motivação:** Autenticação é a porta de entrada. Erros de validação e sessão são os primeiros problemas que um usuário encontra.

**Impacto:** Alto

**Estimativa:** 1 dia

---

### [ ] [T08.03 — Gerenciamento de Baralhos (CRUD)](./task_08_03_deck_crud.md)

**Descrição:** Testes completos de criar, renomear, excluir baralhos, estado vazio e validação.

**Motivação:** Gerenciamento de baralhos é o fluxo mais usado depois de login. Zero testes atualmente.

**Impacto:** Alto

**Estimativa:** 2 dias

---

### [ ] [T08.04 — Gerenciamento de Flashcards (CRUD)](./task_08_04_card_crud.md)

**Descrição:** Testes de criação (editor + lote), edição, exclusão, paginação e validação.

**Motivação:** O conteúdo do estudo são os cards. Sem testes, uma regression no editor quebra o fluxo principal.

**Impacto:** Alto

**Estimativa:** 2-3 dias

---

### [ ] [T08.05 — Fluxo de Revisão FSRS (Cobertura Completa)](./task_08_05_review_completo.md)

**Descrição:** Expandir `review.spec.ts` para todos os 4 ratings, teclas de atalho, fila vazia, Learning state.

**Motivação:** Revisão FSRS é o diferencial do projeto. Regression aqui compromete o valor central do produto.

**Impacto:** Crítico

**Estimativa:** 2-3 dias

---

### [ ] [T08.06 — Import, Share e Analytics (Hardening)](./task_08_06_import_share_analytics.md)

**Descrição:** Adicionar cenários de erro/estado vazio para import, share e analytics.

**Motivação:** Os fluxos felizes existem, mas cenários de erro são tão importantes quanto para a robustez.

**Impacto:** Médio

**Estimativa:** 2 dias

---

### [ ] [T08.07 — Navegação e UX (Regressão)](./task_08_07_navegacao_ux.md)

**Descrição:** Testar navegação via sidebar/header, tema escuro, responsividade básica, e redirecionamentos.

**Motivação:** Garantir que mudanças em componentes compartilhados (Header, Sidebar) não quebram a navegação.

**Impacto:** Médio

**Estimativa:** 1-2 dias

---

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.

## Phase Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#phase-completion-policy).
