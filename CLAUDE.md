# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Sistema TF Quadros — an e-commerce/catalog + budget-request ("orçamento") system for a company that manufactures screen-printing frames. It's a monorepo with two independent apps that must be run separately:

- `backend/` — Express 5 REST API (CommonJS), talks to Supabase (Postgres) and OpenAI.
- `frontend/` — React 19 + Vite SPA, talks to the backend API and directly to Supabase Auth.

Both apps have their own `.env` and `node_modules`; there is no root-level package.json or workspace tooling tying them together.

## Commands

Run these from within `backend/` or `frontend/` respectively — there is no root script runner.

### Backend (`backend/`)
- No `dev`/`start` script is defined in `package.json`. Run the server directly, e.g. `node src/server.js` or `npx nodemon src/server.js` (nodemon is already a devDependency) for auto-reload.
- No test suite exists (`npm test` is the default CRA placeholder that exits with an error).

### Frontend (`frontend/`)
- `npm run dev` — start Vite dev server.
- `npm run build` — production build.
- `npm run preview` — preview a production build locally.
- `npm run lint` — ESLint over the whole project.
- No test suite is configured.

### Environment variables
- `backend/.env`: `SUPABASE_URL`, `SUPABASE_KEY`, `OPENAI_API_KEY`, `PORT`.
- `frontend/.env`: `VITE_API_URL` (backend base URL), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

Both `.env` files are gitignored; there are no `.env.example` files, so ask the user for values rather than inventing them.

## Architecture

### Backend: routes → controllers → Supabase, no models/ORM
Each resource follows the same three-file pattern under `backend/src/`:
- `routes/<resource>Routes.js` — Express router, wires paths to controller functions and applies `middlewares/autenticacao.js` where a route is admin-only.
- `controllers/<resource>Controller.js` — request handling and validation, talks directly to the Supabase client (`services/supabaseClient.js`) using the query builder — no ORM/model layer.
- `services/` — thin external clients: `supabaseClient.js` (Postgres/Auth) and `openaiClient.js` (chat completions).

`server.js` wires everything together (`app.use('/produtos', ...)`, `/orcamentos`, `/chatbot`). There's no versioning or centralized error-handling middleware — each controller returns its own `{ erro: '...' }` JSON on failure.

**Auth**: `middlewares/autenticacao.js` expects a `Bearer <supabase JWT>` header, validates it via `supabase.auth.getUser(token)`, and attaches `req.usuario`. Public GET endpoints (list/detail products, submit a budget, fetch a client's own budgets by token) have no auth; mutating/admin endpoints (create/edit/delete products, list all budgets, change budget status) require it.

**Client identity without accounts**: End customers aren't authenticated users — they're tracked by a random UUID (`cliente_token`, generated client-side in `frontend/src/services/clienteToken.js` and persisted to `localStorage`) that's sent with budget requests and used to look up "my orçamentos" later (`GET /orcamentos/token/:token`). Only admins log in via Supabase Auth.

**Orçamento (budget) line items are snapshotted**: `criarOrcamento` copies each product's current `nome`/`preco` into `orcamento_itens` at creation time, rather than joining live against `produtos`. This is intentional — historical budgets must not change if a product is later edited or deleted.

**Chatbot**: `chatbotController.js` sends a fixed Portuguese system prompt (the assistant is instructed never to quote exact prices/deadlines and to steer users to the "Adicionar ao orçamento" flow) plus the user's message to `gpt-4o-mini`, and logs every exchange to the `conversas_chatbot` Supabase table.

### Frontend: page-per-route, two auth models coexisting
`App.jsx` defines all routes directly (no nested router config file). Public pages (`Home`, `Catalogo`, `ProdutoDetalhe`, `Carrinho`, `Contato`) vs. admin pages (`Admin`, `AdminProdutos`) are distinguished by wrapping admin routes in `RotaProtegida`, which checks `supabase.auth.getSession()` client-side and redirects to `/login` if absent. The chat widget (`ChatWidget`) is rendered globally except on `/admin*` and `/login`.

- `services/api.js` — shared axios instance for the Express backend, base URL from `VITE_API_URL`.
- `services/supabaseClient.js` — separate Supabase client used only for admin auth (login/session), not for data access (data access always goes through the backend API).
- `context/CarrinhoContext.jsx` — cart state (selected products + quantities) as React context, consumed via `useCarrinho()`; this becomes the `itens` payload for `POST /orcamentos`.

When adding a new admin-only page, wrap it in `RotaProtegida` like the existing `/admin` and `/admin/produtos` routes. When adding a new public data endpoint, follow the existing routes→controller pattern rather than introducing a new architecture style.
