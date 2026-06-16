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

## Critério de Conclusão
Features implementadas conforme disponibilidade de tempo. Nenhuma feature desta fase é obrigatória para a entrega do TCC.

---

## Tarefas

### [ ] [T06.01 — Testes frontend para componentes reativos](./task_06_01_testes_frontend_reactivos.md)

**Descrição:** Adicionar coluna `tags TEXT[]` na tabela `cards` e permitir filtrar/filtrar por tags no frontend.

**Motivação:** Organização de cards por assunto/tema é um pedido comum de usuários de flashcards. Para o TCC, mostra capacidade de trabalhar com arrays no PostgreSQL.

**Impacto:** Médio

**Estimativa:** 1 semana

**Subtarefas:**
- [ ] Migration: `ALTER TABLE cards ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';`
- [ ] Índice GIN: `CREATE INDEX IF NOT EXISTS idx_cards_tags ON cards USING GIN (tags);`
- [ ] Atualizar schemas Zod para aceitar `tags?: string[]`
- [ ] Adicionar input de tags no formulário de card
- [ ] Permitir filtro por tag na listagem de cards

---

### [ ] [T06.02 — Página de deck vazio (empty state)](./task_06_02_ferramenta_deck_vazio.md)

**Descrição:** Adicionar achievements baseados em streak, total de revisões, cards criados. Sem badges complexos — apenas notificações visuais.

**Motivação:** Gamificação aumenta engajamento e é um diferencial para apresentação de TCC.

**Impacto:** Médio

**Estimativa:** 1-2 semanas

**Subtarefas:**
- [ ] Criar tabela `achievements` com `id, user_id, key, unlocked_at`
- [ ] Definir achievements iniciais (ex: "Primeira revisão", "7 dias de streak", "100 cards revisados")
- [ ] Verificar achievements após cada revisão (hook no service)
- [ ] Notificar usuário com toast quando um achievement for desbloqueado
- [ ] Mostrar achievements na página de perfil ou dashboard

---

### [ ] [T06.03 — Feedback visual (toast) para ações](./task_06_03_feedback_acao_usuario.md)

**Descrição:** Adicionar opção no ReviewPage para pular o preview e ir direto para os botões de rating após virar o card. Opcionalmente, ativar um modo "revisão expressa" com timer.

**Motivação:** Usuários avançados podem querer revisar mais rápido sem esperar o preview carregar.

**Impacto:** Baixo

**Estimativa:** 2-3 dias

**Subtarefas:**
- [ ] Adicionar toggle "Modo rápido" no header da revisão
- [ ] Quando ativo, esconder preview e mostrar botões de rating imediatamente após virar
- [ ] Persistir preferência em localStorage
- [ ] Garantir que o preview ainda seja carregado em background para mostrar scheduled_days

---

### [ ] [T06.04 — Edição inline de cards](./task_06_04_desevolver_edicao_cards.md)

**Descrição:** Implementar exportação de baralho no formato Anki .apkg (coleção SQLite + mídia).

**Motivação:** Simetria com a importação. Permite ao usuário levar seus cards para o Anki.

**Impacto:** Médio

**Estimativa:** 1 semana

**Subtarefas:**
- [ ] Criar `GET /decks/:id/export` que gera .apkg em memória
- [ ] Usar `better-sqlite3` para criar collection.anki2
- [ ] Copiar mídia para dentro do .apkg
- [ ] Stream arquivo como download
- [ ] Adicionar botão "Exportar" no DeckPage

---

### [ ] [T06.05 — Paginação na listagem de cards](./task_06_05_paginacao_cards.md)

**Descrição:** Garantir que o sync funcione corretamente para usuários que acessam de múltiplos dispositivos. Já é stateless (JWT) — apenas validar que o cache PWA não atrapalha.

**Motivação:** O PWA tem cache NetworkFirst que pode servir dados desatualizados.

**Impacto:** Baixo

**Estimativa:** 2-3 dias

**Subtarefas:**
- [ ] Adicionar header `Cache-Control: no-cache` nas respostas da API
- [ ] Garantir que PWA não cacheie respostas de auth (token)
- [ ] Adicionar "puxar atualização" ao abrir o app (verificar versão do service worker)
