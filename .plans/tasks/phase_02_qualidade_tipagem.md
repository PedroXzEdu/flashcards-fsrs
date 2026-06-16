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

## Critério de Conclusão
Zero ocorrências de `data: any` em services e repositories (exceção: importController que lê formato externo). `npx tsc --noEmit` passa sem erros no backend e frontend com tsconfig strict habilitado.

---

## Tarefas

### [ ] T02.01 — Tipar parâmetros de criação em `deckService` e `deckRepository`

**Descrição:** Substituir `data: any` por uma interface `CreateDeckInput` (e `UpdateDeckInput`) nos serviços e repositórios de deck.

**Motivação:** `deckService.create(data: any)` aceita qualquer objeto. Se um campo obrigatório for omitido, o TypeScript não alerta.

**Impacto:** Alto

**Estimativa:** 2-3 horas

**Subtarefas:**
- [ ] Criar interfaces `CreateDeckInput` e `UpdateDeckInput` em `deckService.ts` ou `deckRepository.ts`
- [ ] Tipar `deckService.create`, `deckService.update`, `deckRepository.create`, `deckRepository.update`
- [ ] Ajustar chamadas existentes (criarDeck no controller passa `{ ...req.body, userId }` — garantir que isso casa com a interface)

---

### [ ] T02.02 — Tipar parâmetros do `reviewLogRepository.create`

**Descrição:** Substituir `data: any` por uma interface `CreateReviewLogInput` em `reviewLogRepository.ts`.

**Motivação:** Mesma fragilidade de tipo. O repository recebe dados que vêm do scheduling do FSRS e precisa garantir que todos os campos obrigatórios estão presentes.

**Impacto:** Alto

**Estimativa:** 1-2 horas

**Subtarefas:**
- [ ] Criar interface `CreateReviewLogInput` com todos os campos necessários
- [ ] Tipar o método `create`
- [ ] Ajustar chamada em `reviewService.submitReview`

---

### [ ] T02.03 — Tipar `cardRepository.create` e `updateFsrsData` com interfaces explícitas

**Descrição:** As interfaces `CreateCardInput` e `FsrsUpdateData` já existem em `cardRepository.ts` — mas não são exportadas nem usadas para tipar os parâmetros dos métodos.

**Motivação:** As interfaces existem, só não estão sendo aplicadas. É uma correção rápida.

**Impacto:** Médio

**Estimativa:** 1-2 horas

**Subtarefas:**
- [ ] Garantir que `CreateCardInput` seja usada como tipo do parâmetro `data` em `create`
- [ ] Garantir que `FsrsUpdateData` seja usada como tipo do parâmetro `data` em `updateFsrsData`
- [ ] Exportar as interfaces para uso em services
- [ ] Ajustar chamadas em `cardService.ts` e `reviewService.ts`

---

### [ ] T02.04 — Habilitar `strict: true` no `tsconfig.json` do frontend

**Descrição:** Ativar `"strict": true` no `frontend/tsconfig.json` e corrigir os erros resultantes.

**Motivação:** TypeScript sem strict mode perde a maior parte do valor do tipo. Uma banca que veja `strict: false` pode questionar.

**Impacto:** Médio

**Estimativa:** 2-3 dias (pode exigir correções em vários arquivos)

**Subtarefas:**
- [ ] Ativar `"strict": true` em `frontend/tsconfig.json`
- [ ] Rodar `npx tsc -b --noEmit` e catalogar todos os erros
- [ ] Corrigir erros por categoria (null checks, implicit any, etc.)
- [ ] Garantir que `build` ainda funciona

---

### [ ] T02.05 — Verificar e tipar retornos dos repositories

**Descrição:** Garantir que todos os métodos dos repositories tenham tipo de retorno explícito (não apenas `result.rows[0]` inferido).

**Motivação:** Métodos como `findByEmail` retornam `Promise<any>` inferido de `result.rows[0]`. Se a query mudar, o tipo não protege contra esquecimento de campos.

**Impacto:** Médio

**Estimativa:** 3-4 horas

**Subtarefas:**
- [ ] Revisar cada método em `userRepository.ts`, `deckRepository.ts`, `cardRepository.ts`, `reviewLogRepository.ts`, `analyticsRepository.ts`
- [ ] Adicionar tipo de retorno explícito onde faltar
- [ ] Garantir que `findByDeckIdPaginated` retorna tipo com `rows` e `total`

---

### [ ] T02.06 — Limpar TODO e commented code

**Descrição:** Revisar o código em busca de `TODO`, `FIXME`, `console.log` comentados e código morto.

**Motivação:** Código morto e comentários desatualizados poluem o codebase. Uma banca que veja `// TODO: fix later` sem contexto pode interpretar como falta de cuidado.

**Impacto:** Baixo

**Estimativa:** 1-2 horas

**Subtarefas:**
- [ ] Buscar `TODO`, `FIXME`, `console.log`, `debugger` em todo o projeto
- [ ] Remover ou resolver cada ocorrência
- [ ] Verificar CSS não utilizado (ex: classes em `index.css` que não são referenciadas)
