---
name: task-memory
description: Rules and automatic maintenance for Memento task memory. Use when working inside a task folder that contains the 5-file memory set (CLAUDE.md, MEMORY.md, TASKS.md, DECISIONS.md, BRIEF.md), when a task crosses the folder threshold and needs a folder bootstrapped automatically (auto-init in an initialized workspace), when recording or revising decisions, when a session produced decisions/stakeholder statements/artifact changes and is wrapping up (run the sync), when new information combined with recorded memory yields an insight - a contradiction, an answered question, a pattern, an implication, a cross-task link (record it), when a task's MEMORY.md outgrows its size budget (seal it), when the user asks how their tasks are doing (status overview), when unverified insights accumulate and outside observer models should verify them (observer pass), when a task is finished (close it), or when the user mentions task memory, memory sync, or decision history.
---

# Memento task-memory method

Ten rules that keep file-based task memory truthful across sessions, plus the maintenance operations the agent performs **automatically**. They were extracted from months of daily multi-stakeholder work; each rule exists because its absence caused a real failure (drifted statuses, lost decision rationale, duplicated facts).

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

**Dead-end check - refuted memory must be consulted, not just kept.** Before recording a new decision, plan, or approach, scan the stored dead ends: `Insights/` files with `status: refuted`, and won't-do items in the relevant tasks' `TASKS.md`. State the result explicitly - either "no known dead ends touch this" or which ones do and why the new plan differs. Storage without retrieval is decoration: the whole point of keeping refuted insights is to prevent exactly this rollback, and a list nobody reads prevents nothing.

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

**Write-immediately tier - long sessions must not starve memory.** The boundary sync is a *sweep*, not the only channel. High-value material is written **the moment it lands**, without waiting for any boundary: a decision made or revised (D-block), a correction lens (Rule 6), a standing preference or durable fact for session auto-memory (Rule 8 - it accretes continuously by design). In a session that runs for days, "at the end of the session" means **never** - deferring all writes to the boundary is exactly how weeks of work stay unrecorded (observed in the field: a two-week session where memory only moved when the user asked). The boundary sync then reconciles the files and catches whatever slipped.

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

## Rule 9: Insight synthesis - stored facts must talk to each other

A memory that only accumulates entries is an archive, not a memory. An **insight** is a conclusion that follows from combining *new* information with something *already recorded* - and that nobody has written down yet. The search space is all of existing memory: this task's log and decisions, the other active tasks in `INDEX.md`, and cross-task auto-memory. Look for five shapes:

- **Contradiction** - a new fact contradicts a recorded one. Decide which is right: wrong history gets a correction lens (Rule 6); genuinely unresolved goes to "Open questions" naming both sides.
- **Answered question** - the new information resolves an entry in "Open questions": record the answer next to it and close it. An open question that stays open after its answer arrived is drift.
- **Pattern** - the same failure, behaviour or request appears for the 2nd-3rd time, in this log or across tasks: generalize it - a charter constraint, or an auto-memory `feedback_*`/`reference_*` fact (Rule 8).
- **Implication** - new fact + existing constraint = a consequence that changes the plan and is written nowhere: a deadline collision, an invalidated approach, a merge risk between two tasks touching the same artifact.
- **Cross-task link** - the fact involves an entity central to another active task (same person, system, table, prompt, deadline - check the `INDEX.md` rows): leave a dated pointer in that task's `MEMORY.md` too, so the insight is found from both ends.

**When to search - two tiers.** The shapes have different costs, and connections need critical mass:

- **Reactive, at append time** - *contradiction* and *answered question*. These are direct matches against the section you are already scanning for dedup (Rule 5); they jump out the moment the entry is written and are never postponed - a fact that contradicts memory, or answers a recorded question, must not sit unprocessed.
- **Batch synthesis, on accumulation** - *pattern*, *implication*, *cross-task link*. Run this pass only when enough new material has piled up since the last one: rule of thumb **~7+ new dated entries or ~2 KB of new log material**, or a **phase boundary** (a phase completed, a decision landed). Track it with a `_Last insight pass: <date>_` marker line in the Insights section - everything dated after the marker is unprocessed material. Below the threshold, skip silently: synthesis over two facts produces noise, and rereading the whole memory for every new line is waste, not diligence. When the pass runs, update the marker.

