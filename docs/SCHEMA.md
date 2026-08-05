# Memento schema

Every shape the method requires, in one place. `skills/task-memory/SKILL.md` says when to write something; this file says what it has to look like.

It exists because these formats are the kind only a human notices when broken. Nothing crashes when `falsifier:` goes missing or a pointer line loses its status suffix - the drift is silent until a cold reader trips over it, which is usually the handover. The sync's last step re-reads what it just wrote against this file (see **Self-check** at the bottom).

Required fields are marked **R**. Anything not listed is free text.

---

## Dates

`YYYY-MM-DD` everywhere - filenames, frontmatter, log entries, statuses. No local formats, no "yesterday". Inside prose a short form (`26.07`) is fine; in any field a machine or a grep reads, the full form.

## Status glyphs

Four states, one character each, defined once in the file header that uses them:

```
🔥 active / burning · ⏳ waiting on a condition · 🔄 in progress, calm · ✅ closed
```

Any 4-glyph set works as long as the legend is in the file. Applied to: `TASKS.md` section headers, `MEMORY.md` dated entries, `INDEX.md` rows.

---

## Task folder

Five files, no more, no less. A registered folder missing one of them is a finding for the structure check.

| File | Role |
|---|---|
| `CLAUDE.md` | charter - current state only |
| `MEMORY.md` | dated log, append-only |
| `TASKS.md` | phases, checkboxes, blockers |
| `DECISIONS.md` | D-blocks, append-only |
| `BRIEF.md` | original problem statement, verbatim |

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
### 🔄 2026-07-26 - Jane confirmed the deploy window

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
```

**R** date of the last refresh. A phase block with no date cannot be judged stale.

---

## Decision block

```markdown
## D4.1 - deploy window moves to 21.08 (revision of D4)

**Decision.** The release ships 21.08, after the freeze.
**Why revised.** Jane, 26.07: "12.08 is inside the freeze, we can't."
**Artifacts.** The 12.08 checklist is obsolete; the migration script is unaffected.
dead_ends_checked: Insights/2026-06-02-parallel-window.md (refuted), platform-migration/TASKS.md won't-do - none block this (2026-07-26)
```

- **R** `D<N>` for a new decision, **R** `D<N>.<M>` for a revision, numbered sequentially.
- A revision **R** names the block it supersedes, **R** states why, **R** states what happens to artifacts built under the old decision: rebuild / obsolete / still valid.
- **R** `dead_ends_checked:` - the files actually scanned (or `none found`) plus the date. A sentence in the chat is not this line.
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
| `refuted <date> - <what killed it>` | kept forever; this is the dead-end store |
| `closed <date> - question no longer live` | the only other exit from `interpretation` |

`falsifier` **R** names a recognizable observation - a log line, a field value, a run result, a stakeholder sentence. "Further investigation shows otherwise" names no observation and is not a falsifier.

### Pointer line in the task log

```markdown
## Insights (derived - verify before acting on)

_Last insight pass: 2026-07-26_

- 💡 **2026-07-26** - deploy window collides with the freeze ->
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

---

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
- 🔥 [checkout-latency-bug](checkout-latency-bug/) - repro found, waiting on Jane's window (2026-07-26)

## Completed
- ✅ [locale-audit](locale-audit/) - shipped 2026-06-30 -> [release/audit-final.sql](locale-audit/release/audit-final.sql)

## Timeline
- 2026-07-26 - deploy window collides with the freeze; D4 under revision
```

**R** glyph, **R** link, **R** one-line status, **R** date of that status. A Completed row **R** links the final artifact.

Both this file and the auto-memory index are **derived**: their rows are reconstructible from the folders and the frontmatter they point at. A contradiction between an index row and the folder it names is a repair, not an incident - the folder wins.

---

## Observer report

`Observers/YYYY-MM-DD-<model>-<mandate>.md`, saved verbatim before any triage, never deleted. **R** final section:

```markdown
## Memory quality

Reconstructible from files alone: partly. The decision path is clear, the
evidence behind D3 is not - two runs are cited by result, not by output.
Missing: what the moderator actually returned.
Score: 6/10
```

**R** the 0-10 score on its own line - the status overview reads it.

---

## Sync report

```
Synced <task name>:
  MEMORY.md    +2 facts, +1 case, 1 dup merged, status line updated
  Insights     +1: deploy window collides with the freeze (hypothesis)
  DECISIONS.md +D3.1 (revision of D3)
  Dead-ends    checked for D3.1: none touch it
  CLAUDE.md    untouched (no scope change)
  TASKS.md     2 checked, 1 marked obsolete, +1 blocker
  INDEX.md     status line updated
  Compaction   under budget, skipped (188 lines)
  Structure    clean (2026-07-26)
```

Every line reports a result, including "nothing happened" - `untouched`, `skipped`, `clean`. A sync that silently omits the lines where nothing changed looks identical to a sync that never ran those steps.

---

## Self-check

Last step of a sync, on what this sync wrote - not on the whole workspace:

1. every new insight file: **R** fields present, `status` from the vocabulary, `sources` count >= 2, `falsifier` present or `status: interpretation`;
2. every new pointer line: date, link resolves, status matches the file it points at;
3. every new D-block: numbering continues, a revision names its original and the artifact fate, `dead_ends_checked:` present;
4. `_Last insight pass:_` updated if the pass ran;
5. any lens or phase block written this session sits above the first dated entry and carries a date;
6. thresholds that were applied are reported as the number used, not as a judgement ("188 lines", not "still small").

Deviations are fixed in place and reported in one line. What cannot be fixed without inventing a fact becomes an open question instead - the schema never wins over the truth of the log.
