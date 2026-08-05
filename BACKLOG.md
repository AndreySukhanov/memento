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

### 12. Write safety - atomicity that is a procedure, not a promise ⛔ half rejected by panel, half re-scoped (06.08.2026)

**Problem.** `commands/init.md` instructs the agent to "write `CLAUDE.md` and update `INDEX.md` atomically". On plain Markdown, with no protocol, that is a declaration - an interrupted write leaves a registered task with no charter, or a charter no index knows about. The exposure grew with v2.8.0: a consilium can be running while the main session syncs, and nothing coordinates writes to `INDEX.md`, a task's `MEMORY.md`, `Insights/*.md` or `CHECKPOINT.yml`.

**Sketch.** Two layers, both plain files.
- **Atomic replace as the standard write:** write to `<name>.tmp`, then rename over the target. Rename is atomic on every filesystem the plugin will meet, and a crash leaves either the old file or the new one, never half of both.
- **`LOCKS.md` with leases** for the shared files: one row per held lock - file, holder, started, TTL. Take the lease before writing, release after; an expired lease may be taken over, with the takeover recorded. This is not general concurrency control, it is a cheap way to stop two writers from interleaving edits to the same log.

**Why it fits.** No infrastructure, no daemon - a text file and a rename. And it repairs an existing promise rather than adding a feature: the method already claims atomicity in writing.

**Cost.** M. One paragraph in the write operations, one new workspace file, and a takeover rule.

> **Panel verdict, 06.08.2026** (gpt-5.6-sol plus an in-session lens; a third model returned an empty response and did not count).
>
> **`LOCKS.md` is rejected outright.** Both lenses independently reconstructed the same race: two agents read the file, both see it free, both write - and atomic replace protects the bytes while doing nothing about the lost update. A TTL makes it worse rather than better, since expiry does not prove the holder died; it may wake after the takeover and keep writing. Safe leasing needs a fencing token the store itself checks, and a Markdown file checks nothing. Any workable version needs an atomic arbitration primitive (`mkdir`, `O_EXCL`, a hard link, an OS lock) - all of which sit outside "plain files".
>
> **temp+rename is contested, and the disagreement is kept, not averaged.** The external lens rates it useful for single-file writes. The in-session lens rates it actively harmful *here*: this method almost never writes a whole file - the sync appends a dated entry, adds a `D<N>.<M>` block, ticks a checkbox, fixes one index line. Routing surgical edits through a full rewrite means an LLM re-emitting a 12 KB log every time, which silently drops lines and reformats tables. That trades a torn write nobody has observed for lossy rewrites on a schedule.
>
> **Neither layer solves the bug this item was opened for.** That bug is a two-file transaction (`CLAUDE.md` plus the index row); atomic replacement of one file has nothing to say about it.
>
> **What shipped instead (v2.8.3), at a fraction of the cost:** content-before-pointer ordering, so every interruption leaves a state the structure check can repair; the index demoted to a rebuildable shadow, which removes the only two files where writers can actually collide; and one-ritual-at-a-time, which addresses the failure the panel found to be real.
>
> **What stays open, now with a falsifier.** By this method's own Rule 9, "partly unworkable on long, parallel sessions" was an *interpretation*: no falsifier was named and no incident was ever observed - it came from reading the text, not from a broken workspace. It is now falsifiable: **an index row pointing at a folder that does not exist, or two interleaved entries inside one `MEMORY.md`**. The structure check looks for the first for free. If a month of use produces neither, this item closes as not needed.

### 13. `OPS_LOG.md` - an append-only journal of automatic operations ✅ shipped in v2.10.0

**Problem.** The automatic operations (sync, seal, observer pass, close) touch several files in sequence. If the session dies mid-sequence, nothing records how far it got: the next session sees a partially updated workspace and cannot tell which half is missing.

**Sketch.** Each automatic operation appends two lines to `OPS_LOG.md` - start (operation, target files) and end (result, or the failure). On session start, an unterminated entry is a recovery signal, exactly as an `active` `CHECKPOINT.yml` is for long user-facing work. The log is append-only and never edited; it is a black box, not a status file.

