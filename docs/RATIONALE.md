# Why the rules are what they are

`skills/task-memory/SKILL.md` is the operational path: trigger, action, record. It deliberately does not argue with the reader - an instruction that spends four paragraphs justifying itself is an instruction the agent skims.

This file holds the arguments. Read it when a rule looks arbitrary or expensive, when you are about to relax one, or when you are adding a new one and want to know what the existing ones were paying for. Every rule here exists because its absence caused a real, remembered failure in months of daily multi-stakeholder work - none of them were designed in the abstract.

---

## Rule 1 - the threshold

Five files on a two-hour question is pure overhead, and overhead is how a method gets abandoned. The threshold is not about importance, it is about **how many ways the work can drift**: more than a day means memory has to survive a context reset; more than two stakeholders means statements will contradict each other; a release artifact means someone will ask "why this version?" in a month; more than two phases means a status will go stale between them.

## Rule 2 - stable vs volatile

The failure is not disorder, it is **double maintenance**. The same fact in the charter and the log gets updated in one place, and from then on the files disagree with each other while both look maintained. The litmus test exists because "important" is not a routing criterion - importance says nothing about whether a fact expires.

The charter is named `CLAUDE.md` because Claude Code auto-loads it when the agent works inside the folder. That is the whole retrieval pipeline: the task's stable context enters the model for free, every session, with no index, no embedding and no lookup step that can fail.

## Rule 3 - decisions are never deleted

A decision log that gets edited answers "what do we do?" A decision log that only ever appends answers "why did *this* become that?" - which is the question that actually costs money to re-derive. A month later, nobody can reconstruct why option B beat option A from a file that only contains B, and the predictable outcome is someone confidently proposing A again.

**Dead-end recall** is the other half. Keeping refuted insights is cheap and feels responsible; nothing forces anyone to *look* at them at the moment a new plan is being written. Storage without retrieval is decoration. The rule ties the scan to the exact moment it pays - just before a decision is committed.

And the result goes in the D-block rather than the chat because the two are indistinguishable from outside. "No known dead ends touch this" is seven tokens whether or not anything was read.

## Rule 4 - the agent syncs, not the user

A ritual that depends on the user remembering it gets skipped exactly when the session was busiest - which is exactly when the memory mattered most. So the sync is a duty, not a command, and it announces rather than asks: recording what happened is the whole point of the system, and asking permission for it invites a "not now" that is never followed by a "now".

The **write-immediately tier** came from a field observation: a session that ran for two weeks, in which memory only moved when the user explicitly asked. Everything had been deferred to "the end of the session", and the end of the session never arrived. Decisions, correction lenses and durable cross-task facts are too expensive to lose to a boundary that may not come.

The counterpart matters just as much: **nothing fired, nothing written**. A sync that touches files after a pure question-answering session adds noise to the log and teaches the reader that dated entries do not mean anything happened.

## Rule 5 - compaction

An append-only log grows until it no longer fits the context window it was meant to save. A memory file too big to load is the same failure as having no memory - reached slowly, which is why nobody notices until it has happened.

Sealing rather than deleting keeps the audit property: you can still reconstruct *what we knew, and when*, at every level of compression. The levels exist so that compaction can run repeatedly without ever facing a choice between "keep everything" and "wipe".

**Dedup on append** came from a specific incident: one memory category reached 184 records, roughly half of them restatements of facts already present. The real updates were still in there, buried under near-duplicates that each looked like new information. The cost of a duplicate is not the space, it is that the current version becomes unfindable.

## Rule 6 - lenses instead of edits

Editing wrong history destroys two things at once: the record of what was believed and when (which often explains the decisions of that period), and any chance of catching every occurrence - the wrong fact is usually scattered across files, and a search-and-replace finds the phrasings you thought of, not the ones you did not.

A lens inverts the cost: one block, written once, corrects every future read of every affected entry, including the ones you never found. History stays auditable, and the correction is applied by the reader rather than by an edit pass that has to be exhaustive to be safe.

`CURRENT PHASE` handles the adjacent failure: files that are individually correct, read through a stale frame. An agent that opens a month-old log without knowing the situation flipped will reason perfectly from a world that no longer exists.

## Rule 7 - glyphs

Reading a 30 KB memory file to find out what is hot right now defeats the purpose of having memory. Glyphs make one pass enough for both a human and an agent.

The side effect is the more valuable one: status becomes visible, so it becomes falsifiable. A "burning" marker three months old is a finding that nothing was flagging before.

## Rule 8 - atomic auto-memory

The monolithic version - one growing file of cross-task facts - fails in a specific way: it becomes unreadable long before it becomes large, because a single fact cannot be revised without rewriting its surroundings, and retrieval degrades to "load everything and hope".

