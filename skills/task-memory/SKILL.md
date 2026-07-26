---
name: task-memory
description: Rules and automatic maintenance for Memento task memory. Use when working inside a task folder that contains the 5-file memory set (CLAUDE.md, MEMORY.md, TASKS.md, DECISIONS.md, BRIEF.md), when a task crosses the folder threshold and needs a folder bootstrapped automatically (auto-init in an initialized workspace), when recording or revising decisions, when a session produced decisions/stakeholder statements/artifact changes and is wrapping up (run the sync), when a task's MEMORY.md outgrows its size budget (seal it), when the user asks how their tasks are doing (status overview), when a task is finished (close it), or when the user mentions task memory, memory sync, or decision history.
---

# Memento task-memory method

Eight rules that keep file-based task memory truthful across sessions, plus the maintenance operations the agent performs **automatically**. They were extracted from months of daily multi-stakeholder work; each rule exists because its absence caused a real failure (drifted statuses, lost decision rationale, duplicated facts).

The only command is `/memento:init`, and it is run **once per workspace** - it creates the `INDEX.md` registry and registers what already exists. From there everything is the agent's own duty: creating task folders when a task earns one, syncing, sealing, closing, status. Memory that waits for a command drifts.

## Rule 1: The threshold - not every task deserves a folder

Create a **full 5-file folder** (automatically - see "Auto-init" below) only if at least one holds:
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

## Rule 4: Sync discipline - the agent syncs, automatically

A ritual that depends on the user remembering it will be skipped exactly when the session was busiest. So the sync is not a command the user runs - it is a duty the agent performs.

**Track drift triggers during the session.** Any one of them means memory has drifted:

- a **decision** was made, revised or rejected (Rule 3 material);
- a **stakeholder statement** arrived - a quote, a requirement, a constraint;
- an **artifact changed** - script, spec, migration, PR;
- a **phase moved** - blocked, unblocked, completed, reopened;
- **new evidence** appeared - log, screenshot, measurement, test result;
- the user stated a **standing preference** (Rule 8 `feedback_*` material);
- an earlier belief turned out to be **wrong** (Rule 6 lens material).

**When at least one fired** and the conversation reaches a natural boundary - the task is wrapped up, the user shifts to another topic, or says something like "that's it for today" - run the sync (see "The sync" below) and report what was written. Do not ask permission for routine drift: recording what happened is the whole point of the system. Announce, don't request:

> Syncing task memory: decision revised (D4 -> D4.1), Jane's deploy-window confirmation logged, 2 checkboxes updated.

If the user objects, revert and respect it for the rest of the session - a declined sync is a valid outcome. **If nothing fired, do nothing silently**: a session of pure question-answering needs no sync, and touching files anyway erodes trust in the log. Purely informational sessions, quick lookups and aborted experiments do **not** count as triggers.

## Rule 5: Compaction - seal the log, don't grow it forever

`MEMORY.md` is append-only by Rule 4, so it grows every session until it no longer fits the context window it was meant to save. A memory file too big to load is the same failure as no memory at all. Bound it by **sealing**, never by silent deletion.

When `MEMORY.md` crosses a size budget (rule of thumb: **~250 lines or ~12 KB**, or the moment loading it starts to crowd the session), compact the **oldest** material:

- **Seal, don't delete.** Collapse the oldest dated entries into a `## Sealed (before <date>)` block near the bottom (just above `File history`): a few lines per period that keep only facts *still load-bearing today*. Decision rationale already lives in `DECISIONS.md`, so here you keep durable findings, live constraints, and still-open threads.
- **Drop the noise, not the signal.** Resolved smoke runs, superseded numbers, day-to-day chatter - gone. Litmus: *"compressed to one clause, does the task still make sense next month?"* Yes -> seal it. Already irrelevant -> drop it. Still drives what you'd do today -> leave it live, don't seal.
- **Never seal `CLAUDE.md` or `DECISIONS.md`.** The charter is already current-state-only; decisions are never deleted (Rule 3). Compaction touches `MEMORY.md` alone.
- **Levels, not a wipe.** Recent sessions stay raw (L0). The first seal rolls a season into a paragraph (L1); when sealed blocks themselves pile up, fold the oldest into one line per quarter (L2). A reader can still reconstruct "what did we know, and when" at every level.

**Dedup on append (the companion discipline).** Rule 2 catches the same fact living in two *files*; this catches it living twice in the *same* file. Before appending a dated entry, scan the target section for a line making the same claim. If found, update that line's date/detail in place instead of adding a near-duplicate - a log that says the same thing five times is how the real update gets buried (the exact failure that bloated one category to 184 records, half of them restatements).

