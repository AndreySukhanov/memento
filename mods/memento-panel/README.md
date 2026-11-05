# memento-panel

An optional mod for [Memento](../../README.md): your task memory beside the chat in Claude Code.

- **A band above the prompt** appears only when memory falls behind - an operation left open in `OPS_LOG.md`, or a task whose `DECISIONS.md` is more than 45 minutes ahead of its `MEMORY.md` (the same checks the guards run). **Sync now** asks the agent to catch up; **Hide** keeps it quiet until the reason changes.
- **A pane** (`/memento-panel`) lists the active tasks from `INDEX.md` with how fresh each log is and its `next:` step, an active `CHECKPOINT.yml`, insights still waiting for verification, the mode, whether guards are on, and the backup count.

It only reads the workspace files; it never writes memory itself.

## Install

Needs Claude Code 2.1.287 or later (mods). With the Memento marketplace added:

```
/plugin install memento-panel@memento
```

## License

**Source-Available** — free to read, run and learn from. Commercial or derivative use requires written permission. See [LICENSE](../../LICENSE).
