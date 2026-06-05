# Whack-a-Mole

This app persists completed game results using Prisma ORM backed by Supabase Postgres.

## Prerequisites

- [Docker](https://www.docker.com/) must be installed and running (required for local Supabase)

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Initialise the Supabase project config (creates `supabase/config.toml`):

```bash
npx supabase init
```

4. Start local Supabase (Docker required):

```bash
npx supabase start
```

   Once started, the CLI prints a credentials table. Copy the **Publishable** key and paste it into `.env`:

```text
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Publishable key from the output above>
```

5. Apply Prisma migrations and generate the client:

```bash
npm run prisma:migrate -- --name init_game_results
npm run prisma:generate
```

1. Start the app:

```bash
npm run dev
```

> **Troubleshooting — Studio fails to pull:**
> If `supabase start` fails with a Docker pull error for the Studio image, open `supabase/config.toml` and set `enabled = false` under `[studio]`, then re-run `npx supabase start`. The Studio UI is not required for the app to work.

## Saved Game Result Fields

- `playerName`
- `score`
- `misses`
- `createdAt` (datetime)

The client invokes a Next.js Server Action on game completion, and the action saves each row in Postgres via Prisma.

## Supabase Local Commands

- Start: `npm run db:start`
- Status: `npm run db:status`
- Stop: `npm run db:stop`

More local Supabase notes are in `supabase/README.md`.
