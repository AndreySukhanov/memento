---
description: Cold-start check of Memento memory - run as the first message of a fresh session after /memento-md:init, after moving or renaming a workspace, or whenever memory seems not to load
argument-hint: (no arguments)
---

# /memento-md:check - does the memory actually load?

Memory that exists on disk but does not reach the model is worse than none: everyone believes it works. This command tests the one thing a cold session depends on - what arrives **without asking** - and then compares it with the files.

Run it as the **first message of a fresh session**. Later in a session the answers are contaminated by everything already read.

## Step 1. Answer from context only

Do not open, list or search any file yet. From what is already in context, state:

1. **Instructions loaded:** the Memento skill, the workspace or task charter (`CLAUDE.md`), any other instruction files - by name.
2. **Auto-memory:** whether the auto-memory index is loaded, and the names of at least two auto-memory files it points to.
3. **Where work stands:** the active task(s) and, for the task the user is most likely to continue, its `next:` line and the date of its latest log entry.
4. **Mode:** `mode: core` or `full`, and whether guards are on.

Say "not in context" for anything you cannot answer. Guessing defeats the check.

## Step 2. Compare with the files

Now read `INDEX.md`, the primed task's `MEMORY.md` header (`CURRENT PHASE`) and the auto-memory index. For every answer from step 1, mark it **match**, **wrong** or **missing**.

## Step 3. Guards self-test

Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/hooks/guards.js" selftest
```

It prints the workspace it detected, whether guards are on, the memory files it watches, where it expects auto-memory, any open operation or sync lag, and the backup count. `node: command not found` means **the guards are not running at all** in this environment - say so plainly; nothing else in the method depends on them, but the user should know the safety net is absent.

## Step 4. Report and repair

One block:

```
Cold-start check - <date>
loaded:      <n>/4 answers matched the files
missing:     <what did not arrive>
guards:      on | off (guards: off) | not running (no node)
auto-memory: found at <path> | NOT FOUND
fix:         <one line per gap>
```

Typical gaps and their fixes:

- **Auto-memory not found, but the workspace has history** -> the workspace was probably moved or renamed: follow *Moving a workspace* in the task-memory skill before writing any new auto-memory, or the old and new memory will split.
- **Auto-memory index loaded, files it points to missing** -> rebuild the index from the files that exist (the index is derived).
- **`next:` line missing or stale** -> run a sync for that task.
- **Charter not loaded** -> the session was started outside the task folder; say where to start it.

**Record.** Append one line to `OPS_LOG.md` as a closed pair (`>` then `<`) with the summary, so "checked, all clean" and "never checked" do not look identical.