Compaction runs automatically as the last step of the sync whenever the budget is crossed (see "The sync"). Under budget - skip; premature sealing loses detail for no gain.

## Rule 6: Correction lenses - never rewrite history, refract it

Rule 3 protects *decisions* from being overwritten. Facts need the same protection. When you discover that past entries were factually wrong - a wrong person attributed, a wrong place, a wrong assumption - the instinct is to edit them. Don't. You lose the record of what you believed and when, and you will miss occurrences scattered across files.

Instead put a **correction lens** at the top of `MEMORY.md`, in a section read *before* any older entry:

```markdown
## CORRECTION LENSES (read before any older entry)

- **LENS 1 (2026-05-12) - role attribution.** Before this date the role
  "backend developer / deploys to prod" was wrongly attributed to the CEO.
  Any earlier entry saying "CEO deploys / CEO owns the API" must be read as:
  API decisions went through the CEO for approval, the implementer was the
  backend engineer.
```

**Why it works:** history stays auditable ("on the 19th we believed X"), while every future read is corrected automatically. One lens fixes dozens of scattered entries without touching them.

Write a lens instead of an edit when: the wrong fact appears in more than one place, or the error changes the interpretation of a whole period rather than one line, or the old belief itself explains decisions made back then. Straight edits remain fine for typos and single-line fixes.

**Companion for volatile state:** keep a `## CURRENT PHASE` block right under the lenses, refreshed whenever the situation flips. An agent reading a month-old log will otherwise reason from a stale frame - the files can be perfectly correct while the *reading frame* is not.

## Rule 7: Status glyphs - state visible at a glance

Prefix sections and entries with a one-character status. Reading a 30 KB memory file to learn what is hot right now defeats the purpose of memory.

```
active/burning · waiting on a condition · in progress, calm · closed
(pick a 4-glyph set and put the legend in the file header)
```

Apply to `TASKS.md` section headers, `MEMORY.md` dated entries, and workspace `INDEX.md` rows. This is triage, not decoration: it lets a human and an agent scan a long file in one pass, and it surfaces drift - a "burning" marker three months old is itself a signal.

## Rule 8: Session auto-memory - atomic facts, not one growing file

Sync step 7 says "session auto-memory, if the environment has one" without saying how. The shape that survives months of use:

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

Types that emerge in practice: `feedback_*` (corrections and standing preferences), `project_*` (active work: goal, state, next step), `reference_*` (stable lookups: where credentials live, contracts, calculation recipes), `user_*` (who the person is).

Keep an index `MEMORY.md` in the same directory - grouped by glyph, one line per file with a *why it matters* clause, so retrieval is decidable without opening everything.

**Why atomic beats monolithic:** the index carries the map and only the relevant file is loaded; a single fact can be revised without rewriting a large file; the frontmatter `description` is what makes retrieval decidable. A workspace running this shape accumulated ~50 such files over months with no maintenance burden; the same content in one file would have become unreadable long before that.

**Division of labour:** folder files (`CLAUDE.md`, `MEMORY.md`, ...) hold *task* memory, synced by the Rule 4 ritual. Auto-memory holds *cross-task* memory - rules of engagement, stable references, who the user is - and accretes continuously as such facts surface.

---

# Automatic operations

The rules above say *why*; this section says *how*. All five operations are performed by the agent on its own initiative - no commands.

## Auto-init (Rule 1 in action)

Once the workspace is initialized (`INDEX.md` exists at its root), the agent creates task folders itself. Triggers:

- the current work **crosses the Rule 1 threshold** and has no task folder yet;
- a folder of **raw materials without the 5 memory files** is being worked in.

When a trigger fires, announce and do - same policy as the sync:

> This task crosses the folder threshold (release artifact + 3 stakeholders). Bootstrapping `checkout-latency-bug/` in the workspace.

Then follow the **Task bootstrap procedure** from the plugin's `commands/init.md` (read that file for the full discipline): classify and read all materials including every image, extract dated stakeholder quotes and evidence with explicit keep/mention/skip decisions, fill the 5 templates from `${CLAUDE_PLUGIN_ROOT}/templates/`, never invent facts - gaps become open questions - and register the folder in `INDEX.md` in the same operation. If there are no materials yet, bootstrap from session context: what is known so far goes in, everything unknown becomes an open question.

Guardrails: if the workspace has **no `INDEX.md`**, do not silently create structure - suggest running `/memento:init` once instead. If the threshold call is genuinely borderline, ask ("full folder, or just a note?" - Rule 1). Name the folder plainly after the task; the user can rename it later.

