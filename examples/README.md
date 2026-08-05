# A worked example

Every other file in this repository is a specification. This folder is the thing itself: one task, six weeks in, after a dozen sessions - a revised decision, a correction lens, an insight that got refuted, a sealed block, and an operations log with a death in the middle of it.

It exists because a cold reader of the specs said the honest thing about them: the method reconstructs as a set of *forms* almost completely, and as an *operating procedure* with gaps - because nothing here showed what a file looks like after a month of use. Snippets of four lines do not answer "how much do I write?", "when does this get long?", "what does a mistake look like once it has been corrected?".

**The task is invented, the shapes are not.** Read it as an illustration of the format, not as advice about latency bugs.

```
checkout-latency-bug/
├── CLAUDE.md       charter - current state only, no history
├── MEMORY.md       the log - lenses, phase, insights, dated facts, one sealed block
├── TASKS.md        phases and blockers, with two obsolete items left visible
├── DECISIONS.md    D1, D2, D2.1 - a revision that did not delete its original
└── BRIEF.md        the original ask, verbatim, and the definition of done

INDEX.md            the workspace registry, as it looks with one active task
OPS_LOG.md          ~40 lines: normal syncs, a declined one, and an unterminated entry
Insights/           two insight files - one refuted, one verified by a panel
```

## What to look at, and why

**`MEMORY.md`, the top eight lines.** Lens 1 sits above everything and rewrites how the first two weeks read: the p99 numbers logged before 12.06 were measured against a warm cache and are not comparable to anything after. Nothing below was edited. That is the whole of Rule 6 in one block - and notice that it is *specific*: it says which entries, from when, and what to read them as.

**`DECISIONS.md`, D2 and D2.1.** D2 chose to shard the session store. D2.1 reversed it three weeks later, and D2 is still there, unedited, with the reasoning that made it right at the time. The revision names the stakeholder quote that killed it and says what happens to the artifacts already built - which is the part people skip, and the part that costs a week when it is missing.

**`Insights/2026-06-14-cache-warm-hypothesis.md`.** A hypothesis, verified by a panel, that later turned out to be *partly* wrong - and is recorded as `refuted` with what killed it. It is still here. It is the reason nobody re-proposed cache warming in July: `dead_ends_checked:` in D3 names it by file.

**`OPS_LOG.md`, lines 22-24.** A sync opened on 2026-07-02 and never closed - the session died. The next morning's entry is the recovery: which files were checked, what was found half-written, what was repaired. This is what the log is for; the other thirty lines are the price of having it.

**`MEMORY.md`, the sealed block.** Six weeks of daily entries compressed to eleven lines. Read what survived: constraints still in force, numbers still quoted, threads still open. Read what did not: every "ran the suite, green", every superseded measurement, every scheduling exchange. The test was not importance, it was *"would this change what I do today?"*

**`TASKS.md`, the two struck items.** Marked `(obsolete, see D2.1)` rather than deleted, so a reader who remembers "weren't we sharding?" gets an answer instead of a silence.

## What this example does not show

A workspace with fifteen tasks and the cross-task links between them; a task in `mode: core`, where the layers stay quiet; a `CHECKPOINT.yml` mid-operation. Those are shapes the schema already describes adequately in a few lines. This folder covers the ones that only make sense at full size.
