# Changelog

## 1.2.0 - Correction lenses, status glyphs, atomic auto-memory

Three practices that were already load-bearing in daily production use but
missing from the published method. Each was added because its absence caused a
real failure.

### Added

**Rule 6 - Correction lenses.** Rule 3 protected *decisions* from being
overwritten; facts had no such protection. When past entries turn out to be
factually wrong (wrong person attributed, wrong place, wrong assumption), you no
longer edit history - you add a **lens** at the top of `MEMORY.md` and every
older entry is read through it. History stays auditable, scattered errors are
corrected in one place.

Companion: a `## Current phase` block for volatile state. Real failure it
prevents - an agent producing forecasts through the frame "contact is broken"
four days after contact had resumed. The files were correct; the reading frame
was not.

**Rule 7 - Status glyphs.** One-character status on `TASKS.md` sections,
`MEMORY.md` entries and `INDEX.md` rows (burning / waiting / active / closed).
Triage, not decoration: a 30 KB memory file becomes scannable in one pass, and
stale statuses become visible (a "burning" marker three months old is a signal).

**Rule 8 - Session auto-memory shape.** Rule 4 step 6 previously said only
"session auto-memory, if the environment has one". Now specified: one fact =
one file with frontmatter (`name`, `description`, `type`), typed as
`feedback_*` / `project_*` / `reference_*` / `user_*`, plus an index with a
*why it matters* clause per row. Division of labour made explicit: folder files
hold task memory (synced by ritual), auto-memory holds cross-task memory (rules
of engagement, references, who the user is) and accretes continuously.

### Changed

- `commands/sync.md` - new step 0 (write a lens instead of editing history;
  refresh current phase) and an expanded step 6 (auto-memory file shape).
- `templates/MEMORY.md.tmpl` - `## Correction lenses` and `## Current phase`
  sections at the top.
- `templates/TASKS.md.tmpl`, `templates/INDEX.md.tmpl` - glyph legend in header.
- `skills/task-memory/SKILL.md` - now eight rules instead of five.

## 1.1.0

- `/memento:compact` command and Rule 5 (sealing an oversized `MEMORY.md`).

## 1.0.0

- Initial release: `/memento:init`, `/memento:sync`, `/memento:status`,
  `/memento:close`, five-file memory set, workspace index, Rules 1-4.
