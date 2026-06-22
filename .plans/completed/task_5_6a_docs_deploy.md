---
id: "task_5_6a_docs_deploy"
title: "Deploy: Documentation (README)"
status: "completed"
priority: "medium"
type: "phase-completed"
---

# Task 5.6a — Deploy: Documentation (README)

## Estado Atual

- **Situação**: Concluída
- **Task pai**: [Phase 05 — Production Readiness](./phase_05_production_readiness.md) (subtask de Task 5.6)
- **Dependências**: Task 5.5b (Docker Compose Prod)
- **Último checkpoint**: Commit `f58e619` — seção Deploy adicionada ao README
- **Critério explícito de conclusão**: README.md atualizado com seção "Deploy" contendo pré-requisitos, passos e variáveis de ambiente

## Objetivo

Atualizar o README.md com instruções claras de deploy usando Docker Compose.

## Escopo

- Adicionar seção "Deploy" ao README.md
- Documentar pré-requisitos (Docker, Docker Compose)
- Documentar passos para deploy com docker-compose.prod.yml
- Documentar variáveis de ambiente necessárias
- Documentar portas expostas e proxy reverso

## Fora de Escopo

- Criar .env.prod.example (task 5.6b)
- Executar testes (task 5.6c)
- Documentar deploy em VPS específica

## Arquivos Permitidos para Modificação

- `README.md`

## Checklist de Implementação

- [ ] Adicionar seção "Deploy" no README
- [ ] Documentar pré-requisitos (Docker, Docker Compose, Node 20)
- [ ] Documentar passos: clonar, configurar .env, docker compose up
- [ ] Listar variáveis de ambiente com descrição
- [ ] Documentar portas expostas (frontend: 8080, backend: 3001, db: 5432)
- [ ] Mencionar necessidade de reverse proxy para SSL

## Critérios de Aceitação

- README.md tem instruções claras de deploy (Docker Compose)
- Todas as variáveis de ambiente documentadas
- Passos são reproduzíveis por um novo desenvolvedor

## Comandos de Verificação

```bash
# Apenas revisão visual do README.md
cat README.md | grep -A 20 "## Deploy"
```

## Definition of Done

- [x] README.md atualizado com seção Deploy (pré-requisitos, passos, variáveis, portas)
- [x] Instruções claras e reproduzíveis
- [x] `@reviewer` aprovou
- [x] Commit criado (`f58e619`)

## Commit Sugerido

```
docs(readme): add deployment section with Docker Compose instructions
```

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
