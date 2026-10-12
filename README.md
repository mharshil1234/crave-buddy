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
- Two-stage AI selection matching cuisine affinity first, followed by standout signature dishes.
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
- Ephemeral, cookie-backed shopping cart powered by **Upstash Redis**.
- Supports items from multiple restaurants concurrently with individual vendor sub-totals.
- Optimistic UI updates with rollback on network failure.

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
        │  • App Router (Next.js 16)    │                 │  • Express + Socket.IO v4     │
        │  • Better Auth Engine         │                 │  • Real-time Chat Sync        │
        │  • Vercel AI SDK (Gemini)     │                 │  • Room Phase Orchestration   │
        └───────┬───────────────┬───────┘                 └───────────────┬───────────────┘
                │               │                                         │
                ▼               ▼                                         ▼
   ┌─────────────────┐    ┌───────────────────────────────────────────────────────────────┐
   │  Upstash Redis  │    │                     Supabase PostgreSQL                       │
   │  • Multi-Cart   │    │  • Prisma Client 7 (@prisma/adapter-pg)                       │
   │  • 7-Day TTL    │    │  • Users, Mood Boards, Rooms, Members, Votes, and Results     │
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
│   ├── lib/                        # Core utilities (Auth, Prisma, Redis, AI, Sockets)
│   │   └── db/                     # Modular database query operations
│   ├── socket/                     # Standalone Socket.IO server & event contracts
│   ├── stores/                     # Zustand state stores (cartStore, locationStore)
│   └── types/                      # TypeScript domain types
├── data/                           # Local restaurant & menu JSON datasets
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
| **Real-Time WebSockets**| [Socket.IO v4](https://socket.io/), [Express](https://expressjs.com/) |
| **Authentication** | [Better Auth v1.6](https://better-auth.com/) (Google OAuth + Email/Password) |
| **Artificial Intelligence** | [Vercel AI SDK](https://sdk.vercel.ai/), [Google Gemini 2.5 Flash](https://ai.google.dev/) |

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm** or **pnpm**
- **PostgreSQL Database** (e.g. Supabase)
- **Upstash Redis Account**
- **Google Generative AI API Key** (Gemini)

---

### Installation & Environment Setup

1. **Configure Environment Variables:**  
   Create a `.env` file in `crave-buddy/`:
   ```env
   # PostgreSQL Connection (Supabase Transaction Pooler)
   DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

   # Direct Connection for Migrations (Supabase Session Pooler)
   DIRECT_URL="postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

   # Supabase Keys
   NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT].supabase.co"
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="[YOUR_KEY]"
   SUPABASE_SECRET_KEY="[YOUR_SECRET]"

   # Upstash Redis (Serverless Cart)
   UPSTASH_REDIS_REST_URL="https://[YOUR_INSTANCE].upstash.io"
   UPSTASH_REDIS_REST_TOKEN="[YOUR_TOKEN]"

   # Google Gemini AI
   GOOGLE_GENERATIVE_AI_API_KEY="[YOUR_GEMINI_API_KEY]"

   # Better Auth
   BETTER_AUTH_URL="http://localhost:3000"
   BETTER_AUTH_SECRET="[YOUR_AUTH_SECRET]"

   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID="[YOUR_GOOGLE_CLIENT_ID]"
   GOOGLE_CLIENT_SECRET="[YOUR_GOOGLE_CLIENT_SECRET]"

   # Real-Time WebSocket Server
   NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
   ```

2. **Install Dependencies & Generate Prisma Client:**
   ```bash
   npm install
   npx prisma generate
   ```

3. **Run Database Migrations (Optional if DB already migrated):**
   ```bash
   npx prisma migrate deploy
   ```

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

## 🧪 Building & Type Checking

To verify production compilation and TypeScript type safety:

```bash
npm run build
```

---

## 🗺️ Roadmap & Upcoming Milestones

- **Mood Room Collaborative Flow**: Multi-phase group dining engine (Cravings collection, live restaurant voting poll, collaborative dish tray, and seamless 1-click cart transfer).
- **Recommendation Engine Microservice**: Python `sentence-transformers` vector search backend.
- **Dietary Constraints & Allergens**: Support Jain, vegan, keto, and allergen exclusions.
- **Group Bill Splitting**: Automatic per-person cost breakdown in finished room orders.