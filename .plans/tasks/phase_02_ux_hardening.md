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

- [ ] Revisar `DashboardPage.tsx` — delete deck deve ter confirmação com nome do baralho
- [ ] Revisar `DeckPage.tsx` — delete card deve ter confirmação com preview do front
- [ ] Revisar `ShareModal.tsx` — unshare deve ter confirmação
- [ ] Garantir que o botão de confirmação use `type="button"` e `variant="danger"`
- [ ] Garantir foco no botão de confirmação ao abrir modal (`useFocusTrap` já existe)
- [ ] Testar via testing-library que confirm aparece e actions corretas são disparadas

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

- [ ] Identificar no `ReviewPage.tsx` onde o número total de cards está disponível
- [ ] Adicionar componente `ProgressBar` simples (div com width percentual + label)
- [ ] Exibir "Cartão 3 de 15" acima do card atual
- [ ] Manter visível também na tela de preview (antes de mostrar resposta)
- [ ] Atualizar ao submeter review e avançar
- [ ] Testar via testing-library que barra reflete progresso

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

- [ ] Revisar `api/client.ts` — garantir que timeout lança erro amigável
- [ ] Adicionar mensagem específica para "sem conexão com o servidor"
- [ ] Em páginas que carregam dados, capturar erro de rede e exibir `ErrorBoundary` ou fallback com botão "Tentar novamente"
- [ ] Garantir que toast de erro não desaparece muito rápido (aumentar duração para erros de rede)
- [ ] Testar via simulação de falha no fetch

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

- [ ] Adicionar `aria-label` em botões de ícone (theme toggle, back button, edit, delete)
- [ ] Adicionar `role="status"` em toasts de notificação
- [ ] Garantir que `Tab` key navega na ordem esperada na tela de revisão
- [ ] Adicionar `aria-describedby` em campos de formulário com erro
- [ ] Verificar contraste de cores em modo light (especialmente links e texto em Botão secondary)
- [ ] Adicionar `aria-live="polite"` para updates assíncronos (ex: "Card criado com sucesso")

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

- [ ] Garantir que o card (front/back) ocupa largura total em telas < 640px
- [ ] Botões de rating (Again/Hard/Good/Easy) empilham verticalmente em telas muito estreitas
- [ ] Botão "Mostrar Resposta" tem tamanho adequado para toque (mín. 44px)
- [ ] Editor rich text funcional em mobile (placeholder visível, toolbar adaptável)
- [ ] Testar manualmente em viewport 375px (Chrome DevTools)

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

- [ ] No formulário de card (create/edit), detectar mudanças após último salvamento
- [ ] Exibir "Salvando..." durante requisição
- [ ] Exibir "Salvo ✓" após sucesso (por 2 segundos)
- [ ] Exibir "Erro ao salvar" com toast em caso de falha
- [ ] Implementar via estado local no componente (loading/saved/error)
- [ ] Testar via testing-library

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

- [ ] Todas as tarefas concluídas
- [ ] Testes implementados
- [ ] Documentação atualizada
- [ ] Revisão de código realizada
- [ ] Critérios de aceitação validados

## Instruções para o Agente Construtor

1. Execute as tarefas na ordem definida (2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6).
2. Não avance para a próxima fase sem concluir os critérios de aceitação.
3. Atualize este documento conforme o progresso.
4. Registre desvios ou decisões arquiteturais relevantes.
5. Gere commits pequenos e focados por tarefa.
6. Após cada task, rode `tsc -b --noEmit` no frontend e invoque `@reviewer` antes de commitar.
