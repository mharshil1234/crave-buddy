# 🍽️ Crave Buddy

> **Food that matches your mood.**  
> An intelligent food discovery and collaborative dining web application built with **Next.js 16**, **React 19**, **Prisma**, **PostgreSQL**, **Upstash Redis**, **Better Auth**, and **Google Gemini AI**.

---

## 🌟 Overview

Have you ever spent 30 minutes scrolling through delivery apps unable to decide what to eat, or argued with friends about what to order on movie night?

**Crave Buddy** solves decision fatigue around food through two core experiences:
1. **Mood Boards**: An AI-powered craving interpreter that translates natural language prompts (*"something spicy for a rainy night"*, *"healthy post-workout meal"*, *"late night comfort food"*) into personalized restaurant and dish recommendations.
2. **Mood Rooms**: A real-time collaborative decision room where groups of friends join with an invite code, submit their individual cravings, vote on nominated restaurants, assemble a shared basket of dishes, and finalize a group order in real time.

---

## 🚀 Key Features

### 🧠 1. AI-Driven Mood Boards
- Express cravings in natural language.
- Filter by vegetarian preferences.
- Pluggable recommender: the built-in Gemini provider or the standalone `crave-buddy-recommendation` service, selected with `RECOMMENDER_PROVIDER`.
- Every recommendation is validated against the catalogue (real restaurants, real dishes, veg filter) before it is saved.
- Rate limited per user / IP.
- Save mood boards to user profiles and share via unique links.

### 👥 2. Collaborative Mood Rooms (Group Ordering)
- **Room Creation & Joining**: Unique 8-character invite codes (`nanoid`) with member capacity controls.
- **Real-Time Group Chat**: Fast WebSocket-powered session chat with active user indicators.
- **Multi-Phase Decision Engine**:
  1. **Lobby**: Waiting room for friends to gather.
  2. **Craving Collection**: Everyone submits their individual food desires.
  3. **Restaurant Voting**: AI synthesizes group cravings into tailored nominees; friends vote in a live poll.
  4. **Item Voting**: Collaborative menu browser where friends vote on dishes and adjust quantities in a shared tray.
  5. **Order Summary**: Finalized order receipt with 1-click **Add to Personal Cart** transfer.

### 🛒 3. Multi-Vendor Shopping Cart
- Ephemeral, cookie-backed shopping cart powered by **Upstash Redis** (one hash per cart, atomic per-item updates).
- Supports items from multiple restaurants concurrently with individual vendor sub-totals.
- Optimistic UI updates that reconcile with the server quantity and roll back on failure.

### 🔐 4. Seamless Authentication
- Powered by **Better Auth** with PostgreSQL adapter.
- Supports Email / Password and Google OAuth with automatic account linking.
- Anonymous-to-user state transition (claim guest-generated mood boards upon signing in).

---

## 🏗️ System Architecture

```
                                  ┌─────────────────────────────┐
                                  │      Client (Browser)       │
                                  │  Next.js 16 (React 19)      │
                                  │  Tailwind CSS v4 + Zustand  │
                                  └──────────────┬──────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        │ HTTP (Port 3000)                                │ WS (Port 3001)
                        ▼                                                 ▼
        ┌───────────────────────────────┐                 ┌───────────────────────────────┐
        │      Next.js App Server       │                 │     Socket.IO Microservice    │
        │  • App Router (Next.js 16)    │                 │  • Socket.IO v4 (node http)   │
        │  • Better Auth Engine         │                 │  • Real-time Chat Sync        │
        │  • Recommender (Gemini / svc) │                 │  • Room Phase Orchestration   │
        └───────┬───────────────┬───────┘                 └───────────────┬───────────────┘
                │               │                                         │
                ▼               ▼                                         ▼
   ┌─────────────────┐    ┌───────────────────────────────────────────────────────────────┐
   │  Upstash Redis  │    │                     Supabase PostgreSQL                       │
   │  • Multi-Cart   │    │  • Prisma Client 7 (@prisma/adapter-pg)                       │
   │  • Rate limits  │    │  • Catalogue (restaurants, menu_items), Users, Mood Boards,   │
   │  • 7-Day TTL    │    │    Rooms, Members, Votes, and Results                         │
   └─────────────────┘    └───────────────────────────────────────────────────────────────┘
```

---

## 📂 Web App Structure (`crave-buddy/`)

