---
name: task-memory
description: Rules for maintaining Memento task memory. Use when working inside a task folder that contains the 5-file memory set (CLAUDE.md, MEMORY.md, TASKS.md, DECISIONS.md, BRIEF.md), when deciding whether a new task deserves a full memory folder, when recording or revising decisions, or when the user mentions task memory, memory sync, or decision history.
---

# Memento task-memory method

Eight rules that keep file-based task memory truthful across sessions. They were extracted from months of daily multi-stakeholder work; each rule exists because its absence caused a real failure (drifted statuses, lost decision rationale, duplicated facts).

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

## Rule 6: Correction lenses - never rewrite history, refract it

Rule 3 protects *decisions* from being overwritten. Facts need the same
protection. When you discover that past entries were factually wrong - a wrong
person attributed, a wrong place, a wrong assumption - the instinct is to edit
them. Don't. You lose the record of what you believed and when, and you will
miss occurrences scattered across files.

Instead put a **correction lens** at the top of `MEMORY.md`, in a section read
*before* any older entry:

```markdown
## CORRECTION LENSES (read before any older entry)

- **LENS 1 (2026-05-12) - role attribution.** Before this date the role
  "backend developer / deploys to prod" was wrongly attributed to the CEO.
  Any earlier entry saying "CEO deploys / CEO owns the API" must be read as:
  API decisions went through the CEO for approval, the implementer was the
  backend engineer.
```

**Why it works:** history stays auditable ("on the 19th we believed X"), while
every future read is corrected automatically. One lens fixes dozens of scattered
entries without touching them.

Write a lens instead of an edit when: the wrong fact appears in more than one
place, or the error changes the interpretation of a whole period rather than one
line, or the old belief itself explains decisions made back then. Straight edits
remain fine for typos and single-line fixes.

**Companion for volatile state:** keep a `## CURRENT PHASE` block right under the
lenses, refreshed whenever the situation flips. An agent reading a month-old log
will otherwise reason from a stale frame - the files can be perfectly correct
while the *reading frame* is not.

## Rule 7: Status glyphs - state visible at a glance

Prefix sections and entries with a one-character status. Reading a 30 KB memory
file to learn what is hot right now defeats the purpose of memory.

```
active/burning · waiting on a condition · in progress, calm · closed
(pick a 4-glyph set and put the legend in the file header)
```

Apply to `TASKS.md` section headers, `MEMORY.md` dated entries, and workspace
`INDEX.md` rows. This is triage, not decoration: it lets a human and an agent
scan a long file in one pass, and it surfaces drift - a "burning" marker three
months old is itself a signal.

## Rule 8: Session auto-memory - atomic facts, not one growing file

Rule 4 step 6 says "session auto-memory, if the environment has one" without
saying how. The shape that survives months of use:

**One fact = one file**, with frontmatter, in the session-memory directory:

```markdown
---
name: Never suggest going to sleep
description: User asked (2026-07-24) not to advise rest unprompted.
type: feedback
---
User explicitly asked: do not tell him to rest on my own initiative.

**Why:** repeated every answer for days, read as nagging.
**How to apply:** only if he asks, or once in an acute spiral - never twice.
```

Types that emerge in practice: `feedback_*` (corrections and standing
preferences), `project_*` (active work: goal, state, next step), `reference_*`
(stable lookups: where credentials live, contracts, calculation recipes),
`user_*` (who the person is).

Keep an index `MEMORY.md` in the same directory - grouped by glyph, one line per
file with a *why it matters* clause, so retrieval is decidable without opening
everything.

**Why atomic beats monolithic:** the index carries the map and only the relevant
file is loaded; a single fact can be revised without rewriting a large file; the
frontmatter `description` is what makes retrieval decidable. A workspace running
this shape accumulated ~50 such files over months with no maintenance burden; the
same content in one file would have become unreadable long before that.

**Division of labour:** folder files (`CLAUDE.md`, `MEMORY.md`, ...) hold *task*
memory, synced by the Rule 4 ritual. Auto-memory holds *cross-task* memory -
rules of engagement, stable references, who the user is - and accretes
continuously as such facts surface.

---

Run compaction inside `/memento:sync` when the budget is crossed, or on demand with `/memento:compact`.
