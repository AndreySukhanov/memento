---
date: 2026-07-09
title: The two slow "populations" are one, split by a naming collision
tasks: [checkout-latency-bug]
status: verified by 2/3 panel (gpt-5.6-sol, deepseek-v4-pro), 2026-07-11; dissent: minimax-m3 - the ticket sample is too small to rule out two mechanisms
falsifier: a slow session from the native app with the retry-storm signature, which would mean the app population is real and separate
depends_on:
  - support tickets use "mobile" to mean mobile web (support interview, 2026-06-03)
  - our own entries use "mobile" to mean the app (MEMORY.md, entries before 2026-07-09)
  - 38 of 41 tickets are mobile web (2026-06-30)
sources:
  - checkout-latency-bug/MEMORY.md - the June population estimate, 3x too large
  - checkout-latency-bug/MEMORY.md - ticket breakdown 38 mobile web / 3 desktop Safari
---

The June estimate counted "mobile users" twice under two definitions: support's
"mobile" (mobile web) and ours (the native app). There are not two slow populations
with two mechanisms - there is one, on mobile web, and an empty set on the app.

This explains three weeks of confusion: every attempt to find the app-side mechanism
failed because there was nothing there to find, and the failure was read as "the app
bug is subtle" rather than "the app bug is imaginary".

Consequence: the population is ~3x smaller than planned for, and one mechanism should
account for all 38 mobile-web tickets. If it does not, that is a real second bug.

---

**Verified by panel, 2026-07-11.** Two lenses confirmed against the cited sources.
The dissent is recorded rather than averaged away: minimax-m3 held that 41 tickets is
too small a sample to rule out a second mechanism on the app, and that absence of app
traces may reflect lower app checkout volume rather than an absent bug. That objection
is why the falsifier stays live and why the three desktop Safari tickets were parked
rather than dismissed.
