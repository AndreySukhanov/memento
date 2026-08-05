---
name: task-memory
description: Rules and automatic maintenance for Memento task memory. Use when working inside a task folder that contains the 5-file memory set (CLAUDE.md, MEMORY.md, TASKS.md, DECISIONS.md, BRIEF.md), when a task crosses the folder threshold and needs a folder bootstrapped automatically (auto-init in an initialized workspace), when recording or revising decisions, when a session produced decisions/stakeholder statements/artifact changes and is wrapping up (run the sync), when new information combined with recorded memory yields an insight - a contradiction, an answered question, a pattern, an implication, a cross-task link (record it), when a task's MEMORY.md outgrows its size budget (seal it), when the user asks how their tasks are doing (status overview), when unverified insights accumulate and outside observer models should verify them (observer pass), when a task is finished (close it), or when the user mentions task memory, memory sync, or decision history.
---

# Memento task-memory method

Eleven rules that keep file-based task memory truthful across sessions, plus the maintenance operations the agent performs **automatically**. Each rule exists because its absence caused a real failure - drifted statuses, lost rationale, an accidental rollback to a rejected design.

The only command is `/memento:init`, run **once per workspace**. From there everything is the agent's own duty: creating task folders when a task earns one, syncing, sealing, closing, status. Memory that waits for a command drifts.

**Three files, three jobs.** This one states the obligations: trigger, action, what gets recorded. Every required *shape* - frontmatter fields, status vocabulary, block formats - lives in [`docs/SCHEMA.md`](../../docs/SCHEMA.md) and is not repeated here. The reasoning behind the rules, and the failures they came from, is in [`docs/RATIONALE.md`](../../docs/RATIONALE.md); read it when a rule seems arbitrary, not while executing one.

---

## Rule 1: The threshold - not every task deserves a folder

**Trigger.** A piece of work is starting and has no task folder.

**Action.** Create a full 5-file folder (see *Auto-init*) if **any** of these holds:
- more than one working day of work;
- more than two stakeholders in different roles;
- a release artifact is required (migration script, spec, PR);
- more than two sequential phases (research -> alignment -> implementation -> verification -> release).

Otherwise a one-line note in the workspace index is enough.

**Exception.** Genuinely borderline - ask: "full folder, or just a note?"

## Rule 2: File roles - stable vs volatile

**Trigger.** Any fact is about to be written into a task folder.

**Action.** Route it by litmus test: *"Can I delete this in a week without losing meaning?"* -> `MEMORY.md`. *"Is it valid until the scope changes?"* -> `CLAUDE.md`. The charter holds scope, environments, stable IDs, stakeholder roles; the log holds dated facts with sources.

**Record.** Same fact found in both files -> migrate it to the correct one immediately, in the same edit. Overlap is how updates get missed.

*(The charter is named `CLAUDE.md` deliberately: Claude Code auto-loads it inside the folder, so the task context enters the model for free.)*

## Rule 3: Decisions are never deleted, only revised

**Trigger.** A decision is made or changes - and equally, **a plan or an approach is about to be recorded**. The dead-end check is owed by all three; only a decision also gets a D-block.

**Action.**
1. New decision -> the next `D<N>`. Changed decision -> a new `D<N>.<M>` block; the original is neither edited nor removed. A revision states why, **with the stakeholder quote if there was one**, and what happens to artifacts built under the old decision.
2. **Dead-end check before writing it:** grep `Insights/` for `status: refuted` and the relevant `TASKS.md` won't-do items.
3. Propagate: mark invalidated `TASKS.md` checkboxes `(obsolete, see D<N>.<M>)`, add the replacements, rewrite affected `CLAUDE.md` sections to current state only.

