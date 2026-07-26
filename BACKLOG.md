# Memento backlog

Candidates for future rules and operations. Each entry states the problem, a design sketch, why it fits the philosophy (plain files, zero infrastructure, maintenance as the agent's duty, distrust of one's own memory), and a cost estimate. Ordered by priority within each horizon.

Sources of inspiration are named where relevant - the 2026 memory-runtime landscape (EverOS, memsearch, VerificAgent, MEMPROBE) converged on several ideas worth adopting, and several worth deliberately *not* adopting.

---

## Now - strongest candidates for the next releases

### 1. Rule 11: Case distillation - closed tasks become skills (verified procedural memory)

**Problem.** Closed task folders are an archive, not leverage. The same kind of task (a release-SQL package, a smoke-test harness, a stakeholder-alignment dance) gets re-derived from scratch, and the archive only helps if someone thinks to read it.

**Sketch.**
- On close, the agent appends a compact **Case** block to the task's memory: what the task type was, what approach worked, what failed (won't-do items and refuted insights included), what artifacts are reusable as templates.
- The insight pass (Rule 9 pattern shape) watches for **2-3 similar Cases** across closed tasks. When the threshold fires, the agent proposes distilling a **Skill** - a reusable instruction file (in Claude Code, a real `.claude/skills/` entry; elsewhere, a `Skills/` folder in the workspace).
- **The Memento twist - no self-confirmation for skills.** A skill is a generalized claim ("this is how this kind of task is done"), so it inherits Rule 10: a distilled skill candidate is *verified by an outside observer* against the Cases it came from before it becomes a standing instruction. Candidates live in `Skills/candidates/` until promoted.

**Why it fits.** Pure files, automatic trigger, and it extends the core differentiator (verification) to procedural memory - EverOS and memsearch both distill skills, neither verifies them. Their known failure mode (a lucky one-off becomes a "skill") is exactly what the observer gate prevents.

**Cost.** M. New rule + a close-operation extension + one observer mandate ("skill auditor": do the Cases actually support the generalization?).

### 2. Dead-end recall - refuted memory must be retrieved, not just kept

**Problem.** We already keep refuted insights and won't-do items ("a documented dead end is also memory") - but nothing forces the agent to *look at them* when planning. Industry evaluations note that retrieving what failed matters as much as retrieving what worked (contrastive recall); storage without retrieval is decoration.

**Sketch.** One rule addition: before recording a new plan, approach decision, or skill candidate, the agent greps `Insights/` for `status: refuted` and the relevant tasks' won't-do items, and states either "no known dead ends touch this" or which ones do. The sync report gains a one-line `Dead-end check` entry when a plan was recorded.

**Why it fits.** Zero new structure - it activates data the system already stores. Directly attacks the "accidental rollback to a rejected option" failure the whole method exists to prevent.

**Cost.** S. A paragraph in Rule 9/Rule 3 and one line in the sync operation.

### 3. Panel voting - graduated verification for high-stakes claims

**Problem.** Rule 10 currently promotes a hypothesis on a single observer's verdict. For cheap insights that is proportionate; for a claim that feeds a release decision, one model's vote is a thin gate - and verifier models err too.

**Sketch.**
- Two verification tiers, chosen by stakes: **single-verdict** (default) and **panel vote** - every model in the pool gets the same verification brief, each through a *different lens* (correctness of sources / alternative explanation / consequence check), majority decides, ties escalate to the user.
- Stakes triggers for the panel tier: the insight touches a release artifact, contradicts a stakeholder statement, or would revise a decision (D-block).
- Verdicts recorded as `verified by 2/3 panel (gpt-5.6-sol, grok-4.5), <date>` - the dissent is named, not averaged away.

**Why it fits.** Uses the pool that already exists; deepens the differentiator. Diverse lenses beat identical refuters - failure modes differ, so coverage compounds.

**Cost.** S-M. Rule 10 extension + observer-pass branching on stakes.

### 4. Memory health score - formalize the cold-read test

**Problem.** Every observer pass already doubles as a test of whether the files speak for themselves, but the result evaporates into prose. MEMPROBE-style thinking applies: memory quality is measurable as an artifact, separately from task success.

**Sketch.**
- Every observer report ends with a mandatory short **Memory quality** section (the Sapper mandate already has one): could the task be reconstructed from files alone; what was missing; 0-10 score.
- The status overview aggregates the latest scores per task into one line (`memory health: 8/10, gap: execution facts missing`) and flags tasks whose score dropped.
- A task closing with a low score gets one repair pass before archive - the archive is only worth keeping if a future reader can use it.

**Why it fits.** No new infrastructure; turns an existing side effect into a tracked signal. Also the honest metric for the method itself - if scores are low, Memento is failing at its one job.

**Cost.** S. Report template line + status-overview aggregation.

---

## Next - worth doing, needs more shaping

### 5. Retrieval interop - "markdown is truth, index is a rebuildable shadow"

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
