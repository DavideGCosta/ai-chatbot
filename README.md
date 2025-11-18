# SciQnt

AI-powered financial markets assistant built with Next.js and AI SDK.

## Features

- Chat about stock trends, portfolio analysis, investment strategies
- Multi-model support
- Secure authentication with Supabase
- Real-time streaming responses

## Getting Started

1. Install dependencies: `pnpm install`
2. Set up environment variables (see .env.local.example)
3. Run development server: `pnpm dev`

For production deployment, configure your hosting provider accordingly.

### How It Works
- **Next.js 15 + App Router** render the chat UI (messages, artifacts, history sidebar) while streaming completions from the AI SDK (`streamText`).
- **Supabase Auth** provides both email/password accounts and anonymous guest sessions. Middleware automatically provisions anonymous sessions so every visitor can chat without a signup flow.
- **Supabase Postgres** stores chat data in the new `chat_conversations`, `chat_messages`, `chat_message_votes`, `chat_streams`, `chat_documents`, and `chat_suggestions` tables. Each table has row-level security policies tied to `auth.uid()` so only the owner can read or mutate their data.
- **AI SDK Models** are still routed through the Vercel AI Gateway, but the model selector now guards against invalid cookies and safely falls back to the default model.

### Key Changes From The Vercel Template
1. Replaced NextAuth + Neon with Supabase clients (`lib/supabase/*`) and a new session helper (`lib/auth/session.ts`) that always relies on `supabase.auth.getUser()`.
2. Rewrote every database query (`lib/db/queries.ts`) to call Supabase directly and introduced schema typings under `lib/db/schema.ts`.
3. Added Supabase-aware middleware and providers so server routes, layouts, and components (sidebar, history APIs, file uploads, etc.) enforce the new auth model.
4. Cleaned up tooling by removing Drizzle migrations/scripts and updating `package.json` to pull in `@supabase/supabase-js` + `@supabase/ssr`.