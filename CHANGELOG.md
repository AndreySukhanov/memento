# Changelog

## 2.10.0 - Evidence instead of promises: an operations log, a next-action line, a fixed reading order, and a countable observer budget

Four backlog items, all of them small, all of them aimed at the same gap: the
method kept making claims that nothing on disk could support.

**`OPS_LOG.md` - a black box for automatic operations.** Every operation opens
one line *before* it touches a file and closes it with the result afterwards.
The ordering is asymmetric on purpose: a session that dies mid-sync leaves an
unterminated line naming the operation and the files it had reached, so the
next session repairs exactly those. Forgetting to close a line raises a false
alarm somebody notices; writing nothing until the end leaves a silent
half-finished workspace nobody does.

The honest limits are written next to it. It cannot catch an operation that
never announced itself, it does not make anything atomic, and it does not
replace *one ritual at a time* - the structure check stays the backstop for
damage nobody announced. What it does is turn a broken ritual from a claim into
evidence. This is also the one file the method prunes: past ~200 lines the
oldest *closed* pairs go, since a closed pair says nothing the sync report and
the files do not. Unterminated lines are never pruned at any age.

**A `next:` line in `CURRENT PHASE`.** One line, rewritten by every sync that
touches the task, naming the single most likely next action. Not a file, not a
list: a separate `NEXT.md` is one more thing to remember, and the only thing
worse than no next-action is yesterday's. A sync that cannot name one deletes
the line rather than leaving the old one.

**Session start is now an operation.** It checks `OPS_LOG.md` for unterminated
lines and `CHECKPOINT.yml` for staleness, then reads the task folder in a fixed
order: lenses -> `CURRENT PHASE` and its `next:` -> open questions and blockers
-> newest entries backwards within a budget. Sealed blocks and materials on
demand only. The three cheapest things to read are the three that change how
everything else is interpreted, which is why they sit in fixed places; entering
through the newest log entries is the failure this prevents - they are the most
detailed and the least oriented. This is the one operation whose silence is
correct: a daily "nothing to report" trains the reader to skip the line that
matters.

**Observer economics, counted in passes rather than money.**
`Observers/CONFIG.md` gains `- budget: <n> passes/month` and
`- mandate: <name> -> <model or tier>`. The budget is counted in passes because
money cannot be verified from inside a workspace while `Observers/` is a dated
folder one listing away - the ledger is the folder itself, with no counter file
to drift.

Two field lessons ship with it, both from real workspaces:

- **Prose in the config configures nothing.** One config documented at length a
  decision to stop calling two paid models while every pass kept calling them
  and failing on payment errors. The file looked configured and was not. Only
  the `- model:` / `- budget:` / `- mandate:` lines do anything, and the format
  now says so.
- **A runner's `OK` is not a result.** A model returned zero characters, the
  runner reported success, and the empty file sat in `Observers/` looking like a
  verdict. A pass now checks that a report is a report before triaging it -
  the same rule the method already applies to itself: verify the outcome, not
  the invocation.

## 2.9.1 - What the panel found in 2.9.0

The compression in 2.9.0 came with a debt the backlog wrote down explicitly:
an outside read, because the author does not grade their own work. Three lenses
ran on the old and new files - completeness of obligations, executability under
load, and a skeptic looking for guarantees that are not implemented. This
release is their findings, applied.

**The critical one, found independently by all three lenses, was introduced by
2.9.0 itself.** The sync said to update `_Last insight pass:` *"either way"* -
whether or not the synthesis pass actually ran. That single word destroyed the
marker's only job. Stamped on a skip, it makes "checked, found nothing" and
"never looked" identical on disk, and it resets the very backlog that was
supposed to accumulate into the next trigger. The marker now moves **only when
the pass ran**; a pass that ran and found nothing writes `(0 found)`, and a
skipped pass leaves the date where it was so the gap keeps growing.

**Self-check now leaves a trace.** `Self-check: clean (<date>)` is required on a
clean pass. Without it the new step broke the rule it was written to serve, one
section further up the same file.

**Obligations restored** that the rewrite thinned out: the dead-end check is
owed by plans and approaches, not only decisions; a revision carries the
stakeholder quote; a hypothesis may **not** feed a decision block or a charter
edit until its status says `confirmed` or `verified by`; compaction triggers
also when the log starts crowding the session, and material that still drives
what you would do today is left live rather than sealed; `Insights/` is created
on the first insight; the auto-memory index is grouped by glyph; a folder is
named plainly after its task; the observer's Memory quality section answers all
three questions, not just the score; the status overview names the repair.

