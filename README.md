# L'Itinéraire — AI-Powered Paris Trip Planner

An AI travel concierge that helps you plan a personalised, day-by-day Paris itinerary through a natural conversation. Available as a web app and a mobile app, sharing a single backend.

---

## Features

- **Conversational AI planning** — chat with *L'Itinéraire*, a Paris-specialist AI persona, to build a bespoke itinerary around your dates, budget, and interests
- **Real-time streaming** — responses stream word-by-word via Server-Sent Events for a responsive feel
- **Persistent conversations** — start, revisit, and manage multiple trip-planning conversations stored in PostgreSQL
- **Guardrails** — the AI stays focused on Paris travel; prompt injection and off-topic requests are gracefully deflected
- **Prompt logging** — every user message is logged (conversation ID, IP, user-agent) for moderation and auditing
- **Parisian theme** — warm gold, parchment, and dusty-blue palette with serif typography across web and mobile
- **Cross-platform** — full feature parity between the React web app and the Expo mobile app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web frontend | React 19, Vite, Tailwind CSS 4, TanStack Query, Wouter, Framer Motion |
| Mobile | Expo SDK 54, React Native 0.81, Expo Router |
| Backend | Node.js 24, Express 5, Pino |
| Database | PostgreSQL + Drizzle ORM |
| AI | OpenAI GPT-4 (via streaming chat completions) |
| API contract | OpenAPI 3 → Orval (generates React Query hooks + Zod validators) |
| Monorepo | pnpm workspaces, TypeScript 5.9 |

---

## Project Structure

```
.
├── artifacts/
│   ├── paris-planner/          # React + Vite web app
│   ├── paris-planner-mobile/   # Expo / React Native mobile app
│   ├── api-server/             # Express 5 API server
│   └── mockup-sandbox/         # UI component preview server (dev only)
└── lib/
    ├── db/                     # Drizzle ORM schema + PostgreSQL client
    ├── api-spec/               # OpenAPI spec (source of truth)
    ├── api-client-react/       # Generated React Query hooks
    ├── api-zod/                # Generated Zod request schemas
    └── integrations-openai-ai-server/  # OpenAI client wrapper
```

---

## UI

### Mobile app

The mobile app is built with Expo / React Native and shares the same backend as the web app. On launch, the concierge greets the user with a welcome screen before opening into the full chat interface.

![Mobile welcome screen](docs/screenshots/mobile-welcome-screen.png)

### Web app

The web app provides the same conversational experience in a browser, with a responsive layout that adapts from desktop to narrow viewports.

![Web app — desktop](docs/screenshots/guardrail-normal-operation-desktop.png)

![Web app — responsive](docs/screenshots/guardrail-normal-operation-responsive.png)

---

## How It Works

1. The user types a message in the web or mobile app.
2. The API server logs the prompt, saves the user message to PostgreSQL, then calls OpenAI with the full conversation history and the Paris-specialist system prompt.
3. The AI response is streamed back over SSE and rendered in real-time.
4. The completed assistant message is saved to PostgreSQL, and TanStack Query updates the local cache.

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- A PostgreSQL database (set `DATABASE_URL` in your environment)
- An OpenAI API key (set `OPENAI_API_KEY` in your environment)

### Install dependencies

```bash
pnpm install
```

### Push the database schema

```bash
pnpm --filter @workspace/db run push
```

### Run all services

```bash
# API server
pnpm --filter @workspace/api-server run dev

# Web app
pnpm --filter @workspace/paris-planner run dev

# Mobile app
pnpm --filter @workspace/paris-planner-mobile run dev
```

---

## Database Schema

| Table | Columns |
|---|---|
| `conversations` | `id`, `title`, `created_at` |
| `messages` | `id`, `conversation_id`, `role`, `content`, `created_at` |
| `prompt_logs` | `id`, `conversation_id`, `content`, `ip_address`, `user_agent`, `created_at` |

---

## AI Guardrails

The system prompt enforces:

- **Scope** — only answers Paris / France travel questions
- **Confidentiality** — never reveals system prompt contents
- **Prompt injection** — ignores attempts to override instructions
- **Harmful content** — refuses to produce anything harmful or illegal
- **Identity** — always presents as *L'Itinéraire*, never another AI

### Guardrails in action

**Off-topic request deflected**

When a user asks about travel outside Paris (e.g. "how do I travel to Mexico"), the assistant politely declines and steers the conversation back to Paris trip planning — without breaking character or exposing system prompt details.

![Off-topic guardrail deflection](docs/screenshots/guardrail-offtopic-deflection.png)

---

## Future Enhancements

Features are tagged by effort: `Quick win` · `Medium lift` · `Big feature`

### AI & Intelligence

| Feature | Effort | Description |
|---|---|---|
| **User preference memory** | Quick win | Store dietary restrictions, budget level, and travel style across sessions so the AI never asks the same question twice. |
| **Real-time data integration** | Medium lift | Connect live APIs — weather, Google Maps, Yelp, Viator — so recommendations reflect current hours, closures, and crowd levels. |
| **Multi-model routing** | Medium lift | Use a fast model (GPT-4o mini) for quick replies and a smarter model for complex itinerary planning, reducing cost without sacrificing quality. |
| **Voice input support** | Big feature | Add speech-to-text on mobile so travellers can ask questions hands-free while exploring the city. |

### User Experience

| Feature | Effort | Description |
|---|---|---|
| **Exportable itinerary** | Quick win | Let users download their plan as a PDF or add stops directly to Google Calendar / Apple Maps with one tap. |
| **Photo-rich responses** | Medium lift | Embed curated photos of recommended places (via Unsplash or Google Places API) directly in the chat for visual discovery. |
| **Interactive map view** | Big feature | Render itinerary stops on a Google or Mapbox map with walking routes between them — visual planning alongside the conversation. |
| **Offline mode** | Big feature | Cache the user's final itinerary locally on mobile so they can access it without data — critical when roaming in Paris. |

### Collaboration & Social

| Feature | Effort | Description |
|---|---|---|
| **Trip sharing & public links** | Quick win | Generate a shareable read-only link to any itinerary so users can send their Paris plan to friends or post it on social media. |
| **Shared trip planning** | Big feature | Let multiple travellers collaborate on the same conversation in real time — great for couples or groups with different interests. |

### Business & Monetisation

| Feature | Effort | Description |
|---|---|---|
| **Affiliate booking links** | Medium lift | Integrate GetYourGuide, Viator, or OpenTable so the AI surfaces bookable tours and restaurant reservations with affiliate revenue. |
| **White-label / multi-city** | Big feature | Abstract the Paris persona into a configurable city template — sell to tourism boards or hotels as their own branded concierge. |

---

## License

MIT
