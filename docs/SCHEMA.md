# Memento schema

Every shape the method requires, in one place. `skills/task-memory/SKILL.md` says when to write something; this file says what it has to look like.

It exists because these formats are the kind only a human notices when broken. Nothing crashes when `falsifier:` goes missing or a pointer line loses its status suffix - the drift is silent until a cold reader trips over it, which is usually the handover. After its content steps, the sync re-reads what it just wrote against this file (see **Self-check** at the bottom).

Required fields are marked **R**. Anything not listed is free text.

---

## Dates

`YYYY-MM-DD` everywhere - filenames, frontmatter, log entries, statuses. No local formats, no "yesterday". Inside prose a short form (`26.07`) is fine; in any field a machine or a grep reads, the full form.

## Status glyphs

Four states, one character each, defined once in the file header that uses them:

```
[!] active / burning · [~] waiting on a condition · [>] in progress, calm · [x] closed
```

This is the set the bundled templates ship and the one every example in this file uses. Any other 4-glyph set works - emoji are common - as long as its legend is in the file. Pick one set per workspace and keep its legend in the header of every file that uses it; mixing sets across files is the drift this rule exists to prevent.

Applied to: `TASKS.md` section headers, `MEMORY.md` dated entries, `INDEX.md` rows. Section *headings* (`## Active`, `## Completed`) may carry any decoration - they are not status glyphs and are not read as such.

---

## Task folder

Five **memory** files, always all five - a registered folder missing one is a finding for the structure check. Raw materials, exports, screenshots and release artifacts live in the same folder alongside them and are not counted here.

| File | Role |
|---|---|
| `CLAUDE.md` | charter - current state only |
| `MEMORY.md` | dated log, append-first (see below) |
| `TASKS.md` | phases, checkboxes, blockers |
| `DECISIONS.md` | D-blocks, append-only |
| `BRIEF.md` | original problem statement, verbatim |

**"Append-first", not "append-only".** New material is always appended, and history is never rewritten to say something it did not say. Three in-place changes are legal and only these three: a dedup merge that updates an existing line's date and detail (Rule 5), sealing that compresses the oldest entries into a dated block, and a straight fix for a typo or a single wrong line. Anything that would change what a past entry *claimed* is a correction lens instead (Rule 6).

### `MEMORY.md` section order

Top to bottom, because reading order is part of correctness:

```markdown
# <task> - memory

## CORRECTION LENSES (read before any older entry)
## CURRENT PHASE
## Current status
## Open questions
## Insights (derived - verify before acting on)
## <dated entries>
## Sealed (before <date>)
## File history
```

A lens or a phase block below the first dated entry is a defect: it corrects reads that already happened.

### Dated log entry

```markdown
### [>] 2026-07-26 - Jane confirmed the deploy window

Jane, in #backend: "12.08, after the freeze lifts" (verbatim).
Source: chat export `materials/backend-2026-07-26.md`.
```

**R** date, **R** source for any fact that came from a person or a run. A claim with no date and no source does not belong in the log.

---

## Correction lens

```markdown
- **LENS 1 (2026-05-12) - role attribution.** Before this date the role
  "backend developer / deploys to prod" was wrongly attributed to the CEO.
  Any earlier entry saying "CEO deploys / CEO owns the API" must be read as:
  API decisions went through the CEO for approval, the implementer was the
  backend engineer.
```

**R** number, **R** date, **R** short subject, **R** a rule of the form *"any earlier entry saying X must be read as Y"*. Without that rewrite clause the lens states an apology instead of a correction.

## `CURRENT PHASE`

```markdown
## CURRENT PHASE (2026-08-01)

Waiting on Jane's freeze-calendar answer. Everything below dated before
2026-07-20 describes the pre-migration architecture.

next: ask Jane whether 21.08 clears the freeze, then rebuild the checklist
```

**R** date of the last refresh. A phase block with no date cannot be judged stale.

**R** at most one `next:` line, and it is the last line of the block. One action, not a list - a list is a plan and belongs in `TASKS.md`. Rewritten by every sync that touches the task, or deleted if no single next action can be named. Two `next:` lines, or one older than the block's own date, is a defect: the line's only value is being current.

---

## Decision block

