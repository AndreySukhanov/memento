# Decisions - checkout-latency-bug

> Append-only. A decision that changes is never edited or deleted - a new block
> `D<N>.<M>` supersedes it and says why. The old block stays so that "why did this
> become that?" has an answer six months from now.

## D1 - freeze the slow-population query, extend the deadline (2026-06-12)

**Decision.** The slow population is defined as `p99_ms > 8000` in
`analytics.checkout_spans`, and that definition is frozen for the rest of the task.
Maria extends the answer deadline from 30.06 to 15.07.

**Why.** The definition had been rewritten three times in two weeks, and every
rewrite changed the population size, which made every comparison meaningless. Maria,
2026-06-11: "I'd rather have a wrong threshold we all agree on than a right one that
moves every Tuesday." The extension is the cost of the freeze - three weeks of
measurements became incomparable.

**Artifacts.** Population estimates from before this date are obsolete and are
marked as such in MEMORY.md. The Grafana board was rebuilt against the frozen query.

dead_ends_checked: scanned 0 refuted, 0 won't-do lists - first decision on this task (2026-06-12)

## D2 - shard the session store (2026-06-18)

**Decision.** Split the session store by user-id hash into four shards. Dan to
prepare the migration, target 05.07.

**Why.** The working theory was pool exhaustion caused by contention on a single
store, and sharding reduces contention by construction. Dan, 2026-06-17: "Four
shards buys us a year of headroom whatever else turns out to be wrong."

**Artifacts.** Migration script drafted, load-rig config for four shards prepared.

dead_ends_checked: scanned 1 refuted (cache-warm-hypothesis), none touch this (2026-06-18)

## D2.1 - do not shard; cap the client retries instead (2026-07-09, revision of D2)

**Decision.** The sharding work stops. The fix is a client-side retry cap of 3 with
200 ms backoff. No change to the session store, and by Dan's standing constraint,
nothing in this task writes to it at all.

**Why revised.** The trace in Case 1 showed the pool was not contended - it was
*held*. Twelve uncancelled retries occupied ten connections for a 30 s timeout each.
Sharding would have divided the same storm across four pools and delayed exhaustion
by seconds. Dan, 2026-07-09, reading the trace: "We'd have shipped a migration, felt
clever, and the spin would still be there. Kill it."

**Artifacts.** The migration script is obsolete - deleted from the branch, kept in
`materials/obsolete/` for the record. The four-shard rig config is obsolete. The
`checkout_session_v2` flag stays off; it was only needed for the migration.

dead_ends_checked: scanned 1 refuted (cache-warm-hypothesis), 1 relevant - the cache
hypothesis had also predicted a store-level cause and was refuted on 2026-06-27;
that should have lowered confidence in D2 a week before this revision (2026-07-09)

## D3 - ship the cap as a constant, not a flag (2026-07-22, pending)

**Decision.** Provisional: retry cap ships as a constant. Not final - Priya wants it
configurable and has not been answered.

**Why.** Dan, 2026-07-22: "If we make it a flag someone will turn it up during an
incident and we'll be back here." The counter-argument is that a constant needs a
deploy to change, which during an incident is worse. Unresolved; see MEMORY.md open
questions.

**Artifacts.** None yet - the fix is written both ways behind one line.

dead_ends_checked: scanned 2 refuted (cache-warm-hypothesis, mobile-naming-collision
- the latter verified, not refuted) + 1 won't-do list; none touch this (2026-07-22)
