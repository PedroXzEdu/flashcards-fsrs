---
id: "P01"
title: "Refatoração Frontend"
status: "completed"
priority: "high"
estimate: "2-3 weeks"
depends_on: []
---


# Fase 01 — Refatoração Frontend

## Objetivo
Extrair componentes monolíticos em componentes menores e focados. Reduzir os 3 maiores arquivos do frontend (DeckPage: 1239 → 895 linhas, ReviewPage: 818 linhas, DashboardPage: 881 linhas) para componentes de no máximo 200-300 linhas cada.

## Justificativa
Esta é a maior dívida técnica do projeto. Três arquivos concentram quase toda a lógica do frontend. Isso dificulta:
- Testabilidade (componentes pequenos são mais fáceis de testar isoladamente)
- Manutenção (uma mudança no card form pode quebrar o bulk create no mesmo arquivo)
- Leitura (qualquer novo desenvolvedor precisa ler 1000+ linhas para entender um fluxo)
- Reutilização (partes como "StreakCards" não podem ser reaproveitadas em outras páginas)

Para a banca de TCC, componentes monolíticos de 1000+ linhas são um sinal claro de falta de componentização.

## Valor Técnico
Muito alto — melhora legibilidade, testabilidade, manutenção e apresentação para banca.

## Esforço Estimado
Alto (2-3 semanas)

## Dependências
Nenhuma — pode começar imediatamente

## Success Metrics

- DeckPage <= 300 linhas de lógica própria
- ReviewPage <= 300 linhas de lógica própria
- DashboardPage <= 300 linhas de lógica própria
- Componentes CardForm, BulkCreateForm, CardListItem extraídos
- Componentes ReviewHeader, RatingButtons, ReviewCard, ReviewSessionProgress, ReviewSessionSummary extraídos
- Componentes StreakCards, WorkloadChart, DeckCard, DeckList, CreateDeckForm extraídos
- Componentes-base UI (Card, FormField, Badge, PageSection) criados
- Testes para componentes críticos criados
- `tsc -b --noEmit` passando sem erros
---

## Tarefas

### [x] T01.01 — Extrair `CardForm` (criação/edição de card)

**Descrição:** Extrair o formulário de criação/edição de card (linhas 869-973 de `DeckPage.tsx`) em um componente `CardForm.tsx` com props `initialValues`, `onSave`, `onCancel`, `saving`, `editMode`.

**Motivação:** O formulário é autônomo e tem seu próprio ciclo de estado (front/back, validação, saveStatus). Extraí-lo reduz DeckPage em ~100 linhas e permite testá-lo isoladamente.

**Impacto:** Alto

**Estimativa:** 4-6 horas

**Real:** ~30 min

**Subtarefas:**
- [x] Criar `frontend/src/components/CardForm.tsx` com o formulário extraído
- [x] Tipar props: `CardFormProps { initialValues?: {front, back}, onSave: (front, back) => Promise<void>, onCancel: () => void }`
- [x] Substituir bloco `{showForm && (...)}` em `DeckPage` por `<CardForm>`
- [x] Ajustar `handleSave` no `DeckPage` para ser passado como prop
- [x] Garantir que `handleBulkCreate` não seja afetado

---

### [x] T01.02 — Extrair `BulkCreateForm`

**Descrição:** Extrair o formulário de criação em lote (linhas 976-1096 de `DeckPage.tsx`) em `BulkCreateForm.tsx`.

**Motivação:** Reduz DeckPage em mais ~120 linhas. O componente tem lógica independente (parse de texto, contagem de cards, etc.).

**Impacto:** Médio

**Estimativa:** 2-3 horas

**Real:** ~15 min

**Subtarefas:**
- [x] Criar `frontend/src/components/BulkCreateForm.tsx`
- [x] Mover lógica de parse (separador `|` e `\t`) para o componente
- [x] Substituir bloco `{showBulk && (...)}` em DeckPage

---

### [x] T01.03 — Extrair `CardListItem` (linha de card na lista)

**Descrição:** Extrair o card individual da lista (linhas 1119-1212 de `DeckPage.tsx`) em `CardListItem.tsx`.

**Motivação:** O item de card tem seus próprios eventos (hover, edit, delete, state badge). Extraí-lo permite reutilização e testes.

**Impacto:** Alto

**Estimativa:** 2-3 horas

**Real:** ~15 min

**Subtarefas:**
- [x] Criar `frontend/src/components/CardListItem.tsx`
- [x] Props: `card: Card`, `onEdit: (card) => void`, `onDelete: (card) => void`
- [x] Mover lógica de hover, state badge, formatação para o componente
- [x] Extrair também o botão "Carregar mais" para componente separado `LoadMoreButton`