```markdown
## D4.1 - deploy window moves to 21.08 (revision of D4)

**Decision.** The release ships 21.08, after the freeze.
**Why revised.** Jane, 26.07: "12.08 is inside the freeze, we can't."
**Artifacts.** The 12.08 checklist is obsolete; the migration script is unaffected.
dead_ends_checked: scanned 4 refuted (parallel-window, batch-import, eager-cache, tz-normalize) + 2 won't-do lists; 1 relevant - Insights/2026-06-02-parallel-window.md, does not block this (2026-07-26)   # high stakes: names required
# routine form:  dead_ends_checked: scanned 4 refuted + 2 won't-do lists, none touch this (2026-07-26)
```

- **R** `D<N>` for a new decision, **R** `D<N>.<M>` for a revision, numbered sequentially.
- A revision **R** names the block it supersedes, **R** states why, **R** states what happens to artifacts built under the old decision: rebuild / obsolete / still valid.
- **R** `dead_ends_checked:` - the **count** of refuted insights and won't-do lists scanned, the verdict, and the date. **Names are required when the stakes are high** - a release artifact, a contradicted stakeholder, a revised D-block - and optional on routine plans, where demanding them turns an audit into a ritual. A bare `none found` with no count fails at both levels: it is what an unrun check also produces, and a sentence in the chat is not this line at all.
- The superseded block is never edited or deleted.

---

## Insight file

`Insights/YYYY-MM-DD-<slug>.md`, one insight per file:

```markdown
---
date: 2026-07-26
title: Deploy window collides with the freeze
tasks: [checkout-latency-bug, platform-migration]
status: hypothesis
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

**R** `date`, `title`, `tasks`, `status`, `sources` (**at least two** - a restated single fact is not an insight), and either `falsifier` + `depends_on`, or `status: interpretation`.

### `status` vocabulary - the only legal values

| Value | Meaning |
|---|---|
| `hypothesis` | falsifiable, not yet verified |
| `hypothesis (was interpretation, <date>)` | a falsifier became nameable |
| `interpretation` | no falsifier can be named; may not carry a decision |
| `verified by <model>, <date>` | single observer verdict |
| `verified by <n>/<m> panel (<models>), <date>; dissent: <model> - <reason>` | panel vote, dissent named |
| `confirmed <date> - <what confirmed it>` | a real-world fact settled it |
| `refuted <date> - <what killed it>` | kept forever; this is the dead-end store. If it had been verified before, add `; had been verified by <models>` |
| `closed <date> - question no longer live` | the only other exit from `interpretation` |

The author writes only `hypothesis`, `interpretation` and `refuted`. `confirmed` requires a real-world fact, `verified by ...` requires an observer - and a verdict of *insufficient evidence* is neither: the status stays `hypothesis` and the missing evidence becomes an open question.

`falsifier` **R** names a recognizable observation - a log line, a field value, a run result, a stakeholder sentence. "Further investigation shows otherwise" names no observation and is not a falsifier.

### Pointer line in the task log

```markdown
## Insights (derived - verify before acting on)

_Last insight pass: 2026-07-26_

- [>] **2026-07-26** - deploy window collides with the freeze ->
  [Insights/2026-07-26-deploy-window-freeze.md](../Insights/2026-07-26-deploy-window-freeze.md) (hypothesis)
```

**R** date, **R** one-line title, **R** relative link, **R** current status in parentheses. Every task named in `tasks:` gets its own pointer line to the same file.

**R** `_Last insight pass: <date>_` - one marker line per task log. It is what makes a skipped pass visible afterwards: compared against the newest dated entry, it says how much material went unprocessed.

---

## `CHECKPOINT.yml`

```yaml
operation: rebuild prompt locale set
task: prompt-restructuring
status: active          # active | done | abandoned <date> - <why>
started: 2026-08-05
steps:
  - [x] dump current state to backup
  - [x] build replacement for 6 RU rows
  - [ ] verify fragments match before applying   # <- next
  - [ ] apply and restart the service
notes: source dump is dumps/prod/2026-08-05.sql; guard clause makes re-runs safe
```

**R** `operation`, `status`, `started`, `steps`. **R** exactly one `# <- next` marker while `status: active`. `abandoned` **R** carries a reason - an abandoned operation with no reason is indistinguishable from a forgotten one.

