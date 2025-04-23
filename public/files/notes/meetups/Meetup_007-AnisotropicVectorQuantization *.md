**

- Meetup 007 - Vector similarity search, March 13th, 2024
    

- [Accelerating Large-Scale Inference with Anisotropic Vector Quantization (2019)](https://arxiv.org/abs/1908.10396)
    



**


# Accelerating Large-Scale Inference with Anisotropic Vector Quantization

**Authors**: Ruiqi Guo, Philip Sun, Erik Lindgren, Quan Geng, David Simcha, Felix Chern, Sanjiv Kumar  
**Affiliation**: Google Research

## Overview

- **Purpose**: Propose a new approach to vector quantization specifically for large-scale Maximum Inner Product Search (MIPS) tasks. This method is designed to be anisotropic, focusing more on relevant components for MIPS.
- **Key Contribution**: The introduction of **score-aware quantization loss** which provides significant performance improvements for inference in large-scale systems.

## Key Concepts

### Maximum Inner Product Search (MIPS)

- **Definition**: Given a query vector, MIPS finds the data point in a database that maximizes the inner product with the query.
- **Applications**: Widely used in recommendation systems, extreme classification tasks, and scalable gradient computations.

### Traditional Quantization Techniques

- Most quantization techniques aim to **minimize reconstruction error**. This approach treats all points equally, which does not align with the requirements of MIPS where only high inner product scores are relevant.

### Anisotropic Quantization Approach

- **Observation**: For MIPS, quantization errors that impact the highest inner product values are more critical.
- **Proposed Loss Function**: The new **score-aware quantization loss** penalizes quantization error differently based on its impact on high-scoring inner product values.
    - More weight is given to errors **parallel** to the datapoint direction compared to those **orthogonal** to it.

## Components of the Proposed Method

### Score-Aware Quantization Loss

- **Weight Function (w)**: An arbitrary function of the inner product score that assigns higher penalties to high-relevance pairs (those with a larger inner product).
- **Anisotropic Loss Function**:
    - Quantization loss is decomposed into **parallel** and **orthogonal** components.
    - **Parallel components** are penalized more heavily than orthogonal ones, as they have a larger effect on the inner product approximation.

### Implementation

- The method is applied to **product quantization** and **vector quantization** frameworks.
- **Dictionary Learning**: The approach involves learning codebooks using anisotropic quantization, which balances parallel and orthogonal residuals during quantization.

## Experimental Results

- **Datasets**: Experiments were conducted using datasets like **Glove-1.2M** and showed state-of-the-art performance improvements.
- **Results**:
    - The proposed method yields better **recall** and **inner product approximation accuracy** compared to traditional quantization methods.
    - Particularly effective in high-recall regions, which are critical for retrieval-based systems.

## Technical Details

### Problem Formulation

- The MIPS problem is formalized as finding the datapoint with the maximum inner product with a given query vector.
- **Quantization Objective**: Traditional quantization minimizes reconstruction errors. Instead, the score-aware quantization loss aims to minimize errors where they most affect the MIPS outcome.

### Mathematical Derivations

- The **score-aware quantization loss** function decomposes into anisotropic components using natural statistical assumptions about query distributions.
- **Parallel vs Orthogonal Errors**:
    - Parallel error (`r‖`) and orthogonal error (`r⊥`) are computed, with different penalties applied depending on their impact on the MIPS task.

## Related Work

- The work builds on and diverges from traditional quantization methods:
    - **Product Quantization (PQ)** and **Additive Quantization (AQ)** have been well studied, but mainly focus on minimizing reconstruction loss.
    - The **score-aware approach** directly targets the loss that influences MIPS, providing a better fit for these applications.

## Conclusion

- The anisotropic quantization strategy provides a significant boost to **MIPS** tasks.
- **Open-Source Implementation**: The authors provide an open-source implementation that can be benchmarked against public datasets, showing superior performance in both recall and speed.