**The asymmetry is the point** (panel review, 06.08.2026): the opening line is written *before* the first file is touched. A forgotten closing line then raises a false alarm - which someone notices - instead of leaving no trace at all, which nobody does. Fail loud beats fail silent, and for an LLM executor that ordering carries most of the value.

**Why it fits.** Same philosophy as the checkpoint rule (Rule 11), one level down: the checkpoint tracks *the user's* long operation, the ops log tracks *the agent's* own maintenance. Both exist because a session can die between two writes.

> **The skeptic lens (06.08.2026) arrived here from a different direction and made the case sharper.** Its complaint was that three things the method calls guarantees - "one ritual at a time", "content before pointer", and automatic operation itself - are enforced by nothing but the model remembering the rule. Its exact words about the ritual: *"the remaining steps happen only if the model remembers where it was. It usually does not"* - followed by a rule whose execution again depends on the model remembering that rule. That circularity is real and this item is the only proposed thing that breaks it: an operation that opens a log line before touching a file leaves evidence of itself independent of whether the model remembered anything afterwards. It does not make the ritual atomic; it makes a broken ritual **findable**, which is the difference between a guarantee and a claim.

**Cost.** S-M. A line in each operation plus a session-start check.

> **Shipped 06.08.2026.** Two lines per operation in `<workspace_root>/OPS_LOG.md`, opening line before the first write. Two things were decided during implementation and are worth recording. **The log is the one file the method prunes** - past ~200 lines the oldest *closed* pairs go, because a closed pair says nothing the sync report and the files do not; unterminated lines are never pruned at any age, they are the entire reason the file exists. And **the honest limit is stated in the skill itself**: the log cannot catch an operation that never announced itself, so it is not a substitute for *one ritual at a time* and not a guarantee of atomicity - the structure check remains the backstop for damage nobody announced. It converts a claim into evidence, which is all it was ever supposed to do.

### 14. Compress the method into trigger -> action -> record ✅ shipped in v2.9.0

**Problem.** `skills/task-memory/SKILL.md` is ~36 KB. The external reviewer's verdict was blunt: too much explanatory prose, too few machine-checkable obligations - an agent will retain the philosophy and quietly drop the small duties (markers, thresholds, status formats). Several rules also restate each other: Rule 4 duplicates the sync order that "The sync" already owns, Rule 5 repeats the dedup logic, Rule 10 states cold / read-only / diversity three times.

**Sketch.** Keep the rationale - it is why the rules survive contact with a busy session - but move it out of the operational path. Each rule becomes a compact block: **trigger, input, action, record format, exception**; the reasoning moves below it or into the README. Wording that states an intention ("announce before spending", "synthesis is the value", "a forced insight is worse than silence") is rewritten as a checkable action or dropped.

**Why it fits.** The method's own principle applied to itself: an instruction the agent cannot reliably execute is decoration, exactly as an insight nobody retrieves is decoration.

**Cost.** M. A rewrite of one file, with the risk of losing nuance - worth an outside read afterwards.

> **Shipped 06.08.2026, 43 KB -> 27 KB.** Three files instead of one: `SKILL.md` keeps the operational path (trigger / action / record / exception per rule), `docs/SCHEMA.md` owns every required shape, `docs/RATIONALE.md` owns the arguments. Nothing was dropped - the prose moved. The restatements did go: Rule 4 no longer repeats the sync order, Rule 5 no longer repeats dedup twice, Rule 10 no longer states cold / read-only / diversity in three places. The nuance risk is real and the mitigation is the same one the method prescribes for itself - an outside read, still owed.

### 18. Repo review, second pass (gpt-5.3-codex, 06.08.2026 on v2.10.0) - triaged

The first external review produced items 12-17. This is the second, run on the repository after 2.9.0-2.10.1. Everything actionable was applied the same day; what follows is the record of what was applied, what was rejected, and why - so neither half comes back around uninvestigated.