## The sync (Rule 4 in action)

Runs at a natural session boundary when at least one drift trigger fired. Fixed order - each file feeds the next:

0. **Lenses first.** If an earlier belief was proven wrong this session, write a correction lens (Rule 6) instead of editing history; refresh `## CURRENT PHASE`.
1. **`MEMORY.md`** - append dated entries for everything new: stakeholder statements (who / when / verbatim), technical findings, new evidence cases. Update the "Current status" line with today's date. **Dedup on append** (Rule 5): update an existing line in place rather than writing a near-duplicate.
2. **`DECISIONS.md`** - revised decisions get a `D<N>.<M>` block (never delete the original); new decisions get the next `D<N>`.
3. **`CLAUDE.md`** - only if scope or stable anchors changed: rewrite the affected charter sections to the *current* state. Most sessions this file is untouched.
4. **`TASKS.md`** - check off completed items; mark invalidated checkboxes `(obsolete, see D<N>.<M>)`; add new items and blockers.
5. **`<workspace_root>/INDEX.md`** - fix the task's one-line status if it no longer reflects reality; add a Timeline line for significant events.
6. **Session auto-memory** (if the environment has one) - update the task's project note (status + date); write any new `feedback_*`/`reference_*` facts that surfaced (Rule 8).
7. **Compaction check** (Rule 5) - if `MEMORY.md` now exceeds ~250 lines / ~12 KB, seal the oldest entries. Under budget - skip.

Finish with a compact diff-style report:

```
Synced <task name>:
  MEMORY.md    +2 facts, +1 case, 1 dup merged, status line updated
  DECISIONS.md +D3.1 (revision of D3)
  CLAUDE.md    untouched (no scope change)
  TASKS.md     2 checked, 1 marked obsolete, +1 blocker
  INDEX.md     status line updated
  Compaction   under budget, skipped
```

Registration is atomic: a new task folder that is not in `INDEX.md` within the same operation will be forgotten - write the charter and the index row back to back.

## Sealing an oversized log (Rule 5 in action)

Normally happens inside sync step 7. For a **large** seal (the file is far over budget and triage will take real work), tell the user what you are about to do first - a seal rewrites the shape of the log, and scale deserves a heads-up:

1. Read the whole `MEMORY.md`. The newest ~1/3 of dated entries stays raw (L0); keep the "Current status" line as-is.
2. Triage the older two-thirds line by line: still load-bearing -> compress to one clause and seal; noise -> drop; decision rationale -> belongs in `DECISIONS.md`, flag if missing there.
3. Write survivors into `## Sealed (before <date>)` just above `File history`, grouped by period. Fold pre-existing sealed blocks down a level (L1 -> L2) rather than nesting.
4. Preserve links: if a sealed fact is referenced by an open `TASKS.md` item or a `DECISIONS.md` block, keep it phrased so the reference still resolves.
5. Never invent; unsure whether a line still matters -> keep it live.

Report numbers: lines/KB before and after, how many entries sealed, dropped, kept raw.

## Closing a finished task

When the session establishes that a task is done (artifact delivered, user confirms the outcome), close it - but closing is semantic, so **confirm first**: "Closing <task> - final outcome: <one-liner>. Correct?" Check `TASKS.md` for unchecked items and open blockers; never close silently over them - list them and ask whether they become "won't do" (record why) or the task stays active.

Then: prepend `**Completed <date>:** <outcome>` to MEMORY.md "Current status"; set the TASKS.md status header to Completed; record a final D-block if the close itself reflects a decision; move the INDEX.md row from Active to Completed with a link to the final artifact; add a Timeline line; update the auto-memory project note. The folder stays where it is - closed task folders are the long-term archive. Delete nothing.

## Status overview

When the user asks how their tasks are doing ("where are my tasks", "what's active", "what did we park"), answer from the files - read-only, modify nothing:

1. Read `INDEX.md` Active rows; for each, read the top of the task's `MEMORY.md` (Current status + date) and `TASKS.md` (phase, unchecked items, blockers).
2. Compute staleness: days since the most recent dated entry.
3. Warn about: **stale memory** (active task, no entries for 7+ days - suggest a sync or parking), **index drift** (INDEX.md contradicts the task's own status - quote both), **missing files** (an active folder lacking one of the 5 - suggest `/memento:init` to repair).

One block per task (status, phase, blockers, warnings), one-line verdict at the end: how many healthy / stale / drifted.
