# Memento backlog

Candidates for future rules and operations. Each entry states the problem, a design sketch, why it fits the philosophy (plain files, zero infrastructure, maintenance as the agent's duty, distrust of one's own memory), and a cost estimate. Ordered by priority within each horizon.

Sources of inspiration are named where relevant - the 2026 memory-runtime landscape (EverOS, memsearch, VerificAgent, MEMPROBE) converged on several ideas worth adopting, and several worth deliberately *not* adopting.

Entries marked 🔴 came from an **external code review** of the whole repository (gpt-5.3-codex, 06.08.2026) - the plugin's own Rule 10 applied to the plugin: the author does not grade their own work. Its headline verdict is recorded here rather than softened: *in its current form the method is partly unworkable on long, parallel sessions without an atomicity and locking protocol* - a systemic hole, not another nice rule. Items 12-17 are that review, triaged.

---

## Now - strongest candidates for the next releases

### 1. Rule 11: Case distillation - closed tasks become skills (verified procedural memory) ⏳ deferred by design

> Held until enough real closed tasks exist to validate distillation on live material rather than synthetic examples - it is the only M-cost, new-entity candidate, and it ships last on purpose.

**Problem.** Closed task folders are an archive, not leverage. The same kind of task (a release-SQL package, a smoke-test harness, a stakeholder-alignment dance) gets re-derived from scratch, and the archive only helps if someone thinks to read it.

**Sketch.**
- On close, the agent appends a compact **Case** block to the task's memory: what the task type was, what approach worked, what failed (won't-do items and refuted insights included), what artifacts are reusable as templates.
- The insight pass (Rule 9 pattern shape) watches for **2-3 similar Cases** across closed tasks. When the threshold fires, the agent proposes distilling a **Skill** - a reusable instruction file (in Claude Code, a real `.claude/skills/` entry; elsewhere, a `Skills/` folder in the workspace).
- **The Memento twist - no self-confirmation for skills.** A skill is a generalized claim ("this is how this kind of task is done"), so it inherits Rule 10: a distilled skill candidate is *verified by an outside observer* against the Cases it came from before it becomes a standing instruction. Candidates live in `Skills/candidates/` until promoted.

**Why it fits.** Pure files, automatic trigger, and it extends the core differentiator (verification) to procedural memory - EverOS and memsearch both distill skills, neither verifies them. Their known failure mode (a lucky one-off becomes a "skill") is exactly what the observer gate prevents.

**Cost.** M. New rule + a close-operation extension + one observer mandate ("skill auditor": do the Cases actually support the generalization?).

### 2. Dead-end recall - refuted memory must be retrieved, not just kept ✅ shipped in v2.6.0

**Problem.** We already keep refuted insights and won't-do items ("a documented dead end is also memory") - but nothing forces the agent to *look at them* when planning. Industry evaluations note that retrieving what failed matters as much as retrieving what worked (contrastive recall); storage without retrieval is decoration.

**Sketch.** One rule addition: before recording a new plan, approach decision, or skill candidate, the agent greps `Insights/` for `status: refuted` and the relevant tasks' won't-do items, and states either "no known dead ends touch this" or which ones do. The sync report gains a one-line `Dead-end check` entry when a plan was recorded.

**Why it fits.** Zero new structure - it activates data the system already stores. Directly attacks the "accidental rollback to a rejected option" failure the whole method exists to prevent.

**Cost.** S. A paragraph in Rule 9/Rule 3 and one line in the sync operation.

### 3. Panel voting - graduated verification for high-stakes claims ✅ shipped in v2.7.0

**Problem.** Rule 10 currently promotes a hypothesis on a single observer's verdict. For cheap insights that is proportionate; for a claim that feeds a release decision, one model's vote is a thin gate - and verifier models err too.

**Sketch.**
- Two verification tiers, chosen by stakes: **single-verdict** (default) and **panel vote** - every model in the pool gets the same verification brief, each through a *different lens* (correctness of sources / alternative explanation / consequence check), majority decides, ties escalate to the user.
- Stakes triggers for the panel tier: the insight touches a release artifact, contradicts a stakeholder statement, or would revise a decision (D-block).
- Verdicts recorded as `verified by 2/3 panel (gpt-5.6-sol, grok-4.5), <date>` - the dissent is named, not averaged away.

**Why it fits.** Uses the pool that already exists; deepens the differentiator. Diverse lenses beat identical refuters - failure modes differ, so coverage compounds.

**Cost.** S-M. Rule 10 extension + observer-pass branching on stakes.

### 4. Memory health score - formalize the cold-read test ✅ shipped in v2.6.0

**Problem.** Every observer pass already doubles as a test of whether the files speak for themselves, but the result evaporates into prose. MEMPROBE-style thinking applies: memory quality is measurable as an artifact, separately from task success.