**Applied in v2.10.1.**
- *The index contradicted itself across files.* `templates/INDEX.md.tmpl` called itself "single source of truth" while the skill and schema call it a derived, rebuildable shadow. The template now says derived, and the README no longer promises "always one file away" without the qualifier.
- *`dead_ends_checked:` accepted a bare count.* Names are now required even when nothing is relevant: a count alone can be invented, a count plus names is one folder listing from being checked.
- *"Drop to the cheapest model" was unverifiable.* The config now carries a required `- cheapest:` line whenever `- budget:` is set, and every pass records `budget_action: normal | degraded | skipped`. Otherwise "degraded correctly" and "used whatever was convenient" produce identical records.
- *Three outcomes vanished silently:* a sync the user declined, a pass skipped on budget, and a recovery after an unterminated log line. All three now have a required closing shape in `OPS_LOG.md` - they are exactly the cases that look like "nothing happened" from outside.
- *`OPS_LOG.md` was over-promised.* The README said "every automatic operation"; session start and the status overview are read-only and log nothing. Scoped to operations that write, in both files.
- *Rationale had crept back into the skill.* The three-paragraph argument for the log's ordering moved to `docs/RATIONALE.md`, leaving the obligation and the honest limit in the operational path.
- *`README.md` overstated automaticity.* "All maintenance is automatic" now names its own exceptions - a declined sync, a missing key, an exhausted budget, a session that only answered questions.

**Rejected: a "session start primed: yes/no" line in the sync report.** It fails this method's own verifiability test. The line would change a byte on disk, but nothing on disk could ever contradict it - unlike `_Last insight pass:`, which can be compared against the newest dated entry. A self-reported "I read the lenses first" is precisely the honour-system sentence the test exists to exclude, and adding it would make the file look more rigorous while measuring nothing. Recorded in `docs/RATIONALE.md` so the idea does not return as a fresh suggestion.

**Dismissed as an artifact of the review setup.** The reviewer reported `commands/init.md` as a link into nothing. The file exists; the runner had been packing attachments under their base names, so the model could not see the tree. Fixed in the runner - it now passes full relative paths - and worth remembering as a general trap: a review of a repository is only as good as the reviewer's picture of its layout.

**Not adopted, glyphs.** The templates ship an ASCII glyph set while the schema's example is emoji. The schema always allowed any four-glyph set with a legend in the file, so this is not drift - but the schema now says so explicitly and separates status glyphs from section-heading decoration, which is what made it look like a conflict.

### 19. Core and layers - the method declares what is optional ✅ shipped in v2.11.0

**Problem.** Every rule was presented as equally load-bearing. An outside evaluation of the method (gpt-5.3-codex, 06.08.2026) disagreed on both halves: the value curve **breaks after the core** - threshold, stable/volatile split, append-only decisions, sync, short log - while insight synthesis, observers and the consilium pay off depending on the class of task and are cost without return on tasks that do not fit them. And the strongest argument against the whole method is not a bug but a busy month: brittleness to a drop in execution discipline, after which it degrades into expensive ritual documentation where the form is maintained and the thinking is not.

**Shipped.** Seven core rules and four core operations named as such; five layers named as optional with the condition under which each is worth its cost; `mode: core` as one machine-readable line in the `INDEX.md` header, default `full`. In core mode the layers fire only when asked for by name.

**Why this and not a lighter method.** The failure mode of an all-or-nothing protocol is abandonment, not trimming - under pressure people stop it rather than reduce it, and the memory dies whole. Declaring a core makes trimming a supported move, and the core is small enough to survive a stretch with no enthusiasm behind it, which is the only test that matters.

**Same evaluation, also applied:** the dead-end check became two-level. Names of the scanned files are required when the stakes are high - a release artifact, a contradicted stakeholder, a revised D-block - and optional on routine plans, where the evaluation called mandatory enumeration "ritual for the sake of ritual". The stakes triggers are the same ones that already select the verification tier, so this is one concept, not two.