One fact per file with a `description` in frontmatter makes relevance decidable *without opening the file*, which is what keeps the index small enough to always be in context. A workspace running this shape accumulated around fifty such files over months with no maintenance burden.

## Rule 9 - insights

A memory that only accumulates entries is an archive. The value is in the combinations: the deadline that collides with a freeze, the approach that a newer fact just invalidated, the third occurrence of a failure that should have become a rule after the second.

**Why two tiers.** Contradictions and answered questions are cheap - they are direct matches against the section already open for dedup, and postponing them means knowingly leaving a false statement in memory. Pattern, implication and cross-task links are expensive and need critical mass: run them on every new fact and you get noise, because synthesis over two facts produces coincidences. The accumulation threshold is the honest version of "when there is enough to connect".

**Why `falsifier` and `depends_on`.** The known central risk of reflective memory is self-reinforcing error: the system derives a conclusion, stores it, later retrieves it as a fact and builds the next conclusion on top. The two fields attack both halves. A falsifier makes the claim killable, so it cannot quietly harden into an assumption. `depends_on` makes memory *reactive*: when a new fact arrives, the claims resting on the old one can be found and re-graded immediately, rather than sitting at `hypothesis` for weeks after their foundation collapsed.

**Why `interpretation` is a distinct status.** Some readings of the facts are useful and unfalsifiable at the same time - that is how understanding usually starts. Deleting them is wasteful, and leaving them labelled `hypothesis` is dangerous, because the failure mode is silent promotion: an interpretation that sits in memory long enough starts getting cited as a finding. Labelling it costs nothing and blocks exactly one thing - a decision resting on it.

**Why zero insights is a valid outcome.** A forced insight is worse than silence: it consumes trust in the whole `Insights/` folder, which only works if its contents are believed by default.

## Rule 10 - the author never grades their own work

The agent that wrote the memory is the worst available verifier of it. Its errors are systematic rather than random, it confirms its own hypotheses, and it reads every file through the lens of what it did today. This is not a quality problem to be fixed with better prompting - it is structural, and the structural answer is a different model.

**Cold is not an inconvenience, it is the test.** An observer that gets session context is grading a summary, not the memory. Giving it the files alone means every pass doubles as a live check that the files speak for themselves - which is the memory's one job, and otherwise nobody ever tests it.

**Diversity over repetition.** Models from different families fail differently, so their coverage compounds; the same model asked three times mostly repeats itself. The same logic drives per-lens assignment in a panel: three refuters with identical instructions converge, three lenses (sources / alternative explanation / consequences) do not.

**Why dissent is never averaged.** A 2/1 split with a named dissent carries information a "mostly verified" verdict destroys - specifically, *where* the claim is weak. The disagreement is often the most useful output of the pass.

**Memory health scores** exist because the cold read was already happening and its result was evaporating into prose. Scoring it turns a side effect into a tracked signal, and gives the method an honest metric against itself: if the scores are low, Memento is failing at its one job, whatever the task statuses say.

## The operations log

Three of the method's stated guarantees - *one ritual at a time*, *content before pointer*, and automatic operation itself - are enforced by nothing except the model remembering the rule. A skeptic lens put it exactly: the explanation of the failure ends with *"the remaining steps happen only if the model remembers where it was. It usually does not"* - and is then followed by a rule whose execution again depends on the model remembering that rule.

`OPS_LOG.md` is the only proposal that breaks that circle, and it breaks it only partly. An operation that opens a line before its first write leaves evidence of itself regardless of what happens next. That does not make anything atomic and does not help if the agent forgot the log entirely - but it converts "the ritual might have been interrupted" from a worry into a finding.

**Why open-before-write and not close-after.** The two orderings fail in opposite directions. Opening first means a forgotten close produces a false alarm: somebody investigates, finds the work was fine, closes the line. Cost: one wasted look. Writing only at the end means a death mid-operation produces nothing at all: the workspace is half-written and looks untouched. Cost: an undetected corruption that surfaces weeks later, usually at handover. A signal that occasionally fires wrongly beats one that occasionally fails to fire.

**Why it is the one file that gets pruned.** Everything else the method writes is kept forever, because refuted insights and superseded decisions carry information. A *closed* pair of log lines does not: whatever it recorded is also in the sync report, in the files themselves, and in their dates. Unterminated lines are the exception and are never pruned at any age - they are the only reason the file exists.

**A rejected addition: a "session start primed" marker.** A review proposed recording, in the first sync of a session, whether the session-start reading order had been followed. It was rejected on this method's own test. The line would change a byte on disk, but nothing on disk could contradict it: unlike `_Last insight pass:`, which can be compared against the newest dated entry, a self-reported "yes, I read the lenses first" has no counter-evidence anywhere. That is precisely the honour-system sentence the verifiability test was written to exclude, and adding it would have made the file *look* more rigorous while measuring nothing.

