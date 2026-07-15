# Freight Rate Finder

Search freight shipping rates between two locations and compare deterministic mock quotes —
built for the frontend take-home assessment.

## Setup

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Other scripts: `pnpm test` (Vitest), `pnpm lint`, `pnpm build`. Built on Node 22 / pnpm 11;
any recent Node ≥ 20 should work.

## How it works

```
src/
  app/                        # thin shells: page (server, Suspense) + api route (transport)
  modules/rates/
    schemas.ts                # single Zod source of truth (search input + quote output)
    types.ts                  # z.infer / z.input exports only — no hand-written shapes
    urlCodec.ts               # search ⇄ URL params (the persistence layer, both directions)
    server/                   # deterministic quote generation + pure request handler
    hooks/                    # TanStack Query hook + URL state hook
    components/               # one component per file
```

The same `rateSearchSchema` object validates the form (react-hook-form resolver), the API
request body (route handler), and the URL on reload (codec) — one definition, three consumers,
zero drift.

## Key decisions & trade-offs

**No state library.** TanStack Query owns server state (per the conventions), react-hook-form
owns form state, and the URL owns "the current search". After that there was nothing left for
Redux/Zustand/Context to manage, so none was added.

**Query, not mutation.** Searching is a deterministic read: `useQuery` keyed by the parsed
search object gives caching, request dedupe, and retries for free; `useMutation` would model it
as a side effect and forfeit all three. The endpoint is a `POST` purely for transport — the
cargo discriminated union is awkward to double-encode into a query string.

**Persistence: the URL is the source of truth.** Submitting writes the search into the page's
query params; on reload the params are parsed back **through the same schema** and the query
re-fires. Because results are deterministic (below), restoring the input provably restores the
results. Free extras: shareable/bookmarkable searches.
*Rejected alternative — localStorage:* invisible, non-shareable state that needs manual
sync, and persisting the results themselves would copy server state outside TanStack Query,
which the conventions discourage. *Accepted trade-off:* results are re-derived on reload
(a brief loading skeleton), not frozen bytes. If the API were non-deterministic, I'd add
TanStack Query's localStorage persister on top of the same URL design.

**Deterministic quotes.** The parsed search is reduced to a canonical string (lowercased route,
mode-tagged cargo fields) → FNV-1a hash → seed for a mulberry32 PRNG → 3–6 quotes (carrier
draw without replacement, transit time, price line items scaled by cargo). Same search ⇒
byte-identical response, always. Even the simulated latency (400–900 ms) derives from the seed.
Money is integer cents end to end; the output schema `refine`s that line items sum to the
total, and the handler validates the response **on the way out** — a generation bug would 500
loudly rather than ship inconsistent math.

**Error-path design.** Errors are typed (`INVALID_INPUT` | `UPSTREAM_ERROR`) and validation
failures return field-level issues. Invalid input fails fast (no simulated latency — bad input
shouldn't cost a fake round-trip). Failure and empty states use **documented deterministic
triggers** rather than random chance, so every UI state is reproducible on demand:

| Input | Result |
|---|---|
| Destination `jupiter` (any casing) | HTTP 500, typed error body → error state with retry |
| Destination `nowhere` | HTTP 200, zero quotes → empty state |
| Schema-invalid body | HTTP 400 with field-level issues |
| Anything else | 3–6 quotes, deterministic |

**Sorting: cheapest total first** (tiebreaks: transit days, then carrier name — fully
deterministic order). Price is the primary decision variable when comparing freight quotes;
transit time stays visible on every card so the trade-off remains scannable. Sorting lives in
the list component — a presentation concern, deliberately not in the API.

**Cargo modes as a discriminated union.** `z.discriminatedUnion("mode", …)` means invalid
combinations are *unrepresentable* in TypeScript, and at runtime Zod strips cross-mode fields
so contamination can't reach the generator (there's a test proving `pieces` can't smuggle into
a containers search). Quantities use `z.coerce.number()` so the identical schema accepts form
strings and JSON numbers — which is what makes "same schema on client and server" literally
true. The form uses `useForm<Input, _, Output>` generics accordingly.

## Tests (34) — aimed at the trust boundaries

1. **Schema** — the contract: valid searches pass, wrong-mode fields rejected/stripped, dates
   validated relative to "today" (offset-based, never stale), quote sum-refine enforced.
2. **Generator** — determinism is load-bearing for persistence: repeat ⇒ deep-equal, casing
   insensitivity, 3–6 count, output re-validated through the quote schema.
3. **Route handler** — pure function, no HTTP needed: 400 with nested issue paths, 200 shape,
   500 mapping, latency returned (not slept) so tests run in milliseconds.
4. **Search form** — the most intricate client logic, tested with **zero mocks** (it never
   fetches or routes — submit just reports a parsed value): mode switching, inline errors,
   coercion on submit, rehydration from persisted defaults.

Skipped deliberately: snapshot tests (noise) and E2E (see below).

## What I cut for time, and what's next

In the order I'd add them back: a user-facing sort toggle (price/transit) → TanStack Query's
localStorage persister (instant repaint on reload; becomes necessary the moment the API stops
being deterministic) → a Playwright smoke test of the reload/error/empty loop → a proper
date-picker component (currently native, `min` = tomorrow) → multi-currency (currently USD via
`Intl.NumberFormat`). Known edge, documented rather than hidden: "future ship date" is
evaluated against the user's local calendar day; production would validate against the origin
port's timezone.

## How I used AI

I used an AI coding assistant throughout, in different roles per layer:

- **Planning:** it argued options for the contested decisions (API layer, persistence
  mechanism, UI approach, scope); the calls above are mine and I can defend each rejected
  alternative.
- **Domain/server layers** (schemas, generator, route handler, URL codec, tests): AI-drafted
  under my direction, reviewed line by line before committing.
- **UI development and client state:** written by me; AI did a requested review pass that caught real
  issues I then had it fix — most notably that the React Compiler's auto-memoization froze
  components reading react-hook-form's `watch()`/`formState` through context (fixed with the
  `useWatch`/`useFormState` subscription hooks), plus stricter typing around the coercing
  schema.
- **Changed or rejected along the way:** I rejected `globals: true` in Vitest in favor of
  explicit imports (and accepted the consequence: registering RTL cleanup manually);
  removed `valueAsNumber` from number inputs in favor of the schema's own coercion (better
  error messages, one conversion path); and folded an AI-suggested standalone plan document
  into this README instead of shipping two overlapping docs.

Every line in the repo was reviewed by me, and all commits are mine.
