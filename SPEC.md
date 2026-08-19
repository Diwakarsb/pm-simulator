# PM Simulator — Product & Technical Spec

**Purpose:** Blueprint for rebuilding the ProductDo "Find Your PM Blind Spots" simulator as a deployable web app, then extending it (clone + improve). Written from a hands-on walkthrough of the live platform at `app.productdo.it`.

**Target build approach:** Later implementation with Claude Code, deployable online.

---

## 1. What the product is

ProductDo is a **practice-based e-learning platform for aspiring/junior Product Managers.** Instead of video lectures, learning happens through **interactive, story-driven simulations**: the learner plays a new PM at a fictional company, colleagues message them with real work problems, and the learner solves each problem — often using *real embedded professional tools* (SQL console, Mixpanel, APIs) — by answering multiple-choice checkpoints.

The unit we're cloning is the **free "tryout" lesson**: `PM in BigTech: Skill Test → Find Your PM Blind Spots` (~20+ tasks, ~30–45 min, marketed as a self-diagnostic before the paid courses).

### Business model context (for the "improve" phase)
- Free tryout lesson → funnels into ~13 paid modules (€109–€509 each) shown in an "All simulators" catalog.
- Tryout ends with a 10% discount coupon (incentive to finish).
- Paid modules referenced throughout the tryout as "learn more" links (SQL for PMs, Analytics for PMs, A/B Testing, Product Discovery, etc.) — i.e. the tryout doubles as a sales tour.

---

## 2. Core UX model

The **entire lesson is one long, vertically-scrolling "chat/story" feed** that reveals itself progressively. It reads like a Telegram/chat thread between the learner and NPC colleagues.

### The building blocks (repeat throughout)

| Block | Description |
|---|---|
| **Character message** | Avatar (circular B&W photo) + name + role, followed by one or more paragraphs of body text. NPCs pose the problem. |
| **Inline artifact** | A code block (monospace, syntax-highlighted SQL), an OKR draft (white card, monospace), or an embedded tool screenshot. |
| **Collapsible "live tool"** | A `▶ If you want to run the query / play with the report yourself` expander that reveals a **real, embedded, interactive tool** (Apache Superset SQL Lab, Mixpanel Insights/Funnels) in an iframe/panel. |
| **Choice question** | A set of radio options, each with a colored left-border. Learner selects one → clicks **Send** → answer is graded. |
| **Feedback block** | Appears after Send. Green left-border = correct, red = wrong. Contains the explanation (the "teaching moment"), often with keyword highlights and a cross-sell link to a paid module. |
| **Continue button** | Outlined pill button (e.g. "Sounds good!", "Wow, it's serious", "Analytics is cool") to advance the narrative when there's nothing to grade. |
| **Progress bar** | Fixed green progress bar + `%` at the top; increments as the learner advances. |

### Grading behavior (verified)
- Each choice has a hidden correctness weight.
- **Full credit** (green): the intended best answer.
- **Partial credit** (green, "almost full point"): a defensible-but-not-ideal answer (e.g. picking the correct SQL *approach* instead of running it to get the exact number).
- **Wrong** (red): incorrect options get a red left-border after submission; the correct one is still highlighted green.
- After grading, previously-selected radio shows filled; the feedback text is revealed; the flow unlocks the next block.
- There is an **"I disagree"** link under most feedback blocks (lets the learner contest / see more — soft engagement affordance).
- State persists across reloads (progress is saved server-side per user; reloading resumes mid-lesson).

