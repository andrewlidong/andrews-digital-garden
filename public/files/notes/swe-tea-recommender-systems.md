---
title: "SWE Tea: Recommender Systems"
date: "2026-07-14"
subtitle: "Meetups 103–108 · industrial recsys from YouTube DNN to HSTU"
---

Part of [[SWE Tea Paper Notes]].

- **Meetup 103** — [Deep Neural Networks for YouTube Recommendations (2016)](https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/45530.pdf) — the canonical two-stage design: candidate generation as extreme multiclass classification, then a ranking network, with production tricks like watch-time weighting and "example age."
- **Meetup 104** — [Deep Interest Network for Click-Through Rate Prediction (2017, Alibaba)](https://arxiv.org/abs/1706.06978) — attention over a user's behavior history *conditioned on the candidate item*: interests are local, not one fixed embedding.
- **Meetup 105** — [Graph Convolutional Neural Networks for Web-Scale Recommender Systems (2018, Pinterest)](https://arxiv.org/abs/1806.01973) — PinSage: GNNs made practical at billions of nodes via random-walk importance sampling.
- **Meetup 106** — [Monolith: Real Time Recommendation System With Collisionless Embedding Table (2022, TikTok)](https://arxiv.org/abs/2209.07663) — real-time recommendation with collisionless embedding tables and online training, arguing staleness is the enemy.
- **Meetup 107** — [Recommender Systems with Generative Retrieval (2023, DeepMind)](https://proceedings.neurips.cc/paper_files/paper/2023/file/20dcab0f14046a5c6b02b61da9f13229-Paper-Conference.pdf) — TIGER: give items semantic ID token sequences and make retrieval an autoregressive decoding problem.
- **Meetup 108** — [Actions Speak Louder than Words (2024, Meta)](https://arxiv.org/abs/2402.17152) — recommendation reformulated as sequential transduction with trillion-parameter "HSTU" transducers, showing scaling-law behavior in recsys for the first time.
