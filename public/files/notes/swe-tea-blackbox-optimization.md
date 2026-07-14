---
title: "SWE Tea: Black-box Optimization"
date: "2026-07-14"
subtitle: "Meetups 109–112 · Vizier to Ax"
---

Part of [[SWE Tea Paper Notes]].

- **Meetup 109** — [Google Vizier: A Service for Black-Box Optimization (2017)](https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/46180.pdf) — black-box optimization as an internal shared service (Gaussian-process bandits underneath), tuning everything from ML hyperparameters to cookie recipes.
- **Meetup 110** — [Optuna: A Next-generation Hyperparameter Optimization Framework (2019)](https://arxiv.org/abs/1907.10902) — the define-by-run API for hyperparameter search: the search space is expressed in ordinary code, with aggressive trial pruning.
- **Meetup 111** — [BoTorch: A Framework for Efficient Monte-Carlo Bayesian Optimization (2020)](https://research.facebook.com/publications/botorch-a-framework-for-efficient-monte-carlo-bayesian-optimization/) — Bayesian optimization rebuilt on PyTorch: Monte-Carlo acquisition functions made differentiable, so the whole pipeline optimizes by autograd.
- **Meetup 112** — [Ax: A Platform for Adaptive Experimentation (2025)](https://openreview.net/forum?id=U1f6wHtG1g) — Meta's platform layered over BoTorch for adaptive experimentation in production, where trials are expensive and configuration is half the battle.
