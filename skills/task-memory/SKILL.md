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