### Navigation chrome (top bar)
- Left: `ProductDo⟩` wordmark (green accent).
- Right: **lesson-outline icon** (opens a modal listing the module's lessons with completion rings), **grid icon + "All simulators"** (catalog), **profile icon**.
- Module modal example: `PM in BigTech: Skill Test` → one lesson `Find Your PM Blind Spots` (with a progress ring).

### Visual design
- **Dark theme.** Near-black background (`#0f0f0f`-ish), light-gray body text, **green accent** (`~#5cb85c`/lime) for brand + highlighted keywords + progress.
- Choice highlight keywords appear in green; cross-sell links in blue.
- Left-border color coding: green (correct/neutral-good), red (wrong).
- Generous line-height, large readable type, centered ~760px content column.
- Character avatars: circular, grayscale.

---

## 3. Narrative / content structure of the tryout lesson

**Setting:** The learner is a new PM at **"Viditation"**, a *clothing rental subscription service* (later tasks reuse a meditation app + online shop dataset). NPCs hand off tasks in sequence.

### Characters (NPCs)
| Name | Role | Function in story |
|---|---|---|
| **Andrew** | Sr. PM ML, mentor | Author/host. Intro + closing, meta-framing, cross-sell. |
| **Jane** | Principal Product Manager | "Senior colleague." Onboards learner; OKR task. |
| **Ingrid** | Marketing specialist | Hands off the SQL, MAU, Mixpanel & funnel tasks. |
| *(more NPCs appear later for API / unit-economics / interview / LLM tasks)* | | |

### Task archetypes observed (first ~23%, representative of the whole)

**T1 — OKR critique (pure reasoning, multi-round).**
Jane shows a weak OKR draft; learner picks what's wrong ("It lacks measurable results"); feedback teaches the principle; a *revised* draft is shown; learner critiques again; iterates across 3 rounds until the OKR is professional. Teaches: Objective = qualitative/ambitious; KRs = measurable outcomes, not processes ("keep fixing bugs" ✗) and not prescribed solutions ("by adding X mechanism" ✗, "add 4 categories" ✗ → "+7% new users" ✓). Ends with the 3 planning horizons (sprint stories / OKRs+epics / vision+strategy) + cross-sell to "Product Planning".

**T2 — Live SQL query (embedded Superset).**
Ingrid gives a starter query and asks to count only Google-Ads users. Learner opens the embedded **Apache Superset SQL Lab** (Postgres "Viditation Database"), edits the query to add `AND acquisition_channel = 'google'`, runs it → count = **17**. Choices include real numbers (17 correct, 116 trap), a "didn't work" option, and two "too lazy" options revealing the correct vs. invalid SQL syntax (`AND ...` ✓ / `IN CASE ...` ✗). Picking the correct-approach lazy option = *partial* credit. Cross-sell: "SQL for Product Managers".

**T3 — Metric reasoning trap (WAU→MAU).**
Ingrid asks to derive MAU from avg WAU (=180). Correct answer: **"impossible to determine"** — you can't infer monthly uniques from weekly average without the visit-overlap distribution (could be anywhere from 180 to ~720). Teaches audience-metric definitions.

**T4 — Mixpanel report reading (embedded Mixpanel Insights).**
Same MAU, now solved with data. Learner opens embedded **Mixpanel** weekly-uniques report; correct MAU = **579** (must open the tool & switch to monthly grouping; the naive "sum weekly = 1083" is a trap because weekly uniques double-count returning users). Cross-sell: "Analytics for Product Managers".

**T5 — Funnel analysis (embedded Mixpanel Funnels).**
Ingrid shows a 5-step onboarding funnel (Start 5,952 → … → Finish 2,074, ~35% overall). Learner picks the step with the biggest drop to improve first → **Step 1→Step 2 (62.57%)**. Teaches: prioritize the largest drop-off, not overall rate. Cross-sell: "Basic Analytics for a Product Manager".

### Remaining archetypes (from platform copy; not individually walked but same shell)
- **API testing** — "test the '100% ready' API" → likely an embedded request builder / Swagger-like panel; choices about response correctness.
- **Unit economics** — build/inspect a unit-economics model (CAC, LTV, margin); numeric choices.
- **A/B testing decisions** — read experiment results, decide ship/no-ship.
- **Customer interview analysis** — read interview transcripts, extract valid vs. biased insights.
- **LLM / AI prototyping** — "master LLMs", "Replit AI" — prompt/prototype tasks.
- **Prioritization** — pick highest-impact work.

All follow: NPC problem → (optional embedded tool) → graded multiple-choice → feedback + cross-sell.

### Ending
Closing message from Andrew + **10%-off coupon**; encouragement to continue into paid modules.

---

## 4. Data / domain model (for the rebuild)

### 4.1 Content model (authoring)
A **Module → Lesson → ordered list of Blocks.** Each block is one of a small set of typed nodes. Suggested schema:

```
Module { id, title, subtitle, description, priceEUR|null, isFree,
         exerciseCount, durationLabel, lessons[] }

Lesson { id, moduleId, title, blocks[] (ordered) }

Block (discriminated union by `type`):
  - message   { character, markdown }
  - artifact  { kind: 'okr'|'code'|'image', content|imageUrl, lang? }
  - tool      { kind: 'superset'|'mixpanel-insights'|'mixpanel-funnel'|'api'|'sheet',
                embedUrl|config, defaultQuery?, collapsedLabel }
  - question  { prompt?, options[], sendLabel }
  - continue  { label }

Option { id, label (supports inline highlight spans), weight (0..1),
          feedbackId }

Feedback { id, verdict: 'correct'|'partial'|'wrong', markdown,
           crossSellModuleId? }

Character { id, name, role, avatarUrl }
```

- `weight` supports partial credit (1 = full, 0.5 = partial, 0 = wrong).
- Options carry inline highlight ranges (green keywords) — store as light markdown or span tokens.
- A `question` may be preceded by a `tool` block whose real answer the learner must compute — but the grading is still on the chosen option (the tool is for the learner to *derive* the answer, not auto-checked). *(Improve idea: optionally auto-verify tool output.)*

### 4.2 Progress / state model
```
UserLessonProgress { userId, lessonId, currentBlockIndex,
                     answers: [{ questionBlockId, optionId, weight, ts }],
                     score, percent, completedAt? }
```
- Percent = function of blocks revealed / total.
- Score = sum(weights)/maxWeights → drives the "blind spots" report (per-skill breakdown) at the end. *(Improve: the current tryout gives a coupon; we can add a real per-skill diagnostic — SQL 3/4, Metrics 2/3, etc.)*

### 4.3 Sample dataset (Superset "Viditation Database")
Table `viditation_user` columns (verified from schema panel):
`user_id INTEGER, created_date TIMESTAMP, acquisition_channel VARCHAR, acquisition_campaign VARCHAR, country_iso VARCHAR, h_lifetime_days INTEGER, h_session_frequency_days INTEGER, age INTEGER, goal VARCHAR, is_premium BOOLEAN, acquisition_cost NUMERIC, is_skylark INTEGER, onboarding_version VARCHAR`
(channels seen: google, twitter; countries: DE, FR; campaigns: "early adopters", "esoteric", "improve concentration".)

---

## 5. Embedded tools — the hard/interesting part

The differentiator (and the main engineering decision) is the **real embedded tools**. Options per tool:

| Tool in original | What it is | Rebuild options |
|---|---|---|
| **SQL console** | Apache **Superset SQL Lab** on a Postgres DB | (a) Embed a real Superset instance (heavy); (b) Build a lightweight in-app SQL playground: **Postgres (read-only sandbox) or client-side SQLite/`sql.js`/DuckDB-WASM** + a schema sidebar, editor (Monaco/CodeMirror), RUN, results grid, CSV export. **Recommended: DuckDB-WASM or sql.js** — no backend DB, runs in browser, safe, fast. |
| **Mixpanel Insights/Funnels** | Real Mixpanel embed | Almost certainly **mock our own analytics widget** driven by fixed JSON (bar chart + data table + date-grouping toggle + funnel view). No real Mixpanel needed for the learning goal. Use Recharts/visx. |
| **API tester** | Request runner | Build a small in-app request panel hitting a **mock API** (static fixtures) so it's deterministic and offline-safe. |
| **Spreadsheet / unit economics** | — | A small editable grid (e.g. Handsontable/AG-Grid or a custom React table) with formula cells, seeded with the scenario. |
| **LLM / Replit AI** | External | For clone: a sandboxed prompt box against a controlled model endpoint, or a scripted mock. Decide later. |

**Recommendation for the clone:** *don't* embed heavyweight third-party SaaS. Reproduce each tool as a **self-contained, deterministic in-app widget** fed by fixture data. This makes the app deployable, offline-safe, cheap, and gradeable. The *look* (Superset/Mixpanel chrome) can be visually approximated.

---

## 6. Proposed architecture for the rebuild

**Frontend:** React + TypeScript + Vite (or Next.js if we want SSR/SEO for the catalog & marketing pages).
- UI: Tailwind + a component lib; dark theme with green accent tokens.
- Content rendered from the Block schema (a `<LessonPlayer>` that maps block types → components).
- Editor: Monaco or CodeMirror 6 for SQL.
- In-browser SQL: **DuckDB-WASM** (or `sql.js`) loading a seeded dataset.
- Charts: Recharts / visx for the mock Mixpanel widgets.
- State: lightweight store (Zustand) + persistence to backend.

**Backend:** Node (Express/Fastify) or Next API routes.
- Auth (email/OAuth), user, progress, scoring.
- Content served from a headless source (JSON/MDX files in repo, or a CMS later).
- Grading endpoint (keeps correct answers server-side so they're not trivially inspectable). *(Improve over original, whose answers are somewhat client-visible.)*
- Payments (Stripe) for the "improve→sell modules" phase; coupon issuance.

**Content pipeline:** author lessons as **MDX or structured JSON** in the repo → validated against the Block schema → seeded into DB. This makes new lessons cheap to add.

**Deployment:** Vercel/Netlify (frontend) + a small managed Postgres (Supabase/Neon) for users/progress. DuckDB-WASM means no analytics DB to host.

---

## 7. Clone-and-improve opportunities (the goal)

Concrete upgrades over the original, to decide on before build:
1. **Real per-skill "blind spots" report** at the end (radar/bar by skill: OKRs, SQL, Metrics, Funnels, Unit Econ, API, A/B, LLM) — delivers on the lesson's own promise better than a coupon.
2. **Server-side grading** so answers aren't inspectable in the DOM.
3. **Deterministic in-app tools** (DuckDB-WASM SQL, mock analytics) — faster, offline, no SaaS dependency, and *auto-verifiable* (optionally grade the learner's actual query result, not just their multiple-choice pick).
4. **Auto-verify tool tasks:** for SQL, run the learner's query and compare the result set to expected — award credit for a correct query even if they mis-click the number.
5. **Resumable, mobile-friendly** layout (original nudges "use a computer"; we can make the embedded tools responsive).
6. **Authoring UI / MDX** so non-engineers can add tasks.
7. **Accessibility:** the choice/radio + color-border grading needs non-color cues (icons) and keyboard nav.
8. **Localization-ready** content model (original has some translation seams).
9. **Analytics on the learner funnel** (which tasks cause drop-off) to improve the course itself.

---

## 8. Open questions to resolve before building
- Which tools must be *real* vs. *mocked*? (Recommend all mocked/self-contained except possibly SQL via DuckDB-WASM.)
- Scope of first build: just the free tryout lesson, or the multi-module platform + payments?
- Do we need auth/accounts in v1, or anonymous progress in localStorage first?
- Content source of truth: MDX-in-repo vs. a CMS?
- Is the goal a portfolio/demo clone, or a real product to sell (changes payments, legal, content-originality needs — we must author *original* content/datasets, not copy ProductDo's).

---

## Appendix A — Verified answer key (tryout, first 5 tasks)
- **T1 OKR:** "It lacks measurable results" → then "Still not very good" → then "…definite yes" (final OKR uses outcome KRs, +7% new users).
- **T2 SQL:** add `AND acquisition_channel = 'google'` → **17** users. ("IN CASE" is invalid SQL trap; "116" is a trap.)
- **T3 WAU→MAU:** "It is clear that it is impossible to determine MAU here."
- **T4 Mixpanel MAU:** **579** (open report, monthly uniques; "1083 = sum of weekly" is the trap).
- **T5 Funnel:** **Step 1** (biggest drop, 62.57% Step1→Step2).

## Appendix B — Superset `viditation_user` schema
See §4.3.
