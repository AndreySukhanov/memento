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

Memento is not a database, not a vector store, not an MCP server. It is a **method plus automation**: a disciplined file layout that turns each task into a self-describing memory unit, and a skill that keeps it truthful automatically. One command initializes the workspace - once; from there the agent creates and maintains the memory itself.

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

A workspace-level `INDEX.md` registers every task folder, so "what's active and where does it live" is one file away. It is a *derived* registry, rebuildable from the folders themselves - which is why a row that disagrees with its task is a repair the structure check performs, not an incident.

Alongside task memory there is a second, **cross-task layer**: session auto-memory - atomic files (one fact each, with frontmatter) holding rules of engagement, stable references and who the user is. Task folders answer *"what is this task?"*; auto-memory answers *"how do we work together?"*.

## Structure

```
workspace/
├── INDEX.md                 # registry of all task folders: active / completed / timeline
├── OPS_LOG.md               # black box: every automatic operation opens a line before writing
├── CHECKPOINT.yml           # only while a long operation is running: which step it stopped on
├── Insights/                # one insight per dated file: 2026-07-26-deploy-window-freeze.md
├── Observers/               # outside-observer reports + CONFIG.md (model list; key via env var)
├── Consilium/               # optional CONFIG.md: the domain lenses for this workspace
├── task-one/
│   ├── CLAUDE.md            # charter    - scope, environments, stable IDs, stakeholders
│   ├── MEMORY.md            # log        - dated facts with sources, findings, evidence, open questions
│   ├── TASKS.md             # plan       - phases, checkboxes, blockers
│   ├── DECISIONS.md         # history    - decision records D1, D2... revisions as D1.1, never deleted
│   ├── BRIEF.md             # anchor     - original problem statement, verbatim, + definition of done
│   └── ...                  # raw materials (chat exports, logs, screenshots) stay untouched
└── task-two/
    └── ...

session auto-memory/         # cross-task layer (one fact per file)
├── MEMORY.md                # index: grouped rows with a why-it-matters clause
├── feedback_*.md            # corrections and standing preferences from the user
├── project_*.md             # active work: goal, state, next step
├── reference_*.md           # stable lookups: credentials location, contracts, recipes
└── user_*.md                # who the person is
```

## Install

```
/plugin marketplace add AndreySukhanov/memento
/plugin install memento@memento
```

## Commands

| Command | What it does |
|---|---|
| `/memento:init <workspace>` | **One-time workspace initialization.** Creates the `INDEX.md` registry and registers existing task folders (bootstrapping the 5-file set for those that only have raw materials). Pointed at a task folder inside an initialized workspace, it bootstraps just that folder - a manual escape hatch you rarely need. |
| `/memento:observers <question>` | **Ad-hoc multi-model panel.** Runs any question (plus attached materials) through the outside-observer pool and synthesizes consensus, disagreements and unique findings. For anything where a second model family's view is worth the tokens: draft reviews, contested decisions, "what am I missing?". |

You run init once per workspace; observers - whenever a question deserves a panel. All *maintenance* - including creating folders for new tasks - is the agent's duty rather than yours, and needs no commands. It is not unconditional: a sync you decline is reverted and recorded as declined, an observer pass with no key or no budget left is skipped with a note, and a session that only answered questions writes nothing at all. Automatic means nobody has to remember it, not that it happens regardless of circumstances.

## Automatic maintenance

An auto-activating **skill** teaches the agent the method itself - the threshold rule (not every task deserves a folder), the file roles, the decision-revision format, correction lenses (refract wrong history, never rewrite it), status glyphs, the shape of session auto-memory - and makes maintenance the agent's duty, not yours:

