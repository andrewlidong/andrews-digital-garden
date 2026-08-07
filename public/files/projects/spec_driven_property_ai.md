# Spec-Driven Property AI

## Spec-driven, property-based AI coding

You write a short spec; one LLM implements it; a *second, independent* LLM — which never sees the implementation, only the spec — derives properties and writes a [fast-check](https://github.com/dubzzz/fast-check) property-based test file. The two are run against each other, and if a property fails, the exact counterexample fast-check found is fed back into the implementer for another attempt.

### Technologies Used
- TypeScript
- fast-check (property-based testing)
- Anthropic API / Claude CLI (headless mode)
- pnpm

### Features
- **Structurally blind test-writer** — the test-writing LLM only ever sees the spec (description + exported TypeScript signature + optional plain-language invariants), and generates the test file once, before any implementation exists. Properties come from the spec's contract, not from watching what one implementation happens to return.
- **Adversarial oracle across retries** — because the test file never adapts to the implementation, a first-pass bug gets a real fast-check counterexample instead of a rubber stamp on every retry.
- **No separate API bill required** — if `ANTHROPIC_API_KEY` isn't set, it shells out to the `claude` CLI in headless mode (`claude -p --tools ""`), reusing an existing Claude Code subscription login instead of pay-per-token API access.
- **Full run transcripts** — every run writes the generated test file, every attempt's implementation, colorized diffs between attempts, and both `report.md` and a self-contained `report.html` with the pass/fail verdict and exact counterexamples.
- **Five shipped example specs** covering run-length encoding, balanced parentheses, merging sorted arrays, array rotation, and binary-search lower-bound — classic territory for off-by-one and boundary bugs.

### How It Works
A spec is a short YAML file: a description, an exported TypeScript signature, and optional plain-language invariants. LLM #1 (the test-writer) sees only that spec and writes a fast-check property test file — once, before any code exists. LLM #2 (the implementer) writes an implementation, which is run in a separate `tsx` process against that frozen test file. On failure, the exact counterexample fast-check found is fed back to the implementer for another attempt, up to a configurable `--max-iter`.

In a case study on a run-length-encoding spec, this setup surfaced a genuine spec-level ambiguity: the format `"<count><character>"` makes `encode("0")` produce `"10"`, indistinguishable from "ten of something." Four implementation attempts failed four different ways — a crash, then two variations of a silent wrong answer, then a structural fix that broke a different input class entirely — while four of five other specs converged on the implementer's first attempt, showing the pipeline correctly recognizes correct code rather than looping needlessly.

Read the full write-up: [[Spec-Driven, Property-Based Agentic Coding]].

### GitHub Repository
For more details and to view the source code, visit the [GitHub repository](https://github.com/andrewlidong/spec-driven-property-ai).
