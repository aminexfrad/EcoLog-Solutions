# EcoLog Solutions

Plateforme logistique durable avec dashboards multi-roles (shipper, carrier, client, admin), suivi d'expeditions, notifications, reporting carbone et assistant IA integre.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL
- AI: OpenAI API (via endpoint backend securise)

## Prerequisites

- Node.js 18+ (recommande 20+)
- npm 9+
- MySQL 8+

## 1) Clone and install

```bash
git clone <your-repo-url>
cd EcoLog-Solutions
```

Install backend:

```bash
cd backend
npm install
```

Install frontend:

```bash
cd ../frontend
npm install
```

## 2) Configure environment variables

### Backend

```bash
cd backend
cp .env.example .env
```

Update `backend/.env` values:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` (required)
- `FRONTEND_URL` (default `http://localhost:5173`)
- `OPENAI_API_KEY` (required for AI chatbot)
- `OPENAI_MODEL` (default `gpt-4o-mini`)

### Frontend

```bash
cd ../frontend
cp .env.example .env
```

Update `frontend/.env` only if backend URL changes:

- `VITE_API_BASE_URL=http://localhost:5000/api`

## 3) Database

Create a MySQL database with the name configured in `DB_NAME` (default: `ecolog_db`).

If you already have SQL scripts/migrations in your project, run them before starting the app.

### Migration: client ownership on shipments

To match the cahier requirement “Client final suit ses commandes”, shipments support an optional `client_id`.

If your database was created before this field existed, run:

```bash
cd backend
node scripts/migrate-add-client-id.js
```

## 4) Run locally

Start backend:

```bash
cd backend
npm run dev
```

Start frontend (new terminal):

```bash
cd frontend
npm run dev
```

Open the app:

- [http://localhost:5173](http://localhost:5173)

Backend health:

- [http://localhost:5000/api/health](http://localhost:5000/api/health)

## AI Chatbot

The chatbot is available globally in the app shell.

- Frontend calls `POST /api/ai/chat`
- Backend route is protected by JWT (`verifyToken`)
- If OpenAI key is missing, chatbot falls back to local smart replies

Required env for real AI replies:

- `OPENAI_API_KEY`

Optional:

- `OPENAI_MODEL` (default `gpt-4o-mini`)

## Build for production

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
npm start
```

## Troubleshooting

- `401 Unauthorized` on API calls:
  - Login again and ensure token exists in local storage.
- CORS errors:
  - Check `FRONTEND_URL` in backend `.env`.
- Chatbot not using AI:
  - Verify `OPENAI_API_KEY` is present in backend `.env`.
- API connection issues:
  - Confirm `VITE_API_BASE_URL` points to your running backend.
