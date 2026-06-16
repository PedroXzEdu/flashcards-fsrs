# Task 06.03 — Adicionar Feedback Visual para Ações do Usuário

## Estado Atual

- **Situação**: Pendente
- **Task pai**: [Phase 06 — Features Futuras](./phase_06_features_futuras.md)
- **Dependências**: Nenhuma

## Objetivo

Adicionar feedback visual (toast/snackbar) para ações como criar deck, criar card, importar, etc.

## Locais a Modificar

| # | Arquivo | O que fazer |
|---|---------|-------------|
| 1 | `frontend/src/components/Toast.tsx` (novo) | Componente de toast |
| 2 | `frontend/src/contexts/ToastContext.tsx` (novo) | Contexto global de toasts |
| 3 | Vários componentes | Usar toast após ações |
| 4 | `frontend/src/App.tsx` | Adicionar ToastProvider |

## Fora de Escopo

- Animações complexas
- Sistema de notificações persistente (apenas toast em memória)

## Arquivos Permitidos para Modificação

- `frontend/src/components/Toast.tsx` (novo)
- `frontend/src/contexts/ToastContext.tsx` (novo) (ou `frontend/src/hooks/useToast.ts`)
- `frontend/src/App.tsx`
- Componentes que chamam ações (AddDeckModal, EditDeckModal, CreateCard, ImportPage, etc.)

## Checklist de Implementação

- [ ] 1. Criar `ToastContext` com provedor e hook `useToast`
- [ ] 2. Criar `Toast` component estilizado (sucesso, erro, info)
- [ ] 3. Envolver app com ToastProvider
- [ ] 4. Adicionar toasts em:
  - Criar deck: "Baralho criado com sucesso"
  - Renomear deck: "Baralho renomeado"
  - Excluir deck: "Baralho excluído"
  - Criar card: "Card criado com sucesso"
  - Importar .apkg: "Importação concluída"
  - Erro em qualquer ação
- [ ] 5. Rodar `npx tsc -b --noEmit`

## Critérios de Aceitação

- Toast aparece após ações principais
- Toast de erro aparece em falhas
- Toasts somem automaticamente após ~3s
- Tema escuro funcional

## Comandos de Verificação

```bash
cd frontend && npx tsc -b --noEmit
npx vitest run
```

## Definition of Done

- [ ] Toast system implementado
- [ ] Toasts integrados nas ações principais
- [ ] `tsc` passando
- [ ] `@reviewer` aprovou
