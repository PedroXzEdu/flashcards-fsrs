---
id: "P06"
title: "Features Futuras"
status: "pending"
priority: "low"
estimate: "2-4 weeks"
depends_on: []
---

# Fase 06 — Features Futuras (Opcional)

## Objetivo
Implementar funcionalidades que agregam valor ao TCC mas não são críticas. Fazer apenas se houver tempo após as fases anteriores.

## Justificativa
O MVP já está completo. Essas features são diferenciais para o TCC e para a experiência do usuário, mas não comprometem a entrega se não forem feitas.

## Valor Técnico
Variável — cada feature tem seu próprio ROI.

## Esforço Estimado
Variável (2-4 semanas no total)

## Dependências
Fases 00-05 preferencialmente concluídas

## Success Metrics

- Sistema de tags implementado e funcional
- Sistema de achievements/gamificação implementado
- Modo de revisão expressa funcional
- Exportação para .apkg implementada
- Sincronização multi-dispositivo funcional
- Nenhuma regressão em funcionalidades existentes


---

## Tarefas

### [x] [T06.01 — Testes frontend para componentes reativos](./task_06_01_testes_frontend_reactivos.md)

**Descrição:** Adicionar coluna `tags TEXT[]` na tabela `cards` e permitir filtrar/filtrar por tags no frontend.

**Motivação:** Organização de cards por assunto/tema é um pedido comum de usuários de flashcards. Para o TCC, mostra capacidade de trabalhar com arrays no PostgreSQL.

**Impacto:** Médio

**Estimativa:** 1 semana

**Subtarefas:**
- [x] Migration: `ALTER TABLE cards ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';`
- [x] Índice GIN: `CREATE INDEX IF NOT EXISTS idx_cards_tags ON cards USING GIN (tags);`
- [x] Atualizar schemas Zod para aceitar `tags?: string[]`
- [x] Adicionar input de tags no formulário de card
- [x] Permitir filtro por tag na listagem de cards

---

### [x] [T06.02 — Página de deck vazio (empty state)](./task_06_02_ferramenta_deck_vazio.md)

**Descrição:** Adicionar achievements baseados em streak, total de revisões, cards criados. Sem badges complexos — apenas notificações visuais.

**Motivação:** Gamificação aumenta engajamento e é um diferencial para apresentação de TCC.

**Impacto:** Médio

**Estimativa:** 1-2 semanas

**Subtarefas:**
- [x] Criar tabela `achievements` com `id, user_id, key, unlocked_at`
- [x] Definir achievements iniciais (ex: "Primeira revisão", "7 dias de streak", "100 cards revisados")
- [x] Verificar achievements após cada revisão (hook no service)
- [x] Notificar usuário com toast quando um achievement for desbloqueado
- [x] Mostrar achievements na página de perfil ou dashboard

---

### [x] [T06.03 — Feedback visual (toast) para ações](./task_06_03_feedback_acao_usuario.md)

**Descrição:** Adicionar opção no ReviewPage para pular o preview e ir direto para os botões de rating após virar o card. Opcionalmente, ativar um modo "revisão expressa" com timer.

**Motivação:** Usuários avançados podem querer revisar mais rápido sem esperar o preview carregar.

**Impacto:** Baixo

**Estimativa:** 2-3 dias

**Subtarefas:**
- [x] Adicionar toggle "Modo rápido" no header da revisão
- [x] Quando ativo, esconder preview e mostrar botões de rating imediatamente após virar
- [x] Persistir preferência em localStorage
- [x] Garantir que o preview ainda seja carregado em background para mostrar scheduled_days

---

### [x] [T06.04 — Edição inline de cards](./task_06_04_desevolver_edicao_cards.md)

**Descrição:** Implementar exportação de baralho no formato Anki .apkg (coleção SQLite + mídia).

**Motivação:** Simetria com a importação. Permite ao usuário levar seus cards para o Anki.

**Impacto:** Médio

**Estimativa:** 1 semana

**Subtarefas:**
- [x] Criar `POST /decks/:id/export` que gera .apkg em memória (POST para side-effect)
- [x] Usar `better-sqlite3` para criar collection.anki2 com schema compatível Anki
- [ ] Copiar mídia para dentro do .apkg (MVP omite — apenas strip referências)
- [x] Stream arquivo como download (PassThrough + archiver)
- [x] Adicionar botão "Exportar" no DeckPage

---

### [x] [T06.05 — Paginação na listagem de cards](./task_06_05_paginacao_cards.md)

**Descrição:** Garantir que o sync funcione corretamente para usuários que acessam de múltiplos dispositivos. Já é stateless (JWT) — apenas validar que o cache PWA não atrapalha.

**Motivação:** O PWA tem cache NetworkFirst que pode servir dados desatualizados.

**Impacto:** Baixo

**Estimativa:** 2-3 dias

**Subtarefas:**
- [x] Adicionar header `Cache-Control: no-cache, no-store, must-revalidate` nas respostas da API
- [x] Garantir que PWA não cacheie respostas de auth (token) — removido `auth` do padrão de runtime caching
- [x] Adicionar "puxar atualização" ao abrir o app — SW alterado de `autoUpdate` para `prompt` com `onNeedRefresh`

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

