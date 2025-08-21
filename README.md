# ZIPBOT (Unified) — v11 Auth-backed Owner-only

This version switches chat storage to **authenticated owner-only** using **Supabase Auth**.

## DB Setup
Run in order (Supabase SQL Editor):
1. `db/schema.sql` (adds `user_id` columns and indexes)
2. `db/rls.sql` (owner-only policies with `auth.uid()`)

## Supabase Auth Setup
- In **Authentication → Providers**, enable **Email** (magic link).  
- Set **Site URL** to your Replit URL.  
- Optional: in **Redirect URLs**, add `<your-site>/auth/callback`.

## Environment (Replit Secrets)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## How it works
- Users sign in with an email link (magic link).  
- RLS policies allow only the **owner (auth.uid())** to read/insert their chats/messages.  
- API routes include the user’s **Bearer token** so RLS is enforced server-side.  
- Realtime still streams only the owner’s records due to RLS.

## Key files
- `db/schema.sql`, `db/rls.sql`
- `components/SignInCard.jsx`, `components/AuthGate.jsx`
- `components/ChatPane.jsx` (now uses user token in API calls)
- `app/auth/callback/page.jsx`



---
## v12 — ListCastAI Assistant Pathway

This version adds a server route that calls a ListCastAI endpoint (if configured) and posts an **assistant** reply into the chat using the **Supabase service role** key (server-side only), then Realtime delivers it to the client.

### New environment variables (Replit Secrets)
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only** secret for inserting assistant messages (bypasses RLS). **Never expose to the browser.**
- `LISTCASTAI_URL` — optional; if set, the server will POST chat context for an AI answer.
- `LISTCASTAI_API_KEY` — optional; bearer token for the ListCastAI endpoint.

If `LISTCASTAI_URL` is not set, we fall back to a simple rule-based answer using the curated ZIP links from `data/pilot.json`.


### Assistant wiring details
- Client posts user messages to `/api/message` (rate-limited & moderated).
- Then calls `/api/assistant` with the same `zip` and `chat_id`.
- `/api/assistant` composes a payload of the recent history and curated links:
  - If `LISTCASTAI_URL` is configured, it will POST the payload and expect a JSON reply like `{ "text": "..." }`.
  - Otherwise, it falls back to a helpful, link-rich answer from `data/pilot.json`.
- The server inserts the assistant message using `SUPABASE_SERVICE_ROLE_KEY` so RLS is satisfied and the owner can read it.

> Keep the service key **server-only**. Never expose it to the browser or return it from an API.
