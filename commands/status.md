---
description: Show all active tasks from the workspace index with staleness check - which memories have drifted and need a sync
argument-hint: [path to the workspace root or its INDEX.md, optional]
---

# /memento:status - workspace overview and staleness check

## Locate the index

Use `$ARGUMENTS` if provided (a workspace root or a direct path to `INDEX.md`). Otherwise look for `INDEX.md` in the current working directory, then its parent. If none found, ask the user where their task workspace lives.

## Algorithm

1. Read `INDEX.md`, list the "🟢 Active" table.
2. For each active task folder, read the top of its `MEMORY.md` ("Current status" line with date) and `TASKS.md` (Status header + unchecked items in the current phase + blockers).
3. Compute **staleness** per task: days between today and the most recent date found in MEMORY.md / TASKS.md.

## Report

One block per active task:

```
🟢 <task name>                      last synced N days ago
   Status:   <current status line from MEMORY.md>
   Phase:    <current phase from TASKS.md> (<X of Y items done>)
   Blockers: <list or "none">
   ⚠️ <warnings>
```

Warnings to raise:
- **Stale memory** - last dated entry older than 7 days on a task marked active: suggest `/memento:sync` or moving it out of Active.
- **Index drift** - the status in INDEX.md contradicts the status in the task's own MEMORY.md: quote both, suggest which to fix.
- **Missing files** - an active task folder lacking any of the 5 memory files: suggest `/memento:init` to repair.

End with a one-line verdict: how many tasks are healthy, stale, or drifted. Do not modify any files - this command is read-only.
