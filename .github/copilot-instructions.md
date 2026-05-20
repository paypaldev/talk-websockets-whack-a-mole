# Copilot Instructions

- Follow the coding style and conventions already present in the codebase.
- Always run lint and build after making changes.

## TypeScript Strictness

- Always write TypeScript that satisfies `strict: true`.
- Never use `any` (explicit or implicit).
- Always type function parameters and return values when inference is not obvious.
- Prefer explicit types at API boundaries (server actions, route handlers, exported functions, data mappers).
- Do not bypass type safety with `// @ts-ignore` or `// @ts-nocheck`.

## Interface-First Object Modeling

- Use `interface` for object shapes and props.
- Use `type` only for unions, intersections, mapped/conditional types, and utility compositions.
- For collections returned from data access, define named interfaces for row/entity shapes before mapping.
- Keep interfaces small and domain-focused; compose interfaces instead of creating broad catch-all types.

## Safety Rules

- Validate and narrow unknown input before use.
- Prefer discriminated unions for state modeling.
- Keep nullability explicit (`string | null`) and handle nullable values directly.

## NextJS

- Use the latest version of Next.js and follow their best practices.
- Use Server Components as much as possible for UI and static content and move client-side interactivity to Client Components.
- Use Server Actions for server-side logic and data mutations.
- Use API routes only for custom request handling or when Server Actions are not suitable.
- Keep components focused on UI; move data fetching and business logic to Server Actions
