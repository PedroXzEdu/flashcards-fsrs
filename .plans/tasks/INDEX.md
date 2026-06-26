---
id: "INDEX"
title: "Plano de Execução — FlashFSRS"
type: "roadmap"
updated: "2026-06-26"
---

# Plano de Execução — FlashFSRS

> Este plano foi gerado a partir de uma análise técnica completa do código-fonte.
> Cada fase é incremental, prioriza ROI e respeita o ritmo de projeto solo.

---

## Situação Atual

- **Período no curso:** ~3º período (≈50% restante)
- **Estado do projeto:** MVP funcional, maduro, com boa arquitetura e testes
- **Maior dívida técnica:** Componentes frontend monolíticos (DeckPage: 1239 linhas, ReviewPage: 818, DashboardPage: 881)
- **Maior risco técnico:** Sanitização apenas no frontend, `any` em services/repositories, migrations sem versionamento

---

## Fases

| Fase | Título | Esforço | ROI | Prioridade para banca |
|------|--------|---------|-----|----------------------|
| 00 | Correções Rápidas | Baixo | Alto | Essencial |
| 01 | Refatoração Frontend | Alto | Muito Alto | Essencial |
| 02 | Qualidade de Código & Tipagem | Médio | Alto | Alta |
| 03 | Segurança & Hardening | Médio | Alto | Alta |
| 04 | Performance & Banco | Médio | Médio | Média |
| 05 | Evolução do FSRS | Baixo | Médio | Média |
| 06 | Features Futuras | Variável | Variável | Opcional |
| 07 | Preparação Final para TCC | Baixo | Muito Alto | Essencial |
| 08 | Testes E2E — Cobertura Completa | Médio | Alto | Alta |

---

## Ordem de Implementação Recomendada

```
Fase 00 → Fase 07 (1 task) → Fase 01 → Fase 02 → Fase 03 → Fase 04 → Fase 05 → Fase 06 → Fase 07 → Fase 08 (intercalada)
```

**Justificativa:** Comece com vitórias rápidas (Fase 00) e com a preparação inicial da apresentação (Fase 07 task de esqueleto), pois isso dá direção. Depois o grosso da refatoração frontend (Fase 01) que é o que mais impacta a qualidade percebida pela banca. Em paralelo, melhore tipagem (Fase 02) e segurança (Fase 03). Deixe performance, FSRS e features para depois.

---

## Timeline Estimada (considerando 50% do curso restante)

| Período | Foco |
|---------|------|
| Mês 1-2 | Fase 00 + Fase 01 (refatoração frontend) |
| Mês 3 | Fase 02 + Fase 03 (tipagem + segurança) |
| Mês 4 | Fase 04 + Fase 05 (performance + FSRS) |
| Mês 5-6 | Fase 06 (features, opcional) + Fase 07 (preparação final) |
| Mês 6-7 | Fase 08 (testes E2E, opcional — intercalado com Fase 07) |

---

## Top 10 Tarefas com Maior ROI Técnico

| # | Tarefa | Fase | ROI |
|---|--------|------|-----|
| 1 | Extrair componentes do `DeckPage.tsx` (1239 linhas → ~6 componentes) | 01 | Altíssimo |
| 2 | Extrair componentes do `ReviewPage.tsx` (818 linhas → ~5 componentes) | 01 | Altíssimo |
| 3 | Extrair componentes do `DashboardPage.tsx` (881 linhas → ~5 componentes) | 01 | Altíssimo |
| 4 | Substituir `data: any` por interfaces tipadas em services/repositories | 02 | Alto |
| 5 | Adicionar sanitização server-side com DOMPurify | 03 | Alto |
| 6 | Criar endpoint agregado `GET /review/due-counts` (substitui N requisições) | 04 | Alto |
| 7 | Migrations versionadas (substituir `migrations.sql` único) | 04 | Alto |
| 8 | Adicionar `useCallback` nos handlers + remover `eslint-disable` no ReviewPage | 01 | Médio |
| 9 | Adicionar índice `users.email` + check geral de índices | 04 | Médio |
| 10 | Parâmetros FSRS customizáveis por deck | 05 | Médio |

---

