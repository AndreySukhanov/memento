# checkout-latency-bug - charter

> **Current state only.** No history, no dated entries - those live in
> [MEMORY.md](MEMORY.md). This file is rewritten when scope or a stable anchor
> changes, and it auto-loads whenever work happens inside this folder.

## Scope

Find and characterise the slow-checkout population, and answer one question: one bug or several. Fix it if it is one.

**Not in scope:** general checkout performance work. The ask is predictability, not speed (BRIEF.md, definition of done).

## Stakeholders

| Who | Role | What they decide |
|---|---|---|
| Maria Okonkwo | product lead | scope, deadline, what counts as done |
| Dan Reyes | backend, payments | anything touching the session store |
| Priya Raman | SRE | what may ship to prod and when |

Escalation goes through Maria. Dan has a standing veto on session-store changes - established after D2.1.

## Environments

| | |
|---|---|
| prod | `checkout.internal` - read-only for this task, no writes without Priya |
| staging | `checkout.stg` - full access, reset nightly at 03:00 UTC |
| load rig | `rig-04`, holds 200 synthetic sessions; **cold cache after every reset** |

## Stable anchors

- Slow-population query: `analytics.checkout_spans WHERE p99_ms > 8000` (definition frozen 2026-06-12, see D1)
- Feature flag: `checkout_session_v2` - off in prod, on in staging
- The 8000 ms threshold is Maria's, not ours: below it support tickets stop appearing

## Constraints in force

- **No writes to the prod session store.** Dan, 2026-06-21, after D2.1.
- Release freeze 10.08-20.08 (Priya). Anything not shipped by 08.08 waits until the 21st.
- The load rig measures cold cache only. Any warm-cache number needs staging and a stated warm-up.
