# Kickoff prompt for Claude Code

Copy-paste the block below as your first message to Claude Code (run it from inside this folder, after moving these files into a fresh git repo).

---

I'm building a web app: a story-driven Product Manager training simulator (a clone-and-improve of ProductDo's "Find Your PM Blind Spots"). All the context you need is in this repo:

- `CLAUDE.md` — your standing instructions, confirmed scope, stack, and guardrails. Read it first.
- `SPEC.md` — the full product & technical spec (UX model, block schema, data model, tool strategy, improvements).
- `content/tryout-lesson.json` — the first 5 tasks already authored in the block schema. This is your test content.
- `data/` — sample SQL dataset schema + notes.

Confirmed decisions:
- v1 = **full platform** (lesson player → catalog → auth + progress → Stripe payments → end-of-lesson "blind spots" report), but build it in that order and get the lesson player working first.
- Embedded tools are **self-contained / mocked** (DuckDB-WASM for SQL, mock React widgets for the Mixpanel Insights + Funnel views). No live third-party SaaS in the learning path.
- Seed content clones the reference tasks for now; we'll author original content before public launch.

Please start by:
1. Reading `CLAUDE.md`, `SPEC.md`, and `content/tryout-lesson.json`.
2. Proposing the repo structure, package list, and confirming the stack (I'm defaulting to Next.js + TS + Tailwind + Zustand + CodeMirror + DuckDB-WASM + Recharts + Postgres + Stripe — push back if you'd choose differently).
3. Scaffolding the app with the dark theme + green accent design tokens.
4. Building the lesson-player engine so all 5 seed tasks in `content/tryout-lesson.json` are fully playable and graded (progressive reveal, radio choices with green/red borders, partial credit, progress bar, resumable state) — including the DuckDB-WASM SQL console and the two mock analytics widgets.

Don't build catalog/auth/payments until the lesson player + tools are working and I've reviewed them. Ask me before adding paid third-party providers or making irreversible infra choices.
