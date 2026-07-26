---
description: One-time workspace initialization - creates the INDEX.md registry and registers existing task folders. After this, new task folders are bootstrapped automatically by the skill. Can also bootstrap a single task folder manually (escape hatch).
argument-hint: [path to the workspace root; or a task folder inside an initialized workspace]
---

# /memento:init - initialize the workspace (once)

## Argument

Path provided: `$ARGUMENTS`

If empty, ask the user first:

> Point me to your task workspace - the directory where task folders live (or will live). Example: `~/work/tasks`

Do not proceed until you have the path.

## Mode detection

- If the **parent** of the given path contains an `INDEX.md` -> the workspace is already initialized and the user is pointing at a **task folder**: run the *Task bootstrap procedure* below on it (manual escape hatch; normally the skill does this automatically).
- Otherwise -> **workspace mode**: initialize the given path as the workspace root.

## Workspace mode

### Step 1. Sanity-check the root

If the path looks like a general-purpose directory rather than a task workspace (Desktop, Downloads, Documents, the user's home directory), do not silently claim it - ask: "<path> looks like a general-purpose directory. Initialize it as your task workspace anyway, or point me somewhere else?"

### Step 2. Create the index

Create `<workspace_root>/INDEX.md` from `${CLAUDE_PLUGIN_ROOT}/templates/INDEX.md.tmpl`. If an `INDEX.md` already exists here, say the workspace is already initialized and stop (offer the task-folder escape hatch if the user meant to bootstrap one folder).

### Step 3. Register what already exists

List the immediate subfolders (skip hidden/system ones: `.git`, `.obsidian`, `.idea`, `.vscode`, `node_modules`, anything starting with a dot). For each that contains task-like materials, show the user the list and ask which to register. For each chosen folder:

- if it already has the 5 memory files - just add its row to "🟢 Active";
- if it has raw materials but no memory files - run the *Task bootstrap procedure* on it;
- leave the rest untouched.

### Step 4. Report and hand over

```
✅ Workspace initialized: <path>
   INDEX.md created
   Registered: N existing tasks (M bootstrapped from raw materials)

From here on, task folders are created automatically: when a task crosses
the folder threshold (more than a day / 2+ stakeholders / release artifact /
2+ phases), the agent will announce it and bootstrap the 5-file set itself.
```

After this, stop. Do not start working on any task until asked.

---

## Task bootstrap procedure

Used in three places: the escape hatch above, Step 3 registration, and by the **skill's auto-init** (which reads this file for the full discipline). Input: one task folder.

### Optional: tracker link

Ask once: "Is there a ticket for this task (GitHub Issues, Jira, Azure DevOps, Linear...)? Paste the URL, or say no." If a URL is given, fetch it through whatever access is available (a connected MCP server, `gh` CLI, or WebFetch for public pages) and treat tracker data as the **authoritative source** for:
- `BRIEF.md` "Original statement" - the ticket description verbatim, with source attribution;
- `CLAUDE.md` header context - ticket URL, type, state, assignee, parent/epic;
- `MEMORY.md` "Stakeholder facts" - ticket author + date + text, then each comment with author, date, text.

Local materials then become **supporting context**; they do not displace tracker data. If no tracker access is available, note the URL in BRIEF.md "Context links" and continue from local materials.

### Step B1. Collect and classify contents

Glob `<path>/**/*` and classify every file by extension. **Skip hidden and system directories entirely** - their contents are tool plumbing, not task materials.

**Readable text** - `.txt .md .json .yml .yaml .sql .py .js .ts .tsx .jsx .html .css .csv .log` and other plain-text formats: Read as text.

**Images (mandatory visual pass)** - `.png .jpg .jpeg .webp .gif`: Read **every** image and note: what it shows, key visible elements, any highlights (a signal of "this exact thing matters"). Never skip an image - the include/exclude decision happens in Step B2, not here.

**Not directly readable** - `.docx .xlsx .pdf .pptx`: list in MEMORY.md as "attached, needs manual review" with the relative path. (If a document-reading skill is available, you may use it instead.)

**Existing memory files** - `CLAUDE.md, MEMORY.md, TASKS.md, DECISIONS.md, BRIEF.md`: Read and remember; this is an **upgrade, not an overwrite** (merge rules in Step B3).

### Step B2. Extract facts

- **Task name** = folder name, as-is (preserve unicode). **Slug** = meaningful kebab-case English translation (used for index links).
- **Stakeholder quotes** - from chat exports and correspondence. For each substantive quote keep: **who** + **when** + **what was said (verbatim)** + **source file**. Skip bare acknowledgements.
- **Problem statement / reproduction** - explicit steps, "Expected:/Actual:", definition of done: goes to `BRIEF.md` and the `CLAUDE.md` "Reproduction" section.
- **Evidence from images and logs** - an explicit A/B/C decision per image: **A. Describe as "Case N"** if it carries standalone information (write a MEMORY.md subsection: scenario, what is visible, key takeaway); **B. Mention only** if related but nothing new (one line in "Technical findings"); **C. Skip** if clearly incidental - but list it in TASKS.md "Source references" marked "_not used_". When torn between A and B, choose A.
- **Technical anchors** - stable identifiers: environment URLs, database entities, record IDs, endpoints, feature flags -> `CLAUDE.md`; hypotheses and findings -> `MEMORY.md`.
- **Stakeholders** - unique names from quotes plus roles if inferable; unknown roles get "role TBD".

### Step B3. Create or upgrade the 5 memory files

For each of `CLAUDE.md`, `MEMORY.md`, `TASKS.md`, `DECISIONS.md`, `BRIEF.md`:

1. Read the template from `${CLAUDE_PLUGIN_ROOT}/templates/<file>.tmpl`.
2. Replace `{{PLACEHOLDER}}` values with extracted facts. Any placeholder you cannot fill: replace with `_needs clarification_` AND add a matching entry to MEMORY.md "Open questions". **Never invent facts.**
3. **Merge rules when the file already exists:** `CLAUDE.md` / `BRIEF.md` - **ask** before overwriting; `MEMORY.md` - append new facts into existing sections (no duplicates) + a "File history" line; `TASKS.md` - never touch existing checkboxes; `DECISIONS.md` - never modify existing D-blocks.
4. Write the result to `<task_path>/<file>`.

### Step B4. Register in the index

Add a row to `INDEX.md` "🟢 Active" and a Timeline line. Treat "write CLAUDE.md" + "update INDEX.md" as one atomic operation - an unregistered task folder is how memory drifts.

### Step B5. Report

```
✅ Task folder `<name>` bootstrapped.
   Files:     CLAUDE.md / MEMORY.md / TASKS.md / DECISIONS.md / BRIEF.md - [created | upgraded]
   Extracted: N stakeholder quotes (from M people), K evidence cases, L source files
   Needs manual review: <list of .docx/.xlsx/.pdf, if any>
   Registered in: <workspace_root>/INDEX.md (Active)
```

---

## Hard rules

- **Workspace init runs once.** A second run on the same root is a no-op with an explanation.
- **Do not overwrite** existing `CLAUDE.md` / `BRIEF.md` without confirmation.
- **Do not invent facts** - missing information becomes `_needs clarification_` plus an open question.
- **After the report, stop.** Initialization only - do not start working on tasks until the user asks.
