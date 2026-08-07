---
title: "Spec-Driven, Property-Based Agentic Coding"
date: "2026-08-07"
subtitle: "How a small closed-loop pipeline caught a real encoding-format ambiguity — and what failed attempts at fixing it taught me about property-based testing versus example-based testing."
slug: "spec-driven-property-based-agentic"
---

I built a small pipeline for spec-driven, property-based AI coding: you write a short spec, one LLM implements it, and a *second, independent* LLM — which never sees the implementation, only the spec — derives properties and writes a [fast-check](https://github.com/dubzzz/fast-check) property-based test file. The two are run against each other, and if a property fails, the exact counterexample fast-check found gets fed back into the implementer for another attempt.

Code and write-up at [github.com/andrewlidong/spec-driven-property-ai](https://github.com/andrewlidong/spec-driven-property-ai).

## The mirror problem

If the same generation pass produces both the code and its tests, the tests tend to encode whatever the implementation already does — including its bugs. Code and tests agree with each other because they share the same blindspots, not because either one is actually correct.

The fix here is structural, not procedural: the test-writing call is genuinely blind to the implementation. It only ever sees the spec — a description, an exported TypeScript signature, and optional plain-language invariants — and it's generated once, before any implementation exists. Properties are derived from the spec's contract (`decode(encode(s)) === s`, "the output is sorted," "the result is a permutation of the inputs") rather than from watching what one implementation happens to return. That frozen test file then acts as a genuine, adversarial oracle across every retry.

## Case study: run-length encoding

One of the shipped example specs asks for run-length encoding and decoding: `"<count><character>"`. It looks straightforward. It isn't.

`encode("0")` produces `"10"` — which is indistinguishable from "ten of some missing character." The spec itself has a latent ambiguity, and the four implementation attempts that followed revealed it four different ways:

- **Attempt 1** crashed outright — `decode` greedily consumed both digits of `"10"` as the count, then tried to repeat a character that didn't exist.
- **Attempt 2** patched the crash with a bounds check, which quietly turned it into a wrong-answer bug instead: `decode("10")` now silently returned `""`.
- **Attempt 3** was functionally the same fix, same underlying bug.
- **Attempt 4** tried a structural fix — reserve the last character before reading digits — which happened to fix `"0"` but broke decoding for longer strings instead. fast-check shrunk the failure to `"0 "` (zero, then a space), where encoding and decoding produced a garbage string of over a hundred spaces.

That last attempt is the real payoff. A fix that satisfies the counterexample fast-check found in one run can still fail fast-check's *next* run, because property-based testing re-samples broadly every attempt rather than re-checking only the input that failed last time. An example-based regression suite built around `"0"` would have gone green on attempt 4 and shipped a decoder that mangles any string with more than one run in it.

## What converged, and what that means

Four of the five shipped example specs — merging sorted arrays, balanced parentheses, array rotation, binary-search lower-bound — converged on the implementer's very first attempt. Only the ambiguous run-length-encoding spec exhausted its retry budget. That split matters: it's evidence the pipeline correctly recognizes *correct* code and doesn't loop needlessly, and that the one spec it failed on failed for the right reason — a genuine design flaw in the spec, not an implementation slip.

## A few implementation details that mattered

The harness runs each attempt's implementation and the frozen test file together with `tsx` in a separate process, inside the project tree so module resolution works, with a 15-second timeout as a minimal safety margin (this is untrusted, LLM-generated code, not sandboxed in any stronger sense). fast-check's errors are passed back to the implementer verbatim rather than parsed and summarized — some of the most useful fixes came from the model noticing details in the full stack trace that a paraphrased error message would have thrown away.

To avoid requiring a separate API key, the implementer and test-writer calls will shell out to the `claude` CLI in headless mode if `ANTHROPIC_API_KEY` isn't set, reusing an existing Claude Code subscription login instead of a pay-per-token key. On the balanced-parentheses spec, the test-writer LLM independently invented a recursive generator using fast-check's `fc.letrec` — without being told to — deriving the need for it from a property hint about nested bracket pairs.

Try it with `pnpm start run --all`.