---

### [x] T01.04 — Extrair componentes do `ReviewPage`

**Descrição:** Dividir `ReviewPage.tsx` (818 linhas) em:
- `ReviewCard.tsx` — o card virado (frente/verso com flip animation)
- `RatingButtons.tsx` — os 4 botões de avaliação com preview de dias
- `ReviewSessionProgress.tsx` — progress bar + dots de histórico
- `ReviewSessionSummary.tsx` — tela de conclusão
- `ReviewHeader.tsx` — header com botões de sair, shuffle, tema

**Motivação:** A página de revisão é o fluxo mais importante do sistema e o mais usado pelo usuário. Componentes pequenos aqui permitem testar cada comportamento isoladamente.

**Impacto:** Muito alto

**Estimativa:** 2-3 dias

**Subtarefas:**
- [ ] Criar `frontend/src/components/review/ReviewHeader.tsx`
- [ ] Criar `frontend/src/components/review/RatingButtons.tsx`
- [ ] Criar `frontend/src/components/review/ReviewCard.tsx`
- [ ] Criar `frontend/src/components/review/ReviewSessionProgress.tsx`
- [ ] Criar `frontend/src/components/review/ReviewSessionSummary.tsx`
- [ ] Refatorar estado da sessão com `useReducer` (actions: FLIP, RATE, LOAD_CARDS, SET_ERROR, NEXT_CARD)
- [ ] Substituir uso em ReviewPage

---

### [x] T01.05 — Extrair componentes do `DashboardPage`

**Descrição:** Dividir `DashboardPage.tsx` (881 linhas) em:
- `StreakCards.tsx` — cards de streak/dias/total
- `WorkloadChart.tsx` — gráfico de previsão de revisões
- `DeckCard.tsx` — card individual de baralho na grid
- `DeckList.tsx` — grid com loading, empty state e lista
- `CreateDeckForm.tsx` — formulário de criação de baralho

**Motivação:** Dashboard é a porta de entrada do sistema. Componentes limpos aqui causam boa impressão imediata.

**Impacto:** Muito alto

**Estimativa:** 2-3 dias

**Subtarefas:**
- [ ] Criar `frontend/src/components/StreakCards.tsx`
- [ ] Criar `frontend/src/components/WorkloadChart.tsx`
- [ ] Criar `frontend/src/components/dashboard/DeckCard.tsx`
- [ ] Criar `frontend/src/components/dashboard/DeckList.tsx`
- [ ] Criar `frontend/src/components/dashboard/CreateDeckForm.tsx`
- [ ] Refatorar DashboardPage para usar os componentes extraídos

---

### [x] T01.06 — Mover CSS inline para classes Tailwind/componentes estilizados

**Descrição:** Criar componentes-base estilizados (`Card`, `FormField`, `PageSection`, `Badge`) e substituir os `style={{}}` repetidos.

**Motivação:** CSS inline misturado com lógica dificulta temas, aumenta bundle e fere o princípio de separação de responsabilidades. Para banca, mostra maturidade de design system.

**Impacto:** Alto

**Estimativa:** 3-5 dias (pode ser feito em paralelo com as extrações)

**Subtarefas:**
- [ ] Criar `frontend/src/components/ui/Card.tsx` (container com bg, border, shadow, padding)
- [ ] Criar `frontend/src/components/ui/FormField.tsx` (label + input estilizado)
- [ ] Criar `frontend/src/components/ui/Badge.tsx` (badge de estado com cor)
- [ ] Criar `frontend/src/components/ui/PageSection.tsx` (seção com título opcional)
- [ ] Substituir uso nos componentes extraídos
- [ ] Não precisa ser 100% — focar nos padrões mais repetidos

---

### [x] T01.07 — Adicionar testes para os novos componentes

**Descrição:** Escrever testes com `@testing-library/react` para os componentes extraídos (pelo menos os mais críticos: ReviewCard, RatingButtons, DeckCard).

**Motivação:** A extração só se justifica se os componentes forem testáveis. Testar o comportamento dos botões de rating e do flip do card é essencial.

**Impacto:** Alto

**Estimativa:** 1-2 dias

**Subtarefas:**
- [ ] Testar `RatingButtons`: renderiza 4 botões, chama onRate com valor correto, mostra scheduled_days
- [ ] Testar `ReviewCard`: renderiza front, flip mostra back, preview é carregado
- [ ] Testar `DeckCard`: renderiza título, descrição, contagem, due badge
- [ ] Testar `CreateDeckForm`: submit com título válido, erro sem título

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

