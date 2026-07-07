---
id: "P07"
title: "Preparação Final para TCC"
status: "pending"
priority: "high"
estimate: "1 week"
depends_on: []
---

# Fase 07 — Preparação Final para TCC

## Objetivo
Preparar o projeto para apresentação à banca: documentação final, revisão geral, gravação de demo, e checklist de apresentação.

## Justificativa
Um TCC não é avaliado apenas pelo código, mas também pela apresentação, documentação e demonstração. Esta fase garante que o esforço técnico das fases anteriores seja bem comunicado para a banca.

## Valor Técnico
Muito alto — uma boa apresentação pode elevar a nota independentemente da complexidade técnica.

## Esforço Estimado
Baixo (1 semana)

## Dependências
Fases 00-06 (preferencialmente, mas a Fase 07 pode começar parcialmente antes)

## Success Metrics

- `ARCHITECTURE.md` revisado e atualizado
- `ROADMAP.md` revisado e atualizado
- `DECISIONS.md` revisado e atualizado
- Código revisado e limpo (dead code, imports não utilizados)
- Screencast do fluxo completo gravado
- Checklist de apresentação preparado
- Dados reais de analytics coletados


---

## Tarefas

### [x] [T07.01 — Revisar e atualizar documentação do projeto](./task_07_01_revisar_arquitetura.md)

**Descrição:** Revisar `README.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `ROADMAP.md` para garantir que refletem o estado atual do código.

**Motivação:** Documentação desatualizada é pior que nenhuma documentação — a banca pode perceber inconsistências.

**Impacto:** Alto

**Estimativa:** 4-6 horas

**Subtarefas:**
- [ ] Atualizar `ROADMAP.md` com status das fases concluídas (T07.02)
- [x] Verificar `ARCHITECTURE.md` se novas pastas/arquivos foram criados
- [ ] Verificar `DECISIONS.md` se decisões foram alteradas (T07.03)
- [ ] Atualizar `README.md` com instruções de setup atualizadas (T07.02/T07.03)
- [ ] Adicionar prints das telas principais no README

---

### [x] [T07.02 — Revisar ROADMAP.md](./task_07_02_revisar_roadmap.md)

**Descrição:** Preparar um documento com os pontos técnicos que devem ser destacados na apresentação para a banca.

**Motivação:** A banca vai perguntar sobre arquitetura, decisões técnicas, desafios. Ter respostas preparadas mostra domínio.

**Impacto:** Alto

**Estimativa:** 4-6 horas

**Subtarefas:**
- [ ] Listar 10 perguntas prováveis da banca e respostas
- [ ] Destacar diferenciais técnicos: FSRS, arquitetura controller/service/repository, testes, Docker, PWA
- [ ] Preparar justificativa para decisões controversas (JWT sem refresh, sanitização frontend)
- [ ] Mapear cada requisito do TCC para funcionalidades implementadas

---

### [ ] [T07.03 — Revisar DECISIONS.md](./task_07_03_revisar_decisions.md)

**Descrição:** Gravar screencast do fluxo completo: registro → login → criar baralho → criar cards → revisar → analytics.

**Motivação:** Se o deploy offline no dia da apresentação, o vídeo é o plano B. Além disso, mostra fluência no produto.

**Impacto:** Alto

**Estimativa:** 2-3 horas

**Subtarefas:**
- [ ] Preparar roteiro do vídeo (o que mostrar em cada tela)
- [ ] Garantir que o ambiente de demonstração tem dados de exemplo (alguns cards e revisões)
- [ ] Gravar com OBS ou ferramenta similar
- [ ] Editar (cortar silêncios, adicionar legendas se necessário)
- [ ] Exportar em formato acessível (MP4, ~1080p)

---

### [ ] [T07.04 — Limpeza final de código](./task_07_04_limpeza_final_codigo.md)

**Descrição:** Checklist físico para o dia da apresentação.

**Motivação:** Evitar esquecimentos de última hora que podem comprometer a demonstração.

**Impacto:** Médio

**Estimativa:** 1 hora

**Subtarefas:**
- [ ] Verificar deploy ativo (Vercel + Render ou Docker local)
- [ ] Testar fluxo completo antes da apresentação
- [ ] Verificar se dados de exemplo estão populados
- [ ] Confirmar que vídeo de backup está acessível
- [ ] Testar áudio/vídeo/projetor com o notebook da apresentação
- [ ] Levar cópia do repositório em pendrive (plano C)

---

### [ ] [T07.05 — Verificação final de regressão](./task_07_05_verificacao_final_regressao.md)

**Descrição:** Usar os dados reais do analytics (taxa de retenção, curva de esquecimento, distribuição de ratings) como evidência na monografia.

**Motivação:** TCC com dados reais do sistema impressiona mais que simulações teóricas. As queries de analytics já estão prontas.

**Impacto:** Muito alto

**Estimativa:** 1-2 dias (escrita, não código)

**Subtarefas:**
- [ ] Coletar dados de retenção real vs predita (endpoint criado na T05.03)
- [ ] Gerar gráficos para a monografia (retenção por estado, curva de esquecimento)
- [ ] Incluir prints do dashboard e da fila de prioridade
- [ ] Se possível, comparar SM-2 vs FSRS com dados simulados (ideia do ROADMAP.md)

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