**Sketch.**
- Every observer report ends with a mandatory short **Memory quality** section (the Sapper mandate already has one): could the task be reconstructed from files alone; what was missing; 0-10 score.
- The status overview aggregates the latest scores per task into one line (`memory health: 8/10, gap: execution facts missing`) and flags tasks whose score dropped.
- A task closing with a low score gets one repair pass before archive - the archive is only worth keeping if a future reader can use it.

**Why it fits.** No new infrastructure; turns an existing side effect into a tracked signal. Also the honest metric for the method itself - if scores are low, Memento is failing at its one job.

**Cost.** S. Report template line + status-overview aggregation.

### 12. Write safety - atomicity that is a procedure, not a promise 🔴 from external review (gpt-5.3-codex, 06.08.2026)

**Problem.** `commands/init.md` instructs the agent to "write `CLAUDE.md` and update `INDEX.md` atomically". On plain Markdown, with no protocol, that is a declaration - an interrupted write leaves a registered task with no charter, or a charter no index knows about. The exposure grew with v2.8.0: a consilium can be running while the main session syncs, and nothing coordinates writes to `INDEX.md`, a task's `MEMORY.md`, `Insights/*.md` or `CHECKPOINT.yml`.

**Sketch.** Two layers, both plain files.
- **Atomic replace as the standard write:** write to `<name>.tmp`, then rename over the target. Rename is atomic on every filesystem the plugin will meet, and a crash leaves either the old file or the new one, never half of both.
- **`LOCKS.md` with leases** for the shared files: one row per held lock - file, holder, started, TTL. Take the lease before writing, release after; an expired lease may be taken over, with the takeover recorded. This is not general concurrency control, it is a cheap way to stop two writers from interleaving edits to the same log.

**Why it fits.** No infrastructure, no daemon - a text file and a rename. And it repairs an existing promise rather than adding a feature: the method already claims atomicity in writing.

**Cost.** M. One paragraph in the write operations, one new workspace file, and a takeover rule.

### 13. `OPS_LOG.md` - an append-only journal of automatic operations 🔴 from external review

**Problem.** The automatic operations (sync, seal, observer pass, close) touch several files in sequence. If the session dies mid-sequence, nothing records how far it got: the next session sees a partially updated workspace and cannot tell which half is missing.

**Sketch.** Each automatic operation appends two lines to `OPS_LOG.md` - start (operation, target files) and end (result, or the failure). On session start, an unterminated entry is a recovery signal, exactly as an `active` `CHECKPOINT.yml` is for long user-facing work. The log is append-only and never edited; it is a black box, not a status file.

**Why it fits.** Same philosophy as the checkpoint rule (Rule 11), one level down: the checkpoint tracks *the user's* long operation, the ops log tracks *the agent's* own maintenance. Both exist because a session can die between two writes.

**Cost.** S-M. A line in each operation plus a session-start check.

### 14. Compress the method into trigger -> action -> record 🔴 from external review

**Problem.** `skills/task-memory/SKILL.md` is ~36 KB. The external reviewer's verdict was blunt: too much explanatory prose, too few machine-checkable obligations - an agent will retain the philosophy and quietly drop the small duties (markers, thresholds, status formats). Several rules also restate each other: Rule 4 duplicates the sync order that "The sync" already owns, Rule 5 repeats the dedup logic, Rule 10 states cold / read-only / diversity three times.

**Sketch.** Keep the rationale - it is why the rules survive contact with a busy session - but move it out of the operational path. Each rule becomes a compact block: **trigger, input, action, record format, exception**; the reasoning moves below it or into the README. Wording that states an intention ("announce before spending", "synthesis is the value", "a forced insight is worse than silence") is rewritten as a checkable action or dropped.

**Why it fits.** The method's own principle applied to itself: an instruction the agent cannot reliably execute is decoration, exactly as an insight nobody retrieves is decoration.

**Cost.** M. A rewrite of one file, with the risk of losing nuance - worth an outside read afterwards.

---

## Next - worth doing, needs more shaping

### 5. Retrieval interop - "markdown is truth, index is a rebuildable shadow" ✅ shipped as [docs/RETRIEVAL.md](docs/RETRIEVAL.md)

**Problem.** Recall currently rides on the index file plus grep. That holds at the current scale (dozens of files) and keeps the zero-infrastructure promise, but a workspace with hundreds of tasks and thousands of insights will outgrow lexical search.

**Sketch.** Do **not** build retrieval into Memento. Document the interop contract instead: Memento files are the source of truth; any hybrid-search runtime that treats its index as a *derived, rebuildable cache* (the EverOS / memsearch architecture) can index the workspace without owning it. A short `docs/RETRIEVAL.md` with the invariants: index never writes back, deletion-by-file wins over index contents, frontmatter `description` is the retrieval unit for auto-memory.

**Why it fits.** Keeps the plugin honest about its lane; users who need vectors get them without Memento growing a database. Interop, not reinvention.

**Cost.** S (a doc), plus testing one reference pairing.

### 6. Session-start priming order

