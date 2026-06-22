---
id: "task_media_url_compatibility"
title: "Task Media Url Compatibility"
status: "completed"
type: "task-completed"
---

## Tarefa: Corrigir compatibilidade de mídia (.apkg) para deploy Vercel + Render

### Contexto
Frontend (Vercel) e backend (Render) em origins diferentes. `processMidiaRefs()` gerava caminhos relativos `/media/...` que o browser resolvia contra o frontend, quebrando imagens/áudio.

### Tarefa
- [x] Adicionar `MEDIA_BASE_URL` (obrigatório) ao schema env.ts
- [x] Alterar `processMidiaRefs()` para gerar URLs absolutas `${MEDIA_BASE_URL}/media/...`
- [x] Atualizar .env.example, .env, .env.local, .env.test
- [x] Tornar `MEDIA_BASE_URL` obrigatória (sem default perigoso em produção)
- [x] Atualizar testes
- [x] Atualizar DECISIONS.md (trade-off URLs absolutas baked-in)
- [x] Atualizar AGENTS.md (env vars)

### Desvios
- Reviewer apontou R1 (default perigoso em produção) — mitigado tornando required
- R2 (cards existentes com URLs relativas) — aceito como limitação, registrado em DECISIONS.md

## Task Completion Policy

Ver política completa em [INDEX.md](./INDEX.md#task-completion-policy).

Resumo: Implementar → Validar → Revisar → Corrigir → Atualizar task → Atualizar fase → Commitar → Próxima task.