**Contradictions between the two files, resolved.** `MEMORY.md` is
*append-first*, not append-only - three in-place edits are legal (dedup merge,
sealing, single-line fix) and everything else is a correction lens. The five
files are five *memory* files; materials and artifacts live beside them.
`confirmed` and `verified by` are different statuses with different sources, and
an *insufficient evidence* verdict promotes nothing.

**Dead-end checks now carry counts** - `scanned 4 refuted, 1 relevant: ...`
rather than `none found`. Two lenses pointed out that a bare "none found" is
exactly what an unrun check also produces, while a count can be compared against
a folder anyone can list.

**Recorded, not fixed:** one lens argued that moving formats into `SCHEMA.md`
made things worse, since an extra file read at a busy moment is a read that does
not happen. The disagreement is kept rather than averaged - the counter-argument
is that the 43 KB file was not being executed either. The cheap half of the fix
ships anyway: the handful of fields used in almost every sync are now written
out in full at the end of the skill, so the common path needs no second file.

## 2.9.0 - Trigger, action, record - and a schema the method checks itself against

The external review's headline complaint was length: 43 KB of skill file, too
much explanatory prose, too few machine-checkable obligations. An agent under
load retains the philosophy and quietly drops the small duties - markers,
thresholds, status formats. This release answers that, and the answer is a
split rather than a deletion.

**Three files, three jobs.** `skills/task-memory/SKILL.md` is now the
operational path only: every rule is trigger, action, what gets recorded, and
the exception. 43 KB -> 27 KB, with nothing removed from the method.

- **[`docs/SCHEMA.md`](docs/SCHEMA.md)** (new) owns every required shape -
  insight frontmatter and the full legal `status` vocabulary, the D-block with
  its `dead_ends_checked:` line, pointer lines, the correction lens, the
  checkpoint YAML, auto-memory frontmatter, index rows, the observer report's
  mandatory score line, the sync report. Required fields are marked. The rules
  now point here instead of restating formats inline.
- **[`docs/RATIONALE.md`](docs/RATIONALE.md)** (new) owns the arguments: what
  failure each rule came from, why two insight tiers instead of one, why
  dissent is never averaged, why an interpretation gets its own status. Read
  when a rule looks arbitrary - not while executing one.

**Duplication removed.** Rule 4 no longer restates the sync order that "The
sync" owns; Rule 5 no longer states dedup twice; Rule 10 no longer says cold /
read-only / diversity in three separate places.

**Format self-check (new sync step 9).** The sync's second-to-last step
re-reads *what it just wrote* against the schema: required fields present,
`status` from the legal vocabulary, at least two sources on an insight, links
that resolve, D-numbering that continues, the insight-pass marker updated,
thresholds reported as the number used. Deviations are fixed in place; what
cannot be fixed without inventing a fact becomes an open question - the schema
never outranks the truth of the log. Scope is deliberately narrow: this checks
one sync's output, while the structure check sweeps the workspace.

**`commands/init.md` stops promising atomicity it cannot deliver.** Registering
a task in the index is now explicitly *last*, after the five files exist - the
ordering is the guarantee, since plain files offer no atomicity to promise.

## 2.8.3 - Ordering instead of locking; obligations that leave a trace

A panel review of the proposed locking design (backlog 12) rejected half of it
and re-scoped the rest. What ships here is cheaper than what was proposed and
addresses the failure the panel found to be real.

**`LOCKS.md` is not happening.** Two lenses independently reconstructed the
same race - both agents read the lock file, both see it free, both write - and
noted that a TTL makes it worse, since expiry does not prove the holder died.
Safe leasing needs a fencing token the store itself enforces; a Markdown file
enforces nothing. The rejection is recorded in the backlog with its reasoning,
so the idea does not come back around in three months.

**Content before pointer.** Real atomicity is unavailable on plain files, so
the method aims at the next best property: every interruption leaves a
*recoverable* state. Content is written first, the thing that points at it
last - the insight file before its pointer line, the folder before its index
row. Stop halfway and you get an orphan the structure check finds; stop the
other way and you get a reference into nothing.