**What stays open, and is not closed by this.** The evaluation named a risk the split does not touch: formal compliance without semantic selection - the system honestly producing many entries whose conclusions are weak, with the form legitimising them. The method's detectors catch form and reconstructibility, not truth. Rule 10 is the nearest thing to an answer and only a partial one. Recorded here rather than in a changelog, because any future rule should be checked against it: does this help the thinking, or only the paperwork?

### 20. Three-mandate audit of the repository (06.08.2026) - applied

The method's own Rule 10 run on the method: memory auditor (gpt-5.6-sol), sapper (gpt-5.3-codex), cold reader (minimax-m3). A fourth model, deepseek-v4-pro, failed on `402 Payment Required` mid-run - the same failure mode that emptied the pool once before, and worth recording again: a pool of paid models degrades silently into no pool at all. Both remaining lenses on the OpenAI side means diversity was thinner than the rule asks for; noted rather than papered over.

**The worst finding was the cheapest to miss: the bundled templates did not satisfy the schema.** `MEMORY.md.tmpl` had its own section order, no `Sealed` block, an undated `## Current phase`, and no glyph legend; `TASKS.md.tmpl` wrote phase headers with no glyphs; the observer config created by `init` set `- budget:` without the `- cheapest:` line the schema requires. Every new workspace therefore started life failing its own self-check. Fixed, and it is the most instructive class of bug in this repository: the specification and the thing that produces files had drifted apart while both looked maintained.

**`mode: core` was bypassable.** v2.11.0 declared that layers do not self-activate in core mode, but the layer rules and the consilium skill still described themselves as firing automatically, and nothing said to check the mode at the trigger. The gate is now one explicit paragraph in the skill plus a check in the consilium skill itself - the two files that could otherwise override a mode the workspace declared.

**Other contradictions closed:** the core was "six rules" in one file and seven in two others; the folder threshold was "more than two stakeholders" in the skill and "2+" everywhere else; `CHECKPOINT.yml` was described as existing only during an operation while the rules keep it with a final status; observers were "skipped silently" in `init.md` and "skipped with a note" in the skill; the README still described observers as OpenRouter-only, listed shipped features as roadmap candidates, and counted four structure checks where there are now five; the index template credited the read-only status overview with maintaining the index.

**Three ambiguities the cold reader could not have executed.** "Stop at the stated token budget" - the budget was stated nowhere, so a default is now named. The `next:` line had no tie-breaker when several actions compete; the order is now unblocks-someone-else, then deadline, then what the last session was doing. And "a stakeholder statement arrived" as a sync trigger did not exclude bare acknowledgements, which are excluded in `init.md` - so a diligent agent would have logged three lines of "ok".

**The biggest gap was not a contradiction at all.** The cold reader scored restorability 6/10 and named the reason: everything in the repository is a specification, and no file showed what any of it looks like after a month of use. Its estimate was that a filled example would save a first week of mistakes, some of them irreversible - a swallowed dead end, a lost refutation. `examples/` is the answer: one task six weeks in, with a revised decision, two lenses, a refuted insight that later did its job, a sealed block, and an operations log containing a session death and its recovery.

**Sapper findings kept as live assumptions rather than fixed.** Three rules rest on things never tested, only reasoned: that different model families err *independently* (the load-bearing assumption under Rule 10), that two sources plus a panel meaningfully reduce false conclusions rather than legitimising weak causality, and that ~250 lines / ~12 KB is a sound compaction threshold across task types. Each is falsifiable and none is falsified: the first dies if `Observers/` accumulates cases where different models were wrong the same way about hypotheses later refuted; the second if insights routinely pass the schema and the panel and then get revised in fact; the third if seals repeatedly cut context that turns out to be live. Watching, not acting.

### 21. The audit's leftovers, and the pool that keeps emptying itself ✅ shipped in v2.12.1

