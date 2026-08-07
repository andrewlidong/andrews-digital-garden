---
title: "Deterministic simulation testing from scratch"
date: "2026-08-07"
subtitle: "Deterministic simulation testing is a testing philosophy where you run your system inside an environment you fully control, replay byte-identical executions on demand, inject faults into the network and the clock, and use coverage-guided search to steer an autonomous fuzzer toward states nobody wrote a test for."
slug: "deterministic-simulation-testing"
---

I built [tinychaos](https://github.com/andrewlidong/tinychaos), a tiny, from-scratch implementation of deterministic simulation testing, to see how much of that philosophy is actually reachable in a weekend project rather than a distributed-systems research lab.

Deterministic simulation testing usually combines four things that are normally built separately: deterministic simulation, fault injection, coverage-guided fuzzing, and automatic failure shrinking. tinychaos combines all four, and finds a real, seeded concurrency bug in a toy distributed billing system — on its own, with no hints — then reduces the repro to two lines.

## One design choice, four capabilities

The foundational rule: make the target's only legal source of nondeterminism a single seeded pseudo-random number generator, and route every timer and every "network" call through one cooperative event scheduler. Nothing in the target is allowed to touch a real clock or a real socket.

That one constraint is what turns four normally-separate capabilities into variations on the same primitive — run this exact script against this exact seed, deterministically, in milliseconds:

- **Deterministic replay** — re-executing the same seed and script byte-for-byte reproduces the same run.
- **Fault injection** — partitions, crashes, and restarts are just more scheduled events in the same timeline.
- **Coverage-guided fuzzing** — mutating the external event script and keeping mutations that reach new code paths is cheap when a run costs milliseconds.
- **Automatic shrinking** — delta-debugging a failing script down to a minimal repro is affordable precisely because re-running is affordable.

No hypervisor, no VM-level determinism, no custom kernel — just routing everything through one seeded scheduler.

## The bug: a real production-shaped race

The test target, TinyLedger, is a simplified three-node Raft-based invoice/payment ledger. Its `applyPayment` operation checks whether an idempotency key has already been applied *immediately*, but only records that key as applied after a simulated replication delay.

Two requests carrying the same idempotency key — exactly what a retried payment webhook looks like — that both arrive inside that window both read "not yet applied" and are both accepted. The payment gets applied twice. It's a real, recurring class of production incident, and it's essentially invisible to a single-threaded unit test, because it only exists due to the timing gap between two concurrent requests. (The balance-sufficiency check, by contrast, is atomic with the debit, so it was deliberately left as the one seeded bug rather than something the fuzzer stumbles into by accident.)

tinychaos's fuzzer finds this in the single digits to low hundreds of iterations and shrinks the failing script down to a two-event repro — two `applyPayment` calls, same idempotency key, nothing else.

## Coverage, the cheap way — and a benchmark that caught its own bug

Real statement/branch coverage needs bytecode instrumentation. Instead, TinyLedger calls lightweight `sim.probe(...)` markers at the branch points that matter, and a run's probe set stands in for its coverage when deciding whether a mutated program earns a spot in the corpus. Coarser than real coverage, but legitimately coverage-guided, and it took an afternoon instead of a week.

The first run of a benchmark comparing coverage-guided search against pure random search produced a surprising result: pure random *won*. That turned out to be a real bug in the fuzzer, not a finding about coverage guidance — the corpus loop only ever mutated existing entries and never generated a fresh one, so once the small probe space saturated, it kept re-mutating the same handful of seed programs with no exploration budget left. Mixing in a 30% chance of a brand-new random program per iteration (standard practice in real coverage-guided fuzzers) fixed it: both strategies reached 100% success afterward, with pure random still modestly faster on this particular shallow, small-key-pool bug — expected, since coverage guidance earns its keep on deep bugs behind rare, compound preconditions, not shallow ones. The useful result wasn't "coverage-guided wins" — it was that the ablation surfaced a real search-strategy bug that a single successful demo run would never have shown.

## Visualizing a failure

Rather than reading verbose ASCII traces, a fuzz or replay run can emit a self-contained HTML swimlane diagram: one lane per node and client, a dot per message or probe event positioned by time, and a red line marking the exact moment a property violation fires across all three replicas. Hovering any dot shows the details. No server, no external dependencies — just open the file in a browser.

## Where this approach stops working

This only works for single-process, cooperatively-scheduled systems. Anything requiring genuine cross-process determinism — real multi-process distributed systems — needs an actual hypervisor-based simulation platform, which is a much bigger undertaking. But the conceptual architecture — controlled nondeterminism as the single lever behind replay, fault injection, search, and shrinking — is transferable, and buildable by one person, for the systems small enough to fit inside it.