**The index is a shadow, not a source.** `docs/RETRIEVAL.md` said this to
external indexers; it applies inward too. Index rows are reconstructible from
the folders, so a lost or contradictory row is a repair rather than an
incident - and those aggregates were the only two files where writers could
collide at all. Everything else is already one fact per file.

**One ritual at a time.** While a sync runs, no other automatic operation
starts. This failure needs no crash and no parallelism: the sync reaches the
decision step, which is itself an observer-pass trigger, the pass writes to the
same log, and the remaining steps happen only if the model remembers where it
was. It usually does not.

**The verifiability test.** A new cross-cutting criterion: an obligation is
real only if skipping it changes a byte on disk. Under load a model will emit
the sentence that says the duty was done, because saying it is free.
Consequences: the dead-end check moves out of the chat into a
`dead_ends_checked:` line in the D-block, where it can be compared against what
`Insights/` actually holds; a clean structure check reports one dated line
instead of staying silent; a sync with no triggers says so. "Ran it, all clean"
and "never ran it" must not look identical.

## 2.8.2 - Exits and a structure check

Two of the six findings from the external review, the two that needed no
contract change.

**Every state now has a way out (backlog 17).** An `active` `CHECKPOINT.yml`
older than **7 days** stops being something the session mentions and becomes
a decision it forces: continue now, or close it `abandoned` with a reason.
"Finish it" relied on somebody remembering, and the method exists because
nobody does. Likewise `status: interpretation` gained its two exits - it
becomes a hypothesis the moment a falsifier can be named
(`hypothesis (was interpretation, <date>)`), or it is closed when the
question stopped mattering. A permanent interpretation is still an
unexamined belief in memory, only with a badge.

**Structure check - the doctor pass (backlog 16).** A seventh automatic
operation that judges nothing and costs nothing: no model call, no key, four
greps. It verifies the structure holds - insight pointers that lead nowhere,
registered tasks missing one of the five files, a checkpoint left active past
a week, folders on disk no index row mentions. Runs at the end of a
multi-file sync and before every close. **A clean pass prints nothing.**

None of those four break anything on the day they appear; they surface on the
day someone needs exactly that file, which is usually the handover.

## 2.8.1 - Documentation drift found by external review

An outside code review of the whole repository (gpt-5.3-codex) found four
places where the docs no longer matched the plugin. All four are corrected
here; the structural findings went to the backlog as items 12-17.

- The method skill opened with "Ten rules" while shipping eleven - Rule 11
  (checkpoints) arrived in 2.8.0 and the intro was never updated.
- `templates/INDEX.md.tmpl` and `templates/TASKS.md.tmpl` still referenced
  `/memento:sync` and `/memento:close`, removed back in 2.0.0. A fresh
  workspace was being seeded with pointers to commands that do not exist.
- The observer pass was documented as OpenRouter-only in the skill while
  `/memento:observers` routes by model id (no `/` -> provider's own API,
  `/` -> OpenRouter). One pool, two descriptions; the skill now defers to
  the same convention.

The review's main verdict is not fixed here and is recorded openly in
BACKLOG.md: atomicity is currently a promise rather than a procedure, and
nothing coordinates concurrent writes - which v2.8.0 made more likely by
adding parallel agents.

## 2.8.0 - Falsifiable hypotheses, checkpoints, consilium

Three additions, all field-driven. The first two harden what memory already
stores; the third adds a second kind of outside view.

**Falsifier and depends_on (Rule 9).** A hypothesis with no stated way to die
is an opinion wearing a status field - and it hardens into an assumption
nobody revisits. Every recorded conclusion now carries `falsifier` (the
recognizable fact that would kill it) and `depends_on` (the facts it rests
on). When a new fact lands it is checked against the `depends_on` of live
hypotheses, so statuses move the same session instead of drifting. A
conclusion for which no falsifier can be named is not a hypothesis but an
**interpretation** - labelled `status: interpretation`, and never allowed to
carry a decision. That closes the silent-promotion path: an unfalsifiable
reading that sits in memory long enough starts getting cited as a finding.

