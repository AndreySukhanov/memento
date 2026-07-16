---
description: Seal the oldest entries of a task's MEMORY.md into a compressed summary block so the log stays loadable - keeps still-relevant facts, drops resolved noise, never touches CLAUDE.md or DECISIONS.md
argument-hint: [path to the task folder or its MEMORY.md, optional if obvious from the session]
---

# /memento:compact - seal the memory log

`MEMORY.md` grows every session (Rule 4 appends, never trims). Left alone it eventually stops fitting the context window it exists to save - a memory file too big to load is the same failure as no memory. This command **seals** the oldest material instead of deleting it, so the log stays loadable and still truthful.

Compaction touches **`MEMORY.md` only**. `CLAUDE.md` is already current-state-only; `DECISIONS.md` is never trimmed (Rule 3). If asked to compact those, refuse and explain.

## Determine the target

Use `$ARGUMENTS` if provided (a task folder or a direct `MEMORY.md` path). Otherwise infer the task folder from the session. If ambiguous, ask which task to compact.

## When to run

Run if `MEMORY.md` exceeds the size budget - rule of thumb **~250 lines or ~12 KB**, or whenever loading it visibly crowds the session. If it is under budget, say so and stop; premature sealing loses detail for no gain.

## Algorithm

1. **Read** the whole `MEMORY.md`. Identify the newest ~1/3 of dated entries (by date) - these stay **raw** (L0), untouched. Keep the `Current status` line as-is.
2. **Triage the older two-thirds**, line by line:
   - *Still load-bearing* (a live constraint, an unresolved thread, a durable finding that still changes what you'd do): **seal** it - rewrite to one compressed clause.
   - *Noise* (resolved smoke runs, superseded numbers, day-to-day chatter, restated facts): **drop** it.
   - *Rationale for a decision*: do **not** copy it here - it belongs to `DECISIONS.md`; if it is missing there, flag that instead of sealing it.
3. **Write** the survivors into a `## Sealed (before <date>)` block placed just above `## File history`, grouped by period, a few lines each. If a `## Sealed` block already exists, fold its oldest content down a level (season -> one line per quarter) rather than nesting endlessly.
4. **Preserve links.** If a sealed fact is referenced by an open `TASKS.md` item or a `DECISIONS.md` block, keep it phrased so that reference still resolves.
5. **Never invent.** Sealing only compresses what is there; if you are unsure whether a line still matters, keep it live rather than guess it away.

## Report

```
Compacted <task name> MEMORY.md:
  before: 312 lines / 14.8 KB
  after:  176 lines / 7.9 KB
  sealed: 41 entries -> "Sealed (before 2026-06)" (9 lines)
  dropped: 22 resolved/noise entries
  kept live: newest 34 entries untouched
```

If nothing needed sealing (under budget, or everything still live), say exactly that. A truthful "still small enough" is a valid outcome.
