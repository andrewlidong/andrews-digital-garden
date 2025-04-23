**

- Meetup 024 - [Towards Modern Development of Cloud Application (2023)](https://dl.acm.org/doi/pdf/10.1145/3593856.3595909)
    

**

# Towards Modern Development of Cloud Applications

**Authors**: Sanjay Ghemawat, Robert Grandl, Srdjan Petrovic, Michael Whittaker, Parveen Patel, Ivan Posva, Amin Vahdat  
**Affiliation**: Google

## Overview

- **Purpose**: This paper proposes a new programming model for developing cloud applications, which aims to simplify and optimize the development process by decoupling logical and physical boundaries in microservice architecture.
- **Core Idea**: Developers should write **logical monoliths** and let an **automated runtime** handle distribution, placement, and scaling, thus addressing the performance, management, and development challenges of traditional microservice-based architectures.

## Key Concepts

### Challenges of Traditional Microservices

- Traditional microservices architectures introduce several **challenges** despite their intended benefits:
    - **C1: Performance Bottlenecks**: Serialization and network overheads make highly distributed applications slower.
    - **C2: Correctness Issues**: Managing compatibility and correctness across multiple versions is challenging.
    - **C3: Complexity in Management**: Managing many binaries with independent release schedules complicates end-to-end testing.
    - **C4: API Evolution Constraints**: APIs become hard to change, leading to technical debt.
    - **C5: Slower Development**: Changes spanning multiple services require intricate coordination across different teams and releases.

### Proposed Programming Methodology

- The paper suggests an alternative methodology consisting of three tenets:
    1. **Write Monolithic Applications with Logical Modules**: Code is written as a monolith but structured into **logical components**.
    2. **Automated Runtime for Distribution**: A **runtime** dynamically assigns logical components to physical resources, considering execution characteristics.
    3. **Atomic Deployments**: Applications are deployed atomically, avoiding issues caused by multiple versions interacting.

## Programming Model

### Components

- **Components**: Long-lived, replicated entities similar to **actors**.
    - Defined by an interface and implemented as self-contained modules.
    - **Runtime Execution**: The runtime decides how to replicate, place, and co-locate components.
- **Example Setup**:
    - Components are either co-located in the same machine to avoid RPC overhead or replicated across nodes to ensure reliability.

### API and Development in Go

- **Component API**: The prototype implementation provides a **Go-based API** to simplify component interaction.
    - Components communicate seamlessly, with RPC calls abstracted away when communicating across nodes.

## Runtime

### Overview

- **Runtime Responsibilities**:
    - Handles component placement, scaling, and replication based on performance characteristics.
    - Ensures **atomic rollouts** to prevent inconsistencies due to different application versions interacting.

### Key Mechanisms

1. **Code Generation**: Automatically generates code for marshaling arguments, handling RPC, and managing components.
2. **Atomic Rollouts**: Ensures consistency by updating the entire application at once, akin to **blue/green deployments**.

## Enabled Innovations

### Performance Optimizations

- The runtime optimizes component **placement and scaling** based on execution metrics.
- Custom serialization and transport are used to **minimize latency**, taking advantage of the runtime's knowledge that all components are on the same version.

### Automated Testing

- **Simplified End-to-End Testing**: Writing applications as a single binary enables comprehensive end-to-end tests akin to unit tests.
- Opens up opportunities for automated testing approaches such as **chaos testing** and **model checking**.

### Stateful Rollouts

- Avoids cross-version communication, simplifying debugging and improving correctness.

## Prototype Implementation and Evaluation

- **Implementation Details**:
    - Written in Go with a custom serialization and transport protocol.
    - Uses **Google Kubernetes Engine (GKE)** for deployments, featuring gradual blue/green rollouts and automatic scaling.
- **Performance Gains**:
    - Achieved a **15× reduction in latency** and a **9× reduction in cost** compared to traditional microservice-based architectures.
    - Metrics showed a drastic reduction in required CPU cores and improved response times when co-locating components.

## Related Work

- The paper compares its approach to **actor systems** like Orleans and **microservice orchestration systems** like Kubernetes, noting that traditional solutions do not effectively address challenges C1-C5 (e.g., atomic rollouts, version management).

## Discussion

### Practical Considerations

- **Multiple Binaries**: Although the proposal emphasizes single-binary applications, practical limitations (e.g., organizational needs or large codebases) may necessitate multiple binaries.
- **Integration with External Services**: External services can still be utilized alongside the proposed model for flexibility.
- **Distributed Systems Challenges**: The proposal cannot eliminate fundamental distributed systems challenges such as handling **component failure** or **high latency**.

## Conclusion

- The traditional microservice-based development model has inherent challenges, such as increased overhead, management complexity, and slow iteration cycles.
- The proposed approach encourages developers to write applications as monoliths with logical boundaries, delegate deployment responsibilities to a runtime, and use **atomic deployments** for consistency.
- By shifting the burden of managing the physical infrastructure to a dedicated runtime, this approach unlocks new opportunities for optimization and reliability, potentially reducing costs and improving performance significantly.

---