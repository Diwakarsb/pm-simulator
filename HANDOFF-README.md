# PM Simulator — Claude Code handoff bundle

This bundle transfers the full context needed to build a PM-training simulator (a clone-and-improve of ProductDo's "Find Your PM Blind Spots") into a Claude Code project.

## How this was produced
Captured from a hands-on walkthrough of the live reference product (`app.productdo.it`): played the first 5 tasks, inspected the embedded tools (Apache Superset SQL Lab, Mixpanel Insights & Funnels), browsed the full course catalog, and verified the answer key.

## Files
| File | Purpose |
|---|---|
| `CLAUDE.md` | Standing instructions Claude Code reads on every run: scope, stack, guardrails, content policy. |
| `SPEC.md` | Full product & technical spec — the authoritative reference. |
| `KICKOFF.md` | Copy-paste first prompt for Claude Code + the v1 milestone. |
| `content/tryout-lesson.json` | The 5 verified tasks authored in the block schema — the engine's test content. |
| `data/viditation_user.schema.sql` | Sample SQL dataset schema for the SQL-console task. |
| `data/README.md` | Notes on the sample data. |
| `HANDOFF-README.md` | This file. |

## How to use it
1. Unzip into a fresh, empty git repo (`git init`).
2. Open the repo in Claude Code.
3. Paste the prompt from `KICKOFF.md` as your first message.
4. Claude Code reads `CLAUDE.md` + `SPEC.md`, confirms the stack, and starts with the lesson-player engine.

## Confirmed build decisions
- **v1 scope:** full platform, built in order (lesson player → catalog → auth/progress → payments → blind-spots report).
- **Embedded tools:** self-contained / mocked (DuckDB-WASM SQL, mock analytics widgets) — no live SaaS.
- **Content:** clone the captured tasks to bootstrap; author original content/datasets before any public launch (copyright).

## Note on originality
The seed content and dataset mirror the reference product so the engine has concrete tasks to run against. If this ships publicly, replace ProductDo's exact wording, branding, NPC names, and datasets with original material. The mechanics are fine to reuse; the specific copy/data should be your own.
