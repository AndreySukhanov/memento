# Brief - checkout latency bug

> The original ask, verbatim. Changes almost never. If the statement itself changes,
> that is a decision - record it in [DECISIONS.md](DECISIONS.md) and update this file
> to the new statement, keeping the old one below it.

## Original statement

Maria Okonkwo, product lead, in #checkout on 2026-05-28:

> "Checkout is slow for a slice of users and we don't know which slice. Support has
> 40-odd tickets since April, all 'the pay button spins'. Nobody can reproduce it.
> I need to know by end of June whether this is one bug or five, because the Q3 plan
> depends on whether we're scheduling a fix or a rewrite."

## Definition of done

Agreed with Maria, 2026-05-29:

1. The slow population is **identified** - who they are, what they have in common.
2. A statement of **one bug or several**, with the evidence behind it.
3. If one: a fix shipped or scheduled. If several: a written breakdown Maria can plan against.

Explicitly **not** in scope: a general checkout performance program. Maria, same day: "I'm not asking you to make checkout fast. I'm asking you to make it predictable."

## Context links

- Ticket: CHK-2891
- Support tag: `checkout-spin` (41 tickets at the time of writing)
- Grafana board: "checkout p50/p99 by region"
