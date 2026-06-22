---
id: "P02"
title: "Qualidade de Código e Tipagem"
status: "completed"
priority: "high"
estimate: "1-2 weeks"
depends_on: []
---


# Fase 02 — Qualidade de Código e Tipagem

## Objetivo
Substituir `data: any` por interfaces tipadas em services e repositories. Eliminar fragilidades de tipo que podem esconder bugs. Melhorar a experiência de desenvolvimento com autocomplete e type-checking.

## Justificativa
O uso de `any` em pontos críticos do backend derrota o sistema de tipos do TypeScript. Uma banca de TCC que avalie código vai questionar por que usar TypeScript se `any` é usado livremente. Além disso, `any` esconde bugs: se um campo obrigatório for esquecido, o compilador não alerta.

## Valor Técnico
Alto — tipagem adequada previne bugs em produção e melhora a experiência de desenvolvimento.

## Esforço Estimado
Médio (1-2 semanas)

## Dependências
Nenhuma

## Success Metrics

- Zero ocorrências de `data: any` em services e repositories
- Interfaces `CreateDeckInput`, `UpdateDeckInput`, `CreateReviewLogInput` definidas e aplicadas
- `cardRepository.create` e `updateFsrsData` tipados com interfaces existentes
- `strict: true` ativado no frontend tsconfig
- Retornos explícitos em todos os repositories
- TODO e dead code limpos
- `tsc --noEmit` passando sem erros
---

## Tarefas

### [x] T02.01 — Tipar parâmetros de criação em `deckService` e `deckRepository`

**Descrição:** Substituir `data: any` por uma interface `CreateDeckInput` (e `UpdateDeckInput`) nos serviços e repositórios de deck.

**Motivação:** `deckService.create(data: any)` aceita qualquer objeto. Se um campo obrigatório for omitido, o TypeScript não alerta.

**Impacto:** Alto

**Estimativa:** 2-3 horas

**Subtarefas:**
- [x] Criar interfaces `CreateDeckInput` e `UpdateDeckInput` em `deckService.ts` ou `deckRepository.ts`
- [x] Tipar `deckService.create`, `deckService.update`, `deckRepository.create`, `deckRepository.update`
- [x] Ajustar chamadas existentes (criarDeck no controller passa `{ ...req.body, userId }` — garantir que isso casa com a interface)

---

### [x] T02.02 — Tipar parâmetros do `reviewLogRepository.create`

**Descrição:** Substituir `data: any` por uma interface `CreateReviewLogInput` em `reviewLogRepository.ts`.

**Motivação:** Mesma fragilidade de tipo. O repository recebe dados que vêm do scheduling do FSRS e precisa garantir que todos os campos obrigatórios estão presentes.

**Impacto:** Alto

**Estimativa:** 1-2 horas

**Subtarefas:**
- [x] Criar interface `CreateReviewLogInput` com todos os campos necessários
- [x] Tipar o método `create`
- [x] Ajustar chamada em `reviewService.submitReview`

---

### [x] T02.03 — Tipar `cardRepository.create` e `updateFsrsData` com interfaces explícitas

**Descrição:** As interfaces `CreateCardInput` e `FsrsUpdateData` já existem em `cardRepository.ts` — mas não são exportadas nem usadas para tipar os parâmetros dos métodos.

**Motivação:** As interfaces existem, só não estão sendo aplicadas. É uma correção rápida.

**Impacto:** Médio

**Estimativa:** 1-2 horas

**Subtarefas:**
- [x] Garantir que `CreateCardInput` seja usada como tipo do parâmetro `data` em `create` — já estava
- [x] Garantir que `FsrsUpdateData` seja usada como tipo do parâmetro `data` em `updateFsrsData` — já estava
- [x] Exportar as interfaces para uso em services
- [x] Ajustar chamadas em `cardService.ts` e `reviewService.ts` — já compatíveis

---

### [x] T02.04 — Habilitar `strict: true` no `tsconfig.json` do frontend

**Descrição:** Ativar `"strict": true` no `frontend/tsconfig.json` e corrigir os erros resultantes.

**Motivação:** TypeScript sem strict mode perde a maior parte do valor do tipo. Uma banca que veja `strict: false` pode questionar.

**Impacto:** Médio

**Estimativa:** 2-3 dias (pode exigir correções em vários arquivos)

**Subtarefas:**
- [x] Ativar `"strict": true` em `frontend/tsconfig.json` — já estava ativo em `tsconfig.app.json`
- [x] Rodar `npx tsc -b --noEmit` e catalogar todos os erros — zero erros
- [x] Corrigir erros por categoria (null checks, implicit any, etc.) — nenhum necessário
- [x] Garantir que `build` ainda funciona

---

### [x] T02.05 — Verificar e tipar retornos dos repositories

**Descrição:** Garantir que todos os métodos dos repositories tenham tipo de retorno explícito (não apenas `result.rows[0]` inferido).

**Motivação:** Métodos como `findByEmail` retornam `Promise<any>` inferido de `result.rows[0]`. Se a query mudar, o tipo não protege contra esquecimento de campos.

**Impacto:** Médio

**Estimativa:** 3-4 horas

**Subtarefas:**
- [x] Revisar cada método em `userRepository.ts`, `deckRepository.ts`, `cardRepository.ts`, `reviewLogRepository.ts`, `analyticsRepository.ts`
- [x] Adicionar tipo de retorno explícito onde faltar
- [x] Garantir que `findByDeckIdPaginated` retorna tipo com `rows` e `total`

---

### [x] T02.06 — Limpar TODO e commented code

**Descrição:** Revisar o código em busca de `TODO`, `FIXME`, `console.log` comentados e código morto.

**Motivação:** Código morto e comentários desatualizados poluem o codebase. Uma banca que veja `// TODO: fix later` sem contexto pode interpretar como falta de cuidado.

**Impacto:** Baixo

**Estimativa:** 1-2 horas

**Subtarefas:**
- [x] Buscar `TODO`, `FIXME`, `console.log`, `debugger` em todo o projeto — nenhum encontrado
- [x] Remover ou resolver cada ocorrência — N/A
- [x] Verificar CSS não utilizado — removido `App.css` (não importado) e classe `.mono` (não usada)

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

