# Tasks - checkout-latency-bug

> **Status glyphs (Rule 7):** [!] active/burning · [~] waiting on a condition · [>] in progress, calm · [x] closed
>
> Every phase header carries one. Invalidated items are marked obsolete with the
> decision that killed them, never deleted - a reader who remembers "weren't we
> sharding?" deserves an answer.

## Status: [>] fix written, waiting on a release slot

---

## [x] Phase 0: Research

- [x] Pull and classify all 41 `checkout-spin` tickets
- [x] Reconstruct the timeline from the Grafana board
- [x] Interview support on what users actually report ("the pay button spins")

## [x] Phase 1: Root-cause analysis

- [x] Freeze the slow-population definition (D1)
- [x] Test the cold-cache hypothesis against staging - refuted, see Insights
- [x] Get one real production trace of a slow session
- [x] Identify the mechanism: uncapped client retries exhausting the pool

## [x] Phase 2: Implementation

- [x] ~~Prepare the four-shard migration~~ (obsolete, see D2.1)
- [x] ~~Add the four-shard rig config~~ (obsolete, see D2.1)
- [x] Retry cap of 3 with 200 ms backoff
- [x] Bench it cold and warm, both numbers recorded

## [~] Phase 3: Verification

- [x] Cold-cache run on `rig-04`: p99 8940 -> 1120 ms
- [x] Warm run on staging: within noise, as expected
- [ ] Soak on staging for 48 h before the release slot

## [~] Phase 4: Release / handoff

- [ ] Ship date from Priya, before the 08.08 freeze
- [ ] Resolve constant-vs-flag with Dan and Priya (D3 is provisional)
- [ ] Task closed (the agent proposes the close; confirmation is yours)

---

## [~] Blockers

- **Release slot.** Priya has not given a date. Hard boundary: the 10.08-20.08 freeze
  means anything not shipped by 08.08 waits eleven days.
- **Constant vs flag.** Dan and Priya disagree; D3 cannot be finalised without it.

## Won't do

- **General checkout performance work.** Out of scope by the brief - Maria asked for
  predictability, not speed. If p50 becomes a concern it is a new task.
- **Explain the three desktop Safari tickets.** Maria parked them explicitly on
  2026-07-15. If they recur after the fix ships, they are a separate task with their
  own folder.
- **Session-store changes of any kind.** Dan's standing veto after D2.1. Recorded
  here so a future session that rediscovers sharding finds the refusal before the idea.

## Risks (summary)

- The fix is measured on synthetic sessions on a cold rig. Real mobile-web traffic on
  bad networks may behave differently; the soak is the mitigation.
- If the release slot slips past 08.08, the fix waits until the 21st and support
  tickets keep accumulating for three more weeks.

_Details in [MEMORY.md](MEMORY.md)._

## Source references

- `materials/tickets-checkout-spin.csv` - all 41 support tickets
- `materials/trace-mobileweb-slow.json` - the production trace, Case 1
- `materials/rig-vs-staging.md` - the run that refuted the cache hypothesis, Case 2
- `materials/2026-07-18-bench.md` - before/after numbers for the fix
- `materials/2026-07-15-review.md` - Maria's acceptance
- `materials/obsolete/shard-migration.sql` - _not used_, kept per D2.1
- `materials/grafana-export-june.png` - _not used_, superseded by the frozen query
