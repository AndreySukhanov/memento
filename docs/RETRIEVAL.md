# Retrieval interop contract

Memento deliberately ships no retrieval infrastructure: at the scale of one workspace (dozens of tasks), the index file plus grep beats embeddings on precision, auditability and zero setup. But a workspace with hundreds of tasks and thousands of insights will outgrow lexical search - and the answer is **interop, not reinvention**.

Any hybrid-search runtime (BM25 + vector markdown indexers such as EverOS or memsearch) can index a Memento workspace, under one architecture:

> **Markdown is the source of truth. The index is a derived, rebuildable shadow.**

## Invariants

An external indexer is welcome as long as it holds four invariants:

1. **The index never writes back.** No indexer may modify, annotate, reorder or "enrich" the memory files. All writes go through the agent's maintenance duties (sync, sealing, lenses) - an index that edits its own source destroys the audit trail the method exists to keep.
2. **The files win.** On any disagreement between index contents and files, the files are right. Deleting or editing a file must eventually purge or supersede the stale index entries; a hit whose source line no longer exists must be dropped, not served.
3. **The index is disposable.** Wiping the index and rebuilding from the files must lose nothing. If a rebuild loses information, that information was living in the wrong place.
4. **Retrieval respects the memory's own structure:**
   - for **auto-memory**, the frontmatter `description` is the retrieval unit - it exists precisely to make relevance decidable without opening the file;
   - for **task folders**, `CLAUDE.md` (charter) outranks `MEMORY.md` (log); correction lenses and `CURRENT PHASE` must be surfaced *with* any older log entry they refract - serving a pre-lens fact without its lens reproduces the stale-frame failure Rule 6 prevents;
   - for **insights**, the `status` field travels with the hit: a `refuted` insight retrieved as if it were confirmed is worse than no retrieval;
   - **sealed blocks** are compressed history - retrieve them only when the query asks for history, not as peers of live entries.

## Practical notes

- Content-hash change detection (the memsearch pattern) works well here: memory files change rarely and locally, so incremental indexing is cheap.
- A file watcher on the workspace is sufficient for freshness; sync happens at session boundaries, so near-real-time indexing buys little.
- Keep the index outside the workspace (or gitignored): the workspace stays pure files under version control; the shadow lives wherever the indexer wants.

If you pair Memento with a specific runtime and hit friction with these invariants, open an issue - the contract is meant to be testable, not aspirational.