The file is **not deleted** when the operation ends: it is set to `done` or `abandoned` and stays until the next long operation overwrites it. A workspace therefore holds at most one checkpoint, and reading it answers both "is something running?" and "what was the last long thing we did?".

---

## `OPS_LOG.md`

One workspace-level file, append-only, two lines per operation:

```markdown
- 2026-08-06 14:02 > sync checkout-latency-bug -> MEMORY.md, DECISIONS.md, INDEX.md
- 2026-08-06 14:05 < sync checkout-latency-bug: +2 facts, D3.1, index row, self-check clean
- 2026-08-06 15:40 > observer pass platform-migration (sapper) -> Observers/
- 2026-08-06 16:15 > seal platform-migration -> MEMORY.md
```

**R** date and time, **R** the direction marker - `>` opens, `<` closes - **R** the operation and its target, **R** on an opening line the files it expects to touch, **R** on a closing line the result or the failure.

The opening line is written **before the first file is touched**; the closing line after the last. An opening line with no matching close is the signal the file exists for: at session start it names the operation that died and the files it had reached.

In the sample above, two operations are open. The 15:40 observer pass never closed, and the 16:15 seal started anyway - which is also a *one ritual at a time* violation, visible only because both lines are here.

Three closings carry a required shape, because each records something that would otherwise vanish:

```markdown
- 2026-08-06 17:20 < sync checkout-latency-bug: declined by user
- 2026-08-06 18:04 < observer pass platform-migration: budget_action: skipped (20/20 this month)
- 2026-08-07 09:12 < recovery sync checkout-latency-bug: checked MEMORY.md, DECISIONS.md, INDEX.md - index row was missing, added
```

A declined sync, a pass skipped on budget and a recovery all look like "nothing happened" from outside. These three lines are the difference between nothing happening and nothing being recorded.

Never edited, never reordered, never deduplicated. Past ~200 lines, the oldest **closed pairs** may be deleted - the one place the method prunes, because a closed pair says nothing the sync report and the files do not. Unterminated lines are never pruned at any age.

## Auto-memory file

One fact per file, in the session-memory directory:

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

**R** `name`, **R** `description` (this is the retrieval unit - it must be decidable without opening the file), **R** `type` from `feedback | project | reference | user`.

Index row in the directory's `MEMORY.md`:

```markdown
- [Short title](file.md) - why it matters
```

**R** link, **R** a why-it-matters clause. A row that only repeats the filename adds nothing to retrieval.

---

## `INDEX.md` rows

```markdown
## Active
- [!] [checkout-latency-bug](checkout-latency-bug/) - repro found, waiting on Jane's window (2026-07-26)

## Completed
- [x] [locale-audit](locale-audit/) - shipped 2026-06-30 -> [release/audit-final.sql](locale-audit/release/audit-final.sql)

## Timeline
- 2026-07-26 - deploy window collides with the freeze; D4 under revision
```

**R** glyph, **R** link, **R** one-line status, **R** date of that status. A Completed row **R** links the final artifact.

The file header may carry one machine-readable mode line:

```markdown
mode: core
```

`full` (the default, and what an absent line means) runs the layered rules on their own triggers. `core` keeps rules 1-7 and the four core operations, and leaves the layers - auto-memory, insight synthesis, observers, checkpoints, consilium - to run only when asked for by name. Prose describing a mode configures nothing; this line does.

Both this file and the auto-memory index are **derived**: their rows are reconstructible from the folders and the frontmatter they point at. A contradiction between an index row and the folder it names is a repair, not an incident - the folder wins.

---

## `Observers/CONFIG.md`

```markdown
# Observers config

Keys come from environment variables and are never written here.

- model: gpt-5.6-sol
- model: deepseek/deepseek-v4-pro
- model: minimax/minimax-m3

- budget: 20 passes/month
- cheapest: minimax/minimax-m3
- mandate: insight verifier -> gpt-5.6-sol
- mandate: memory auditor -> cheapest
```

**R** at least one `- model:` line. The `- model:`, `- budget:`, `- cheapest:` and `- mandate:` lines are the **machine-readable configuration**; anything else in the file is a note for humans.

