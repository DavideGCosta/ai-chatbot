## Chat

This project is a customized fork of the [Vercel AI Chatbot template](https://vercel.com/templates/next.js/nextjs-ai-chatbot). It keeps the same Next.js App Router + AI SDK experience, but refactors persistence and authentication around Supabase so it can run as a fully managed, multi-tenant chat workspace.

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

This README is intentionally focused on the Chatbot feature—use the diffs and in-code documentation for deeper implementation details.