**Rule 11: checkpoint long operations.** Work that does not fit one turn -
a bulk edit across locales, an eval run, a data load, a release package -
gets `CHECKPOINT.yml` written before the first step and updated after each
one, not at the end (the end is exactly the moment that never arrives). A
session that starts with an `active` checkpoint reports where it stopped
before doing anything else. Both halves matter: a checkpoint nobody reads is
a diary, and a stale `active` file from three weeks ago trains the reader to
ignore it.

**Consilium - parallel domain review, as an auto-firing skill.** Observers verify what is
already written, cold and after the fact. They are the wrong tool for "what
breaks if we do this?" when the answer spans several areas at once. A
consilium splits the question across in-session agents - each with its own
lens and required reading - plus a **mandatory skeptic** whose job is to find
the prior rejection. All agents are read-only; disagreements are reported as
disagreements, never averaged, because two lenses contradicting each other is
the most useful output the exercise produces. Verification after versus
perspective before - the two are siblings, not duplicates.

It ships as a **skill**, not a command, on purpose: a command has to be
remembered at exactly the moment you are deep in the change and least
likely to think of it. The skill fires on its own when the situation
matches, announces what it is about to run, and lets you stop it.

## 2.7.1 - Write-immediately tier (field bug fix)

**Field bug, found in production use:** Rule 4 framed all memory writing as a
sync "at a natural session boundary". In a session that runs for days or weeks,
the boundary never arrives - so the agent, faithfully following the rule,
wrote memory only when explicitly asked. Before the plugin, the same agent
wrote continuously; the skill had *downgraded* its memory discipline.

Fix: Rule 4 gains a **write-immediately tier**. High-value material is written
the moment it lands, without waiting for any boundary: decisions (D-blocks),
correction lenses, standing preferences and durable facts for session
auto-memory (which accretes continuously by design). The boundary sync is
demoted to a sweep that reconciles the files and catches whatever slipped.

## 2.7.0 - Panel voting: verification graduated by stakes

Rule 10 gains two verification tiers. A single observer's verdict stays the
default for ordinary insights; for claims that decisions ride on, one model's
vote is a thin gate - verifier models err too.

**Panel vote** triggers when a claim touches a release artifact, contradicts
a stakeholder statement, or would revise a decision (D-block). Every model in
the pool gets the same verification brief through a *different lens* -
correctness of cited sources / strongest alternative explanation /
consequence check. Majority decides; a tie escalates to the user; the dissent
is recorded by name, never averaged away:
`verified by 2/3 panel (gpt, grok), <date>; dissent: gemini - <reason>`.

Diverse lenses beat identical refuters: models fail differently, so coverage
compounds.

## 2.6.0 - Dead-end recall + memory health score

Two zero-new-entity additions from the backlog - both activate data the
system already stores.

**Dead-end recall.** Refuted insights and won't-do items must be *consulted*,
not just kept: before recording any new decision, plan or approach, the agent
scans `Insights/` for `status: refuted` and the relevant won't-do items, and
states the result ("no known dead ends touch this" / which ones do and why
the new plan differs). The sync report gains a `Dead-ends` line. Storage
without retrieval is decoration.

**Memory health score.** Every observer report now ends with a mandatory
**Memory quality** section: could the task be reconstructed from the files
alone, what was missing, and a 0-10 score. The latest score per task surfaces
in the status overview (with a warning on <=5 or a drop), and a task cannot
close over a low score without one repair pass - the archive is only worth
keeping if a future reader can use it.

## 2.5.0 - Ad-hoc observer panel

New command `/memento:observers <question>` - run any question (plus attached
material files) through the Rule 10 outside-observer pool on demand, not just
on the scheduled triggers. Use for draft reviews, contested decisions,
hypothesis checks, "what am I missing?".

