# Contributing to Memento

Thanks for your interest! Contributions are welcome — the method grows from real failures, so the most valuable additions are small and grounded in something that actually went wrong.

## Great first contributions

### 1. A worked example from your domain
[`examples/`](examples/) holds one task after six weeks of use. A second one from a different domain — a data migration, a research task, a support escalation — shows the method under other pressures. Anonymize names and IDs, keep the shapes from [`docs/SCHEMA.md`](docs/SCHEMA.md), and add a short guide like [`examples/README.md`](examples/README.md): what to look at and why.

### 2. A search runtime integration
Memento ships no retrieval infrastructure on purpose. An indexer for a large workspace is welcome as long as it holds the four invariants in [`docs/RETRIEVAL.md`](docs/RETRIEVAL.md): the index never writes back, the files win, the index is disposable, and it can be rebuilt from the files alone.

### 3. A rule that contradicts another, or reads two ways
Open an issue with the two passages and the failure the ambiguity causes — which file the agent wrote into, what it should have done. The 2.12 releases came from exactly this kind of cold read.

## Development setup

Clone the repo and install the plugin from your local copy in Claude Code:

```
/plugin marketplace add ./memento
/plugin install memento@memento
```

The plugin is Markdown plus one script: commands in `commands/`, skills in `skills/`, task-file templates in `templates/`, guards in `hooks/`. Run `/memento:init` on a scratch workspace and check that a sync writes what you expect.

The guards are the one piece of code: `hooks/guards.js` (plain Node, no dependencies). Change it together with `hooks/guards.test.js` and run `node hooks/guards.test.js` - the tests build throwaway workspaces and need no network.

## Ground rules

- **English everywhere** — specs, examples, commits, PRs.
- **Every rule names its failure.** A new or changed rule comes with an entry in [`docs/RATIONALE.md`](docs/RATIONALE.md): the failure it prevents and where it came from.
- **One home per shape.** Required fields and formats live in [`docs/SCHEMA.md`](docs/SCHEMA.md); the skill and the templates follow it.
- A change that users will notice gets a [`CHANGELOG.md`](CHANGELOG.md) entry and a version bump in `.claude-plugin/plugin.json`.

## Bigger changes

Open an issue first and describe the approach — happy to discuss the method before you invest time. [`BACKLOG.md`](BACKLOG.md) lists what was already considered and rejected, with the reasons.

## License

By contributing you agree that your contribution is licensed under the project's [LICENSE](LICENSE).