**Prose in this file configures nothing.** A table that disagrees with the `- model:` lines does not change what runs - it only makes the file look configured while the old pool keeps being called. Observed in the field: a workspace whose config had documented, in full prose, a decision to stop calling two paid models, while every pass kept calling them and failing on payment errors. Changing the pool means changing these lines.

**`budget:` is counted in passes, not money** - the ledger is the `Observers/` folder itself, and the count is one directory listing, checkable by anyone. Prices change and cannot be verified from here; file counts can. Over budget -> drop to the cheapest model in the pool, then skip with a one-line note. Never block a sync on the budget.

**Three rules for choosing what goes in the pool**, each from an incident:

1. **Probe before adding, and read the answer.** A runner reporting success proves a request was made, not that a model replied - one model returned zero characters and the empty file sat in `Observers/` looking like a verdict. Judge a candidate by the length and relevance of what came back.
2. **At least two entries should cost nothing.** A pool of paid models empties itself the moment a balance runs out, and it does so mid-pass, leaving a panel that silently ran short. Free entries mean an exhausted balance degrades the panel instead of deleting it.
3. **The table is a snapshot, the lines are the configuration.** Providers change availability without notice, so a model list that was correct last month is not evidence about today.

**`- cheapest:` is required whenever `- budget:` is set.** The degraded tier has to be named in advance, not judged per pass - otherwise "dropped to the cheapest model" and "used whichever model was convenient" produce identical records.

**`mandate:` lines are hints, not routing rules.** `-> <model id>` names a preference; `-> cheapest` / `-> strongest` names a tier. An unlisted mandate rotates through the pool.

## Observer report

`Observers/YYYY-MM-DD-<model>-<mandate>.md`, saved verbatim before any triage, never deleted. **R** final section:

```markdown
## Memory quality

Reconstructible from files alone: partly. The decision path is clear, the
evidence behind D3 is not - two runs are cited by result, not by output.
Missing: what the moderator actually returned.
Score: 6/10
```

**R** all three: whether the task is reconstructible from the files alone, what was missing, and the 0-10 score on its own line - the status overview reads the score, and a close reads the gaps.

---

## Sync report

```
Synced <task name>:
  Lenses       none needed; CURRENT PHASE refreshed, next: rewritten
  MEMORY.md    +2 facts, +1 case, 1 dup merged, status line updated
  Insights     +1: deploy window collides with the freeze (hypothesis)
               marker moved to 2026-07-26 (pass ran)
  DECISIONS.md +D3.1 (revision of D3)
  Dead-ends    D3.1: scanned 4 refuted, none touch it
  CLAUDE.md    untouched (no scope change)
  TASKS.md     2 checked, 1 marked obsolete, +1 blocker
  INDEX.md     status line updated
  Auto-memory  +1 reference_ fact; project note dated
  Compaction   under budget, skipped (188 lines measured)
  Self-check   clean (2026-07-26)
  Structure    clean (2026-07-26)
```

Every line reports a result, including "nothing happened" - `untouched`, `skipped`, `clean`. A sync that silently omits the lines where nothing changed looks identical to a sync that never ran those steps.

---

## Self-check

Runs after the sync's content steps, on what **this sync** wrote - not on the whole workspace, which is the structure check's job. Any file the structure check then creates is built from a template and conforms by construction.

1. every new insight file: **R** fields present, `status` from the vocabulary, `sources` count >= 2, `falsifier` present or `status: interpretation`;
2. every new pointer line: date, link resolves, status matches the file it points at;
3. every new D-block: numbering continues, a revision names its original and the artifact fate, `dead_ends_checked:` present;
4. `_Last insight pass:_` updated if the pass ran;
5. any lens or phase block written this session sits above the first dated entry and carries a date, and `CURRENT PHASE` holds at most one `next:` line;
6. thresholds that were applied are reported as the number used, not as a judgement ("188 lines", not "still small").

Deviations are fixed in place and reported in one line. What cannot be fixed without inventing a fact becomes an open question instead - the schema never wins over the truth of the log.

A clean pass **R** still reports: `Self-check: clean (<date>)`. The rule it would otherwise break is the method's own - a check whose success leaves no trace is indistinguishable from a check that never ran.
