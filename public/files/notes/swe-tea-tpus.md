---
title: "SWE Tea: TPUs"
date: "2026-07-14"
subtitle: "Meetups 118–122 · five generations of Google's ML chips"
---

Part of [[SWE Tea Paper Notes]].

- **Meetup 118** — [In-Datacenter Performance Analysis of a Tensor Processing Unit (2017)](https://arxiv.org/abs/1704.04760) — Google's first TPU: an 8-bit systolic-array matrix engine for inference that beat contemporary CPUs/GPUs by 15–30× on performance and 30–80× on performance-per-watt. The paper that made domain-specific architectures respectable again.
- **Meetup 119** — [The Design Process for Google's Training Chips: TPUv2 and TPUv3 (2021)](https://gwern.net/doc/ai/scaling/hardware/2021-norrie.pdf) — the jump from inference to training: bfloat16, HBM, and a torus interconnect, with candid discussion of the compromises made to ship on deadline.
- **Meetup 120** — [Ten Lessons From Three Generations Shaped Google's TPUv4i (2021)](https://gwern.net/doc/ai/scaling/hardware/2021-jouppi.pdf) — the distilled retrospective; the memorable ones are optimizing for total cost of ownership rather than raw perf, and designing for backwards ML compatibility because production models outlive chips.
- **Meetup 121** — [TPU v4: An Optically Reconfigurable Supercomputer (2023)](https://arxiv.org/abs/2304.01433) — 4,096 chips joined through optical circuit switches, so the network topology is reconfigured per job and failed racks are routed around; plus SparseCores for embedding workloads.
- **Meetup 122** — [Resiliency at Scale: Managing Google's TPUv4 ML Supercomputer (2024)](https://www.usenix.org/system/files/nsdi24-zu.pdf) — the fleet-management layer above the hardware: scheduling, checkpointing, and self-healing that keep month-long training jobs productive despite constant component failures.
