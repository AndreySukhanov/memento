# Memento

**Persistent, file-based task memory for Claude Code. Your agent forgets everything between sessions - Memento doesn't.**

> In the film *Memento*, Leonard can't form long-term memories - so he survives on a ruthless system of notes, photos and tattoos. Your AI agent has the same condition: every session it wakes up blank. This plugin is its system of notes - plain Markdown files, structured so that any future session (or any teammate) can pick up a months-old task in minutes. Developers may also recognize the *Memento pattern*: capturing state so it can be restored later. That is exactly what this is.

## The problem

LLM agents have brilliant working memory and zero long-term memory. Every new session starts from scratch: the context window fills up, gets compacted, and the *why* behind your decisions evaporates. Chat transcripts are not memory - nobody rereads 400 turns to find out why v3 was rejected.

The result is familiar to anyone doing multi-day, multi-stakeholder work with an agent:

- statuses in your notes drift from reality within a week;
- decision rationale gets lost, and someone confidently rolls back to an option that was already rejected;
- the same fact lives in three files, gets updated in one;
- a task parked for a month takes a full day just to reload into your (and the agent's) head.

## The idea

Memento is not a database, not a vector store, not an MCP server. It is a **method plus automation**: a disciplined file layout that turns each task into a self-describing memory unit, and commands that keep it truthful.

Every non-trivial task gets a folder with five files, each with one strict role:

| File | Role | Changes |
|---|---|---|
| `CLAUDE.md` | **Charter** - scope, environments, stable IDs, stakeholders | Rarely - on scope changes |
| `MEMORY.md` | **Log** - dated facts with sources: who said what when, findings, evidence | Every session |
| `TASKS.md` | **Plan** - phases, checkboxes, blockers | Every session |
| `DECISIONS.md` | **History** - decision records; revisions never delete, only supersede (D1 -> D1.1) | On decisions |
| `BRIEF.md` | **Anchor** - the original problem statement, verbatim, plus definition of done | Almost never |

Two details do most of the work:

1. **The charter is named `CLAUDE.md` on purpose.** Claude Code auto-loads it whenever the agent works inside the folder - your task context enters the model for free, every session, no retrieval pipeline needed.
2. **The stable/volatile split has a litmus test.** *"Can I delete this fact in a week without losing meaning?"* -> it's log material (`MEMORY.md`). *"Is it valid until the scope changes?"* -> it's charter material (`CLAUDE.md`). No more updating the same fact in two places.

A workspace-level `INDEX.md` registers every task folder, so "what's active and where does it live" is always one file away.

## Structure

```
workspace/
├── INDEX.md                 # registry of all task folders: active / completed / timeline
├── task-one/
│   ├── CLAUDE.md            # charter    - scope, environments, stable IDs, stakeholders
│   ├── MEMORY.md            # log        - dated facts with sources, findings, evidence, open questions
│   ├── TASKS.md             # plan       - phases, checkboxes, blockers
│   ├── DECISIONS.md         # history    - decision records D1, D2... revisions as D1.1, never deleted
│   ├── BRIEF.md             # anchor     - original problem statement, verbatim, + definition of done
│   └── ...                  # raw materials (chat exports, logs, screenshots) stay untouched
└── task-two/
    └── ...
```

## Install

```
/plugin marketplace add AndreySukhanov/memento
/plugin install memento@memento
```

## Commands

| Command | What it does |
|---|---|
| `/memento:init <folder>` | Turn a folder of raw materials (chat exports, screenshots, notes, logs) into the 5-file memory set. Reads **everything** including images, extracts dated stakeholder quotes and evidence, never invents facts - gaps become open questions. Optionally pulls the ticket from your tracker. |
| `/memento:sync` | End-of-session ritual: propagate what happened into the memory files **in a fixed order** (log -> decisions -> charter -> plan -> index), so nothing drifts. |
| `/memento:status` | Read-only overview of all active tasks with staleness detection: which memories haven't been synced in a week, where the index contradicts the task's own status. |
| `/memento:close` | Close a finished task: completion block, final decision record, index row moves to Completed. The folder stays - closed tasks are your long-term archive. |

Plus an auto-activating **skill** that teaches the agent the method itself - the threshold rule (not every task deserves a folder), the file roles, the decision-revision format, the sync discipline - whenever it works inside a Memento folder.

## Why it works

- **Decisions are append-only.** When a decision is revised, the old block stays and a `D1.1` block explains what changed, why, and what happens to artifacts built under the old decision. A month later you can reconstruct the whole path - and nobody re-litigates a settled question.
- **Every fact has a date and a source.** "The API returns 403" is a trap; "the API returned 403 on 2026-06-12, per Jane's message in #backend" is memory. Staleness becomes measurable - `/memento:status` literally measures it.
- **Evidence is triaged explicitly.** During init, every screenshot and log gets an explicit keep/mention/skip decision, and even skipped files are listed - nothing silently disappears.
- **It's just Markdown.** Greppable, diffable, works in any editor, survives any tooling change. Your memory is not held hostage by a plugin - uninstall Memento and every file remains fully usable.

## Origin

Extracted from months of daily prompt-engineering work on a production AI product: dozens of parallel tasks, four-plus stakeholders, decisions revised weekly. Every rule in the method exists because its absence caused a real, remembered failure - drifted statuses, lost rationale, an accidental rollback to a rejected design. This is the distilled version of what survived.

## FAQ

**Does it need Claude Code specifically?**
The commands and auto-loading of `CLAUDE.md` are Claude Code features. The method - five files, litmus test, append-only decisions, sync order - works with any agent or with no agent at all.

**How is this different from a TODO app or a wiki?**
Task trackers store *state*, wikis store *documents*. Memento stores *working memory*: dated facts, superseded decisions with rationale, and evidence - the things you need to resume thinking, not just to report progress.

**What about vector databases / RAG memory?**
Complementary, not competing. Memento is deliberately low-tech: for a single workspace of tasks, structured files beat embeddings on precision, auditability, and zero infrastructure. If you outgrow it, the files are perfect RAG source material.

## License

MIT