**Record.** The D-block per [SCHEMA](../../docs/SCHEMA.md#decision-block), including a `dead_ends_checked:` line with the date. A plan or approach with no D-block records the same line under its `TASKS.md` entry.

That line names **how many refuted insights exist and how many were read**, then which ones touch this - `scanned 4 refuted, 1 relevant: Insights/...`, or `scanned 4 refuted, none touch this`. A bare `none found` is what an unrun check also produces: the folder's contents are countable, so state the count and the claim becomes checkable against them.

## Rule 4: Sync discipline - the agent syncs, automatically

**Trigger.** Any of these fired during the session:
- a decision was made, revised or rejected;
- a stakeholder statement arrived - quote, requirement, constraint;
- an artifact changed - script, spec, migration, PR;
- a phase moved - blocked, unblocked, completed, reopened;
- new evidence appeared - log, screenshot, measurement, test result;
- the user stated a standing preference;
- an earlier belief turned out to be wrong.

**Action.** At the next natural boundary - task wrapped up, topic shifted, "that's it for today" - run *The sync*. Announce, don't request:

> Syncing task memory: decision revised (D4 -> D4.1), Jane's deploy-window confirmation logged, 2 checkboxes updated.

**Write-immediately tier.** Three kinds do **not** wait for the boundary: a decision or revision (D-block), a correction lens, a standing preference or durable fact for auto-memory. In a session that runs for days, "at the end of the session" means never.

**Record.** The diff-style report ([SCHEMA](../../docs/SCHEMA.md#sync-report)). Nothing fired -> write nothing, and say so in one line: "no drift triggers fired, memory untouched".

**Exception.** The user objects -> revert and respect it for the rest of the session; a declined sync is a valid outcome. Informational sessions, quick lookups and aborted experiments are not triggers.

## Rule 5: Compaction - seal the log, don't grow it forever

**Trigger.** `MEMORY.md` crosses ~250 lines or ~12 KB - **or** loading it starts to crowd the session, which can happen earlier and is a trigger in its own right. Checked as the last content step of every sync.

**Action.** Compact the **oldest** material, never the newest:
- collapse old dated entries into `## Sealed (before <date>)` above `File history` - a few lines per period, keeping only what is still load-bearing;
- drop resolved noise (superseded numbers, finished smoke runs, chatter); litmus: *"compressed to one clause, does the task still make sense next month?"*. Three outcomes, not two: still load-bearing -> seal; already irrelevant -> drop; **still drives what you would do today -> leave it live and do not seal it**;
- levels, not a wipe: recent stays raw (L0), a season folds to a paragraph (L1), old sealed blocks fold to one line per quarter (L2);
- never seal `CLAUDE.md` or `DECISIONS.md` - the charter is already current-only, decisions are append-only.

**Dedup on append** (runs on every append, not only at the threshold): before adding a dated entry, scan the target section for a line making the same claim; found -> update that line's date and detail in place. Rule 2 catches a fact living in two files; this catches it living twice in one.

**Record.** Lines and KB before and after, entries sealed / dropped / kept raw. **Measure the file, do not estimate it** - the number goes in the report, so a guess becomes a false statement on the record rather than a harmless approximation.

**Exception.** Under budget -> skip and report the measured number. Premature sealing loses detail for no gain.

## Rule 6: Correction lenses - never rewrite history, refract it

**Trigger.** Past entries turn out to be factually wrong - wrong person, wrong place, wrong assumption.

**Action.** Write a **lens** at the top of `MEMORY.md` instead of editing the entries, when any holds: the wrong fact appears in more than one place; the error changes the reading of a whole period; the old belief itself explains decisions made back then. Straight edits stay fine for typos and single-line fixes.

**Record.** The lens block ([SCHEMA](../../docs/SCHEMA.md#correction-lens)), above every dated entry, containing an explicit *"any earlier entry saying X must be read as Y"* clause.

**Companion.** Keep `## CURRENT PHASE` right under the lenses, refreshed whenever the situation flips and always dated. Files can be perfectly correct while the reading frame is not.

**One `next:` line, rewritten every sync.** The last thing the sync does inside `CURRENT PHASE` is state the single most likely next action - what a fresh session should pick up first. Strictly one line, strictly overwritten, never a list: the files already say what happened, and this says where to re-enter. A stale `next:` is worse than none, so it is rewritten or deleted on every sync that touches the task - if the sync cannot name one, it deletes the line rather than leaving yesterday's.

## Rule 7: Status glyphs - state visible at a glance

**Trigger.** Writing a section header in `TASKS.md`, a dated entry in `MEMORY.md`, or a row in `INDEX.md`.

**Action.** Prefix it with one of four status glyphs; put the legend in the file header ([SCHEMA](../../docs/SCHEMA.md#status-glyphs)).

*This is triage, not decoration - and it surfaces drift on its own: a "burning" marker three months old is itself a finding.*

## Rule 8: Session auto-memory - atomic facts, not one growing file

**Trigger.** A fact surfaces that outlives the task: a standing preference, a stable reference, who the user is, the state of active work.

**Action.** Write **one fact = one file** in the session-memory directory, typed `feedback_*` / `project_*` / `reference_*` / `user_*`, and add its index row.

**Record.** Frontmatter and index row per [SCHEMA](../../docs/SCHEMA.md#auto-memory-file), the index **grouped by glyph** so the map stays scannable. The `description` field is the retrieval unit - it must make the file's relevance decidable without opening it.

**Division of labour.** Folder files hold *task* memory, synced by the Rule 4 ritual. Auto-memory holds *cross-task* memory and accretes continuously, in the write-immediately tier.

## Rule 9: Insight synthesis - stored facts must talk to each other

An **insight** is a conclusion that follows from combining *new* information with something *already recorded*, and that nobody has written down yet. The search space is this task's log and decisions, the other active tasks in `INDEX.md`, and cross-task auto-memory.

**Five shapes:**

| Shape | What it looks like | What to do |
|---|---|---|
| **Contradiction** | a new fact contradicts a recorded one | decide which is right; wrong history -> lens (Rule 6); unresolved -> open question naming both sides |
| **Answered question** | new information resolves an entry in Open questions | record the answer next to it and close it |
| **Pattern** | the same failure, behaviour or request for the 2nd-3rd time | generalize: a charter constraint, or an auto-memory `feedback_*`/`reference_*` fact |
| **Implication** | new fact + existing constraint = a consequence written nowhere | deadline collision, invalidated approach, merge risk between tasks on one artifact |
| **Cross-task link** | the fact involves an entity central to another active task | a dated pointer in that task's log too |

**Two tiers, because connections need critical mass:**

- **Reactive, at append time** - contradiction and answered question. Direct matches against the section already being scanned for dedup; never postponed.
- **Batch synthesis, on accumulation** - pattern, implication, cross-task link. Runs only past **~7 new dated entries / ~2 KB of new log**, or at a phase boundary - a phase completed, **a decision landed**. Below that, skip.

**Record.** One insight = one dated file in `Insights/` - create the folder if this is the first one - plus a pointer line in every task named in `tasks:` ([SCHEMA](../../docs/SCHEMA.md#insight-file)). Status changes update the file and every pointer line. Files are never deleted - a refuted insight documents a dead end, which is also memory.

**The marker moves only when the pass actually ran.** A pass that ran and found nothing writes `_Last insight pass: <date> (0 found)_`; a pass skipped below the threshold **leaves the marker where it is**, so the untouched gap between it and the newest entry keeps growing until the threshold is met. Stamping today's date on a skip is the one edit that destroys the marker's entire purpose: it makes "checked, nothing there" and "never looked" identical, and it resets the backlog that was supposed to accumulate into a trigger.

**Two fields make a hypothesis checkable.**
- **`falsifier`** - the recognizable fact that would kill it. A conclusion with no stated way to die is an opinion wearing a status field.
- **`depends_on`** - the facts it stands on. When a new fact lands, check it against the `depends_on` of live hypotheses and update their statuses **in the same session**. A hypothesis whose foundation was refuted three weeks ago and still reads `hypothesis` is a confident wrong answer waiting to be quoted.
- **No falsifier -> `status: interpretation`**, and no decision may rest on it. It has exactly two exits, one of which must eventually be taken: it becomes a hypothesis the moment a falsifier can be named (`hypothesis (was interpretation, <date>)`), or it is closed when its question stops mattering. A permanent `interpretation` is an unexamined belief with a badge.

**Guardrails.** At least two sources, or it is a restated fact and not an insight. Only actionable findings - ones that would change a decision, a plan or a risk assessment. Dedup before appending. **Zero insights is a valid outcome** - most syncs find none.

**An unverified insight may not carry weight.** A hypothesis is never silently promoted (Rule 10), and until its status says otherwise it **may not feed a D-block or a charter edit**. Only once it reads `confirmed` or `verified by ...`, with a date, may a decision rest on it. This is the whole mechanism against self-reinforcing error: without it the system quietly cites its own guesses back to itself as findings.

## Rule 10: Outside observers - the author never grades their own work

The agent maintaining the memory has correlated blind spots: it confirms its own hypotheses and reads the files through the lens of what it did today. A different model errs differently.

**Four constraints on every observer pass:**
- **cold** - files only, no session context, no summaries (this doubles as a live test: a cold model that cannot reconstruct the task means the memory failed its job);
- **read-only** - the observer produces a report, never an edit; triage is the main agent's job;
- **diverse** - three models one pass each beat one model three passes, and repeated cycles on the same material stop paying after the second;
- **no self-confirmation** - promotion out of `hypothesis` requires a real-world fact (-> `confirmed <date>`) or an observer's verdict (-> `verified by <model>, <date>`); the two are different statuses and neither is written by the author alone. A verdict of *insufficient evidence* promotes nothing: the insight stays `hypothesis` and an open question records what evidence is missing.

**Disagreement is a record, not a discard.** Main agent disagrees with a verdict -> both positions go into the insight file and the user decides.

**Four mandates:**

| Mandate | What it does | Input |
|---|---|---|
| **Insight verifier** | each hypothesis: confirm / refute / insufficient, strictly against the sources cited | `Insights/*.md` + cited sources |
| **Sapper** | finds mines under decisions: active D-blocks resting on assumptions outdated, contradicted or never proven | `DECISIONS.md` + logs |
| **Pattern scout** | cross-task links the main agent missed - a fresh read of the whole board | `INDEX.md` + active logs |
| **Memory auditor** | contradictions between files, stale statuses, duplicates, broken pointers | the whole structure |

**Two verification tiers, by stakes:**
- **single verdict (default)** - one model from the pool;
- **panel vote** - when the claim touches a release artifact, contradicts a stakeholder statement, or would revise a D-block. Same brief to every pool model, each with a *different lens*: correctness of the cited sources / strongest alternative explanation / consequence check. Majority decides, a tie escalates to the user, the dissent is recorded by name and never averaged away.

**Record.** Reports in `Observers/YYYY-MM-DD-<model>-<mandate>.md`, verbatim, never deleted. Every report ends with a **Memory quality** section answering all three: could the task be reconstructed from the files alone, what was missing, and a 0-10 score - which the status overview reads and a close cannot ignore ([SCHEMA](../../docs/SCHEMA.md#observer-report)).

**Not the only outside view.** Observers verify what is already written, cold and after the fact. When the question is "what breaks if we do this?" and the answer spans several areas at once, the tool is a **consilium** - parallel in-session agents, each on a lens, plus a mandatory skeptic looking for the prior rejection. Verification after versus perspective before; the consilium skill fires on its own. On demand, the panel is `/memento:observers <question>`.

## Rule 11: Checkpoint long operations - the session can die mid-way

**Trigger.** An operation that does not fit one turn and is expensive to lose: a bulk edit across files or locales, an eval run, a data load, a sweep audit, a release package.

**Action.** Write `<workspace_root>/CHECKPOINT.yml` **before step 1**, and update it **after each step** - not at the end, which is the moment that never arrives.

**At session start**, if the file is `active`, say so before anything else: the operation, the step it stopped on, an offer to continue. Then finish it - `done` on completion, `abandoned` with a reason otherwise.

**Staleness has a deadline.** An `active` checkpoint older than **7 days** stops being a mention and becomes a decision the session must force: continue now, or close it as `abandoned` with the reason. There is no third option; "still active, we'll get to it" is how the file dies.

**Record.** The YAML per [SCHEMA](../../docs/SCHEMA.md#checkpointyml), with exactly one `# <- next` marker while active.

**Exception.** If losing the operation costs under ten minutes of redoing, the file is ceremony.

---

## The verifiability test - applies to every rule above

An obligation is only real if **skipping it changes a byte on disk**. Everything else is honour-system: under load the model produces the sentence that says the duty was done, because saying it costs seven tokens and doing it costs a file read. Neither the user nor a later session can tell the two apart.

So when a rule asks for work, it must also ask for a trace:

- `_Last insight pass: <date>_` is the model to copy - it can be compared against the newest dated entry, so a skipped pass is visible afterwards.
- A check that finds nothing writes one line saying so, with a date. **Silence is not a report** - "ran it, all clean" and "never ran it" must not look identical.
- A scan whose only output is a sentence in the chat is not verifiable; move the result into the file the work was about.
- A threshold the agent has to eyeball will be estimated rather than counted. Where it matters, record the number that was used.

When adding a rule, ask what a later reader would find on disk if it had been quietly skipped for a month. If the answer is "nothing", the rule is decoration.

---

# Automatic operations

Eight operations, all performed on the agent's own initiative - no commands.

**Three invariants hold across all of them.**

**Content before pointer.** In any operation writing more than one file, the content goes first and the thing pointing at it goes last: the insight file before its pointer line, the task folder before its index row, the observer report before the status that cites it. Real atomicity is not available on plain files, so aim for the next best property - every interruption leaves a *recoverable* state. Stop after the content and you get an orphan the structure check finds; stop after the pointer and you get a reference into nothing.

**One ritual at a time.** While a sync runs, no other automatic operation starts - not an observer pass, not a consilium, not a background notification. They wait for the closing report. This failure needs no crash and no parallelism: the sync reaches the decision step, the decision step is itself an observer trigger, the pass writes to the same log, and the remaining steps happen only if the model remembers where it was. It usually does not.

**Announce in `OPS_LOG.md` before touching a file.** Every operation below opens a line in `<workspace_root>/OPS_LOG.md` *before* its first write, and closes it with the result when finished ([SCHEMA](../../docs/SCHEMA.md#ops_logmd)). Append-only, never edited, never reordered - it is a black box, not a status file.

**The ordering is the whole mechanism, and it is deliberately asymmetric.** Open first, and a session that dies mid-operation leaves an unterminated line: the next session sees exactly which operation stopped and which files it had reached. Forget to close, and you get a false alarm - which somebody notices. Close first (or write nothing until the end) and a death leaves no trace at all, which nobody notices. Fail loud beats fail silent, and that ordering carries most of the value here.

**What it does not do.** It cannot catch an operation that never announced itself: an agent that forgot the log entirely leaves the same nothing as before. This is not a guarantee of atomicity and does not replace *one ritual at a time* - it makes a broken ritual **findable**, which is the difference between a claim and evidence. The structure check stays the backstop for damage that was never announced.

**Bounding it.** `OPS_LOG.md` is the one file the method prunes. Past ~200 lines, delete the oldest *closed* pairs - a closed pair carries no information the sync report and the files themselves do not already carry. Unterminated lines are never pruned at any age; they are the only reason the file exists.

## Session start

**Trigger.** The first turn of work inside an initialized workspace.

**Action.** Two checks, both cheap, both **before** anything else is said about the task:

1. **`OPS_LOG.md` - any unterminated line?** An opening `>` with no matching `<` means a previous session died mid-operation. Name it, name the files it had reached, and run the structure check on those files before continuing. A false alarm (the operation finished, the close was forgotten) costs one line to resolve and is the price of the ordering.
2. **`CHECKPOINT.yml` - `active`?** Report the operation and the step it stopped on, and offer to continue (Rule 11). Older than 7 days -> force the decision now: continue, or `abandoned` with a reason.

**Then read the task folder in this order** - the order is load-bearing, because a month-old log read from the wrong end reproduces exactly the stale frame Rule 6 exists to prevent:

1. **Correction lenses** - what you must not believe from anything below.
2. **`CURRENT PHASE`** and its `next:` line - the frame, and where to re-enter.
3. **Open questions and blockers** (`MEMORY.md`, `TASKS.md`) - what is unresolved right now.
4. **Newest dated entries, backwards** - stop at the stated token budget, not at the bottom of the file.

Sealed blocks, closed D-blocks and the raw materials are read **on demand only**. The charter loads itself and needs no step.

**Record.** Nothing, unless a check fires - then the repair itself is an operation and opens its own log line.

**Exception.** Neither file exists, or both are clean -> say nothing and get to work. This is the one operation whose silence is correct: it runs every session, and a daily "nothing to report" trains the reader to skip the line that matters.

**Why not just read the log.** The three cheapest things to read - lenses, phase, blockers - are the three that change how everything else is interpreted, and they sit in a fixed place precisely so that a session with almost no budget can still read them. Entering through the newest log entries instead is the common failure: they are the most detailed and the least oriented.

## Auto-init (Rule 1 in action)

**Trigger.** Work crosses the Rule 1 threshold with no task folder, or a folder of raw materials without the 5 memory files is being worked in.

**Action.** Announce and do:

> This task crosses the folder threshold (release artifact + 3 stakeholders). Bootstrapping `checkout-latency-bug/` in the workspace.

Then follow the **Task bootstrap procedure** in the plugin's `commands/init.md` - read that file for the full discipline: classify and read all materials including every image, extract dated stakeholder quotes and evidence with explicit keep/mention/skip decisions, fill the templates from `${CLAUDE_PLUGIN_ROOT}/templates/`, never invent facts (gaps become open questions), and register the folder in `INDEX.md` in the same operation. No materials yet -> bootstrap from session context; everything unknown becomes an open question.

**Exception.** No `INDEX.md` at the workspace root -> do not silently create structure; suggest `/memento:init` once. Name the folder plainly after the task; the user can rename it later.

## The sync (Rule 4 in action)

**Before step 0 writes anything:** open the `OPS_LOG.md` line, naming the task and the files this sync expects to touch.

Then the fixed order - each file feeds the next:

0. **Lenses first.** A belief proven wrong this session -> a lens (Rule 6), never an edit; refresh `## CURRENT PHASE` and rewrite its `next:` line - or delete the line if no next action can be named.
1. **`MEMORY.md`** - dated entries for everything new: stakeholder statements (who / when / verbatim), findings, evidence. Update the Current status line with today's date. Dedup on append (Rule 5).
2. **Insight pass** (Rule 9) - reactive shapes were handled in step 1; synthesis shapes run only past the accumulation threshold. Ran -> update the marker, including on zero findings. Skipped below threshold -> **leave the marker alone** and say so in the report.
3. **`DECISIONS.md`** - new `D<N>` or revision `D<N>.<M>`, each with its dead-end check recorded in the block (Rule 3).
4. **`CLAUDE.md`** - only if scope or stable anchors changed. Most sessions: untouched.
5. **`TASKS.md`** - check off completed, mark invalidated `(obsolete, see D<N>.<M>)`, add new items and blockers.
6. **`INDEX.md`** - fix the task's status row if it no longer reflects reality; add a Timeline line for significant events.
7. **Session auto-memory** - update the task's project note (status + date); write any new `feedback_*`/`reference_*` facts (Rule 8).
8. **Compaction check** (Rule 5) - over budget -> seal the oldest; under -> skip, reporting the number.
9. **Self-check** - re-read what this sync wrote against [SCHEMA](../../docs/SCHEMA.md#self-check): required fields, legal statuses, resolving links, continued numbering, marker handled correctly. Fix deviations in place; what cannot be fixed without inventing a fact becomes an open question. **Report the result either way** - `Self-check: clean (<date>)` or the deviations found and fixed. A silent clean pass is indistinguishable from a skipped one, which this file forbids two sections above.
10. **Structure check** - if the sync touched more than one file (below).

Close the `OPS_LOG.md` line with the result, then finish with the diff-style report ([SCHEMA](../../docs/SCHEMA.md#sync-report)) - including the lines where nothing happened.

## Structure check (the doctor pass)

The memory auditor judges *content*. This pass judges nothing: it checks that the structure holds together. No model call, no key, no cost - four greps and a directory listing. Runs as the last step of a multi-file sync, and always before a close.

| Check | Symptom | Repair |
|---|---|---|
| **Broken pointers** | an `## Insights` line points at a file that no longer exists | re-point it, or drop the line if the insight is gone |
| **Incomplete file set** | a registered folder is missing one of the five files | create it from the template, seeded from what the other four know |
| **Stale checkpoint** | `CHECKPOINT.yml` is `active` and older than 7 days | force the decision: continue or `abandoned` |
| **Orphan folder** | a task folder on disk that no `INDEX.md` row mentions | register it, or say it was deliberately archived |
| **Unterminated operation** | an `OPS_LOG.md` line opened by an earlier session and never closed | check the files it named, repair what is half-written, close the line with what was found |

Report only what it found, one line per finding. A clean pass reports `Structure check: clean (<date>)` - one line, not silence. The failure it prevents is quiet: none of these four break anything today, and each stays invisible until the day someone needs exactly that file, which is usually the handover.

**The index is a shadow, not a source.** [`docs/RETRIEVAL.md`](../../docs/RETRIEVAL.md) states this for external indexers - markdown is truth, the index is derived and rebuildable - and it holds inside the method too. `INDEX.md` rows are reconstructible from the folders; the auto-memory index from its files' frontmatter. So a lost or contradictory row is a repair this pass performs, not an incident. That matters because those two aggregates are the only files where two writers can collide at all - everything else is already one-fact-per-file. The cure for the aggregates is not to guard them, it is to keep them cheap to rebuild.

## Sealing an oversized log (Rule 5 in action)

Normally happens inside sync step 8. A **large** seal (far over budget, triage will take real work) gets a heads-up first - it rewrites the shape of the log.

1. Read the whole `MEMORY.md`. The newest ~1/3 of dated entries stays raw; keep the Current status line as-is.
2. Triage the older two-thirds line by line: still load-bearing -> compress to one clause and seal; noise -> drop; decision rationale -> belongs in `DECISIONS.md`, flag if missing there.
3. Write survivors into `## Sealed (before <date>)` above `File history`, grouped by period. Fold pre-existing sealed blocks down a level rather than nesting.
4. Preserve links: a sealed fact referenced by an open `TASKS.md` item or a D-block stays phrased so the reference resolves.
5. Never invent. Unsure whether a line still matters -> keep it live.

## Closing a finished task

**Trigger.** The session establishes the task is done - artifact delivered, user confirms the outcome.

**Action.** Closing is semantic, so **confirm first**: "Closing <task> - final outcome: <one-liner>. Correct?" Check `TASKS.md` for unchecked items and open blockers; never close silently over them - list them and ask whether they become won't-do (record why) or the task stays active. Check the latest **memory health score**: <=5, or concrete gaps named by an observer -> one repair pass on the files before archiving.

**Record.** Prepend `**Completed <date>:** <outcome>` to the Current status line; set the `TASKS.md` status header to Completed; a final D-block if the close itself was a decision; move the `INDEX.md` row to Completed with a link to the final artifact; add a Timeline line; update the auto-memory project note.

The folder stays where it is - closed folders are the long-term archive. Delete nothing.

## Observer pass (Rule 10 in action)

**Trigger** (no confirmation needed): 3+ `status: hypothesis` insights accumulated; a release artifact about to be handed off or a major decision about to be recorded; a task being closed; the user asks.

**Action.** Same routing as `/memento:observers` - one pool, one convention:

1. **Key and models.** The model list is `- model: <id>` lines in `<workspace_root>/Observers/CONFIG.md` (aim for 2-3 models from *different families*). The id decides routing: **no `/`** -> the provider's own API (e.g. OpenAI, `OPENAI_API_KEY`); **with `/`** -> OpenRouter (`OPENROUTER_API_KEY`). Keys come from environment variables and are **never written into any file**. Only those lines configure anything - prose in the same file that contradicts them changes nothing ([SCHEMA](../../docs/SCHEMA.md#observersconfigmd)).
2. **One request per mandate.** The mandate's instruction plus its input files, in a single prompt. Files only - no session context, no "what we did" summaries.
3. **Save the raw report** before any triage - then **check that it is a report**. A runner that returns success has proven it made a call, not that a model answered: an empty file, a refusal, or an answer about something else all arrive as a successful run. A response that is empty or off-topic is a failed pass, recorded as such, and the model is dropped from this pass rather than triaged. (Observed: a runner printed `OK` for a model that returned zero characters, and the empty file sat in the folder looking like a verdict.)
4. **Triage** (main agent): update insight statuses; open questions for "insufficient evidence"; disagreements recorded in the insight file with both positions and surfaced to the user; a Sapper finding that invalidates a premise -> a `D<N>.<M>` revision proposal, never a silent edit.
5. **Report** in one block: mandates, models, verdict counts, memory health scores, passes used this month against the budget, and anything escalated - including any model that returned nothing.

**Tier selection.** Ordinary insight -> one model, rotating through the pool. Release artifact / contradicted stakeholder / D-block revision -> panel vote with assigned lenses (Rule 10).

**Rotation.** Not all four mandates every time: insight verification on the insight trigger; Sapper before major decisions and closes; pattern scout and memory auditor on the calendar, every week or two in an active workspace. A `- mandate: <name> -> <model or tier>` line in the config overrides the rotation for that mandate.

**Budget.** If the config carries `- budget: <n> passes/month`, count this month's files in `Observers/` before starting - one directory listing, no bookkeeping file to drift. At the cap: drop to the cheapest model in the pool; past it: skip with a one-line note naming the count. The spend goes in the pass report as the number of passes used and remaining.

**Exception.** No key, no config, or budget exhausted -> skip with a one-line note. Never block a sync on an unavailable observer.

## Status overview

**Trigger.** "Where are my tasks", "what's active", "what did we park".

**Action.** Answer from the files, read-only, modify nothing:

1. Read `INDEX.md` Active rows; per task, the top of `MEMORY.md` (Current status + date) and `TASKS.md` (phase, unchecked items, blockers).
2. Compute staleness: days since the most recent dated entry.
3. Pick up the memory health score from the latest observer report, if any.
4. Warn about: **stale memory** (active, no entries for 7+ days - suggest a sync or parking); **index drift** (`INDEX.md` contradicts the task's own files - quote both, the folder wins); **missing files** (an active folder lacking one of the five - suggest `/memento:init` on that folder to repair); **low or dropping health** (score <=5, or below the previous report - name the gap the observer cited).

**Record.** Nothing. One block per task on screen (status, phase, blockers, health, warnings) and a one-line verdict: how many healthy / stale / drifted.

---

## The fields you will otherwise get wrong

Everything above points at [`docs/SCHEMA.md`](../../docs/SCHEMA.md) for shapes, and that file is worth opening whenever you write something you write rarely - a lens, a checkpoint, an observer report. But a handful of fields come up in almost every sync, and an extra file read at exactly the busy moment is a read that does not happen. Those live here, in full:

**Insight file** - `Insights/YYYY-MM-DD-slug.md`: `date`, `title`, `tasks`, `status`, `sources` (>= 2), and either `falsifier` + `depends_on` or `status: interpretation`.

**Legal `status` values, in full** - anything else is a defect:
`hypothesis` · `hypothesis (was interpretation, <date>)` · `interpretation` · `verified by <model>, <date>` · `verified by <n>/<m> panel (<models>), <date>; dissent: <model> - <reason>` · `confirmed <date> - <what confirmed it>` · `refuted <date> - <what killed it>` · `closed <date> - question no longer live`

**Pointer line** - `- 💡 **<date>** - <title> -> [<path>](<relative path>) (<status>)`

**D-block** - `D<N>` new, `D<N>.<M>` revision naming its original; decision, why revised (+ the quote), artifact fate, `dead_ends_checked:` with counts.

**Marker** - `_Last insight pass: <date>_`, moved only when the pass ran.

**Dated log entry** - date plus a source for anything that came from a person or a run.
