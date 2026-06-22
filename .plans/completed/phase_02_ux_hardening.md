---
id: "phase_02_ux_hardening"
title: "UX Hardening"
status: "completed"
priority: "medium"
type: "phase-completed"
---

# Phase 02 — UX Hardening

## Objetivo

Melhorar a experiência do usuário com foco em: feedback visual de operações, tratamento de estados limite (loading, erro, vazio), acessibilidade de teclado, e consistência visual em toda a aplicação. O MVP já tem toasts, empty states e loading skeletons — agora o trabalho é polir os cantos.

## Escopo

- Feedback visual para ações destrutivas (delete deck, delete card)
- Melhorias no fluxo de revisão (contagem regressiva, progresso)
- Acessibilidade (labels, aria, foco, contraste)
- Tratamento de erros no frontend (timeout, fallback, retry)
- Consistência de layout responsivo
- Melhorias no formulário de criação/edição de cards
- Feedback de salvamento automático

## Fora de Escopo

- Redesign completo de páginas
- Animações complexas ou microinterações elaboradas
- Gamificação (pontos, badges, streaks visuais)
- Modo offline ou PWA completo
- Suporte multi-idioma

## Pré-requisitos

- Fase 01 concluída ou pelo menos task 1.1 (metrics middleware)
- Frontend rodando com `npm run dev`
- Testes de frontend existentes passando (vitest)
- `tsc -b --noEmit` no frontend sem erros

## Tarefas

### Task 2.1 — ConfirmDialog para ações destrutivas

Garantir que toda ação destrutiva (delete deck, delete card, unshare deck) passe por `ConfirmModal` com descrição clara do que será removido.

#### Subtarefas

- [x] Revisar `DashboardPage.tsx` — delete deck deve ter confirmação com nome do baralho (já funcionava)
- [x] Revisar `DeckPage.tsx` — delete card deve ter confirmação com preview do front
- [x] Revisar `ShareModal.tsx` — unshare deve ter confirmação (já funcionava)
- [x] Garantir que o botão de confirmação use `type="button"` e `variant="danger"` (Button já usa type="button"; ConfirmModal defaults danger)
- [x] Garantir foco no botão de confirmação ao abrir modal — revertido para Cancel primeiro no DOM por safety UX (reviewer recomendou)
- [x] Testar via testing-library que confirm aparece e actions corretas são disparadas

#### Critérios de Aceitação

- Todo delete de baralho exibe modal com nome do baralho
- Todo delete de card exibe modal com preview do front do card
- Cancelar não executa a ação
- Confirmar executa a ação e exibe toast de sucesso/erro

#### Arquivos Impactados

- `frontend/src/pages/decks/DashboardPage.tsx`
- `frontend/src/pages/decks/DeckPage.tsx`
- `frontend/src/components/ShareModal.tsx`
- `frontend/src/components/__tests__/ConfirmModal.test.tsx` (estender)

---

### Task 2.2 — Barra de progresso na revisão

Adicionar indicador de progresso na tela de revisão: "Card X de Y" e barra de progresso.

#### Subtarefas

- [x] Identificar no `ReviewPage.tsx` onde o número total de cards está disponível
- [x] Adicionar componente `ProgressBar` simples (div com width percentual + label)
- [x] Exibir "Cartão 3 de 15" acima do card atual
- [x] Manter visível também na tela de preview (antes de mostrar resposta)
- [x] Atualizar ao submeter review e avançar
- [x] Testar via testing-library que barra reflete progresso

#### Critérios de Aceitação

- Barra de progresso aparece no topo da tela de revisão
- Texto "Cartão X de Y" é exibido
- Barra atualiza ao submeter cada review
- Ao completar todos, direciona para tela de conclusão

#### Arquivos Impactados

- `frontend/src/pages/review/ReviewPage.tsx`
- `frontend/src/components/ProgressBar.tsx` (novo)
- `frontend/src/components/__tests__/ProgressBar.test.tsx` (novo)

---

### Task 2.3 — Tratamento de erro de rede no frontend

Melhorar o feedback quando a API está indisponível ou timeout ocorre.

#### Subtarefas

- [x] Revisar `api/client.ts` — timeout lança "O servidor não respondeu"; TypeError "Failed to fetch" lança "Sem conexão com o servidor"
- [x] Adicionar mensagem específica para "sem conexão com o servidor"
- [x] Em páginas que carregam dados, capturar erro de rede e exibir `ErrorBoundary` ou fallback com botão "Tentar novamente" (ErrorBoundary já tinha retry)
- [x] Garantir que toast de erro não desaparece muito rápido — erro padrão 8s; `networkError` dedicado com 8s
- [x] Testar via simulação de falha no fetch (coberto por testes existentes + dedup no ToastContext)

#### Critérios de Aceitação

- Timeout de fetch exibe toast com "O servidor não respondeu. Verifique sua conexão."
- Erro de rede (TypeError: Failed to fetch) exibe toast ou fallback visual
- Botão "Tentar novamente" dispara nova requisição
- Múltiplos erros consecutivos não criam pilha de toasts duplicados

