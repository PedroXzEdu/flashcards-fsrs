# FlashFSRS

Sistema de flashcards inteligente inspirado no Anki, com algoritmo **FSRS (Free Spaced Repetition Scheduler)** para revisão espaçada, importação de decks `.apkg`, compartilhamento de baralhos e estatísticas de aprendizagem.

## Preview

- Dashboard
- Revisão FSRS
- Estatísticas
- Compartilhamento de decks
- Importação `.apkg`

---

## Funcionalidades

### Autenticação
- Cadastro e login com JWT
- Proteção de rotas
- Rate limiting em login e registro
- Sanitização de entradas
- Request ID para rastreamento de erros

### Gestão de Baralhos
- Criar, renomear e excluir baralhos
- Configuração personalizada por deck
- Compartilhamento por link
- Importação de decks `.apkg`

### Gestão de Cards
- Criar, editar e excluir cards
- Editor rico (Rich Text)
- Suporte a fórmulas matemáticas com KaTeX
- Busca e gerenciamento em lote

### Sistema de Revisão (FSRS)
- Agendamento inteligente de revisões
- Estados de aprendizado
- Avaliações:
  - Repetir
  - Difícil
  - Bom
  - Fácil
- Fila diária de revisão

### Estatísticas
- Heatmap de atividade
- Taxa de acerto
- Distribuição de reviews
- Progresso por deck
- Métricas globais

### Qualidade e Engenharia
- Docker-first workflow
- Lazy loading no frontend
- Logging estruturado com Pino
- Health check endpoint
- Error boundary no frontend
- ESLint + Prettier
- Husky + lint-staged
- Testes automatizados

---

## Stack Tecnológica

### Frontend
- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Tiptap
- Recharts
- KaTeX

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Pino Logger

### Infraestrutura
- Docker
- Docker Compose

### Qualidade
- ESLint
- Prettier
- Husky
- lint-staged
- Vitest

---

## Arquitetura

O projeto segue uma arquitetura separada entre frontend e backend.

```txt
flashfsrs/
├── frontend/          # React + Vite
├── backend/           # Express + Prisma
├── docker-compose.yml
├── AGENTS.md
└── README.md
````

### Backend

Estrutura baseada em camadas:

```txt
src/
├── controllers/
├── services/
├── middlewares/
├── routes/
├── database/
├── config/
└── utils/
```

### Frontend

Estrutura baseada em páginas e componentes:

```txt
src/
├── components/
├── pages/
├── contexts/
├── hooks/
├── services/
└── types/
```

---

## Como Executar o Projeto

### Pré-requisitos

* Docker
* Docker Compose

> Não é necessário instalar Node.js localmente.

### 1. Clone o repositório

```bash
git clone [<url-do-repositorio>](https://github.com/PedroXzEdu/flashcards-fsrs)
cd flashcards-fsrs
```

### 2. Configure as variáveis de ambiente

Crie os arquivos `.env`.

#### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/flashfsrs
JWT_SECRET=sua_chave_secreta
PORT=3000
NODE_ENV=development
```

#### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
```

### 3. Suba os containers

```bash
docker compose up --build
```

### 4. Rode as migrations

```bash
docker compose exec backend npx prisma migrate deploy
```

### 5. Acesse a aplicação

Frontend:

```txt
http://localhost:5173
```

Backend:

```txt
http://localhost:3000
```

Health check:

```txt
http://localhost:3000/health
```

---

## Scripts Úteis

### Frontend

```bash
docker compose exec frontend npm run dev
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
docker compose exec frontend npm run test
```

### Backend

```bash
docker compose exec backend npm run dev
docker compose exec backend npm run build
docker compose exec backend npm run test
docker compose exec backend npx prisma studio
```

### Formatação

```bash
docker compose exec frontend npm run format
docker compose exec backend npm run format
```

---

## Testes

O projeto possui testes automatizados para:

* Auth Service
* Deck Service
* Review Service

Executar:

```bash
docker compose exec backend npm test
```

---

## Segurança

O projeto implementa medidas básicas de segurança para um MVP:

* JWT Authentication
* Rate limiting em autenticação
* Sanitização de entradas
* Upload seguro de `.apkg`
* Request IDs para rastreamento
* Logging estruturado
* Error handling centralizado

---

## Roadmap

### Curto prazo

* [ ] Melhorias adicionais de responsividade
* [ ] Testes E2E
* [ ] Melhorias visuais no dashboard
* [ ] Mais métricas de aprendizagem

### Médio prazo

* [ ] PWA
* [ ] Sincronização em tempo real
* [ ] Modo offline
* [ ] Sistema de tags

### Longo prazo

* [ ] Deploy em produção
* [ ] Compartilhamento público de decks
* [ ] Gamificação
* [ ] Aplicativo mobile

---

## Autor

**Pedro Eduardo**

Projeto desenvolvido como sistema de estudo baseado em repetição espaçada utilizando o algoritmo **FSRS**.

---

## Licença

Este projeto é destinado para fins acadêmicos e educacionais.
