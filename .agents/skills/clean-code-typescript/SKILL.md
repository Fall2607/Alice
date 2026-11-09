---
name: clean-code-typescript
description: Audits and refactors TypeScript, React 19, and Next.js 15 code according to Clean Code standards, labs42io principles, and secure PostgreSQL patterns.
---

# Clean Code TypeScript & Next.js Skill

This skill provides step-by-step audit, refactoring, and code review procedures adapted from:
- `labs42io/clean-code-typescript`
- `pontusab/cursorrules`
- `midudev/cursor-rules`
- `PatrickJS/awesome-cursorrules`

---

## When to Use This Skill
Activate this skill when:
1. Reviewing existing or newly written TypeScript files in the project.
2. Refactoring complex functions or components that have become too large or nested.
3. Checking for type safety (eliminating `any`, enforcing interfaces, narrowing `unknown`).
4. Auditing API routes for security (SQL injection prevention, connection leaks, proper HTTP status codes).
5. Ensuring Next.js 15 App Router conventions (Server Components first, async params, dynamic route configs).

---

## Audit Checklist

When auditing a file or module, run through these 5 checks:

### 1. Naming & Readability Check
- [ ] Variables and functions reveal their intent clearly without obscure abbreviations.
- [ ] Boolean variables/flags start with `is`, `has`, `can`, or `should`.
- [ ] Functions start with an action verb (`get`, `calculate`, `verify`, `format`, `generate`).
- [ ] No magic numbers; constants use `UPPER_SNAKE_CASE` with descriptive names.

### 2. Function Design & SRP Check
- [ ] Each function has a Single Responsibility (SRP).
- [ ] Maximum 1-2 positional parameters. Functions needing > 2 parameters use an options object.
- [ ] No boolean flag arguments that toggle execution branches.
- [ ] Guard clauses and early returns are used to eliminate deep nesting. Happy path is at the end.
- [ ] Pure functions preferred; no mutating arguments in place.

### 3. Type Safety Check
- [ ] Zero usage of `any`.
- [ ] Types from external or unknown sources are typed as `unknown` and validated with type guards.
- [ ] Object shapes use `interface`.
- [ ] Enums are replaced with `const` objects + `as const` union types.
- [ ] Readonly attributes applied where state must not change.

### 4. Next.js 15 & React 19 Architecture Check
- [ ] Server Component by default; `'use client'` only present when hooks/events/browser APIs are used.
- [ ] Dynamic Route `params` and `searchParams` are awaited (`const { id } = await params`).
- [ ] Route Handlers return standard `NextResponse.json` with correct HTTP status codes.
- [ ] Route Handlers that read cookies/headers or dynamic DB data declare `export const dynamic = 'force-dynamic'`.

### 5. PostgreSQL & Security Check
- [ ] All database queries use parameterized placeholders (`$1, $2, ...`), never string template interpolation.
- [ ] Connection pool is imported from `@/app/lib/db`, no orphan pool instances.
- [ ] Client connections checked out from the pool for transactions are strictly released in `finally`.

---

## Common Refactoring Recipes

### Recipe A: Eliminating `any` and Adding Type Narrowing
```ts
// BEFORE
function processResponse(res: any) {
  return res.data.items.map((i: any) => i.id);
}

// AFTER
interface ApiResponseItem {
  readonly id: string;
}

interface ApiResponse {
  readonly data: {
    readonly items: readonly ApiResponseItem[];
  };
}

function isApiResponse(value: unknown): value is ApiResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    typeof (value as any).data === 'object' &&
    Array.isArray((value as any).data?.items)
  );
}

function processResponse(res: unknown): string[] {
  if (!isApiResponse(res)) {
    throw new Error('Invalid API response shape');
  }
  return res.data.items.map((item) => item.id);
}
```

### Recipe B: Guard Clauses & Early Return Refactoring
```ts
// BEFORE (Nested arrow/pyramid of doom)
function verifyClockIn(karyawan: Karyawan, distance: number) {
  if (karyawan.isActive) {
    if (distance <= 2000) {
      return { allowed: true };
    } else {
      return { allowed: false, error: 'Di luar radius geofence' };
    }
  } else {
    return { allowed: false, error: 'Karyawan tidak aktif' };
  }
}

// AFTER (Clean guard clauses)
function verifyClockIn(karyawan: Karyawan, distance: number) {
  if (!karyawan.isActive) {
    return { allowed: false, error: 'Karyawan tidak aktif' };
  }
  if (distance > 2000) {
    return { allowed: false, error: 'Di luar radius geofence (maks 2 km)' };
  }
  return { allowed: true };
}
```

### Recipe C: Database Safe Transaction Pattern
```ts
// Safe PostgreSQL transaction with auto-rollback and guaranteed release
import pool from '@/app/lib/db';

export async function executeRosterTransaction(operations: (client: import('pg').PoolClient) => Promise<void>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await operations(client);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

