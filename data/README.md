# Sample data

`viditation_user.schema.sql` — table schema for the SQL-console task. Generate a seed dataset that satisfies the answer-key constraints in `../content/tryout-lesson.json` (T2: exactly 17 premium Google users created in January 2022).

The analytics tasks (T4 Insights, T5 Funnel) are driven by fixture values embedded directly in `tryout-lesson.json` under each `tool` block's `config` — no separate dataset needed for those.

Reminder: this dataset mirrors the reference product for engine bootstrapping. Replace with an original dataset before any public launch (see CLAUDE.md content policy).
