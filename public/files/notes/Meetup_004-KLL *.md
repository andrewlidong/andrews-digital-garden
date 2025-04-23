**

- Meetup 004 - [KLL Optimal Quantile Approximation in Streams (2016)](https://arxiv.org/pdf/1603.05346v2.pdf), Feb 21th, 2024
    

**


# Optimal Quantile Approximation in Streams (KLL)

**Authors**: Zohar Karnin, Kevin Lang, Edo Liberty  
**Affiliation**: Yahoo Research

## Overview

- **Purpose**: To solve the problem of constructing an optimal quantile sketch for streaming data, allowing approximate rank queries with tight error bounds while using minimal space.
- **Main Contribution**: Introduces an **anisotropic vector quantization** approach for creating quantile sketches with a space complexity of **O((1/ε) log log(1/δ))**, improving over previous known methods.

## Key Definitions

### Quantile Approximation

- **Single Quantile Approximation**: Given a stream of items, estimate the rank of a query value `x` such that the error is bounded by `εn` with probability `1 - δ`.
- **All Quantiles Approximation**: Construct a data structure such that the ranks of all potential query values can be approximated simultaneously within an error of `εn` with a given confidence level.

### Quantile Sketching Problem

- **Rank (R(x))**: Number of stream items such that `xi ≤ x`.
- **Quantile Sketch**: A data structure that allows efficient approximation of the rank of a query `x` in a large stream.

## Related Work

- **Previous Approaches**:
    - **Greenwald and Khanna (GK)**: Provides a deterministic quantile sketch with space complexity **O((1/ε) log(nε))**.
    - **Manku, Rajagopalan, Lindsay (MRL)**: Requires **O((1/ε) log²(nε))** space.
    - **Felber and Ostrovsky (FO)**: Randomized solution with **O((1/ε) log(1/ε))** space.
- **Mergeability**: An important feature that allows multiple sketches to be merged into one, maintaining the same error bounds.

## Contributions of KLL Sketch

- **Novel Representation**: Modifies the widely used merge-and-reduce construction, leading to improved analysis and better space efficiency.
- **Lower Space Complexity**: Achieves **O((1/ε) log log(1/δ))** for a randomized sketch, which is significantly better than previous works.
- **Mergeable**: Maintains the ability to merge sketches, making it suitable for distributed systems.

## Algorithm Overview

### Compactors and Compaction

- **Compactor**: A data structure that holds `k` items with the same weight `w`. It compacts `k` items into `k/2` elements by sorting and selecting either the even or odd items.
- **Hierarchy of Compactors**:
    - Multiple compactors are used in a hierarchy.
    - Each compactor at a higher level in the hierarchy receives items from lower levels with exponentially increasing weights.

### Optimizations

- **Varying Compactor Capacities**:
    - Different levels of the hierarchy use compactors of varying capacities (`kh`).
    - **Top Levels**: Use higher capacities to minimize error contribution, while lower levels use reduced capacities to improve space efficiency.
- **Sampling Instead of Compacting**:
    - For the top compactors, sampling is used instead of compaction, reducing space usage further without compromising accuracy.

### Space Complexity

- **Single Quantile Problem**: Achieved **O((1/ε) log log(1/δ))** space complexity.
- **All Quantiles Problem**: Similar space complexity holds due to efficient compaction and sampling techniques.

## Results and Evaluation

### Tightness of Results

- **Lower Bound**: The paper establishes that their solution is optimal for randomized quantile sketching, proving that any algorithm must store at least **Ω((1/ε) log log(1/δ))** items for single quantile approximation.
- **Comparison with Prior Works**:
    - The KLL sketch reduces both **space complexity** and **computational overhead** compared to the **Greenwald-Khanna (GK)** and **Manku et al. (MRL)** methods.

## Practical Considerations

- **Mergeability**: The KLL sketch is fully mergeable, supporting distributed computation and enabling large-scale data analysis over multiple data partitions.
- **Failure Probability and Space-Optimality**:
    - By handling the top compactors differently (e.g., using GK sketch), the space complexity can be further reduced, though mergeability is partially compromised.

## Summary

- The **KLL sketch** is a major advancement in quantile approximation for streaming data, providing an efficient, scalable, and mergeable solution.
- It improves over previous work by achieving a better space complexity of **O((1/ε) log log(1/δ))** and handles both **single** and **all quantiles** problems effectively.
