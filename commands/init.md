---
description: Initialize a task folder from raw materials - creates or upgrades the 5 memory files (CLAUDE.md, MEMORY.md, TASKS.md, DECISIONS.md, BRIEF.md) and registers the task in the workspace index
argument-hint: [path to the task folder, optional]
---

# /memento:init - turn a folder of raw materials into structured task memory

## Argument

Task folder path provided: `$ARGUMENTS`

If empty, ask the user first:

> Point me to the task folder. Example: `~/work/tasks/checkout-latency-bug`
>
> The folder must already exist and may contain any materials about the task: chat exports, screenshots, markdown notes, code, data dumps, logs.

Do not proceed until you have the path.

## Optional second question: tracker link

After receiving the path, ask:

> Is there a ticket for this task in your tracker (GitHub Issues, Jira, Azure DevOps, Linear...)? Paste the URL.
>
> If there is no ticket yet, say "no" and we will proceed from local materials only.

If a URL is given, fetch the ticket through whatever access is available (a connected MCP server, `gh` CLI for GitHub, or WebFetch for public pages) and treat tracker data as the **authoritative source** for:
- `BRIEF.md` "Original statement" - the ticket description verbatim, with source attribution ("<tracker> ticket N, created by X on DATE");
- `CLAUDE.md` header context - ticket URL, type, state, assignee, parent/epic;
- `MEMORY.md` "Stakeholder facts" - ticket author + date + text, then each comment with author, date, text.

Local materials then become **supporting context** in MEMORY.md; they do not displace tracker data. If no tracker access is available, note the URL in BRIEF.md "Context links" and continue from local materials.

---

## Algorithm (7 steps)

### Step 1. Verify the folder

- Confirm the folder exists (Glob / ls). If not: stop and tell the user to create it, put materials in, and re-run.
- If the folder is empty: warn "No materials found - I will create the 5 files from templates with placeholder stubs. Continue?" and wait for confirmation.

### Step 2. Collect and classify contents

Glob `<path>/**/*` and classify every file by extension.

**Skip hidden and system directories entirely** - `.git`, `.obsidian`, `.idea`, `.vscode`, `node_modules`, `__pycache__`, `.venv` and anything else starting with a dot: their contents are tool plumbing, not task materials, and must not appear in MEMORY.md or Source references.

**Readable text** - `.txt .md .json .yml .yaml .sql .py .js .ts .tsx .jsx .html .css .csv .log` and other plain-text formats: Read as text.

**Images (mandatory visual pass)** - `.png .jpg .jpeg .webp .gif`: Read **every** image and note for yourself: what it shows (UI / chat / debug log / data / diagram / other), key visible elements, any highlights or underlines (a signal of "this exact thing matters"). Never skip an image - the include/exclude decision happens in Step 3, not here.

**Not directly readable** - `.docx .xlsx .pdf .pptx`: list in MEMORY.md as "attached, needs manual review" with the relative path. (If a document-reading skill is available in the session, you may use it instead.)

**Existing memory files** - `CLAUDE.md, MEMORY.md, TASKS.md, DECISIONS.md, BRIEF.md`: Read and remember the current content; this is an **upgrade, not an overwrite** (merge rules in Step 4).

### Step 3. Extract facts

- **Task name** = folder name, as-is (preserve unicode).
- **Slug** = meaningful kebab-case English translation of the name (used for index links). If unsure, ask the user in one question.
- **Open date** = today.
- **Stakeholder quotes** - from chat exports and correspondence. Recognize common patterns (`Name\n<time>\n<message>`, `- **Name**: "..."`, Slack/Teams/Telegram export formats). For each substantive quote keep: **who** + **when** (or "circa {{DATE}}") + **what was said (verbatim)** + **source file**. Skip bare acknowledgements ("ok", "yes", "got it").
- **Problem statement / reproduction** - explicit numbered steps, "Expected:/Actual:", definition of done: goes to `BRIEF.md` and the `CLAUDE.md` "Reproduction" section.
- **Evidence from images and logs** - apply an explicit A/B/C decision to every image read in Step 2:
  - **A. Describe as "Case N"** if it carries standalone information (UI screenshot of the failing scenario, debug log, JSON response, stack trace, explanatory diagram): write a MEMORY.md subsection "Case N (date, `filename`)" - scenario, what is visible, key takeaway.
  - **B. Mention only** if it is related but adds nothing new (angled photo of a screen, duplicate of a described case): one line in "Technical findings" - "See also `filename` - <one-liner>".
  - **C. Skip** if clearly incidental (avatar, logo, stray file): do NOT mention in MEMORY.md, but list it in TASKS.md "Source references" marked "_not used_" so nothing is lost in a future audit.
  - When torn between A and B, choose A. Better an extra case than a lost piece of visual evidence.