**Recording - one insight = one dated file.** Every insight is saved to the workspace-level `Insights/` folder as `Insights/YYYY-MM-DD-<slug>.md`:

```markdown
---
date: 2026-07-26
title: Deploy window collides with the freeze
tasks: [checkout-latency-bug, platform-migration]
status: hypothesis   # hypothesis | interpretation | verified by <model> <date> | confirmed <date> | refuted <date>
falsifier: the freeze calendar shows the window outside the frozen range
depends_on:
  - Jane named 12.08 as the window (26.07)
  - the freeze runs 10.08-20.08 (charter, platform-migration)
sources:
  - checkout-latency-bug/MEMORY.md - Jane's window fact (26.07)
  - platform-migration/CLAUDE.md - release freeze section
---

Jane's deploy window (26.07) falls inside the release freeze recorded in
platform-migration. One of the two must move.
```

The task's `MEMORY.md` `## Insights` section gets the short dated pointer line:

```markdown
## Insights (derived - verify before acting on)

- 💡 **2026-07-26** - deploy window collides with the freeze ->
  [Insights/2026-07-26-deploy-window-freeze.md](../Insights/2026-07-26-deploy-window-freeze.md) (hypothesis)
```

A **cross-task** insight lives as one file; every involved task's log gets its own pointer line - found from all ends, stored once. When an insight's status changes (confirmed, refuted), update the file's `status` field with a date and the pointer lines; never delete the file - a refuted insight documents a dead end, which is also memory. If the `Insights/` folder does not exist yet, create it on the first insight.

**Two fields make a hypothesis checkable - `falsifier` and `depends_on`.** A conclusion with no stated way to die is not a hypothesis, it is an opinion wearing a status field, and it will quietly harden into an assumption nobody revisits.

- **`falsifier`** names the *recognizable fact* that would kill it: a line in a log, a value in a field, the result of a run, a sentence from a stakeholder. "Further investigation shows otherwise" is not a falsifier - it names no observation.
- **`depends_on`** lists the facts it stands on. This is what makes memory reactive instead of archival: when a new fact lands, check it against the `depends_on` of live hypotheses and update their statuses **immediately**, in the same session. A hypothesis whose foundation was refuted three weeks ago and still reads `hypothesis` is worse than no memory - it is a confident wrong answer waiting to be quoted.
- **If no falsifier can be named, it is not a hypothesis** - it is an *interpretation*: a way of reading the facts that no observation distinguishes from its alternatives. Record it as `status: interpretation` and never let a decision rest on it. Interpretations are not worthless - they are how understanding starts - but they must be labelled, because the failure mode is silent promotion: an interpretation that sits in memory long enough starts getting cited as a finding.

