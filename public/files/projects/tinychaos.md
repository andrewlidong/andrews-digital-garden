# tinychaos

## A from-scratch deterministic simulation testing framework

tinychaos is a tiny implementation of deterministic simulation testing that combines four things usually built separately: deterministic simulation, fault injection, coverage-guided fuzzing, and automatic failure shrinking. It finds a real, seeded concurrency bug in a toy distributed billing system on its own, with no hints, and shrinks the repro to two lines.

### Technologies Used
- TypeScript
- Node.js

### Features
- **One seeded source of nondeterminism** — every timer and every "network" call routes through a single cooperative event scheduler driven by one seeded PRNG, so the same seed and script always produce byte-identical execution.
- **Fault injection as scheduled events** — network partitions, node crashes, and restarts are just more events in the same deterministic timeline.
- **Coverage-guided fuzzing** — an autonomous search loop mutates event scripts and keeps the ones that reach code paths ("probes") never seen before this session.
- **Millisecond shrinking** — because re-running a deterministic sim is cheap, delta-debugging reduces a failing script to a minimal repro almost instantly.
- **Self-contained HTML visualizations** — a swimlane diagram of message timing and probe events across nodes, with the exact moment a property violation fires marked in red, for direct viewing in a browser.

### How It Works
The test target, TinyLedger, is a 3-node replicated invoice/payment ledger running a simplified Raft-lite (leader election by term and majority vote, heartbeat-driven replication). Its nodes never touch a real timer or socket — they call `sim.schedule()` and `sim.send()`, which route through the same seeded event loop. That single design choice is what makes replay, fault injection, mutation search, and shrinking all variations on one primitive: run this exact script against this exact seed, deterministically, in milliseconds.

The seeded bug: `applyPayment` checks whether an idempotency key has already been applied immediately, but only records it as applied after a simulated replication delay. Two payment requests carrying the same key — exactly what a retried webhook looks like — that both arrive inside that window both read "not yet applied" and are both accepted, applying one payment twice. tinychaos's fuzzer finds this in single-digit-to-low-hundreds of iterations and shrinks it to a two-event repro.

A benchmark comparing coverage-guided search against pure random search initially showed random *winning* — which turned out to be a real bug in the fuzzer itself (it only ever mutated existing corpus entries, never generated fresh ones). Fixing the exploration/exploitation balance brought both strategies to 100% success; the useful result wasn't "coverage-guided wins," it was that the ablation caught a real search-strategy bug a single successful demo run would never have surfaced.

Read the full write-up: [[Deterministic simulation testing from scratch]].

### GitHub Repository
For more details and to view the source code, visit the [GitHub repository](https://github.com/andrewlidong/tinychaos).
