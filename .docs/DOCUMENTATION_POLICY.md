# Documentation Policy

Governance rules for the project's documentation files.

---

## ROADMAP.md

[`ROADMAP.md`](../ROADMAP.md) é o único documento de roadmap e status do projeto.

**Quando atualizar:**

- funcionalidade concluída ou removida
- mudança arquitetural relevante
- dívida técnica descoberta que merece registro
- prioridades mudam significativamente

**Quando NÃO atualizar:**

- correções triviais (digitação, formatação, refactor menor)
- tarefas do dia — não é um quadro de sprint

Mantenha curto e honesto. Um roadmap desatualizado é pior que nenhum.

---

## ARCHITECTURE.md

[`ARCHITECTURE.md`](../ARCHITECTURE.md) é o mapa real da estrutura do projeto.

**Quando atualizar:**

- estrutura de pastas muda (novo diretório relevante, reorganização)
- responsabilidades de camada mudam
- nova camada/layer aparece
- fluxo importante muda (review, import, share)
- inconsistências conhecidas são corrigidas

**Quando NÃO atualizar:**

- rename trivial de arquivo
- refactor pequeno que não altera responsabilidade
- adição de componente isolado

Mantenha sincronizado com o código. Uma architecture desatualizada engana mais que ajuda.

---

## DECISIONS.md

[`DECISIONS.md`](../DECISIONS.md) é o registro de decisões técnicas não-óbvias e trade-offs.

**Quando atualizar:**

- decisão técnica não-óbvia é tomada
- trade-off relevante surge (ex: escolha entre duas abordagens)
- mudança arquitetural altera ou invalida uma decisão anterior
- nova dependência significativa é adicionada

**Quando NÃO atualizar:**

- bugfix trivial
- detalhe irrelevante (versão de patch, formatação)
- preferência estética sem impacto técnico

Cada decisão deve ter: contexto, escolha, justificativa, trade-offs, e quando revisitar. Se uma decisão for revertida, marque como obsoleta, não apague.
