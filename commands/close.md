---
description: Close a completed task - final status in the memory files, move the index entry from Active to Completed with a link to the final artifact
argument-hint: [path to the task folder]
---

# /memento:close - close out a finished task

## Determine the task folder

Use `$ARGUMENTS`, or infer from the session. Confirm with the user before closing: "Closing <task name> - final outcome: <your one-line summary>. Correct?"

## Pre-close check

Read `TASKS.md`. If there are unchecked items in non-final phases or open blockers, list them and ask whether to:
- close anyway (items become "won't do" - record why), or
- keep the task active.

Never close silently over open blockers.

## Algorithm

1. **`MEMORY.md`** - prepend a completion block to "Current status":
   `**Completed {{DATE}}:** <final outcome, 2-3 sentences: what was delivered, where the artifact lives, what remains out of scope>.`
2. **`TASKS.md`** - update the Status header to `✅ Completed {{DATE}}`; mark remaining items `[x]` or `(won't do: <reason>)`.
3. **`DECISIONS.md`** - if the close itself reflects a decision ("shipped v3 instead of v4 because..."), record it as the final D-block.
4. **`<workspace_root>/INDEX.md`**:
   - move the task's row from "🟢 Active" to "✅ Completed" with the final outcome and a link to the final artifact;
   - add a Timeline line: `- **{{DATE}}**: closed **<task name>** - <outcome one-liner>`.
5. **Session auto-memory** (if this environment has one) - update the task's project note with the completion block, or archive it.

## Report

```
✅ <task name> closed.
   Outcome:  <one-liner>
   Artifact: <path or link>
   INDEX.md: moved to Completed
   Left open: <"nothing" or the recorded won't-do items>
```

The folder itself stays where it is - closed task folders are the long-term memory archive. Do not delete or move anything.
