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
- `npm start` — run the API (`node src/server.js`).
- `npm run dev` — run with nodemon for auto-reload.
- `npm test` — Jest + Supertest suite in `backend/tests/` (Supabase and OpenAI are mocked, so no network or database is touched). `backend/tests/postman/` holds the black-box Postman collection; see `backend/tests/README.md`.

### Frontend (`frontend/`)
- `npm run dev` — start Vite dev server.
- `npm run build` — production build.
- `npm run preview` — preview a production build locally.
- `npm run lint` — ESLint over the whole project.
- No test suite is configured (backend only, for now).

### Environment variables
- `backend/.env`: `SUPABASE_URL`, `SUPABASE_KEY`, `OPENAI_API_KEY`, `PORT`.
- `backend/.env` also needs `JWT_SECRET` (used to sign and verify the admin token).
- `frontend/.env`: `VITE_API_URL` (backend base URL).

Both `.env` files are gitignored; there are no `.env.example` files, so ask the user for values rather than inventing them.

## Architecture

### Backend: routes → controllers → Supabase, no models/ORM
Each resource follows the same three-file pattern under `backend/src/`:
- `routes/<resource>Routes.js` — Express router, wires paths to controller functions and applies `middlewares/autenticacao.js` where a route is admin-only.
- `controllers/<resource>Controller.js` — request handling and validation, talks directly to the Supabase client (`services/supabaseClient.js`) using the query builder — no ORM/model layer.
- `services/` — thin external clients: `supabaseClient.js` (Postgres/Auth) and `openaiClient.js` (chat completions).

`app.js` wires everything together (`app.use('/produtos', ...)`, `/orcamentos`, `/chatbot`, `/admin`, `/grupos-variacao`) and exports the Express app; `server.js` only loads `.env` and calls `listen`, so the tests can import the app without opening a port. There's no versioning or centralized error-handling middleware — each controller returns its own `{ erro: '...' }` JSON on failure.

**Auth**: authentication is implemented in the project itself, not with Supabase Auth. `POST /admin/login` (`controllers/adminController.js`) looks the admin up in the `administradores` table, compares the password against `senha_hash` with `bcryptjs`, and signs a JWT (`jsonwebtoken`, `JWT_SECRET`, 8h). `middlewares/autenticacao.js` expects a `Bearer <JWT>` header, verifies it with `jwt.verify` and attaches `req.usuario`. `scripts/criarAdmin.js` creates an admin with a hashed password. Public GET endpoints (list/detail products, submit a budget, fetch a client's own budgets by token) have no auth; mutating/admin endpoints (create/edit/delete products, list all budgets, change budget status) require it.

**Client identity without accounts**: End customers aren't authenticated users — they're tracked by a random UUID (`cliente_token`, generated client-side in `frontend/src/services/clienteToken.js` and persisted to `localStorage`) that's sent with budget requests and used to look up "my orçamentos" later (`GET /orcamentos/token/:token`). `criarOrcamento` reuses the existing `clientes` row for that token (updating name/e-mail/phone) instead of inserting a new one, so one browser keeps a single client record with many budgets. Only admins log in, through `/admin/login`.

**Orçamento (budget) line items are snapshotted**: `criarOrcamento` copies each product's current `nome`/`preco` into `orcamento_itens` at creation time, rather than joining live against `produtos`. This is intentional — historical budgets must not change if a product is later edited or deleted.

**Chatbot**: `chatbotController.js` sends a Portuguese system prompt — the fixed `CONTEXTO_SISTEMA` (company/screen-mesh knowledge; never quote exact prices/deadlines, steer users to the "Adicionar ao orçamento" flow) plus the current catalog (product names, descriptions and variation options, deliberately without prices) loaded from `produtos` on every request, falling back to the fixed text alone if that query fails — plus the user's current message to `gpt-4o-mini` — previous messages are NOT replayed, so the model has no memory of the conversation. Messages are capped at 500 characters and rate-limited to 10/minute per client token (`express-rate-limit`). The transcript lives only in the browser (`context/ChatContext.jsx` + `localStorage`) and is sent once, with the budget request: `criarOrcamento` then asks `gpt-4o-mini` for a one-sentence summary (`resumo_conversa`) and stores the messages in `historico_chatbot`. Conversations that never become a budget are never persisted.

**Product images**: `POST /produtos/upload-imagem` receives the file with Multer (memory storage, 5MB, images only) and uploads it to the Supabase Storage bucket `produtos-imagens`, returning the public URL that is saved in `produtos.imagem_url`.

### Frontend: page-per-route
`App.jsx` defines all routes directly (no nested router config file). Public pages (`Home`, `Catalogo`, `ProdutoDetalhe`, `Carrinho`, `Contato`) vs. admin pages (`Admin`, `AdminProdutos`) are distinguished by wrapping admin routes in `RotaProtegida`, which checks the stored admin JWT client-side and redirects to `/login` if absent. The chat widget (`ChatWidget`) is rendered globally except on `/admin*` and `/login`.

- `services/api.js` — shared axios instance for the Express backend, base URL from `VITE_API_URL`.
- `services/adminAuth.js` — stores/reads/clears the admin JWT in `localStorage`; all data access goes through the backend API.
- `context/CarrinhoContext.jsx` — cart state (selected products + quantities) as React context, consumed via `useCarrinho()`; this becomes the `itens` payload for `POST /orcamentos`.

When adding a new admin-only page, wrap it in `RotaProtegida` like the existing `/admin` and `/admin/produtos` routes. When adding a new public data endpoint, follow the existing routes→controller pattern rather than introducing a new architecture style.