- **Bootstrap.** When a task crosses the folder threshold (more than a day / 2+ stakeholders / release artifact / 2+ phases), the agent announces it and creates the 5-file folder itself: reads **everything** in the materials including images, extracts dated stakeholder quotes and evidence, never invents facts - gaps become open questions - and registers the folder in the index in the same operation.
- **Sync.** The agent watches for drift triggers during the session (a decision made or revised, a stakeholder statement, an artifact changed, a phase moved, new evidence, a standing preference, a belief proven wrong) and, at a natural boundary, writes the memory files **in a fixed order** (lenses -> log -> insights -> decisions -> charter -> plan -> index -> auto-memory), announcing a diff-style summary of what was written. Nothing fired - nothing touched.
- **Insights.** New entries are checked against everything already recorded - this task's log and decisions, the other active tasks, cross-task auto-memory - in two tiers. Direct matches (a contradiction, an answer to a recorded open question) are caught the moment an entry is appended. The heavier synthesis - repeated failures becoming generalized rules, combinations that change the plan (a deadline collision, an invalidated approach, a merge risk between tasks) - runs only once enough new material has accumulated, because connections need critical mass: forcing the search on every new fact produces noise, not insight. Each finding is saved as a **dated file in the workspace-level `Insights/` folder** (one insight per file, with sources and status: hypothesis / confirmed / refuted), and every involved task's log gets a pointer line - a cross-task insight is stored once and found from all ends. Hypotheses until verified, never silently promoted to fact; refuted insights stay - a documented dead end is also memory. Zero insights is a valid outcome.
- **Observers.** The author never grades their own work: independent models (over the OpenRouter API, key via env var, models via `Observers/CONFIG.md`) are connected automatically when 3+ unverified insights accumulate, before a release handoff, or at a task close. They read the memory **cold** - files only, no session context - which doubles as a live test of memory quality, and report under four mandates: insight verifier, **Sapper** (finds mines under decisions: outdated or unproven assumptions), pattern scout, memory auditor. Reports are saved verbatim and never deleted; a hypothesis can only be promoted by a real-world fact or an observer's verdict; disagreements are recorded, not discarded. Verification is **graduated by stakes**: ordinary claims get one verdict; a claim that touches a release artifact, contradicts a stakeholder, or would revise a decision gets a **panel vote** - every pool model, each through a different lens (sources / alternative explanation / consequences), majority decides, dissent named.
- **Compaction.** When a log crosses its size budget (~250 lines / ~12 KB), the oldest entries are sealed into a compressed summary block that keeps still-relevant facts and drops resolved noise - the log stays loadable without losing the thread. Large seals get a heads-up first.
- **Closing.** When a task is done, the agent proposes the close (confirmation required - closing is semantic), records the final outcome and decision, and moves the index row to Completed. Folders are never deleted - closed tasks are your long-term archive.
- **Status.** Ask "how are my tasks doing?" and get a read-only overview with staleness detection - which memories haven't been synced in a week, where the index contradicts the task's own files - plus each task's **memory health score**: every observer report grades whether a cold reader could reconstruct the task from the files alone (0-10), and the close procedure requires a repair pass before archiving a task whose score is low.
- **Dead-end recall.** Refuted insights and won't-do items are not just kept - they are *consulted*: before any new decision or plan is recorded, the agent checks the stored dead ends and states either "no known dead ends touch this" or which ones do. The accidental rollback to a rejected option is the failure this whole method exists to prevent.
- **Falsifiable hypotheses.** Every recorded conclusion carries two extra fields: `falsifier` - the recognizable fact that would kill it (a log line, a field value, a run result, a stakeholder sentence) - and `depends_on`, the facts it stands on. When a new fact lands, it is checked against the `depends_on` of live hypotheses and their statuses are updated immediately, so memory reacts instead of accumulating. A conclusion for which no falsifier can be named is not a hypothesis but an **interpretation**: labelled as such, and never allowed to carry a decision. The failure this prevents is silent promotion - an unfalsifiable reading that sits in memory long enough starts being quoted as a finding.
- **Consilium.** When a change touches three or more areas at once - crosses languages or services, alters a contract someone depends on, or is a regression that appeared after a fix - a second skill fires on its own and splits the question across parallel read-only agents, each with its own lens and required reading, plus a **mandatory skeptic** whose job is to find the prior rejection. Disagreements between lenses are reported as disagreements, never averaged: two domains contradicting each other marks the zone of real uncertainty, which is the most useful thing the exercise produces. Observers verify what is already written; a consilium looks at what would break before it is written.
- **Structure check.** A no-cost doctor pass that judges nothing and only verifies the structure holds: insight pointers that lead nowhere, registered tasks missing one of the five files, a checkpoint left `active` past a week, folders on disk that no index row mentions. Runs at the end of a multi-file sync and before every close; a clean pass prints one dated line, because "ran it, all clean" and "never ran it" must not look identical. None of these break anything today - they surface on the day someone needs exactly that file, which is usually the handover.
- **An operations log.** Every operation that *writes* opens a line in `OPS_LOG.md` *before* it touches a file, and closes it with the result afterwards - read-only passes stay out of it. The ordering is asymmetric on purpose: a session that dies mid-sync leaves an unterminated line naming the operation and the files it had reached, so the next session starts by repairing exactly those. Forgetting to close a line raises a false alarm someone notices; writing nothing until the end leaves a silent half-finished workspace nobody does. It is not atomicity - plain files cannot offer that - it is evidence instead of a promise.
- **Checkpoints.** Operations too long for one turn (a bulk edit across locales, an eval run, a data load, a release package) get a `CHECKPOINT.yml` written before the first step and updated after each one. If a session starts with an active checkpoint, the agent says which operation stopped where before doing anything else. Context runs out, tools time out, machines reboot - the next session should not have to guess whether step 4 of 9 finished.

## What makes it different

