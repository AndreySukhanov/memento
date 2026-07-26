# Changelog

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
