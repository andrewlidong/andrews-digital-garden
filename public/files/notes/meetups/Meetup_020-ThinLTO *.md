**- Meetup 020 - [ThinLTO: Scalable and incremental LTO](https://research.google/pubs/thinlto-scalable-and-incremental-lto/)**


# ThinLTO: Scalable and Incremental LTO

**Authors**: Teresa Johnson (Google), Mehdi Amini (Apple), Xinliang David Li (Google)  
**Conference**: CGO 2017, Austin, USA

## Overview

- **Purpose**: ThinLTO (Thin Link-Time Optimization) is a scalable cross-module optimization (CMO) technique designed to provide the benefits of LTO (Link-Time Optimization) without the usual high memory footprint and long build times.
- **Core Problem**: Traditional LTO techniques are resource-intensive, limiting their applicability, especially for large applications and machines without extensive memory configurations.
- **Solution**: ThinLTO addresses these challenges by using a **summary-based Whole-Program Analysis (WPA)**, splitting the optimization into scalable, distributed phases.

## Key Concepts

### Cross-Module Optimization (CMO)

- **CMO Definition**: Extending optimization scope beyond individual modules to achieve better runtime performance through **Inter-Procedural Optimization (IPO)** across multiple source modules.
- **Traditional LTO**: Implements CMO by combining all modules into a monolithic module for IPO, which often leads to large memory usage and serial execution bottlenecks.

### ThinLTO's Approach

- **Goal**: ThinLTO aims to achieve the benefits of traditional LTO while maintaining scalability similar to a non-LTO build, making it practical for large-scale applications.
- **Summary-Based WPA**: Uses a summary index of each module for global analysis rather than reading the entire intermediate representation (IR) into memory.

---

## ThinLTO Design

### Phases of ThinLTO

1. **Compile Phase**: Generates intermediate representation (IR) and module summaries.
    - Each summary includes metadata such as function definitions, global variables, and references.
2. **Thin Link Phase**: Serial phase that combines summaries from all modules to perform **Whole-Program Analysis (WPA)**.
    - No full IR is loaded into memory, making it lightweight and fast.
3. **ThinLTO Backend Phase**: Fully parallel backend optimizations based on the global analysis results.
    - Applies transformations such as **function importing** to enable inlining and other IPO optimizations.

### Key Optimizations

1. **Function Importing**: Imports functions from other modules to perform cross-module inlining.
    - **Profitability Analysis**: Determines which functions are likely to benefit from inlining based on their size and profile-guided data.
2. **Promotion of Symbols**:
    - **Local Symbols**: Promoted to global scope when referenced by imported functions, ensuring consistency across distributed compilation backends.

### Incremental Builds

- **Support for Incremental Compiles**:
    - Uses hashing to detect changes and only recompile affected modules.
    - Efficient incremental compilation enables fast rebuilds, which is not possible with traditional monolithic LTO.

---

## ThinLTO Cross-Module Optimizations

### Internalization

- **Internalization**: Converts symbols that do not need external visibility to local symbols to enable more aggressive inlining and removal of unused functions.
- **Challenges with ThinLTO**: Less internalization than regular LTO since modules remain separate, but linker dead stripping helps achieve a similar text size.

### Weak Symbol Resolution

- **Handling Weak Symbols**: Marks one prevailing copy of weak symbols and allows the others to be discarded.
- **Linkonce Linkage**: Modified to weak linkage when required, ensuring symbols are retained to satisfy external references if necessary.

### Indirect Call Promotion

- **Indirect Call Value Profiles**: Uses profile data to promote indirect calls to direct calls, enabling further inlining.
- **Integration with Profile Guided Optimization (PGO)**: Profile-based call edges are recorded in summaries, guiding the function import decisions for potential indirect call promotions.

---

## Performance Evaluation

### Runtime Performance

- **SPEC cpu2006 Benchmarks**: ThinLTO achieves similar performance to traditional LTO while being significantly more scalable.
- **Importing Statistics**: Most functions imported are inlined, highlighting the effectiveness of function importing in improving runtime performance.

### Build Performance

- **Serial Phase Efficiency**: The serial phase (Thin Link) is lightweight, consuming minimal memory and performing well even with debug information.
- **Comparison with Traditional LTO**:
    - **LLVM LTO and GCC LTO**: Higher memory usage and longer build times, especially for large real-world applications.
    - **ThinLTO**: Capable of scaling to larger applications while maintaining a build time comparable to a non-LTO build.

### Incremental Build Performance

- **Incremental Builds**: ThinLTO supports incremental compilation, making it suitable for day-to-day development compared to regular LTO, which requires expensive recompilation of the entire link step.

### Distributed Build Performance

- **Distributed Systems**: ThinLTO is designed to integrate well with distributed build systems. It serializes out global analyses, allowing backend compilation to run in parallel across multiple nodes.

---

## Future Work

- **New Optimizations**:
    - Global dead symbol stripping.
    - Hybrid models for merging small, tightly coupled modules to enhance internalization.
    - Improved debug metadata handling to reduce binary sizes for debug builds.
- **Dependency Tracking**: Exploring finer-grained dependency tracking for more efficient incremental builds.

## Conclusion

- **Impact**: ThinLTO provides a scalable alternative to traditional LTO, balancing between performance and memory efficiency. It achieves most of the performance gains of LTO while significantly improving scalability, enabling more widespread use in day-to-day development.
- **Scalability and Incremental Builds**: Its unique architecture, leveraging summary-based analyses, allows ThinLTO to support **incremental compilation** and integrate effectively into modern build systems, making it a strong candidate for default use in production environments.