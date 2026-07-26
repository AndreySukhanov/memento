---
description: Run any question through the outside-observer model panel (Rule 10 pool) and synthesize consensus, disagreements and unique findings - ad-hoc multi-model analysis on demand
argument-hint: [the question; optionally paths to material files]
---

# /memento:observers - ad-hoc multi-model panel

The scheduled observer passes (Rule 10) verify insights and audit memory on their own triggers. This command is the **on-demand mode**: any question where a second (and third) model family's view is worth the tokens - reviewing a draft or a prompt, stress-testing a contested decision, checking a hypothesis, risk assessment, "what am I missing here?".

## Step 1. Build the input

From `$ARGUMENTS`: the question text plus file paths, if given. If empty - ask what to analyze. If the question refers to session material (a draft, a report, a diff), save that material to a temp file and pass it as a file.

Phrase the question **self-contained**: observers do not see the session. Whatever context is needed to answer must be in the question or the attached files.

## Step 2. Run the panel

- The pool comes from `<workspace_root>/Observers/CONFIG.md` (`- model: <id>` lines). Convention: a model id **without** `/` is called on the provider's own API (e.g. OpenAI, key `OPENAI_API_KEY`); an id **with** `/` goes through OpenRouter (`OPENROUTER_API_KEY`). Keys from environment variables only - never from files in the workspace.
- One request per model: `system` = the observer role (a neutral independent expert by default; a mandate instruction from CONFIG.md when the question matches one), `user` = the question + materials. `max_tokens` ~4000, low temperature.
- Save each raw answer to `<workspace_root>/Observers/adhoc/YYYY-MM-DD-<slug>-<model>.md` with a header (date, model, files, token usage) **before** any synthesis. Reports are never deleted.
- A model failing is not a stop: continue with the rest and mention the failure in the synthesis.

## Step 3. Synthesize (the actual value)

Read all answers and produce a digest - do not retell each answer:

1. **Consensus** - what all/most models agree on (strong signal).
2. **Disagreements** - where models contradict each other, and whose position is better grounded. This is the most valuable part: a disagreement marks a zone of genuine uncertainty.
3. **Unique findings** - what only one model noticed (verify it is not an artifact before acting).
4. **Recommendation** - your own conclusion informed by the panel; if you side against the panel, say so explicitly and argue why.

End with one line: paths to the saved reports and total token spend.

## Rules

- Do not run the panel on trivial questions where it adds nothing - it costs money; say so and answer directly instead.
- Never print keys or write them into files.
- If a panel verdict touches a recorded insight, apply Rule 10: status `verified by <model>, <date>`, disagreements recorded with both positions.