Everything item 20 raised and 2.12.0 did not close: the vocabulary table for open question / blocker / risk / insight, the relationship between `_needs clarification_` and open questions, the three apparent contradictions (check-reports-itself vs nothing-fired, observer triggers created mid-sync, session start with several active tasks), and the version question - which rules is this agent running.

**One thing here is more than tidying.** Rule 10's whole claim rests on different model families erring independently, and that had never been tested - it was reasoned from "different training, different failures". It is now recorded: an insight that was verified and is later refuted names the models that verified it. The data accumulates on its own from that point, and if it ever shows the same models wrong together, the panel is one opinion wearing three names.

**And a finding about running observers at all, which belongs here rather than in a changelog.** The model pool emptied itself twice in one day - first when paid models hit `402` mid-pass, then again when the replacements chosen to fix that turned out to be paid too. A separate incident had a model report success with a zero-length response. Three rules came out of it, and they generalise past this project:

1. **A model enters the pool only after a probe that reads the answer**, not after a successful call. The runner proves a request happened; only the length of the reply proves a model answered.
2. **At least two of three pool entries should cost nothing**, so an exhausted balance degrades the panel rather than emptying it.
3. **A prose table in the config configures nothing.** Both incidents were preceded by a config that documented the right decision in words while the machine-readable lines said something else.

The probe itself is nine lines of loop and lives with the workspace, not in the plugin - but the rules are in `docs/SCHEMA.md` under the config format, where the next person setting up observers will meet them.

---

## Next - worth doing, needs more shaping

### 5. Retrieval interop - "markdown is truth, index is a rebuildable shadow" ✅ shipped as [docs/RETRIEVAL.md](docs/RETRIEVAL.md)

**Problem.** Recall currently rides on the index file plus grep. That holds at the current scale (dozens of files) and keeps the zero-infrastructure promise, but a workspace with hundreds of tasks and thousands of insights will outgrow lexical search.

**Sketch.** Do **not** build retrieval into Memento. Document the interop contract instead: Memento files are the source of truth; any hybrid-search runtime that treats its index as a *derived, rebuildable cache* (the EverOS / memsearch architecture) can index the workspace without owning it. A short `docs/RETRIEVAL.md` with the invariants: index never writes back, deletion-by-file wins over index contents, frontmatter `description` is the retrieval unit for auto-memory.

**Why it fits.** Keeps the plugin honest about its lane; users who need vectors get them without Memento growing a database. Interop, not reinvention.

**Cost.** S (a doc), plus testing one reference pairing.

### 6. Session-start priming order ✅ shipped in v2.10.0

**Problem.** What the agent reads first when entering a task folder is currently implicit (charter auto-loads; the rest is judgment). A month-old task read in the wrong order (old log before lenses) reproduces exactly the stale-frame failure Rule 6 exists to prevent.

**Sketch.** Fix the order as a rule: lenses -> `CURRENT PHASE` -> open questions and blockers -> newest log entries backwards, within a stated token budget; sealed blocks only on demand. One paragraph in the skill.

**Cost.** S.

> **Shipped 06.08.2026 inside the new Session start operation**, which item 13 had just created for the `OPS_LOG.md` and checkpoint checks - so the reading order landed in an operation that already runs first, instead of becoming a paragraph somebody has to remember. The ordering argument is stated with it: the three cheapest things to read are the three that change how everything else is interpreted, which is why they sit in fixed places. Entering through the newest log entries is the failure being prevented - they are the most detailed and the least oriented.

### 7. Observer economics - budget and rotation in CONFIG ✅ shipped in v2.10.0

**Problem.** Observer passes cost real money and the spend is invisible. There is no policy for which mandate gets which model, and no cap.

**Sketch.** CONFIG.md gains optional `budget:` (monthly cap; passes degrade to the cheapest model, then to skip-with-note when exceeded) and per-mandate model hints (verification -> strongest, calendar audits -> cheapest). The observer-pass report states the spend. All still plain markdown config.

**Cost.** S-M.

