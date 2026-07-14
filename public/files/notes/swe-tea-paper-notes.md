---
title: "SWE Tea Paper Notes"
date: "2026-07-14"
subtitle: "Quick summaries of what the reading group has been reading"
---

One or two lines per paper from [[Communities|SWE Tea]], grouped by theme, newest first. Each theme is read chronologically to follow an idea through time.

## TPUs

- **In-Datacenter Performance Analysis of a Tensor Processing Unit (2017)** — Google's first TPU: an 8-bit systolic-array matrix engine for inference that beat contemporary CPUs/GPUs by 15–30× on performance and 30–80× on performance-per-watt. The paper that made domain-specific architectures respectable again.
- **The Design Process for Google's Training Chips: TPUv2 and TPUv3 (2021)** — the jump from inference to training: bfloat16, HBM, and a torus interconnect, with candid discussion of the design compromises made to ship on deadline.
- **Ten Lessons From Three Generations Shaped Google's TPUv4i (2021)** — the distilled retrospective; the memorable ones are optimizing for total cost of ownership rather than raw perf, and designing for backwards ML compatibility because production models outlive chips.
- **TPU v4: An Optically Reconfigurable Supercomputer (2023)** — 4,096 chips joined through optical circuit switches, so the network topology is reconfigured per job and failed racks are routed around; plus SparseCores for embedding workloads.
- **Resiliency at Scale: Managing Google's TPUv4 ML Supercomputer (2024)** — the fleet-management layer above the hardware: scheduling, checkpointing, and self-healing that keep month-long training jobs productive despite constant component failures.

## Virtualization

- **A Comparison of Software and Hardware Techniques for x86 Virtualization (2006)** — VMware shows their software binary translation often *beat* first-generation Intel VT-x, because the early hardware lacked MMU virtualization. A great lesson in not assuming hardware support wins.
- **kvm: the Linux Virtual Machine Monitor (2007)** — virtualization as a kernel module: guests are just Linux processes, so the hypervisor inherits the kernel's scheduler and memory management for free. It became *the* Linux hypervisor.
- **virtio (2008)** — a standard paravirtualized I/O interface built on shared ring buffers, so every hypervisor stops inventing its own device drivers.
- **KVM/ARM (2014)** — porting KVM to ARM via split-mode virtualization, contorting across privilege levels because ARM's hypervisor mode wasn't designed to host a full kernel.
- **Firecracker: Lightweight Virtualization for Serverless Applications (2020)** — AWS's minimal Rust VMM on KVM that boots microVMs in ~125ms and packs thousands per host: VM-grade isolation at near-container density, running Lambda underneath everyone.

## Black-box Optimization Platforms

- **Google Vizier (2017)** — black-box optimization as an internal shared service (Gaussian-process bandits underneath), tuning everything from ML hyperparameters to cookie recipes.
- **Optuna (2019)** — the define-by-run API for hyperparameter search: the search space is expressed in ordinary code, with aggressive trial pruning.
- **BoTorch (2020)** — Bayesian optimization rebuilt on PyTorch: Monte-Carlo acquisition functions made differentiable, so the whole pipeline optimizes by autograd.
- **Ax (2025)** — Meta's platform layered over BoTorch for adaptive experimentation in production, where trials are expensive and configuration is half the battle.

## Industrial Recommender Systems

- **Deep Neural Networks for YouTube Recommendations (2016)** — the canonical two-stage design: candidate generation as extreme multiclass classification, then a ranking network, with production tricks like watch-time weighting and "example age."
- **Deep Interest Network (2017, Alibaba)** — attention over a user's behavior history *conditioned on the candidate item*: interests are local, not one fixed embedding.
- **Graph Convolutional Networks for Web-Scale RecSys (2018, Pinterest)** — PinSage: GNNs made practical at billions of nodes via random-walk importance sampling.
- **Monolith (2022, TikTok)** — real-time recommendation with collisionless embedding tables and online training, arguing staleness is the enemy.
- **Recommender Systems with Generative Retrieval (2023, DeepMind)** — TIGER: give items semantic ID token sequences and make retrieval an autoregressive decoding problem.
- **Actions Speak Louder than Words (2024, Meta)** — recommendation reformulated as sequential transduction with trillion-parameter "HSTU" transducers, showing scaling-law behavior in recsys for the first time.