- Same pool (`Observers/CONFIG.md`), same key convention (model id without
  `/` -> provider's own API, with `/` -> OpenRouter; keys from env vars only),
  same storage (`Observers/adhoc/YYYY-MM-DD-<slug>-<model>.md`, never deleted).
- The agent synthesizes instead of retelling: consensus, disagreements (the
  zone of genuine uncertainty), unique findings, own recommendation - siding
  against the panel is allowed but must be argued explicitly.
- Guardrails: refuse trivial questions (the panel costs money), continue past
  a failed model, apply Rule 10 statuses when a verdict touches a recorded
  insight.

## 2.4.0 - Outside observers

**New Rule 10: the author never grades their own work.** Independent models
are connected periodically to read the memory **cold** (files only, no
session context) and report on it - which doubles as a live test of memory
quality: if a cold model cannot reconstruct the task from the files, the
memory has failed its purpose.

- Four mandates: **insight verifier** (hypothesis -> confirm / refute /
  insufficient evidence, strictly against cited sources), **Sapper** (finds
  mines under decisions - outdated or unproven assumptions in active
  D-blocks), **pattern scout** (missed cross-task links), **memory auditor**
  (contradictions, stale statuses, duplicates, broken pointers).
- **Observer pass** runs automatically: 3+ unverified insights, a release
  handoff, a task close, or on request. External models over the OpenRouter
  API - key via `OPENROUTER_API_KEY` env var (never stored in files), model
  list in `Observers/CONFIG.md` (prefer different families). No key -> the
  pass is skipped with a note, never blocking the sync.
- Reports saved verbatim to `Observers/YYYY-MM-DD-<model>-<mandate>.md`,
  never deleted. Insight statuses gain `verified by <model>, <date>`;
  promotion of a hypothesis now requires a real-world fact or an observer's
  verdict - self-confirmation is forbidden. Disagreements are recorded (both
  positions) and surfaced to the user, never silently dropped.
- Workspace init now also creates `Observers/` with a `CONFIG.md` stub.

## 2.3.0 - Insights as dated files

Every insight is now saved as its own file in the workspace-level `Insights/`
folder - `Insights/YYYY-MM-DD-<slug>.md` with frontmatter (date, tasks,
status, sources) and the statement as the body. The task's `## Insights`
section keeps a short dated pointer line to the file.

- A **cross-task** insight is stored once and pointed to from every involved
  task's log - found from all ends, no duplication.
- Status changes (confirmed / refuted) update the file's `status` field with a
  date; the file is never deleted - a refuted insight documents a dead end,
  which is also memory.
- Workspace init now creates the `Insights/` folder; if it is missing, it is
  created on the first insight.

## 2.2.1 - Insight synthesis gated by volume

The insight pass no longer fires on every new fact. Two tiers:

- **Reactive, at append time** - contradiction and answered-question: direct
  matches against the section already being scanned for dedup; never postponed.
- **Batch synthesis, on accumulation** - pattern, implication, cross-task
  link: runs only when enough new material piled up since the last pass
  (~7+ new dated entries / ~2 KB, or a phase boundary), tracked by a
  `_Last insight pass: <date>_` marker in the Insights section.

Rationale: connections need critical mass - synthesis over two facts produces
noise, and rereading the whole memory for every new line is waste, not
diligence.

## 2.2.0 - Insight synthesis

**New Rule 9: stored facts must talk to each other.** A memory that only
accumulates entries is an archive, not a memory. Every sync now includes an
**insight pass**: the just-appended entries are run against everything already
recorded - this task's log and decisions, the other active tasks in `INDEX.md`,
cross-task auto-memory - looking for five shapes:

- **contradiction** -> correction lens or open question naming both sides;
- **answered question** -> the open question gets its answer and closes;
- **pattern** (2nd-3rd occurrence) -> generalized into a charter constraint or
  an auto-memory fact;
- **implication** (new fact + existing constraint = unwritten consequence) ->
  recorded in a dedicated `## Insights` section;
- **cross-task link** -> a dated pointer written into the other task's log too,
  so the insight is found from both ends.

Guardrails: an insight must cite at least two sources, must be actionable,
stays a **hypothesis until verified** (never silently promoted to fact), is
deduped before appending - and zero insights is a valid outcome; a forced
insight is worse than silence.

Sync order is now: lenses -> log -> **insights** -> decisions -> charter ->
plan -> index -> auto-memory -> compaction. The sync report gained an
`Insights` line.

## 2.1.0 - Init once, bootstrap automatically

`/memento:init` is now a **one-time workspace initialization**: it creates the
`INDEX.md` registry and registers existing task folders. From there the skill
**auto-inits** new tasks: when work crosses the Rule 1 threshold (or a folder
of raw materials has no memory files), the agent announces it and bootstraps
the 5-file set itself - same extraction discipline as before (read everything
including images, never invent facts, atomic index registration).

Pointing `/memento:init` at a task folder inside an initialized workspace
still bootstraps that single folder - kept as a manual escape hatch.

Guardrails: no silent structure in an uninitialized workspace (no `INDEX.md` ->
suggest running init once); borderline threshold calls still get the "full
folder, or just a note?" question.

## 2.0.0 - One command, automatic maintenance

**Breaking: the command set is gone - only `/memento:init` remains.**
`/memento:sync`, `/memento:compact`, `/memento:status` and `/memento:close`
are removed; their algorithms now live in the skill as **Automatic operations**
the agent performs on its own initiative:

- **Sync** runs automatically at a natural session boundary when drift
  triggers fired - the agent announces a diff-style summary instead of asking
  permission. Nothing fired - nothing touched.
- **Compaction** runs inside the sync whenever the log crosses its budget;
  large seals get a heads-up first.
- **Closing** is proposed by the agent when a task is done (confirmation kept -
  closing is semantic; never over open blockers silently).
- **Status** is answered from the files whenever the user asks how their tasks
  are doing - read-only, with the same staleness and drift warnings.

Rationale: a ritual that waits for a command gets skipped exactly when the
session was busiest. v1.2.1 taught the skill to *offer* the sync; v2.0.0 makes
it *perform* the maintenance. Initialization stays a command because
bootstrapping a folder from raw materials is a deliberate, user-initiated act.

## 1.2.1 - The skill offers the sync

**Sync is no longer purely user-initiated.** A ritual that depends on the user
remembering it gets skipped exactly when the session was busiest. The skill now
tracks **drift triggers** during a session - a decision made/revised/rejected, a
stakeholder statement, an artifact change, a phase move, new evidence, a standing
preference, a belief proven wrong - and at a natural conversation boundary states
plainly what changed and offers `/memento:sync`.

Discipline built in: offer **once** per boundary, name *what* drifted rather than
asking a generic "shall I sync?", accept a refusal as a valid outcome, and stay
silent when nothing fired (pure Q&A sessions need no sync; offering anyway trains
users to ignore the prompt).

Added to Rule 4 in `skills/task-memory/SKILL.md`; skill description broadened so
it activates at session wrap-up, not only inside a task folder.

## 1.2.0 - Correction lenses, status glyphs, atomic auto-memory

Three practices that were already load-bearing in daily production use but
missing from the published method. Each was added because its absence caused a
real failure.

### Added

**Rule 6 - Correction lenses.** Rule 3 protected *decisions* from being
overwritten; facts had no such protection. When past entries turn out to be
factually wrong (wrong person attributed, wrong place, wrong assumption), you no
longer edit history - you add a **lens** at the top of `MEMORY.md` and every
older entry is read through it. History stays auditable, scattered errors are
corrected in one place.

Companion: a `## Current phase` block for volatile state. Real failure it
prevents - an agent producing forecasts through the frame "contact is broken"
four days after contact had resumed. The files were correct; the reading frame
was not.

**Rule 7 - Status glyphs.** One-character status on `TASKS.md` sections,
`MEMORY.md` entries and `INDEX.md` rows (burning / waiting / active / closed).
Triage, not decoration: a 30 KB memory file becomes scannable in one pass, and
stale statuses become visible (a "burning" marker three months old is a signal).

**Rule 8 - Session auto-memory shape.** Rule 4 step 6 previously said only
"session auto-memory, if the environment has one". Now specified: one fact =
one file with frontmatter (`name`, `description`, `type`), typed as
`feedback_*` / `project_*` / `reference_*` / `user_*`, plus an index with a
*why it matters* clause per row. Division of labour made explicit: folder files
hold task memory (synced by ritual), auto-memory holds cross-task memory (rules
of engagement, references, who the user is) and accretes continuously.

### Changed

- `commands/sync.md` - new step 0 (write a lens instead of editing history;
  refresh current phase) and an expanded step 6 (auto-memory file shape).
- `templates/MEMORY.md.tmpl` - `## Correction lenses` and `## Current phase`
  sections at the top.
- `templates/TASKS.md.tmpl`, `templates/INDEX.md.tmpl` - glyph legend in header.
- `skills/task-memory/SKILL.md` - now eight rules instead of five.

## 1.1.0

- `/memento:compact` command and Rule 5 (sealing an oversized `MEMORY.md`).

## 1.0.0

- Initial release: `/memento:init`, `/memento:sync`, `/memento:status`,
  `/memento:close`, five-file memory set, workspace index, Rules 1-4.
