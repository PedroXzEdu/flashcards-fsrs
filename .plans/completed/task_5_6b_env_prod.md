---
id: "task_5_6b_env_prod"
title: "Deploy: Production Environment File"
status: "completed"
priority: "medium"
type: "phase-completed"
---

# Task 5.6b — Deploy: Production Environment File

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 05 — Production Readiness](./phase_05_production_readiness.md) (subtask de Task 5.6)
- **Dependências**: Task 5.5b (Docker Compose Prod)
- **Último checkpoint**: Commit `f58e619` — `.env.prod.example` criado
- **Critério explícito de conclusão**: `.env.prod.example` criado com todas as variáveis necessárias para produção

## Objetivo

Criar arquivo `.env.prod.example` com todas as variáveis de ambiente necessárias para produção.

## Escopo

- Criar `.env.prod.example` na raiz do projeto
- Incluir todas as variáveis: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
- Incluir variáveis opcionais: PORT, CORS_ORIGIN
- Adicionar comentários explicativos para cada variável
- Usar valores placeholder seguros (não expor secrets reais)

## Fora de Escopo

- Documentação no README (task 5.6a)
- Testes ou verificação de build (task 5.6c)
- Deploy real

## Arquivos Permitidos para Modificação

- `.env.prod.example` (novo)

## Checklist de Implementação

- [ ] Criar `.env.prod.example` na raiz
- [ ] Adicionar `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- [ ] Adicionar `JWT_SECRET` com placeholder
- [ ] Adicionar `PORT` (opcional, default 3001)
- [ ] Adicionar `CORS_ORIGIN` (opcional)
- [ ] Adicionar comentários explicativos em português ou inglês (consistente com README)

## Critérios de Aceitação

- `.env.prod.example` contém todas as variáveis necessárias
- Valores placeholder seguros (ex: `change-me`, `your-secret-here`)
- Comentários explicativos presentes

## Comandos de Verificação

```bash
# Verificar que o arquivo foi criado
cat .env.prod.example
```

## Definition of Done

- [x] `.env.prod.example` criado (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, PORT, CORS_ORIGIN)
- [x] Todas as variáveis documentadas com comentários
- [x] Placeholders seguros (`change-me-to-a-secure-password`, `change-me-to-a-random-64-char-hex-string`)
- [x] `@reviewer` aprovou
- [x] Commit criado (`f58e619`)

## Commit Sugerido

```
chore(config): add .env.prod.example with production environment variables
```

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