```
crave-buddy/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/                    # API Route Handlers (Auth, Rooms, Cart, Mood Board)
│   │   ├── mood-board/             # Mood board creation & display views
│   │   ├── mood-room/              # Mood room create, join, lobby & session views
│   │   ├── restaurant/[id]/        # Restaurant detail & menu views
│   │   ├── cart/                   # Multi-vendor shopping cart view
│   │   ├── signin/ & signup/       # Auth pages
│   │   └── page.tsx                # Homepage restaurant discovery
│   ├── components/                 # React UI Components
│   │   ├── MoodRoom/               # Lobby, member lists, and host controls
│   │   ├── MoodRoomSession/        # ChatBox, phase manager, voting views
│   │   ├── UserMoodBoard/          # Mood board cards, restaurant picks
│   │   ├── CartPage/               # Cart cards and line items
│   │   ├── RestaurantPage/         # Menu list, search, and dish cards
│   │   └── ui/                     # Shared UI components (QuantityButton, icons, modals)
│   ├── hooks/                      # Shared client hooks (useCartItem)
│   ├── lib/                        # Core utilities (Auth, Prisma, Redis, catalogue, cart)
│   │   ├── recommender/            # Recommender interface, Gemini + HTTP service providers, validation
│   │   └── db/                     # Modular database query operations
│   ├── socket/                     # Standalone Socket.IO server & event contracts
│   ├── stores/                     # Zustand state stores (cartStore, locationStore)
│   └── types/                      # TypeScript domain types
├── data/                           # Catalogue seed sources (restaurants, menus, data/catalogue/*)
├── scripts/seedCatalogue.ts        # Idempotent catalogue seeder (npm run seed)
├── prisma/                         # Prisma schema & database migration history
└── package.json
```

---

## 🛠️ Tech Stack

| Domain | Technology |
|---|---|
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Compiler) |
| **UI Library & Styling** | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **State Management** | [Zustand v5](https://github.com/pmndrs/zustand) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/)), [Prisma v7](https://www.prisma.io/) |
| **In-Memory Cache** | [Upstash Redis](https://upstash.com/) (REST client) |
| **Real-Time WebSockets**| [Socket.IO v4](https://socket.io/) |
| **Authentication** | [Better Auth v1.6](https://better-auth.com/) (Google OAuth + Email/Password) |
| **Recommendations** | Pluggable: [Vercel AI SDK](https://sdk.vercel.ai/) + [Google Gemini 2.5 Flash](https://ai.google.dev/), or the `crave-buddy-recommendation` FastAPI service |
| **Testing** | [Vitest](https://vitest.dev/) |

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm** or **pnpm**
- **PostgreSQL Database** (e.g. Supabase)
- **Upstash Redis Account**
- **Google Generative AI API Key** (Gemini), unless you run the recommendation service

---

### Installation & Environment Setup

1. **Configure Environment Variables:**  
   Copy the template and fill in your values:
   ```bash
   cp .env.example .env
   ```
   See [`.env.example`](.env.example) for every variable. Set `RECOMMENDER_PROVIDER=service` and `RECOMMENDER_URL` to use the recommendation service instead of Gemini.

2. **Install Dependencies & Generate Prisma Client:**
   ```bash
   npm install
   npx prisma generate
   ```

3. **Apply Database Migrations:**
   ```bash
   npx prisma migrate deploy
   ```
   Use `migrate deploy` against Supabase. `migrate dev` may try to reset the database.

4. **Seed the Catalogue:**
   ```bash
   npm run seed
   ```
   Loads restaurants and menus from `data/` into the `restaurants` and `menu_items` tables. Safe to re-run.

---

### Running in Development

The application runs with two concurrent processes: the **Next.js Web App** and the **Socket Server**.

**Terminal 1 — Next.js Application:**
```bash
npm run dev
# Running on http://localhost:3000
```

**Terminal 2 — Real-Time Socket Server:**
```bash
npm run socket
# Running on http://localhost:3001
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Running with Docker (both servers in one command)

Requires Docker with the Compose plugin. Postgres (Supabase) and Redis (Upstash) stay hosted, so `.env` is all the containers need.

```bash
npm run docker:up     # builds the image, starts the web app (:3000) and socket server (:3001)
npm run docker:down   # stops both
```

- Source is bind-mounted, so code changes hot-reload in both containers.
- Logs from both servers stream in the same terminal; use `npm run docker:up -- -d` to run them in the background and `docker compose logs -f` to follow logs.
- After changing `package.json`, just run `npm run docker:up` again: it rebuilds the image and refreshes the containers' `node_modules`.
- Stop any `npm run dev` / `npm run socket` running on your machine first, since they use the same ports.
- To reach a service on your machine (e.g. the recommendation service), use `http://host.docker.internal:8000` instead of `localhost` in `.env`.

---

## 🧪 Building & Type Checking

To verify production compilation and TypeScript type safety:

```bash
npm run build
```