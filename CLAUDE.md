# CLAUDE.md — PM Simulator project

This file is your standing context for this repo. Read `SPEC.md` in full before writing code — it is the authoritative product & technical spec (captured from a hands-on walkthrough of the reference product, ProductDo's "Find Your PM Blind Spots" tryout).

## What we're building
A deployable web app that clones **and improves** the ProductDo PM-training simulator: a story-driven, chat-style lesson player where NPC colleagues hand the learner PM tasks, the learner solves them (some inside embedded pro-tool widgets), and answers graded multiple-choice checkpoints with color-coded feedback.

## Confirmed v1 scope (build in this order)
1. **Lesson player engine** — renders an ordered list of typed content blocks (message / artifact / tool / question / continue / feedback), progressive reveal, radio-choice grading with green/red borders, partial credit, progress bar, resumable state. This is the heart of the app — build and test it first.
2. **Embedded tools — self-contained / mocked** (NOT real SaaS):
   - SQL console → **DuckDB-WASM** (preferred) or `sql.js`, seeded from `/data`. Schema sidebar, CodeMirror/Monaco editor, RUN, results grid, CSV export. Approximate Superset's look.
   - Analytics widgets (Insights bar chart + data table + date-grouping toggle; Funnels view) → **mock React components** driven by fixture JSON (Recharts/visx). Approximate Mixpanel's look.
   - API tester, unit-economics grid, LLM box → mock/deterministic; stub for later.
3. **Catalog + nav** — "All simulators" grid, module cards, lesson-outline modal, top nav, profile.
4. **Accounts + progress persistence** — auth (email/OAuth), per-user lesson progress & scoring, server-side grading (keep correct answers off the client).
5. **Payments (Stripe)** — paid modules, coupon issuance at tryout end.
6. **End-of-lesson "blind spots" report** — per-skill score breakdown (improvement over the original's coupon-only ending).

## Content policy (important)
- The seed content in `/content` reproduces the 5 tasks verified during the walkthrough, **for engine bootstrapping only**.
- Before any public launch, **replace ProductDo's exact wording, branding ("Viditation", NPC names), and datasets with original content** to avoid copyright issues. Keep the mechanics; author fresh scenarios. Flag this to the user if we approach launch.

## Recommended stack (adjust with the user if they prefer otherwise)
- **Next.js + TypeScript** (SSR for catalog/marketing SEO; API routes for grading/progress/payments).
- **Tailwind** with a dark theme + green accent design tokens (see SPEC §2).
- **Zustand** for player state; **CodeMirror 6** editor; **DuckDB-WASM** in-browser SQL; **Recharts** charts.
- **Postgres** (Supabase/Neon) for users/progress; **Stripe** for payments.
- Content authored as **JSON/MDX** validated against the Block schema (SPEC §4.1), seeded into DB.

## Conventions & guardrails
- Keep correct-answer weights and grading **server-side**.
- Every content block is a typed, discriminated union — no ad-hoc rendering. New task types = new block variants, not special cases.
- Embedded tools must be **deterministic and offline-safe** (fixture-driven). No live third-party SaaS calls in the learning path.
- Accessibility: grading feedback needs non-color cues (icons + text), full keyboard nav on choices, responsive layout (don't assume desktop-only like the original).
- Write tests for the grading engine and the SQL-task auto-verification (optionally grade the learner's actual query result, not just their pick — see SPEC §7.4).
- Ask the user before adding paid third-party dependencies or committing to auth/payment providers.

## Where things live
- `SPEC.md` — full product/technical spec (read first).
- `KICKOFF.md` — the starting prompt / first milestone brief.
- `content/tryout-lesson.json` — the 5 seed tasks as Block-schema JSON.
- `data/viditation_user.schema.sql` + `data/README.md` — sample dataset schema for the SQL tool.
- `HANDOFF-README.md` — what this bundle is and how it was produced.

## First actions when you start
1. Read `SPEC.md` and `content/tryout-lesson.json`.
2. Propose the concrete repo structure + package list to the user and confirm the stack.
3. Scaffold the Next.js app + design tokens.
4. Build the lesson-player engine against `content/tryout-lesson.json` and get the 5 seed tasks fully playable + graded before moving to catalog/auth/payments.
