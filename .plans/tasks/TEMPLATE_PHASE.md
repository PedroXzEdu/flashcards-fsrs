---
id: PXX
title: Nome da Fase
status: active
priority: high|medium|low
estimate: X-Y weeks/days
depends_on: []
---

# Fase XX — Nome da Fase

## Objetivo

Descrição clara do objetivo da fase.

## Justificativa

Por que esta fase existe e qual o valor que entrega.

## Valor Técnico

Alto/Médio/Baixo — justificativa.

## Esforço Estimado

X-Y (dias/semanas)

## Dependências

- Lista de dependências (ou "Nenhuma")

## Success Metrics

Critérios mensuráveis que definem o sucesso da fase:

- Métrica 1
- Métrica 2
- Métrica 3

---

## Tarefas

### [ ] TXX.01 — Nome da Tarefa

**Descrição:** Breve descrição do escopo.

**Impacto:** Alto/Médio/Baixo

**Estimativa:** X-Y horas

**Subtarefas:**
- [ ] Subtarefa 1
- [ ] Subtarefa 2

---

### [ ] TXX.02 — Nome da Tarefa

**Descrição:** Breve descrição do escopo.

**Impacto:** Alto/Médio/Baixo

**Estimativa:** X-Y horas

**Subtarefas:**
- [ ] Subtarefa 1
- [ ] Subtarefa 2

---

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

---

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

---

## Planning Source of Truth

Regras:

- `AGENTS.md` define a política de execução
- Arquivos de fase definem o progresso atual do roadmap
- Arquivos de task definem o escopo de implementação
- Fases concluídas são registros históricos em `.plans/completed/`
- Trabalho ativo sempre vem de `.plans/tasks/`
- Trabalho arquivado sempre vive em `.plans/completed/`
