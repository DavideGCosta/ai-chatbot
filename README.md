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
- **Next.js 16 + App Router** render the chat UI (messages, artifacts, history sidebar) while streaming completions from the AI SDK (`streamText`).
- **Supabase Auth** provides both email/password accounts and anonymous guest sessions. Middleware automatically provisions anonymous sessions so every visitor can chat without a signup flow.
- **Supabase Postgres** stores chat data in the new `chat_conversations`, `chat_messages`, `chat_message_votes`, `chat_streams`, `chat_documents`, and `chat_suggestions` tables. Each table has row-level security policies tied to `auth.uid()` so only the owner can read or mutate their data.
- **AI SDK Models** are still routed through the Vercel AI Gateway, but the model selector now guards against invalid cookies and safely falls back to the default model.

### Key Changes From The Vercel Template
1. Replaced NextAuth + Neon with Supabase clients (`lib/supabase/*`) and a new session helper (`lib/auth/session.ts`) that always relies on `supabase.auth.getUser()`.
2. Rewrote every database query (`lib/db/queries.ts`) to call Supabase directly and introduced schema typings under `lib/db/schema.ts`.
3. Added Supabase-aware middleware and providers so server routes, layouts, and components (sidebar, history APIs, file uploads, etc.) enforce the new auth model.
4. Cleaned up tooling by removing Drizzle migrations/scripts and updating `package.json` to pull in `@supabase/supabase-js` + `@supabase/ssr`.

### Upstream Sync Strategy
- Upstream base: `upstream/main` from the Vercel ai-chatbot template. We keep our Supabase auth/storage model and do **not** reintroduce NextAuth/Neon.
- Workflow: review `git log HEAD..upstream/main`, cherry-pick or reimplement relevant commits (e.g., CVE bumps, UI fixes) while adapting to Supabase. When equivalent changes are in, record them as local commits with the upstream PR number in the message.
- Tracking: once covered, merge `upstream/main` with `-s ours` to mark the history and keep `git log HEAD..upstream/main` empty without pulling incompatible auth changes.
- Last sync: covered upstream commits #1333–#1347 (Next 16 upgrade, React/AI CVE bumps, scroll/back-nav fixes).
