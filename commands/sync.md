---
description: End-of-session sync ritual - propagate what happened this session into the task's memory files and the workspace index, in the correct order
argument-hint: [path to the task folder, optional if obvious from the session]
---

# /memento:sync - end-of-session memory sync

Memory that is not synced drifts from reality within one session. This command walks the sync points **in a fixed order** - the order matters because each file feeds the next.

## Determine the task folder

Use `$ARGUMENTS` if provided. Otherwise infer from the session: which task folder's files were read or edited? If ambiguous, ask the user which task to sync.

## What counts as sync-worthy

Run the full ritual if the session contained **actions** on the task: an artifact changed, a stakeholder was consulted, new evidence appeared, a decision was made or revised, a phase moved. Purely informational Q&A does not require a sync - say so and stop.

## Sync order (fixed)

1. **`MEMORY.md`** - append dated entries for everything new: stakeholder statements (who / when / verbatim), technical findings, new evidence cases. Update the "Current status" line with today's date.
2. **`DECISIONS.md`** - if any recorded decision was revised this session, add a `D<N>.<M>` revision block (never delete the original; see the format at the top of the file). New decisions get the next `D<N>`.
3. **`CLAUDE.md`** - only if the **scope or stable anchors changed**: rewrite the affected charter sections to the *current* state (no history here - history lives in DECISIONS.md). Most sessions this file is untouched.
4. **`TASKS.md`** - check off completed items; mark checkboxes invalidated by revised decisions with `(obsolete, see D<N>.<M>)`; add new items and blockers.
5. **`<workspace_root>/INDEX.md`** - if the one-line status of this task in "🟢 Active" no longer reflects reality, fix it. Add a Timeline line for significant events (phase completed, blocker cleared).
6. **Session auto-memory** (if this environment has one) - update the task's project note: status line + date.

## Report

Finish with a compact diff-style summary:

```
Synced <task name>:
  MEMORY.md    +2 facts, +1 case, status line updated
  DECISIONS.md +D3.1 (revision of D3)
  CLAUDE.md    untouched (no scope change)
  TASKS.md     2 checked, 1 marked obsolete, +1 blocker
  INDEX.md     status line updated
```

If nothing needed syncing, say exactly that - a truthful "nothing drifted" is a valid outcome.
