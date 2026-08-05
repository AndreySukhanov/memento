# Task Index

> **Status glyphs (Rule 7):** [!] burning · [~] blocked/waiting · [>] active · [x] done

mode: full

> Workspace-level registry of all task folders - the fast answer to "what is active and
> where does it live". Derived, not authoritative: every row is rebuildable from the task
> folders themselves, so a row that disagrees with its folder loses to the folder.
> Created by `/memento:init`; the sync and the close write here automatically. The status
> overview only reads it.

## Active

| Task | Essence | Status | Key artifacts |
|---|---|---|---|
| [~] [checkout-latency-bug](checkout-latency-bug/) | one bug or five behind the checkout spin | fix written, waiting on a release slot before the 08.08 freeze (2026-07-24) | `materials/2026-07-18-bench.md` |

## Completed

| Task | Essence | Outcome | Final artifact |
|---|---|---|---|
| [x] [locale-audit](locale-audit/) | which locales fall back silently | 6 of 31 fell back; all fixed | [release/audit-final.sql](locale-audit/release/audit-final.sql) |

## Timeline

- **2026-07-24** - observer pass skipped, monthly budget exhausted (20/20)
- **2026-07-15** - Maria accepted the one-bug answer; the brief's second criterion closed
- **2026-07-09** - D2 revised: sharding dropped, retry cap chosen instead
- **2026-07-03** - recovered a sync that died mid-operation the previous afternoon
- **2026-06-27** - cache hypothesis refuted
- **2026-06-12** - population query frozen, deadline extended to 15.07 (D1)
- **2026-05-29** - checkout-latency-bug opened
