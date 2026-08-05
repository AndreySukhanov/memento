# Operations log

> Append-only black box. Every operation that writes opens a line **before** touching
> a file and closes it with the result. An opening `>` with no matching `<` is what a
> session start looks for: it names the operation that died and the files it reached.
>
> Never edited, never reordered. Past ~200 lines the oldest **closed** pairs may be
> deleted; unterminated lines are never pruned at any age.

- 2026-06-25 09:14 > seal checkout-latency-bug -> MEMORY.md
- 2026-06-25 09:31 < seal checkout-latency-bug: 187 -> 96 lines, 4 weeks sealed, 11 entries dropped
- 2026-06-27 16:02 > sync checkout-latency-bug -> MEMORY.md, Insights/, INDEX.md
- 2026-06-27 16:09 < sync checkout-latency-bug: +1 case, cache hypothesis refuted, index row updated
- 2026-06-30 11:47 > sync checkout-latency-bug -> MEMORY.md
- 2026-06-30 11:52 < sync checkout-latency-bug: +1 finding (3 Safari tickets), open question added
- 2026-07-02 14:20 > sync checkout-latency-bug -> MEMORY.md, DECISIONS.md, TASKS.md, INDEX.md
- 2026-07-03 08:05 < recovery sync checkout-latency-bug: checked MEMORY.md, DECISIONS.md, TASKS.md, INDEX.md - MEMORY.md had the 02.07 entry, DECISIONS.md and TASKS.md were untouched, INDEX.md still said "investigating". Re-ran the remaining steps; nothing was lost because the log named exactly which four files to look at.
- 2026-07-08 10:33 > sync checkout-latency-bug -> MEMORY.md
- 2026-07-08 10:41 < sync checkout-latency-bug: +Case 1 (production trace), status line updated
- 2026-07-09 15:12 > sync checkout-latency-bug -> MEMORY.md, Insights/, DECISIONS.md, TASKS.md, INDEX.md
- 2026-07-09 15:34 < sync checkout-latency-bug: LENS 2 written, +1 insight, D2.1 revision, 2 items marked obsolete, self-check clean, structure clean
- 2026-07-11 09:50 > observer pass checkout-latency-bug (insight verifier, panel) -> Observers/
- 2026-07-11 09:58 < observer pass checkout-latency-bug: 3 models, 1 insight verified 2/3, dissent recorded, budget_action: normal (7/20 this month)
- 2026-07-15 17:40 > sync checkout-latency-bug -> MEMORY.md, TASKS.md
- 2026-07-15 17:44 < sync checkout-latency-bug: declined by user - "not now, I'm mid-review, do it after". Re-run at 19:02.
- 2026-07-15 19:02 > sync checkout-latency-bug -> MEMORY.md, TASKS.md, INDEX.md
- 2026-07-15 19:11 < sync checkout-latency-bug: Maria's acceptance logged, phase 3 opened, index row updated
- 2026-07-18 13:25 > sync checkout-latency-bug -> MEMORY.md
- 2026-07-18 13:30 < sync checkout-latency-bug: +1 finding (bench before/after), no insight pass (below threshold, marker left at 2026-07-09)
- 2026-07-21 10:15 > sync checkout-latency-bug -> MEMORY.md
- 2026-07-21 10:26 < sync checkout-latency-bug: insight pass ran, 0 found, marker moved; compaction skipped (142 lines measured)
- 2026-07-22 16:44 > sync checkout-latency-bug -> MEMORY.md, DECISIONS.md
- 2026-07-22 16:50 < sync checkout-latency-bug: Dan's quote logged, D3 recorded as provisional, open question added
- 2026-07-24 09:03 > observer pass checkout-latency-bug (sapper) -> Observers/
- 2026-07-24 09:05 < observer pass checkout-latency-bug: budget_action: skipped (20/20 this month), no models called
