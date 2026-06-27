# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**TaxInsuranceInvestment-Advice** — an application for tax, insurance, and
investment advice. The codebase is in its early stages; document architecture
and conventions in this file as they emerge.

## How to respond

- **Be brief, simple, and concise.** Every response should be **one to three
  sentences** unless the task genuinely cannot be answered that briefly.
- Prefer plain language over jargon. Lead with the answer, not the preamble.
- When more length is unavoidable (e.g. a code block or a list of distinct
  steps), keep the surrounding prose just as tight.

## How to ask questions — grill before you build

Inspired by Matt Pocock's `grill-me` skill. Most failures come from
under-specified requirements, not bad code. Before writing code or committing
to a design, interview the user to raise the resolution of their request.

- **Interview relentlessly** about every aspect of the plan until you and the
  user reach a **shared understanding**.
- **Ask one question at a time.** Wait for the answer before asking the next.
  Never bundle multiple questions into one message.
- **Walk down the design tree.** Resolve decisions in dependency order — each
  answer narrows the next question — branch by branch, until nothing material
  is left unresolved.
- **Explore before asking.** If a question can be answered by reading the
  codebase, read it instead of asking the user.
- Keep each question short and concrete. Offer the likely options when it helps
  the user decide faster.
- Only start implementing once the design tree is fully resolved.