> **Shipped 06.08.2026, with the budget counted in passes rather than money.** Money cannot be verified from inside the workspace - prices drift and nothing here can check them - while `Observers/` is a dated folder whose contents are one listing away. The ledger is the folder itself, so there is no counter file to drift out of sync with reality.
>
> Two field lessons shipped with it, both from the plugin author's own workspace on the same day. **Prose in the config configures nothing:** a config had documented at length a decision to stop calling two paid models, and every pass kept calling them and failing on payment errors - the file looked configured and was not. That is now stated in the config format itself. And **a runner's `OK` is not a result:** a model returned zero characters, the runner reported success, and the empty file sat in `Observers/` looking like a verdict. The pass now checks that a report is a report before triaging it, which is the same rule the method already applies to its own obligations - verify the outcome, not the invocation.

### 8. Next-session prep note ✅ shipped in v2.10.0

**Problem.** Each session re-derives "where was I" even with good memory - the files say what happened, not what to pick up first.

**Sketch.** The sync's last step may append one line to `CURRENT PHASE`: *next: <the single most likely next action>*. Strictly one line, strictly overwritten each sync - a stale "next" is worse than none. (EverOS ships a whole "foresight" track; one honest line is the zero-cost version.)

**Cost.** S.

> **Shipped 06.08.2026 as one line inside `CURRENT PHASE`, not a file.** The deciding argument was staleness: a `next:` line living inside the block the sync already rewrites gets refreshed by an operation that runs anyway, while a separate `NEXT.md` is one more file to remember, and the one thing worse than no next-action is yesterday's next-action. The rule states the failure mode directly - if a sync cannot name a single next action, it deletes the line rather than leaving the old one.

_External review (06.08.2026) arrived at the same idea from the cold-start angle and proposed a separate `NEXT.md` per task instead - next action, blocker, evidence needed - to cut the tokens a fresh session spends reconstructing state. Same problem, bigger footprint: worth deciding one line inside `CURRENT PHASE` versus a file, but not worth two entries._

### 15. Format self-check before a sync completes ✅ shipped in v2.9.0

**Problem.** The method relies on formats that only a human notices when broken: insight frontmatter (`status`, `falsifier`, `depends_on`, at least two sources), decision blocks `D<N>.<M>`, the `_Last insight pass:_` marker, status glyphs. Nothing checks them, so drift is silent and only surfaces when a cold reader - or an observer - trips over it.

**Sketch.** A `SCHEMA.md` stating the required shapes, and one self-check step at the end of the sync: the agent re-reads what it just wrote against the schema and fixes or reports deviations. No linter binary - the agent is the linter, which is the same bet the whole plugin makes.

**Why it fits.** Cheap, file-only, and it turns a class of silent errors into loud ones.

**Cost.** M.

> **Shipped 06.08.2026 together with 14**, which is what made it cheap: the schema had to be written down anyway to get the formats out of `SKILL.md`, and once it exists the check is one more sync step (step 9) that reads it. Scope is deliberately narrow - the self-check reads **what this sync just wrote**, not the workspace; sweeping the whole thing is the structure check's job, and merging the two would make both too expensive to run every time. Deviations are fixed in place; anything that cannot be fixed without inventing a fact becomes an open question, because the schema never outranks the truth of the log.

### 16. Doctor pass - structural repair, not content review ✅ shipped in v2.8.2

**Problem.** Structural rot accumulates below the level any current pass looks at: pointer lines to insight files that were renamed, task folders missing one of the five files, an `active` checkpoint from three weeks ago, a folder on disk that no index row mentions.

**Sketch.** A periodic read-only sweep that reports exactly these four - broken pointers, incomplete file sets, stale checkpoints, orphan folders - and proposes the repairs. Distinct from the observer's memory auditor, which judges *content*; this one only checks that the structure holds together, and therefore needs no model call at all.

**Why it fits.** Maintenance is the agent's duty; this is the cheapest possible form of it.

**Cost.** S.

### 17. Exits for states that currently have none ✅ shipped in v2.8.2

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
