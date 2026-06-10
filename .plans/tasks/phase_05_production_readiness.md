# Phase 05 — Production Readiness

> **Arquivo índice / master.** Cada task abaixo tem seu próprio arquivo de microtask com detalhes completos.

## Objetivo

Preparar o FlashFSRS para implantação em produção: CSP enforcement, PWA funcional, hardening de segurança, otimização de build, documentação de deploy, e garantia de que o projeto pode rodar com configuração mínima fora do Docker Compose.

## Escopo

- CSP enforcement (mudar de reportOnly para enforce)
- PWA funcional (service worker, manifest, offline page)
- Segurança: rate limit global, brute force protection, headers de segurança adicionais
- Build otimizado (frontend, backend)
- Script de deploy (docker-compose.prod.yml)
- Documentação de deploy no README
- Verificação final de regressão (todos os testes + E2E)

## Fora de Escopo

- Deploy real em VPS ou Railway
- Domínio customizado
- SSL/TLS (delegado ao reverse proxy)
- CI/CD pipeline
- Monitoramento em produção
- Backup automático de banco

## Pré-requisitos

- Fases 01-04 concluídas
- Todos os testes passando (unit, integration, E2E)
- Docker Compose funcional
- `tsc --noEmit` passando em backend e frontend

## Tasks (Índice)

| ID | Microtask | Arquivo | Dependências |
|---|---|---|---|
| 5.1 | CSP Enforcement | [`task_5_1_csp_enforcement.md`](./task_5_1_csp_enforcement.md) | — |
| 5.2a | PWA — Manifest & Icons | [`task_5_2a_manifest_icons.md`](./task_5_2a_manifest_icons.md) | — |
| 5.2b | PWA — Service Worker | [`task_5_2b_service_worker.md`](./task_5_2b_service_worker.md) | 5.2a |
| 5.2c | PWA — Offline Page | [`task_5_2c_offline_page.md`](./task_5_2c_offline_page.md) | 5.2b |
| 5.3a | Hardening — Global Rate Limit | [`task_5_3a_global_rate_limit.md`](./task_5_3a_global_rate_limit.md) | — |
| 5.3b | Hardening — Brute Force Login | [`task_5_3b_bruteforce_login.md`](./task_5_3b_bruteforce_login.md) | — |
| 5.3c | Hardening — Security Headers | [`task_5_3c_security_headers.md`](./task_5_3c_security_headers.md) | — |
| 5.4a | Build — Pipeline | [`task_5_4a_build_pipeline.md`](./task_5_4a_build_pipeline.md) | — |
| 5.4b | Build — Production Runtime | [`task_5_4b_production_runtime.md`](./task_5_4b_production_runtime.md) | 5.4a |
| 5.5a | Docker — Prod Dockerfiles | [`task_5_5a_prod_dockerfiles.md`](./task_5_5a_prod_dockerfiles.md) | 5.4a, 5.4b |
| 5.5b | Docker — Compose Prod | [`task_5_5b_docker_compose_prod.md`](./task_5_5b_docker_compose_prod.md) | 5.5a |
| 5.6a | Deploy — Documentação | [`task_5_6a_docs_deploy.md`](./task_5_6a_docs_deploy.md) | 5.5b |
| 5.6b | Deploy — Env Prod | [`task_5_6b_env_prod.md`](./task_5_6b_env_prod.md) | 5.5b |
| 5.6c | Verificação Final | [`task_5_6c_full_regression.md`](./task_5_6c_full_regression.md) | todas anteriores |

## Ordem de Execução

```
5.1 → 5.2a → 5.2b → 5.2c → 5.3a → 5.3b → 5.3c → 5.4a → 5.4b → 5.5a → 5.5b → 5.6a → 5.6b → 5.6c
```

Tasks sem dependência entre si (ex: 5.3a, 5.3b, 5.3c) podem ser executadas em paralelo.

## Riscos e Pontos de Atenção

- CSP enforcement pode quebrar funcionalidades não testadas — testar exaustivamente
- PWA icons precisam ser gerados ou baixados — certificar-se de que existem no repositório
- Brute force em memória não persiste entre restart (aceitável)
- Docker Compose de produção expõe portas diferentes — documentar
- nginx para frontend requer configuração de proxy reverso para API
- Verificação final deve ser feita com `docker compose down -v` + `up` para garantir estado limpo

## Estado Atual

- **Início**: Fase iniciada
- **Último checkpoint**: Tasks 5.1 até 5.5b concluídas
- **Progresso**: 11/14 tasks

## Critério de Conclusão da Fase

- Todas as 14 microtasks concluídas e verificadas
- Task 5.6c (full regression) executada com sucesso
- `@doc` aprovou documentação

## Checklist da Fase

- [x] 5.1 CSP Enforcement
- [x] 5.2a Manifest & Icons
- [x] 5.2b Service Worker
- [x] 5.2c Offline Page
- [x] 5.3a Global Rate Limit
- [x] 5.3b Brute Force Login
- [x] 5.3c Security Headers
- [x] 5.4a Build Pipeline
- [x] 5.4b Production Runtime
- [x] 5.5a Prod Dockerfiles
- [x] 5.5b Docker Compose Prod
- [ ] 5.6a Docs Deploy
- [ ] 5.6b Env Prod
- [ ] 5.6c Full Regression
- [ ] Revisão de código realizada
- [ ] Critérios de aceitação validados

## Instruções para o Agente Construtor

1. Execute as tasks na ordem definida (ou paralelize quando não houver dependência).
2. Para cada task, abra o arquivo de microtask correspondente e siga seu checklist.
3. Não avance para a próxima fase sem concluir os critérios de aceitação.
4. Atualize o checklist acima conforme o progresso.
5. Registre desvios ou decisões arquiteturais relevantes.
6. Gere commits pequenos e focados por microtask.
7. Após cada microtask, rode `tsc --noEmit` (backend) ou `tsc -b --noEmit` (frontend) conforme aplicável, e invoque `@reviewer` antes de commitar.
8. **Task 5.6c é a verificação final**: não declare a fase concluída sem todos os testes verdes e `@doc` aprovado.