A refuted hypothesis is never deleted (Rule 3's logic applies to claims too): `status: refuted <date>` plus what killed it. The store of dead ends is the thing that stops a future session from re-proposing an option that was already tried and rejected.

Guardrails - what keeps this signal, not noise:
- an insight must cite **at least two sources** (that is the definition - a restated single fact is not an insight);
- record only **actionable** insights - ones that would change a decision, a plan or a risk assessment; interesting-but-inert observations stay unwritten;
- an insight is a **hypothesis until verified** - never silently promote it to fact; and the author never verifies their own hypothesis (Rule 10): promotion requires a real-world fact or an outside observer's verdict. When confirmed, update its status with a date, and only then may it feed a decision block or a charter edit;
- dedup against existing insights before appending (Rule 5 discipline applies);
- **zero insights is a valid outcome** - most syncs will find none, and a forced insight is worse than silence.

## Rule 10: Outside observers - the author never grades their own work

The agent that maintains the memory has correlated blind spots: it tends to confirm its own hypotheses, reads the files through the lens of what it did today, and its errors are systematic, not random. A different model errs *differently* - so verification comes from outside. **Outside observers** are independent models, connected periodically, that read the memory cold and report on it.

Principles:

- **The observer is cold.** It sees no sessions, no chat - only the memory files. Double duty: an independent verdict, plus a live test of memory quality (if a cold model cannot reconstruct the task from the files, the memory has failed its core purpose).
- **Read-only.** An observer writes nothing into the memory - only a report. Triaging the report and editing the files is the main agent's job, under the usual rules (lenses, D-blocks, statuses).
- **Diversity over repetition.** Different model families err differently; three models one pass each beat one model three passes. And repeated review cycles on the same material hit diminishing returns after the second - observation is periodic, not a convergence loop.
- **No self-confirmation.** `hypothesis -> confirmed` requires a real-world fact or an observer's verdict; the insight's author cannot promote it alone. An observer's verdict is recorded as `verified by <model>, <date>`.
- **Disagreement is a record, not a discard.** If the main agent disagrees with a verdict, both positions go into the insight file and the user decides. Silently dropping a verdict is forbidden.

Four mandates - different lenses, not one "check everything":

| Mandate | What it does | Input |
|---|---|---|
| **Insight verifier** | Each hypothesis: confirm / refute / insufficient evidence, strictly against the sources cited in the file | `Insights/*.md` + cited sources |
| **Sapper** | Finds mines planted under decisions: which active D-blocks rest on assumptions that are outdated, contradicted by newer facts, or were never proven | `DECISIONS.md` + logs |
| **Pattern scout** | Cross-task links and patterns the main agent missed - a fresh read of the whole board | `INDEX.md` + active task logs |
| **Memory auditor** | Contradictions between files, stale statuses, duplicates, broken pointers | the whole structure |

**Verification tiers - graduated by stakes.** A single observer's verdict is proportionate for ordinary insights; for claims that decisions ride on, one model's vote is a thin gate - verifier models err too. Two tiers:

- **Single verdict (default):** one model from the pool verifies; recorded as `verified by <model>, <date>`.
- **Panel vote (high stakes):** triggered when the claim touches a **release artifact**, **contradicts a stakeholder statement**, or would **revise a decision** (D-block). Every model in the pool gets the same verification brief, each through a *different lens* - correctness of the cited sources / the strongest alternative explanation / consequence check ("if this is true, what follows and does that hold?"). Majority decides; a tie escalates to the user. Recorded with the dissent named, never averaged away: `verified by 2/3 panel (gpt, grok), <date>; dissent: gemini - <one-line reason>`.

Diverse lenses beat identical refuters: models fail differently, so coverage compounds.

Reports land in `<workspace_root>/Observers/` as `YYYY-MM-DD-<model>-<mandate>.md` and are never deleted - they are the audit history.

**Memory health score.** Every observer report ends with a mandatory short **Memory quality** section: could the task be reconstructed from the files alone; what was missing; a **0-10 score**. The cold read is a standing test of the memory itself, and the score turns that side effect into a tracked signal - the latest score per task surfaces in the status overview, and a task cannot close over a low score without a repair pass. If the scores are low, the memory is failing at its one job, whatever the task status says.

Besides the scheduled passes, the panel is available on demand via `/memento:observers <question>` - ad-hoc multi-model analysis of any question, with the same pool, storage and trust rules.

Observers run automatically - see "Observer pass" in Automatic operations.

**Observers are not the only outside view, and not the right one for every question.** They verify what is already written, cold and after the fact. When the question is "what breaks if we do this?" and the answer spans several areas at once, the tool is a **consilium** - parallel in-session agents, each on a different lens, plus a mandatory skeptic whose job is to find the prior rejection. Verification after versus perspective before; the consilium skill fires on its own when the situation matches.

## Rule 11: Checkpoint long operations - the session can die mid-way

Some work does not fit in one turn and is expensive to lose: a bulk edit across many files or locales, an evaluation run, a data load, a sweep audit, a release package. Context runs out, a tool times out, a machine reboots - and the next session inherits no idea whether step 4 of 9 finished.

Before starting such an operation, write `<workspace_root>/CHECKPOINT.yml`, and update it **after each step** - not at the end, which is precisely the moment that never arrives:

```yaml
operation: rebuild prompt locale set
task: prompt-restructuring
status: active          # active | done | abandoned <date + why>
started: 2026-08-05
steps:
  - [x] dump current state to backup
  - [x] build replacement for 6 RU rows
  - [ ] verify fragments match before applying   # <- next
  - [ ] apply and restart the service
notes: source dump is dumps/prod/2026-08-05.sql; guard clause makes re-runs safe
```

Two rules keep it honest. **At session start, if the file is `active`, say so before anything else** - name the operation, the step it stopped on, and offer to continue. A checkpoint nobody reads is a diary entry. And **finish it**: `status: done` on completion, or `abandoned` with a reason. An `active` checkpoint from three weeks ago trains the reader to ignore the file, which costs more than never having it.

Do not checkpoint ordinary work. If losing the operation would mean redoing under ten minutes, the file is ceremony.

---

# Automatic operations

The rules above say *why*; this section says *how*. All six operations are performed by the agent on its own initiative - no commands.

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
2. **Insight pass** (Rule 9) - the reactive shapes (contradiction, answered question) were already handled at append time in step 1. The synthesis shapes (pattern, implication, cross-task link) run only if enough new material accumulated since the `_Last insight pass_` marker (~7+ new dated entries / ~2 KB, or a phase boundary) - below that, skip silently. When it runs: each finding -> a dated file in `<workspace_root>/Insights/` + a pointer line in `## Insights` of every involved task (Rule 9 format); update the marker. Zero findings - update the marker and move on.
3. **`DECISIONS.md`** - revised decisions get a `D<N>.<M>` block (never delete the original); new decisions get the next `D<N>`. Every new or revised decision gets the **dead-end check** (Rule 3): scan refuted insights and won't-do items, state the result.
4. **`CLAUDE.md`** - only if scope or stable anchors changed: rewrite the affected charter sections to the *current* state. Most sessions this file is untouched.
5. **`TASKS.md`** - check off completed items; mark invalidated checkboxes `(obsolete, see D<N>.<M>)`; add new items and blockers.
6. **`<workspace_root>/INDEX.md`** - fix the task's one-line status if it no longer reflects reality; add a Timeline line for significant events.
7. **Session auto-memory** (if the environment has one) - update the task's project note (status + date); write any new `feedback_*`/`reference_*` facts that surfaced (Rule 8).
8. **Compaction check** (Rule 5) - if `MEMORY.md` now exceeds ~250 lines / ~12 KB, seal the oldest entries. Under budget - skip.

Finish with a compact diff-style report:

```
Synced <task name>:
  MEMORY.md    +2 facts, +1 case, 1 dup merged, status line updated
  Insights     +1: deploy window collides with the freeze (hypothesis)
  DECISIONS.md +D3.1 (revision of D3)
  Dead-ends    checked for D3.1: none touch it
  CLAUDE.md    untouched (no scope change)
  TASKS.md     2 checked, 1 marked obsolete, +1 blocker
  INDEX.md     status line updated
  Compaction   under budget, skipped
```

Registration is atomic: a new task folder that is not in `INDEX.md` within the same operation will be forgotten - write the charter and the index row back to back.

## Sealing an oversized log (Rule 5 in action)

Normally happens inside sync step 8. For a **large** seal (the file is far over budget and triage will take real work), tell the user what you are about to do first - a seal rewrites the shape of the log, and scale deserves a heads-up:

1. Read the whole `MEMORY.md`. The newest ~1/3 of dated entries stays raw (L0); keep the "Current status" line as-is.
2. Triage the older two-thirds line by line: still load-bearing -> compress to one clause and seal; noise -> drop; decision rationale -> belongs in `DECISIONS.md`, flag if missing there.
3. Write survivors into `## Sealed (before <date>)` just above `File history`, grouped by period. Fold pre-existing sealed blocks down a level (L1 -> L2) rather than nesting.
4. Preserve links: if a sealed fact is referenced by an open `TASKS.md` item or a `DECISIONS.md` block, keep it phrased so the reference still resolves.
5. Never invent; unsure whether a line still matters -> keep it live.

Report numbers: lines/KB before and after, how many entries sealed, dropped, kept raw.

## Closing a finished task

When the session establishes that a task is done (artifact delivered, user confirms the outcome), close it - but closing is semantic, so **confirm first**: "Closing <task> - final outcome: <one-liner>. Correct?" Check `TASKS.md` for unchecked items and open blockers; never close silently over them - list them and ask whether they become "won't do" (record why) or the task stays active.

Also check the task's latest **memory health score** (Rule 10): if it is <=5 or the observer named concrete gaps, run one repair pass on the files (fill the gaps, fix the reading order) before archiving - the archive is only worth keeping if a future reader can use it.

Then: prepend `**Completed <date>:** <outcome>` to MEMORY.md "Current status"; set the TASKS.md status header to Completed; record a final D-block if the close itself reflects a decision; move the INDEX.md row from Active to Completed with a link to the final artifact; add a Timeline line; update the auto-memory project note. The folder stays where it is - closed task folders are the long-term archive. Delete nothing.

## Observer pass (Rule 10 in action)

Runs **automatically** when a trigger fires - no user confirmation needed:

- **3+ unverified insights** have accumulated (`status: hypothesis` across `Insights/`);
- a **release artifact is about to be handed off** or a major decision is about to be recorded;
- a **task is being closed** (final audit before the archive);
- the user asks for it.

Mechanics (external models over the OpenRouter API):

1. **Key and models.** The API key comes from the `OPENROUTER_API_KEY` environment variable - **never stored in any file**. The model list lives in `<workspace_root>/Observers/CONFIG.md` (aim for 2-3 models from *different families*). No key or no config -> skip with a one-line note; never block the sync on an unavailable observer.
2. **Per mandate, one request.** Pack the mandate's instruction plus its input files (see the Rule 10 table) into a single prompt and POST it to `https://openrouter.ai/api/v1/chat/completions` (header `Authorization: Bearer $OPENROUTER_API_KEY`, body `{"model": "<from CONFIG>", "messages": [...]}`). The observer gets files only - no session context, no summaries of "what we did": the files must speak for themselves.
3. **Save the raw report** to `Observers/YYYY-MM-DD-<model>-<mandate>.md` verbatim, before any triage. Reports are never deleted.
4. **Triage** (main agent): update insight statuses (`verified by <model>, <date>` / refuted with the reason), open questions for "insufficient evidence" verdicts, record disagreements in the insight file (both positions) and surface them to the user. Sapper findings that invalidate a decision's premise -> a `D<N>.<M>` revision proposal, never a silent edit.
5. **Report to the user** in one block: which mandates ran, on which models, verdict counts (confirmed / refuted / insufficient), the memory health scores, and anything escalated.

**Tier selection** (Rule 10): before sending a verification brief, check the stakes. Ordinary insight -> one model (rotate through the pool). Claim touching a release artifact / contradicting a stakeholder statement / revising a D-block -> **panel vote**: same brief to every pool model, each with its assigned lens (sources / alternative explanation / consequences), majority decides, tie escalates, dissent recorded by name.

Rotate mandates by need, not all four every time: insight verification runs on the insight trigger; Sapper - before major decisions and closes; pattern scout and memory auditor - on the calendar (an active workspace deserves a pass every week or two).

## Status overview

When the user asks how their tasks are doing ("where are my tasks", "what's active", "what did we park"), answer from the files - read-only, modify nothing:

1. Read `INDEX.md` Active rows; for each, read the top of the task's `MEMORY.md` (Current status + date) and `TASKS.md` (phase, unchecked items, blockers).
2. Compute staleness: days since the most recent dated entry.
3. Read the latest observer report for the task (if any) and pick up its **memory health score** (Rule 10).
4. Warn about: **stale memory** (active task, no entries for 7+ days - suggest a sync or parking), **index drift** (INDEX.md contradicts the task's own status - quote both), **missing files** (an active folder lacking one of the 5 - suggest `/memento:init` to repair), **low or dropping memory health** (score <=5, or lower than the previous report - name the gap the observer cited).

One block per task (status, phase, blockers, memory health, warnings), one-line verdict at the end: how many healthy / stale / drifted.
