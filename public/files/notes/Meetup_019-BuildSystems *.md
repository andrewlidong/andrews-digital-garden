**

- Meetup 019 - [Build systems a la carte](https://www.microsoft.com/en-us/research/publication/build-systems-la-carte/) (2024-07-10)
    

**

# Build Systems à la Carte

**Authors**: Andrey Mokhov, Neil Mitchell, Simon Peyton Jones  
**Affiliations**: Newcastle University, Digital Asset, Microsoft Research  
**Conference**: Proc. ACM Program. Lang., Vol. 2, ICFP 2018

## Overview

- **Purpose**: To provide a systematic and executable framework for understanding, comparing, and designing build systems.
- **Main Idea**: Build systems, despite being widely used, are rarely studied in depth. The paper presents a framework for viewing build systems as points in a design space rather than isolated entities, allowing new build systems to be designed with desired properties.

## Key Contributions

1. **Framework for Build Systems**:
    
    - Introduces abstractions to describe the essence of various build systems.
    - Uses **Haskell** to create executable models of these build systems, focusing on their correctness and design differences.
2. **Axes of Variation in Build Systems**:
    
    - **Static vs Dynamic Dependencies**: Whether the dependencies are known ahead of time or determined during the build.
    - **Local vs Cloud Build**: Where build artifacts are processed or stored.
    - **Deterministic vs Non-Deterministic**: If the build system guarantees the same output every time.
    - **Early Cutoff Support**: Determines if the build can stop early if unchanged results are detected.
    - **Self-Tracking Systems**: Systems like Excel, where changes in both inputs and rules (tasks) are tracked.
3. **Comparative Analysis**:
    
    - Analyzes existing build systems including **Make**, **Shake**, **Bazel**, **Nix**, and even **Excel**.
    - Shows how each system represents different trade-offs in a shared design space.

## Types of Build Systems

### Traditional Build Systems

- **Make**:
    
    - Relies on **static dependencies**.
    - Uses **file modification times** to determine if a task should be rebuilt.
    - **Minimal**: Rebuilds only when necessary, but lacks **early cutoff**.
- **Excel**:
    
    - Uses **dynamic dependencies** with formulas that determine dependencies during execution.
    - Rebuilds based on the "calc chain", allowing dynamic reordering of task execution.
    - Implements **self-tracking**, which is not common in software build systems.

### Modern Build Systems

- **Shake**:
    
    - Supports **dynamic dependencies** without compromising minimality.
    - Uses a **suspending scheduler**: dynamically adds tasks during execution and suspends tasks until dependencies are satisfied.
    - Implements **early cutoff**, stopping rebuilds if a result is unchanged.
- **Bazel**:
    
    - A **cloud build system** that allows sharing build artifacts among developers.
    - Uses a **restarting scheduler**: tasks are restarted if new dependencies are discovered during execution.

## Framework for Designing Build Systems

### Key Concepts

1. **Task Scheduling**:
    
    - Defines the order in which build tasks are executed.
    - **Topological Scheduling** (Make): Tasks are preordered based on dependencies.
    - **Restarting Scheduler** (Excel, Bazel): Tasks may restart when discovering new dependencies.
    - **Suspending Scheduler** (Shake): Tasks are suspended if dependencies are not yet available.
2. **Rebuilder**:
    
    - Determines whether a task needs to be rebuilt.
    - **Dirty Bit**: Used by systems like Make and Excel to track whether inputs have changed.
    - **Verifying Traces**: Used by Shake to verify hashes and dependencies.
    - **Constructive Traces**: Employed by Bazel to track full task execution and share results across developers.

### Summary of Build Systems Design Choices

- **Make**: Topological scheduler with file modification-based rebuild.
- **Excel**: Restarting scheduler with dynamic dependencies and self-tracking.
- **Shake**: Suspends tasks with verifying traces for dynamic dependencies and early cutoff.
- **Bazel**: Uses both cloud cache and a restarting scheduler for dynamic dependencies and incremental builds.

## Practical Examples

- The paper uses examples like **compiling source files** and **spreadsheet recalculations** to illustrate different approaches to dependencies and rebuild strategies.
- Shows how **dynamic dependencies** can be resolved differently in Excel vs Shake.

## Lessons Learned

- **Build System as a Landscape**: The key insight is that build systems should not be seen in isolation but as variations in a **design space** of possible build systems.
- **Designing New Systems**: By combining different schedulers and rebuilders, it is possible to create new build systems with tailored properties, for example, combining aspects of Shake and Bazel to achieve **cloud-shared builds with efficient early cutoff**.

## Conclusion

- **Contribution**: Offers a unified model to understand and compare build systems, using functional programming principles.
- **Impact**: This work helps engineers choose or design a build system that best fits their needs, taking into consideration properties like scalability, efficiency, and handling of dynamic dependencies.

---