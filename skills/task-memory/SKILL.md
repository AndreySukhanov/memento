---
name: task-memory
description: Rules for maintaining Memento task memory. Use when working inside a task folder that contains the 5-file memory set (CLAUDE.md, MEMORY.md, TASKS.md, DECISIONS.md, BRIEF.md), when deciding whether a new task deserves a full memory folder, when recording or revising decisions, or when the user mentions task memory, memory sync, or decision history.
---

# Memento task-memory method

Four rules that keep file-based task memory truthful across sessions. They were extracted from months of daily multi-stakeholder work; each rule exists because its absence caused a real failure (drifted statuses, lost decision rationale, duplicated facts).

## Rule 1: The threshold - not every task deserves a folder

Create a **full 5-file folder** (via `/memento:init`) only if at least one holds:
- the task will take **more than one working day**;
- **more than two stakeholders** with different roles are involved;
- a **release artifact** is required (migration script, spec document, PR);
- the task has **more than two sequential phases** (research -> alignment -> implementation -> verification -> release).

Otherwise a one-line note in the workspace index (or session memory) is enough. Full folders pay off on long tasks; on quick questions five files are pure overhead. When unsure, ask the user: "full folder, or just a note?"

## Rule 2: File roles - stable vs volatile

The core separation that prevents duplicate maintenance:

- **`CLAUDE.md` = stable charter.** Scope, environments, stable IDs, stakeholder roles. Changes only on scope revision. (Named `CLAUDE.md` deliberately: Claude Code auto-loads it when working inside the folder - the charter enters context for free.)
- **`MEMORY.md` = chronological log.** Dated facts with sources: who said what and when, technical findings, evidence cases, open questions. Changes every session.
- **Litmus test** for where a fact goes: *"Can I delete this fact in a week without losing meaning?"* Yes -> MEMORY.md. *"Is it valid until the scope changes?"* -> CLAUDE.md.
- If you spot the same fact in both files, migrate it to the correct one immediately - overlap is how updates get missed.

## Rule 3: Decisions are never deleted, only revised

When a recorded decision changes, do **not** edit or remove the old block in `DECISIONS.md`. Add a new block `D<N>.<M>` (e.g. `D1.1`) that references the original and states: the new decision, why it was revised (with the stakeholder quote if there was one), and what happens to artifacts built under the old decision (rebuild / obsolete / still valid).

Then propagate: mark invalidated checkboxes in `TASKS.md` with `(obsolete, see D1.1)` and add the new ones; rewrite the affected `CLAUDE.md` sections to the *current* state only. Without this, a month later nobody can tell why "this way" became "that way" - and someone will accidentally roll back to the rejected option.

## Rule 4: Sync discipline - fixed order, every working session

At the end of any session with real actions on the task, sync in this order (or run `/memento:sync`):

1. `MEMORY.md` - dated entries: *who said what when*
2. `DECISIONS.md` - revision blocks: *why and what we do now*
3. `CLAUDE.md` - only on scope change: *how things are now*
4. `TASKS.md` - checkboxes, obsolete marks, blockers
5. workspace `INDEX.md` - the task's one-line status
6. session auto-memory, if the environment has one

Registration is atomic: a new task folder that is not in `INDEX.md` within the same operation will be forgotten - write the charter and the index row back to back.

## Rule 5: Compaction - seal the log, don't grow it forever

`MEMORY.md` is append-only by Rule 4, so it grows every session until it no longer fits the context window it was meant to save. A memory file too big to load is the same failure as no memory at all. Bound it by **sealing**, never by silent deletion.

When `MEMORY.md` crosses a size budget (rule of thumb: **~250 lines or ~12 KB**, or the moment loading it starts to crowd the session), compact the **oldest** material:

- **Seal, don't delete.** Collapse the oldest dated entries into a `## Sealed (before <date>)` block near the bottom (just above `File history`): a few lines per period that keep only facts *still load-bearing today*. Decision rationale already lives in `DECISIONS.md`, so here you keep durable findings, live constraints, and still-open threads.
- **Drop the noise, not the signal.** Resolved smoke runs, superseded numbers, day-to-day chatter - gone. Litmus: *"compressed to one clause, does the task still make sense next month?"* Yes -> seal it. Already irrelevant -> drop it. Still drives what you'd do today -> leave it live, don't seal.
- **Never seal `CLAUDE.md` or `DECISIONS.md`.** The charter is already current-state-only; decisions are never deleted (Rule 3). Compaction touches `MEMORY.md` alone.
- **Levels, not a wipe.** Recent sessions stay raw (L0). The first seal rolls a season into a paragraph (L1); when sealed blocks themselves pile up, fold the oldest into one line per quarter (L2). A reader can still reconstruct "what did we know, and when" at every level.

**Dedup on append (the companion discipline).** Rule 2 catches the same fact living in two *files*; this catches it living twice in the *same* file. Before appending a dated entry, scan the target section for a line making the same claim. If found, update that line's date/detail in place instead of adding a near-duplicate - a log that says the same thing five times is how the real update gets buried (the exact failure that bloated one category to 184 records, half of them restatements).

Run compaction inside `/memento:sync` when the budget is crossed, or on demand with `/memento:compact`.