**Problem.** What the agent reads first when entering a task folder is currently implicit (charter auto-loads; the rest is judgment). A month-old task read in the wrong order (old log before lenses) reproduces exactly the stale-frame failure Rule 6 exists to prevent.

**Sketch.** Fix the order as a rule: lenses -> `CURRENT PHASE` -> open questions and blockers -> newest log entries backwards, within a stated token budget; sealed blocks only on demand. One paragraph in the skill.

**Cost.** S.

### 7. Observer economics - budget and rotation in CONFIG

**Problem.** Observer passes cost real money and the spend is invisible. There is no policy for which mandate gets which model, and no cap.

**Sketch.** CONFIG.md gains optional `budget:` (monthly cap; passes degrade to the cheapest model, then to skip-with-note when exceeded) and per-mandate model hints (verification -> strongest, calendar audits -> cheapest). The observer-pass report states the spend. All still plain markdown config.

**Cost.** S-M.

### 8. Next-session prep note

**Problem.** Each session re-derives "where was I" even with good memory - the files say what happened, not what to pick up first.

**Sketch.** The sync's last step may append one line to `CURRENT PHASE`: *next: <the single most likely next action>*. Strictly one line, strictly overwritten each sync - a stale "next" is worse than none. (EverOS ships a whole "foresight" track; one honest line is the zero-cost version.)

**Cost.** S.

_External review (06.08.2026) arrived at the same idea from the cold-start angle and proposed a separate `NEXT.md` per task instead - next action, blocker, evidence needed - to cut the tokens a fresh session spends reconstructing state. Same problem, bigger footprint: worth deciding one line inside `CURRENT PHASE` versus a file, but not worth two entries._

### 15. Format self-check before a sync completes 🔴 from external review

**Problem.** The method relies on formats that only a human notices when broken: insight frontmatter (`status`, `falsifier`, `depends_on`, at least two sources), decision blocks `D<N>.<M>`, the `_Last insight pass:_` marker, status glyphs. Nothing checks them, so drift is silent and only surfaces when a cold reader - or an observer - trips over it.

**Sketch.** A `SCHEMA.md` stating the required shapes, and one self-check step at the end of the sync: the agent re-reads what it just wrote against the schema and fixes or reports deviations. No linter binary - the agent is the linter, which is the same bet the whole plugin makes.

**Why it fits.** Cheap, file-only, and it turns a class of silent errors into loud ones.

**Cost.** M.

### 16. Doctor pass - structural repair, not content review 🔴 from external review

**Problem.** Structural rot accumulates below the level any current pass looks at: pointer lines to insight files that were renamed, task folders missing one of the five files, an `active` checkpoint from three weeks ago, a folder on disk that no index row mentions.

**Sketch.** A periodic read-only sweep that reports exactly these four - broken pointers, incomplete file sets, stale checkpoints, orphan folders - and proposes the repairs. Distinct from the observer's memory auditor, which judges *content*; this one only checks that the structure holds together, and therefore needs no model call at all.

**Why it fits.** Maintenance is the agent's duty; this is the cheapest possible form of it.

**Cost.** S.

### 17. Exits for states that currently have none 🔴 from external review

**Problem.** Two states can be entered and not left. An `active` `CHECKPOINT.yml` has a "finish it" rule but no escalation if nobody does - after a few weeks it becomes furniture. And `status: interpretation` (Rule 9) forbids a claim from carrying a decision but never says how an interpretation becomes a hypothesis, so it can sit forever, neither usable nor removable.

**Sketch.** For the checkpoint: an age threshold after which the session must raise it rather than mention it. For interpretations: a stated transition - an interpretation becomes a hypothesis the moment a falsifier can be named, and is closed when the question it answers stops mattering.

**Why it fits.** The method already refuses to delete anything; that only works if every state has a defined way out.

**Cost.** S.

---

## Later - real ideas, not yet earned

### 9. Shared-workspace governance

Multiple agents (or agent + human teammates) writing one workspace: per-file ownership, append-only zones, arbitration through lenses instead of overwrites. Active research area ("governed shared memory"); wait until a real multi-writer workspace exists before designing.

### 10. Profile portability

Export a privacy-filtered pack of `user_*` / `feedback_*` auto-memory to bootstrap a new environment ("how we work together" travels, project internals do not). Needs a real second environment to test against.

### 11. Domain template packs

The 5-file templates are one flavor (multi-stakeholder knowledge work). Packs for other task shapes - incident response, research spikes, content pipelines - once someone actually asks.

---

## Deliberately not doing

- **Built-in vector database / embeddings.** The category's crowded lane; breaks zero-infrastructure and file-ownership. Interop instead (see 5).
- **Automatic session capture into memory** (transcript-summarization pipelines). Memory should hold *curated* facts with sources, not compressed chat logs - the drift between "what was said" and "what a summarizer kept" is exactly the noise the method filters out.
- **Confidence scores on ordinary facts.** A fact either has a date and a source or it does not belong; numeric confidence theater on top of that adds maintenance without adding truth. Verification statuses stay reserved for *derived* claims (insights, skills).