## O que NÃO Mexer Agora (evitar desperdício)

- **Migrar para ORM (Prisma, Drizzle, etc.):** SQL puro está funcionando bem. A troca não traz benefício proporcional ao custo para TCC.
- **Migrar para NestJS/Fastify:** Express 5 está servindo bem. Framework war não agrega ao TCC.
- **Adicionar Redis/session store:** JWT stateless é adequado para o volume. Só adicionar se houver requisito de revogação de token.
- **Implementar microsserviços:** Overengineering puro para projeto solo.
- **Adicionar CI/CD completo:** Útil, mas não crítico para TCC. Um script simples de deploy é suficiente.
- **Refatorar FSRS internamente:** `ts-fsrs` é biblioteca oficial e testada. Implementação própria seria retrabalho.
- **Mudar sistema de temas (CSS Modules, Styled Components, etc.):** Tailwind + CSS variables funciona. Trocar agora é retrabalho.
- ~~**Adicionar testes E2E para novos fluxos:**~~ — **REMOVIDO.** Agora planejado na Fase 08 devido ao valor para validação de regressão e apresentação do TCC.
- **Adicionar sistema de tags/gamificação:** Features legais, mas não essenciais para TCC. Adiar para Fase 06 se sobrar tempo.
- **Reescrever componentes Button/Modal/Input com variants complexas:** O que existe funciona. Overengineering de design system.

---

## Task Completion Policy

A task é considerada completa apenas quando TODAS as condições abaixo são verdadeiras:

1. **Implementação finalizada** — código escrito e funcional
2. **Validação concluída** — `tsc --noEmit`, testes, build
3. **Revisão executada** — `@reviewer` invocado e concluído
4. **Achados da revisão corrigidos ou justificados** — zero achados em aberto
5. **Arquivo da task atualizado** — frontmatter sincronizado, status refletido
6. **Arquivo da fase atualizado** — checklist e progresso atualizados
7. **Commit criado** — mudança commitada antes de prosseguir

### Fluxo Obrigatório

```
Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task
```

A próxima task NÃO DEVE começar antes do commit da atual.

### Exceções

A única exceção para pular a revisão é quando o diff é zero (nenhum arquivo foi modificado).

---

## Phase Completion Policy

Quando toda task da fase estiver completa:

1. Verificar que todas as tasks estão marcadas como concluídas (frontmatter `status: completed`)
2. Verificar que os Success Metrics foram atingidos
3. Verificar que não há achados de revisão em aberto
4. Atualizar frontmatter da fase para `status: completed`
5. Mover o arquivo da fase para `.plans/completed/`
6. Mover todos os arquivos de task associados para `.plans/completed/`
7. Criar um commit de conclusão da fase

Apenas após o arquivamento completo a próxima fase pode começar.

---

## Planning Source of Truth

### Regras

| Camada | Função | Localização |
|--------|--------|-------------|
| Política de execução | Define como o trabalho é executado | `AGENTS.md` |
| Roadmap | Progresso atual do plano | `.plans/tasks/INDEX.md` |
| Fases ativas | Escopo e status de cada fase | `.plans/tasks/` |
| Tasks ativas | Escopo de implementação detalhado | `.plans/tasks/` |
| Fases concluídas | Registro histórico | `.plans/completed/` |
| Tasks concluídas | Registro histórico | `.plans/completed/` |

### Princípios

- Trabalho ativo sempre vem de `.plans/tasks/`
- Trabalho arquivado sempre vive em `.plans/completed/`
- O arquivo de fase é a fonte primária de progresso
- Status de task no frontmatter deve refletir o status na fase
- Nenhuma task pode estar `completed` em um lugar e `pending` em outro

---

## Change History

| Data | Responsável | Mudança |
|------|-------------|---------|
| 2026-06-22 | Sistema de Planejamento | Migração para novo template com YAML frontmatter, políticas de conclusão, seções de risco e validação |
| 2026-06-26 | Planejamento E2E | Adicionada Fase 08 (Testes E2E) com 7 tarefas de infraestrutura, cobertura de auth, deck, card, review, import/share/analytics e navegação. Removida restrição anterior de "não adicionar testes E2E". |