File-based agent memory is a crowded category in 2026: markdown-first memory runtimes, tiered session logs, SQLite observation stores, `AGENTS.md` as a standard. Some of them also *reflect* - synthesize conclusions from accumulated facts. Memento shares the file-based foundation, and its insight synthesis has good company.

The difference is what happens **after** the memory writes something down. The known central risk of reflective memory is **self-reinforcing error**: the agent derives a conclusion, stores it, later retrieves it as if it were a fact, and builds the next conclusion on top. Industry reviews call the quality gates for this "still underdeveloped". Memento's answer is structural, not aspirational:

- **The author never grades their own work.** A hypothesis cannot be promoted by the agent that wrote it - only by a real-world fact or an outside observer's verdict.
- **Outside observers are different model families, reading cold.** Independent models get the files and nothing else - no session context, no summaries. Their errors are uncorrelated with the author's, and the cold read doubles as a standing test that the memory actually speaks for itself.
- **Decisions get mined for rot.** The Sapper mandate re-examines what recorded decisions *rest on* - assumptions that were never proven, or that newer facts have quietly contradicted.
- **Verification leaves a trail.** Observer reports are stored verbatim and never deleted; disagreements are recorded with both positions, not resolved by silence.

Storage is table stakes. Not trusting your own memory is the feature.

## Why it works

- **Decisions are append-only.** When a decision is revised, the old block stays and a `D1.1` block explains what changed, why, and what happens to artifacts built under the old decision. A month later you can reconstruct the whole path - and nobody re-litigates a settled question.
- **Every fact has a date and a source.** "The API returns 403" is a trap; "the API returned 403 on 2026-06-12, per Jane's message in #backend" is memory. Staleness becomes measurable - the status overview literally measures it.
- **Evidence is triaged explicitly.** During init, every screenshot and log gets an explicit keep/mention/skip decision, and even skipped files are listed - nothing silently disappears.
- **Memory stays bounded.** An append-only log eventually grows too big to load - which defeats the point. Compaction seals the oldest entries into a compressed, still-readable summary (keeping what's load-bearing, dropping resolved noise), so the log stays loadable without losing the thread.
- **Wrong history is refracted, not rewritten.** When past entries turn out to be factually wrong, you add a correction lens at the top of the log instead of editing dozens of scattered lines. What you believed - and when - stays auditable, while every future read is corrected automatically.
- **Cross-task memory has a shape.** Rules of engagement, stable references and who the user is live in session auto-memory as atomic files with frontmatter - one fact per file, indexed - so they accrete for months without becoming an unreadable blob.
- **It's just Markdown.** Greppable, diffable, works in any editor, survives any tooling change. Your memory is not held hostage by a plugin - uninstall Memento and every file remains fully usable.

## Origin

Extracted from months of daily prompt-engineering work on a production AI product: dozens of parallel tasks, four-plus stakeholders, decisions revised weekly. Every rule in the method exists because its absence caused a real, remembered failure - drifted statuses, lost rationale, an accidental rollback to a rejected design. This is the distilled version of what survived.

## FAQ

**Does it need Claude Code specifically?**
The `/memento:init` command, the auto-activating skill and the auto-loading of `CLAUDE.md` are Claude Code features. The method - five files, litmus test, append-only decisions, sync order - works with any agent or with no agent at all.

**How is this different from a TODO app or a wiki?**
Task trackers store *state*, wikis store *documents*. Memento stores *working memory*: dated facts, superseded decisions with rationale, and evidence - the things you need to resume thinking, not just to report progress.

**What about vector databases / RAG memory?**
Complementary, not competing. Memento is deliberately low-tech: for a single workspace of tasks, structured files beat embeddings on precision, auditability, and zero infrastructure. If you outgrow it, the files are perfect RAG source material.

## Docs

| File | What's in it |
|---|---|
| [`docs/SCHEMA.md`](docs/SCHEMA.md) | Every required shape in one place - insight frontmatter and the legal status vocabulary, decision blocks, correction lenses, the checkpoint YAML, auto-memory frontmatter, index rows, report formats. The sync's self-check reads this file. |
| [`docs/RATIONALE.md`](docs/RATIONALE.md) | Why each rule is what it is, and the failure it came from. Read it when a rule looks arbitrary or you are about to relax one. |
| [`docs/RETRIEVAL.md`](docs/RETRIEVAL.md) | The interop contract for external search runtimes: markdown is truth, your index is a derived cache. |

## Changelog

See [CHANGELOG.md](CHANGELOG.md). Latest: **v2.10.1** - a second full-repo review, applied: contradictions removed, two obligations made checkable, two over-promises corrected.

## Roadmap

See [BACKLOG.md](BACKLOG.md) - prioritized candidates (verified skill distillation, dead-end recall, panel voting, memory health score, retrieval interop) and, just as deliberately, what Memento will **not** do.

## License

MIT
