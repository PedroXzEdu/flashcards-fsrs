---
id: "P05"
title: "Evolução do FSRS"
status: "pending"
priority: "medium"
estimate: "1 week"
depends_on: []
---

# Fase 05 — Evolução do FSRS

## Objetivo
Melhorar a implementação do FSRS: permitir parâmetros customizáveis por deck, tratar edge cases na fila de prioridade, e enriquecer os analytics com dados reais de retenção.

## Justificativa
O FSRS é o coração do sistema. Embora a implementação atual funcione corretamente (via `ts-fsrs`), há oportunidades de melhoria: parâmetros fixos (não customizáveis), fila de prioridade que trata cards novos de forma subótima, e analytics que usam aproximações.

## Valor Técnico
Médio — melhora a precisão do algoritmo e permite customização pelo usuário.

## Esforço Estimado
Médio (1 semana)

## Dependências
Nenhuma

## Success Metrics

- Parâmetros FSRS customizáveis por deck
- Fila de prioridade integrada às revisões
- Taxa de retenção real vs prevista calculada
- `FsrsService` aceita parâmetros opcionais
- Testes existentes continuam passando


---

## Tarefas

### [x] [T05.01 — Parâmetros FSRS Customizáveis por Deck](./task_05_01_tests_fsrs_sync.md)

**Descrição:** Criar uma tabela `deck_fsrs_params` para armazenar parâmetros FSRS por deck. Usar parâmetros default se não houver configuração.

**Motivação:** `generatorParameters()` usa defaults do FSRS-5. Diferentes tipos de conteúdo podem se beneficiar de parâmetros diferentes (ex: learning_step menor para vocabulário, maior para fórmulas).

**Impacto:** Alto

**Estimativa:** 4-6 horas

**Subtarefas:**
- [x] Criar migration `009_create_deck_fsrs_params.sql` com tabela
- [x] Atualizar `FsrsService` para aceitar parâmetros customizados
- [x] Criar UI de configuração FSRS no modal de settings do deck
- [x] Usar parâmetros default se deck não tiver configuração própria

---

### [ ] [T05.02 — Integrar revisões com fila de prioridade](./task_05_02_integrar_review_stack.md)

**Descrição:** Separar cards novos (state=0) dos de revisão na fila diária. Cards novos podem ter prioridade baseada em ordem de criação ou sorteio, não em `predicted_recall` (que é 0 para stability=0).

**Motivação:** A fórmula `Math.exp(-days / stability)` com `stability=0` (cards novos) produz `exp(-Infinity) = 0`, colocando todos os cards novos como prioridade máxima. Isso não faz sentido — cards novos nunca foram revisados, não têm "risco de esquecimento".

**Impacto:** Médio

**Estimativa:** 2-3 horas

**Subtarefas:**
- [ ] Separar cards novos em grupo próprio na fila
- [ ] Para cards novos, ordenar por `created_at ASC` (mais antigos primeiro)
- [ ] Manter ordenação por `predicted_recall` apenas para cards em revisão (state > 0)
- [ ] Atualizar `priorityQueueService.ts`

---

### [ ] [T05.03 — Revisar lógica de state do card](./task_05_03_revisar_logica_state_card.md)

**Descrição:** Calcular a taxa de retenção real (rating >= 3 como "lembrado") e comparar com a retenção prevista pelo FSRS no momento do agendamento.

**Motivação:** Uma das ideias da monografia (ROADMAP.md): "Analisar correlação entre stability e acertos reais" e "Visualizar curva de esquecimento real vs predita". Isso diferencia o TCC de um CRUD comum.

**Impacto:** Alto (para monografia)

**Estimativa:** 4-6 horas

**Subtarefas:**
- [ ] Criar query que para cada review_log calcula:
  - Retenção real (rating >= 3 → sucesso)
  - Retenção prevista (baseada na stability no momento do agendamento)
- [ ] Criar endpoint `GET /analytics/retention-comparison`
- [ ] Criar gráfico comparativo no frontend (StatsGlobalPage ou página separada)
- [ ] Documentar para uso na monografia

---

### [ ] [T05.04 — Documentar arquitetura do FSRS](./task_05_04_documentar_fsrs.md)

**Descrição:** Refatorar `FsrsService` para não usar singleton `generatorParameters()` fixo, mas aceitar parâmetros opcionais.

**Motivação:** O singleton atual `const f = fsrs(generatorParameters())` é criado na inicialização e não pode ser customizado.

**Impacto:** Baixo

**Estimativa:** 1-2 horas

**Subtarefas:**
- [ ] Criar método `getFSRS(deckId?)` que carrega parâmetros do deck (ou usa default)
- [ ] Se nenhum deck específico, usar `generatorParameters()` como fallback
- [ ] Garantir que o preview e submit usem a mesma instância (ou com mesmos parâmetros)

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

