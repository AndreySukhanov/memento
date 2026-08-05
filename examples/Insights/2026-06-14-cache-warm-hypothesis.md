---
date: 2026-06-14
title: The slow population is a cold-cache artefact of the load rig
tasks: [checkout-latency-bug]
status: refuted 2026-06-27 - real users show the same long tail on warm caches
falsifier: a warm-cache run that still shows the long tail, or production traces from users whose caches are demonstrably warm
depends_on:
  - rig-04 resets cold after every run (charter, environments)
  - the p99 gap between rig and staging is ~13x (2026-06-13)
sources:
  - checkout-latency-bug/MEMORY.md - the rig/staging discrepancy, 2026-06-13
  - checkout-latency-bug/CLAUDE.md - load rig section, cold cache after every reset
---

Every measurement showing an 8-9 s p99 comes from `rig-04`, which resets cold.
Staging, which runs warm, shows 0.7 s for the same 200 sessions. If the slow
population is an artefact of measuring cold, there may be no user-facing bug at all -
only a badly configured rig.

If true, the whole task changes shape: the fix is to the measurement, and the 41
support tickets need a different explanation.

---

**Refuted 2026-06-27.** The deliberate rig-vs-staging run (Case 2) reproduced the
gap, but production traces from users with demonstrably warm caches show the same
long tail. Cold cache changes the *median*, not the tail - and the tail is what users
report. The rig is measuring something real, just not the thing we thought.

Kept because it is load-bearing twice over. It is the reason the charter now demands
that every number state its cache state (LENS 1). And it should have lowered
confidence in D2: this hypothesis had also predicted a store-level cause, and its
refutation on 26.06 was evidence against sharding two weeks before D2.1 caught it.
