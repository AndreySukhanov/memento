---
name: consilium
description: Parallel domain review before a decision - several read-only agents, each on a different lens, plus a mandatory skeptic, then a synthesis of consensus and disagreements. Use when a change touches three or more areas at once, when it crosses languages, models or services, when it alters a contract another team depends on, when it needs sign-off from named stakeholders, when preparing a release-scale piece of work, when investigating a regression that appeared after a fix ("we changed X and Y broke"), or when the user asks to look at something from all sides, asks what will break, or asks for a consilium. Do not use for rewording a paragraph, locating a file, checking a field value or reading a log.
---

# Consilium - parallel domain review

One question, several lenses, **at the same time** - instead of one head walking through the angles in sequence and quietly dropping the ones it finds less interesting.

## Not the same thing as observers

Both are read-only and both exist because a single perspective is unreliable. They sit on different axes, and conflating them wastes tokens on the wrong tool.

| | Outside observers (Rule 10) | Consilium |
|---|---|---|
| Who | independent models, other providers | agents inside this session |
| What they see | memory files only, cold | the project - code, data, specs, prior decisions |
| When | periodically, **after** work is recorded | **before** a decision, while it is still cheap to change |
| Question | "is what we wrote true?" | "what breaks if we do this?" |
| Output | a verdict on a claim | a digest: consensus, disagreements, findings |

Observers verify. Consilium looks. On a large task both earn their keep: consilium first (what breaks inside), observers after (how it reads from outside).

## When it fires

This skill activates **on its own** when the situation matches - the agent should not wait to be asked, and the user should not have to remember a command.

**Indications.** The change touches **three or more areas**; it crosses languages, models or services; it is methodologically contested; it alters a contract another team depends on; it needs sign-off from named stakeholders; it is a release-scale piece of work; or it is a regression post-mortem ("we fixed X and Y broke"). Also on request: "look at it from all sides", "what will break here".

**Contraindications.** Rewording one paragraph, finding a file, checking a field value, reading a log. There a consilium is lost tempo and burnt tokens - answer directly.

**Announce before spending.** A consilium costs real tokens, so say what you are about to run and why - the question, the chosen lenses, how many agents - and let the user stop it. Firing automatically means noticing the moment, not deciding unilaterally to spend.

## Step 1. Define the domains

Domains are **workspace-specific** - a prompt-engineering workspace and a backend one need different lenses. Take them from `<workspace_root>/Consilium/CONFIG.md` if it exists; otherwise derive 3-5 from the question and the workspace layout, and offer to save them for next time.

A domain entry is three things: a name, the lens (what this agent is responsible for noticing), and the files it must read first.

```markdown
- domain: data assembly
  lens: what actually reaches the artifact - sources, ordering, locales, bindings
  files: [docs/schema.md, dumps/, scripts/check_bindings.py]
```

**The skeptic is not optional.** Whatever else you pick, one agent is always tasked with killing the proposal: what would falsify it, what does it silently assume, and - critically - **has this already been tried and rejected?** Its required reading is the decision history and the recorded dead ends (`DECISIONS.md`, refuted insights, won't-do items). Without it a consilium turns into a chorus of agreement, which is worse than no consilium at all: it manufactures confidence.

## Step 2. Ask the question properly

Agents do not see the session. Everything needed to answer goes into the prompt: what exactly changes, in which scenario, for which language or model, what the current behaviour is, and what "good" would look like.

A vague question produces vague lenses. If you cannot state it self-contained in a paragraph, the consilium is premature - you do not yet know what you are asking.

## Step 3. Run them in parallel

Each agent gets: the question, its lens, its file list, and four standing instructions.

1. Answer **within your domain only**. Someone else covers the rest.
2. Be concrete - name files, fields, identifiers. No preambles, no politeness.
3. **State what you do not know** in your own area. The gaps matter more than the conclusions: a confident answer with an unnamed blind spot is how a consilium fails.
4. **Write nothing.** Not to files, not to a database, not to memory. Editing is the main session's job, after the decision.

## Step 4. Synthesize

The value is in the synthesis, not in the transcripts. Do not retell each agent.

1. **Consensus** - what several lenses independently agree on. Strong signal.
2. **Disagreements** - kept as disagreements. **Do not average them.** Two domains contradicting each other marks the zone of real uncertainty, and that is the single most useful output of the whole exercise; flattening it into a middle position destroys exactly the information you paid for.
3. **Unique findings** - what one lens saw and the others structurally could not. Check it is not an artifact before acting.
4. **The skeptic's verdict** - separately, always. If it found a prior rejection, that outranks the consensus until someone explains what changed.
5. **Recommendation** - your own. Going against the consilium is allowed and sometimes right; saying so explicitly and arguing it is mandatory.

The user gets the digest. Agent transcripts stay available but unread by default.

## Step 5. Record it

A consilium on a task-scale question ends in that task's `DECISIONS.md` as a new block: the question, the recommendation, the disagreements that stayed open, and what would change the answer. A consilium whose result lives only in a chat message was a rehearsal, not a decision.

If it produced a claim rather than a decision, it is a **hypothesis** and inherits the usual discipline (Rule 9): it carries a falsifier, and it is not promoted to fact by the agent that produced it (Rule 10).

## Rules

- Every agent is **read-only**. This is the rule that makes parallelism safe: five agents editing files concurrently is not a review, it is a merge conflict with opinions.
- Domain constraints that apply to the workspace apply to every agent - read-only production systems, forbidden operations, out-of-scope components. State them in the prompt; an agent that does not know the constraint will cheerfully recommend violating it.
- Three to five agents plus the skeptic. Beyond that the synthesis costs more than the coverage is worth.
- Zero disagreements on a genuinely complex question is a warning sign, not a success: check that the lenses were actually different and the question was not leading.