- **Technical anchors** - stable identifiers mentioned in materials: environment URLs, database entities, record IDs, endpoints, feature flags. These go to `CLAUDE.md`; hypotheses and findings go to `MEMORY.md`.
- **Stakeholders** - unique names from quotes plus roles if inferable from context; unknown roles get "role TBD".

### Step 4. Create or upgrade the 5 memory files

For each of `CLAUDE.md`, `MEMORY.md`, `TASKS.md`, `DECISIONS.md`, `BRIEF.md`:

1. Read the template from `${CLAUDE_PLUGIN_ROOT}/templates/<file>.tmpl`.
2. Replace `{{PLACEHOLDER}}` values with extracted facts. Any placeholder you cannot fill: replace with `_needs clarification_` AND add a matching entry to MEMORY.md "Open questions". **Never invent facts** - if it is not in the materials, it is an open question.
3. **Merge rules when the file already exists:**
   - `CLAUDE.md` / `BRIEF.md` - **ask** before overwriting ("file exists - overwrite or keep?").
   - `MEMORY.md` - append new facts into the existing sections (no duplicates); add a "File history" line: `- **{{DATE}}** - enriched by /memento:init: <what was added>`.
   - `TASKS.md` - never touch existing checkboxes; only fill "Source references" if empty.
   - `DECISIONS.md` - never modify existing D-blocks; add new ones only if the fresh materials contain explicit decisions.
4. Write the result to `<task_path>/<file>`.

### Step 5. Register in the workspace index

The workspace root = the **parent directory** of the task folder. The index = `<workspace_root>/INDEX.md`.

**Sanity-check the parent first**: if it looks like a general-purpose directory rather than a task workspace (Desktop, Downloads, Documents, the user's home directory), do not silently put an index there - ask: "The parent of this task folder is <path>, which looks like a general-purpose directory. Where does your task workspace live, or should I create INDEX.md here anyway?"

1. If `INDEX.md` does not exist, create it from `${CLAUDE_PLUGIN_ROOT}/templates/INDEX.md.tmpl` (confirm with the user first: "No index found at <path> - create one?").
2. Add a row to "🟢 Active": `| [<task name>](./<folder>/CLAUDE.md) | <one-line essence> | Opened {{DATE}}; <status> | <key artifacts> |`
3. Add a Timeline line: `- **{{DATE}}**: opened **<task name>** - <one-liner>`.

Treat "write CLAUDE.md" + "update INDEX.md" as one atomic operation - an unregistered task folder is how memory drifts.

### Step 6. Session memory pointer (if available)

If this Claude Code session has a persistent auto-memory directory, add a short project note there: task name, folder path, one-line status, and the instruction "read `<folder>/CLAUDE.md` and `MEMORY.md` before working on this task". Skip silently if there is no auto-memory in this environment.

### Step 7. Final report

```
✅ Task folder `<name>` initialized.

Files:            CLAUDE.md / MEMORY.md / TASKS.md / DECISIONS.md / BRIEF.md  - [created | upgraded]
Extracted:        N stakeholder quotes (from M people), K evidence cases, L source files
Needs manual review:  <list of .docx/.xlsx/.pdf, if any>
Registered in:    <workspace_root>/INDEX.md (Active)

Next step: read CLAUDE.md and MEMORY.md, verify the auto-filled sections, add open questions I could not extract.
```

---

## Hard rules

- **Do not create the task folder** - it must exist; the user creates it and drops materials in.
- **Do not overwrite** existing `CLAUDE.md` / `BRIEF.md` without confirmation.
- **Do not invent facts** - missing information becomes `_needs clarification_` plus an open question.
- **After Step 7, stop.** Initialization only - do not start working on the task itself until the user explicitly asks.
