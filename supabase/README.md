# Supabase Local Development

This project expects Supabase to run locally in development.

## Prerequisites

- Docker Desktop running
- Supabase CLI installed (`brew install supabase/tap/supabase`)

## Start local Supabase

```bash
npm run db:start
```

## Check status and connection values

```bash
npm run db:status
```

## Stop local Supabase

```bash
npm run db:stop
```

The local database URL used by Prisma is:

```text
postgresql://postgres:postgres@127.0.0.1:54322/postgres?schema=public
```