## Rule 11 - checkpoints

Context runs out, tools time out, machines reboot. The next session then inherits a half-finished bulk operation with no way to tell whether step 4 of 9 completed - and re-running a step is sometimes worse than skipping one.

Updating **after each step** rather than at the end is the entire rule: the end is precisely the moment that never arrives when something goes wrong.

The **7-day deadline** exists because "finish it" relies on somebody remembering, and this method exists because nobody does. An `active` checkpoint from three weeks ago trains the reader to ignore the file, which is worse than never having written it - a signal that fires falsely stops being a signal.

## The verifiability test

Added in v2.8.3 after a review found the pattern across several rules: obligations phrased as intentions ("announce before spending", "check the dead ends", "synthesis is the value") that leave no trace when skipped. Under load, a model will emit the sentence claiming the duty was done, because the sentence is free and the duty is not. Neither the user nor a later session can distinguish the two.

The test is not about distrust of the model. It is about making maintenance *auditable* - which is the same standard the method applies to facts, decisions and insights.

## Why there is a core and why the rest is optional

An outside evaluation of the whole method (gpt-5.3-codex, 06.08.2026) landed on a verdict worth keeping verbatim in the reasoning file rather than in a changelog nobody rereads: the method is **workable and above the average of file-based practices of 2026** - particularly on decision history, dead-end recall and recoverability - but it is **heavy**, and "this is not a light plugin, it is a disciplinary protocol".

Two of its findings drove this split.

**The value curve breaks after the core.** Threshold, the stable/volatile split, append-only decisions, the sync and a short log pay off on essentially any task long enough to have a folder. Insight synthesis, observers and the consilium pay off *depending on the class of task* - and on a task that does not fit them they are cost with no return. Stating that in the method is more honest than implying every rule is equally load-bearing.

**The strongest argument against the method is a busy month, not a bug.** The evaluation put it as brittleness to a drop in execution discipline: under time pressure the protocol degrades into expensive ritual documentation where the form is maintained and the thinking is not. The failure mode of an all-or-nothing protocol is abandonment - people do not trim it, they stop it, and the memory dies whole. Naming a core small enough to survive a period of zero enthusiasm makes trimming a supported move rather than a defeat.

**What this does not fix.** The same evaluation names a risk the split does not touch: formal compliance without semantic selection - the system honestly producing many entries whose conclusions are weak, with the form legitimising them. The method's own detectors (memory health scores, cold observer reads, the structure and self-checks) catch **form and reconstructibility**, not truth. That gap is real and is not closed here. The nearest thing to an answer is Rule 10 - promotion of a claim requires a real-world fact or an outside verdict - and it is a partial one.

## What was deliberately rejected

**Locks and lease files.** An external review proposed `LOCKS.md` with TTL leases to serialize concurrent writers. A panel rejected it: two agents read the file, both see it free, both write, and the lease has no way to notice. A TTL makes it worse, since expiry does not prove the holder died. Safe leasing needs a fencing token the store itself enforces, and a Markdown file enforces nothing. The full verdict, including the contested question of temp+rename writes, is in [BACKLOG.md](../BACKLOG.md) item 12.

What shipped instead was cheaper and aimed at the failure that was actually observed: content-before-pointer ordering, the index demoted to a rebuildable shadow, and one-ritual-at-a-time.

**Splitting formats into `SCHEMA.md` - contested, kept anyway.** One lens of the v2.9.1 panel argued the split made things worse: an extra file to open at exactly the busy moment is a file that does not get opened, so form-compliance drops and the self-check degrades into a sentence. The counter-argument is that the 43 KB single file was not being executed either - that was the finding that started the compression. The disagreement is recorded rather than averaged, and the cheap half of the objection was accepted: the fields used in almost every sync are written out in full at the end of the skill, so the common path needs no second read. If form-compliance still degrades in practice, the honest fix is to inline more of the schema, not to argue the lens was wrong.

**Automatic observer passes - challenged, unchanged.** The same panel argued the observer pass is too expensive to fire mid-session and should be user-triggered or scheduled. That would remove the method's main differentiator: verification that does not wait to be requested. What the trigger list already does is fire on close, on handoff and on accumulation - not in the middle of unrelated work - and *one ritual at a time* keeps it from interleaving with a sync. Recorded as dissent, not adopted.

**A vector database, automatic transcript capture, and confidence scores on ordinary facts** - see the "Deliberately not doing" section of [BACKLOG.md](../BACKLOG.md). Short version: the first breaks zero-infrastructure and file ownership; the second stores compressed chat instead of curated facts with sources; the third adds numeric theatre on top of a question already answered by "does this have a date and a source?".