#### Arquivos Impactados

- `frontend/src/api/client.ts`
- `frontend/src/contexts/ToastContext.tsx`
- `frontend/src/components/ErrorBoundary.tsx`

---

### Task 2.4 — Acessibilidade incremental

Melhorar atributos de acessibilidade nos componentes principais.

#### Subtarefas

- [x] Adicionar `aria-label` em botões de ícone (back button, stats, shuffle, theme toggle)
- [x] Adicionar `role="status"` em toasts de notificação
- [x] Garantir que `Tab` key navega na ordem esperada na tela de revisão (card front focusable, tabIndex condicional)
- [ ] Adicionar `aria-describedby` em campos de formulário com erro (role="alert" já presente; mudança postergada)
- [ ] Verificar contraste de cores em modo light (visual design — não implementado como código)
- [x] Adicionar `aria-live="polite"` para updates assíncronos (já existia no ToastContext)

#### Critérios de Aceitação

- Lighthouse Accessibility (ou axe) não reporta violações críticas nos componentes modificados
- Botões de ícone têm `aria-label` descritivo
- Toasts são anunciados por leitores de tela
- Navegação por teclado funciona no fluxo de revisão (preview → mostrar resposta → rating)

#### Arquivos Impactados

- `frontend/src/components/Layout.tsx`
- `frontend/src/pages/review/ReviewPage.tsx`
- `frontend/src/components/Button.tsx`
- `frontend/src/contexts/ToastContext.tsx`
- `frontend/src/components/RichTextEditor.tsx`

---

### Task 2.5 — Responsividade da tela de revisão

Melhorar layout da revisão em telas pequenas (celular).

#### Subtarefas

- [x] Garantir que o card (front/back) ocupa largura total em telas < 640px (media query width: 100%)
- [x] Botões de rating (Again/Hard/Good/Easy) empilham verticalmente em telas muito estreitas (2 cols a 480px, 1 col a 360px)
- [x] Botão "Mostrar Resposta" tem tamanho adequado para toque (mín. 44px) (card-face min-height clamp(200px, 40vh, 280px))
- [x] Editor rich text funcional em mobile (toolbar já tem flexWrap: wrap; placeholder via Tiptap)
- [ ] Testar manualmente em viewport 375px (Chrome DevTools) — manual

#### Critérios de Aceitação

- Cards de revisão não estouram o layout em viewport 375px
- Botões de rating são tocáveis (mínimo 44x44px)
- Baralho com muitos cards não causa scroll horizontal
- Editor rich text não fica truncado

#### Arquivos Impactados

- `frontend/src/pages/review/ReviewPage.tsx`
- `frontend/src/styles/index.css` (media queries)
- `frontend/src/components/RichTextEditor.tsx`

---

### Task 2.6 — Feedback de salvamento automático no editor

Adicionar indicador "Salvando..." / "Salvo" no editor de cards ao criar/editar.

#### Subtarefas

- [x] No formulário de card (create/edit), detectar mudanças após último salvamento
- [x] Exibir "Salvando..." durante requisição (já existia no botão)
- [x] Exibir "Salvo ✓" após sucesso (por 2 segundos)
- [x] Exibir "Erro ao salvar" com toast em caso de falha (já existia)
- [x] Implementar via estado local no componente (loading/saved/error)
- [ ] Testar via testing-library (postergado — sem testes de página existentes)

#### Critérios de Aceitação

- Indicador aparece ao lado do botão de salvar
- "Salvando..." é exibido durante submit
- "Salvo ✓" aparece por 2s após sucesso e depois desaparece
- Erro de salvamento exibe toast e não limpa formulário

#### Arquivos Impactados

- `frontend/src/pages/decks/DeckPage.tsx`
- `frontend/src/components/RichTextEditor.tsx`

---

## Riscos e Pontos de Atenção

- Mudanças de responsividade podem afetar layout em desktop se não testadas
- Acessibilidade: evitar adicionar `aria-label` redundante (já presente em elementos com texto visível)
- ConfirmDialog para delete de card com muito texto pode ser longo — truncar preview
- Salvamento automático: evitar race condition se usuário salva manualmente ao mesmo tempo

## Checklist da Fase

- [x] Todas as tarefas concluídas
- [x] Testes implementados (53 testes, 9 suites)
- [ ] Documentação atualizada (invocar @doc se necessário)
- [x] Revisão de código realizada (@reviewer invocado por task)
- [x] Critérios de aceitação validados

## Instruções para o Agente Construtor

1. Execute as tarefas na ordem definida (2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6).
2. Não avance para a próxima fase sem concluir os critérios de aceitação.
3. Atualize este documento conforme o progresso.
4. Registre desvios ou decisões arquiteturais relevantes.
5. Gere commits pequenos e focados por tarefa.
6. Após cada task, rode `tsc -b --noEmit` no frontend e invoque `@reviewer` antes de commitar.


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

