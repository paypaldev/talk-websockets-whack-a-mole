# Whack-a-Mole

This app persists completed game results using Prisma ORM backed by Supabase Postgres.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Start local Supabase (Docker required):

```bash
npm run db:start
```

4. Apply Prisma schema and generate client:

```bash
npm run prisma:migrate -- --name init_game_results
npm run prisma:generate
```

5. Start the app:

```bash
npm run dev
```

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
