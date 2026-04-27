# Paris Trip Planner — L'Itinéraire

## Overview

AI-powered Paris Trip Planner chatbot. Users chat with an AI Paris travel expert ("L'Itinéraire") to plan personalized day-by-day Paris itineraries. The AI asks about travel dates, budget, interests, and style, then generates detailed recommendations for neighborhoods, restaurants, activities, and local experiences.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/paris-planner) at `/`
- **API framework**: Express 5 (artifacts/api-server) at `/api`
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **AI**: OpenAI via Replit AI Integrations (gpt-5.4), SSE streaming
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Features

- Multi-conversation chat interface with sidebar history
- Real-time streaming AI responses (SSE)
- AI Paris travel expert with detailed knowledge of neighborhoods, restaurants, activities
- Day-by-day itinerary generation with markdown formatting
- Paris-themed design (warm gold, parchment, dusty blue palette)
- Auto-starts a new conversation on first load

## Architecture

- **Frontend**: `artifacts/paris-planner/src/` — React + Wouter routing, custom SSE streaming hook
- **Backend routes**: `artifacts/api-server/src/routes/openai/` — conversation CRUD + SSE chat endpoint
- **DB schema**: `lib/db/src/schema/` — conversations + messages tables
- **AI libs**: `lib/integrations-openai-ai-server/` — OpenAI SDK client wrapper

## OpenAI Integration

Uses Replit AI Integrations proxy (no user API key needed). Environment variables `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY` are auto-provisioned.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
