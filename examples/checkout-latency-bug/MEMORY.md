# checkout-latency-bug - Memory Log

> **Living log.** Append-first, dated, chronological. Every fact gets a date and a source.
> Stable context (scope, environments, IDs) lives in [CLAUDE.md](CLAUDE.md).
>
> **Status glyphs (Rule 7):** [!] burning · [~] waiting on a condition · [>] in progress, calm · [x] closed

## CORRECTION LENSES (read before any older entry)

- **LENS 1 (2026-06-12) - cache state of every measurement.** Before this date we
  did not record whether a p99 number came from a warm or a cold cache, and the load
  rig resets cold while staging runs warm. Any entry dated before 2026-06-12 that
  quotes a p99 must be read as: **cold cache if it came from `rig-04`, warm if it
  came from staging, and unusable for comparison against anything measured after
  this date.** The numbers were not wrong, they were not comparable.

- **LENS 2 (2026-07-09) - "the mobile slice" meant two different things.** Entries
  before 2026-07-09 use "mobile users" to mean *the app*, while support tickets use
  it to mean *the mobile web checkout*. Any earlier entry saying "mobile" must be
  read as "mobile web" unless it names the app build explicitly. This is what made
  the June population estimate look 3x too large.

## CURRENT PHASE (2026-07-24)

Fix for the retry storm is written and reviewed; waiting on Priya for a slot before
the 08.08 freeze. The one-bug-or-several question is answered and Maria has it, so
the deadline pressure is off - what remains is shipping. Everything dated before
2026-07-09 describes the period when we still believed there were two populations.

next: get a ship date from Priya for the retry cap, then update D3 with it

## Current status

**2026-07-24:** one bug, not five. Retry storm under connection-pool exhaustion,
affecting mobile web on slow networks. Fix written, awaiting a release slot.

## Open questions

- Does the retry cap need a config flag, or is a constant acceptable? Dan asked
  2026-07-22, no answer yet - he prefers a constant, Priya prefers a flag.
- The 3 tickets from desktop Safari (2026-06-30) were never explained. They do not
  match the retry-storm signature. Parked as probably unrelated; if they recur after
  the fix ships, they are a separate task.

## Insights (derived - verify before acting on)

_Last insight pass: 2026-07-21 (0 found)_

- [x] **2026-06-14** - slow population is a cold-cache artefact of the load rig ->
  [Insights/2026-06-14-cache-warm-hypothesis.md](../Insights/2026-06-14-cache-warm-hypothesis.md) (refuted 2026-06-27)
- [>] **2026-07-09** - the two "populations" are one, split by a naming collision ->
  [Insights/2026-07-09-mobile-naming-collision.md](../Insights/2026-07-09-mobile-naming-collision.md) (verified by 2/3 panel, 2026-07-11)

## Stakeholder facts

### [>] 2026-07-22 - Dan on the retry cap

Dan Reyes, in #checkout: "A constant is fine. If we make it a flag someone will turn
it up during an incident and we'll be back here." Priya disagreed in the same thread
and wants it configurable. Unresolved - see Open questions.

### [>] 2026-07-15 - Maria accepted the one-bug answer

Maria Okonkwo, in review: "Good. One bug, scheduled fix, Q3 plan unblocked. I don't
need the Safari three explained before I plan - park them." Source: meeting notes
`materials/2026-07-15-review.md`. This closed the BRIEF's second acceptance criterion.

### [!] 2026-06-21 - Dan's veto on session-store writes

Dan Reyes, after D2.1: "Nothing writes to the prod session store from this task.
Not a migration, not a backfill, not a one-off script. If you think you need to,
that's a conversation, not a PR." Recorded in the charter as a standing constraint.

## Technical findings

### [>] 2026-07-18 - the fix, measured

Retry cap of 3 with 200 ms backoff, on `rig-04`: p99 8940 ms -> 1120 ms across 200
synthetic sessions, cold cache both runs. Staging, warm: 640 ms -> 590 ms, which is
within noise and expected - the bug never fired warm. Both numbers are in
`materials/2026-07-18-bench.md`.

### [>] 2026-07-09 - the actual mechanism

Under a slow network the client retries the session call every 2 s with no cap. Each
retry holds a pool connection for the full 30 s timeout. Twelve retries exhaust the
pool of 10, and every subsequent request queues - which is the spin users see. The
trigger is network latency above ~1200 ms, which is why it never reproduced in the
office and always reproduced on the train.

### [>] 2026-06-30 - three tickets that do not fit

Three of the 41 support tickets are desktop Safari, no mobile involvement, no retry
pattern in their traces. Signature does not match. Parked, see Open questions.

## Evidence / cases

### Case 1 (2026-07-08, `materials/trace-mobileweb-slow.json`)

A production trace from a user who reported the spin. Twelve `POST /session` calls
in 24 s, all from one page load, none cancelled. Pool wait time climbs from 4 ms on
the first call to 21 s on the twelfth. This trace is what turned the retry storm
from a guess into the mechanism - everything before it was inference from aggregates.

### Case 2 (2026-06-27, `materials/rig-vs-staging.md`)

The same 200 sessions run on `rig-04` and on staging, deliberately, to test the
cache hypothesis. Cold p99 9.1 s, warm p99 0.7 s - and the *shape* differs: the cold
run has a long tail, the warm one does not. This killed the cache hypothesis: real
users showed the tail on warm caches too.

## Sealed (before 2026-06-25)

Four weeks of investigation, compressed. What is still load-bearing:

- Task opened 2026-05-28 on Maria's ask; deadline end of June for the one-or-several
  answer, met on 2026-07-15 after she extended it two weeks (D1 records why).
- 41 support tickets tagged `checkout-spin`, April to May. 38 mobile web, 3 desktop
  Safari - the split that mattered later.
- The slow-population query definition was frozen 2026-06-12 (D1) after three
  rewrites; earlier population sizes in this log used looser definitions and are not
  comparable. Frozen definition is in the charter.
- Reproduction failed in the office for three weeks straight. The reason - network
  latency below the trigger threshold - was only understood on 2026-07-09.
- Dropped from this block: eleven daily "no repro today" entries, four superseded
  population estimates, the scheduling exchange about the June deadline, two
  benchmark runs invalidated by LENS 1.

## File history

- **2026-05-29** - initialized by `/memento:init` from 41 support tickets, the
  Grafana board and the #checkout export.
- **2026-06-25** - first seal: 187 lines -> 96, 4 weeks of entries into one block.
- **2026-07-24** - current.
