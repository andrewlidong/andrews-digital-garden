**

- Meetup 033 - [Linearizable State Machine Replication of State-Based CRDTs without Logs](https://arxiv.org/pdf/1905.08733v1.pdf)
    

**

# Linearizable State Machine Replication of State-Based CRDTs without Logs

**Authors**: Jan Skrzypczak, Florian Schintke, Thorsten Schütt (Zuse Institute Berlin)

## Overview

- **Purpose**: Introduce a protocol for linearizable state machine replication of Conflict-Free Replicated Data Types (CRDTs) without the need for command logs or consensus mechanisms.
- **Core Contributions**:
    - Log-free linearizable state machine replication for state-based CRDTs.
    - Avoidance of leader election and consensus-based synchronization, leveraging generalized lattice agreement.
    - Updates in a single round-trip and reduced coordination overhead.

---

## Key Concepts

### State-Based CRDTs

- **Definition**: Conflict-Free Replicated Data Types (CRDTs) allow distributed systems to converge to the same state without needing complex conflict-resolution protocols.
- **Properties**:
    - Rely on **monotonic growth** in a **join semilattice**.
    - No need for consensus or rollback as the data structure’s properties resolve conflicts.
- **Examples**: Counters, sets, certain graphs.

### Challenges with Consensus Protocols

- **Traditional Approaches**: Paxos and Raft are commonly used for consensus but introduce significant synchronization overhead and rely on log replication.
- **Leader Requirement**: Conventional state machine replication protocols often depend on a leader, leading to single points of failure and additional synchronization.

---

## Protocol Overview

### Problem Statement

- The protocol aims to support **linearizable updates** and **queries** of state-based CRDTs replicated across multiple nodes.
- **Challenges Addressed**:
    - Avoiding the need for a leader or command log.
    - Maintaining linearizability without extensive coordination.

### The Protocol

1. **Update Commands**:
    - Updates modify the state in a single round-trip.
    - Updates are merged directly without log replication.
2. **Query Commands**:
    - Require two-phase communication to ensure consistency across replicas.
    - Uses a modified version of the **Paxos algorithm** to agree on the current state before returning a query result.

### Generalized Lattice Agreement (GLA)

- Utilizes **generalized lattice agreement** rather than consensus, which allows for lightweight synchronization.
- States belong to a **join semilattice**, ensuring that they can be safely merged.

### Safety and Stability

- The protocol guarantees:
    - **Validity**: States reflect a series of update operations from an initial state.
    - **Stability**: States learned by subsequent queries are non-decreasing.
    - **Consistency**: States learned across processes are comparable.

---

## Key Features

- **Logless Updates**: Unlike Paxos or Raft, this protocol does not replicate a command log, reducing memory overhead.
- **High Throughput**: Through efficient use of CRDT properties, the protocol processes most updates in a single round-trip.
- **Read Operations**: Not always wait-free under concurrent updates but achieve over 97% read success with one or two round-trips.
- **Lightweight State Management**: Only a single counter per message for coordination, minimizing memory and synchronization costs.

### Optimizations

- **Reduced Payload Transmission**: Only necessary payload states are transmitted, reducing network traffic.
- **Batching**: Commands can be batched to reduce synchronization overhead for workloads with high concurrent access.

---

## Evaluation

- **Comparison with Paxos and Raft**:
    - **Higher Throughput**: Especially under mixed workloads with fewer updates.
    - **Reduced Latency**: Efficient load distribution without a leader.
- **Failure Handling**:
    - The protocol remains **continuously available** as long as a quorum of replicas is reachable, without the need for leader election.

---

## Related Work

- **Consensus Protocols**: Paxos, Raft, and generalized consensus protocols aim to provide linearizable access but come with high synchronization costs.
- **CRDT Usage**: Widely used in distributed systems like **Redis**, **Riak**, and **Akka**. Typically suitable for relaxed consistency models, but this paper extends CRDTs to support linearizable state machine replication.

---

## Conclusion

- **Contribution**: Provides a lightweight, high-throughput approach to linearizable replication of state-based CRDTs.
- **Advantages**: No leader election, no command log, continuous availability, and minimal coordination costs.
- **Future Work**: Potential integration of state delta mechanisms to reduce bandwidth and exploration of garbage collection for CRDT state management.

---




---

# **Linearizable State Machine Replication of State-Based CRDTs without Logs**

## **Abstract**

- **Problem:** Traditional state machine replication protocols require consensus and leader election, incurring high synchronization overhead and complexity.
- **Solution:** The authors propose a protocol leveraging **state-based CRDTs** (Conflict-Free Replicated Data Types) to achieve:
    - Linearizability without logs or leaders.
    - Reduced memory and synchronization overhead.
    - High throughput for updates and reads with minimal round trips.
- **Results:** The protocol achieves linearizable state machine replication with:
    - Single-round trip updates.
    - More than 97% of reads resolved in one or two round trips.
    - Improved performance over traditional Paxos and Raft implementations.

---

## **Introduction**

- **State Machine Replication (SMR):**
    - Ensures fault tolerance by replicating application state across distributed nodes.
    - Traditional methods require all replicas to execute the same commands in the same order (via consensus protocols like Paxos or Raft).
- **Challenges of Consensus Protocols:**
    - Central coordinator/leader requirements.
    - High memory overhead from log replication.
- **CRDTs (Conflict-Free Replicated Data Types):**
    - Mathematical structures ensuring replica convergence without coordination.
    - Common in systems like Redis, Riak, and SoundCloud.
    - Typically incompatible with linearizability.

### **Proposed Protocol:**

- Combines CRDT properties (monotonic growth in a join semilattice) with linearizable replication.
- Eliminates logs and leader dependencies.

---

## **Preliminaries**

### **System Model:**

- Distributed, asynchronous processes communicate via message passing.
- Processes may crash and recover without losing internal state.
- Byzantine failures are not addressed.

### **State-Based CRDTs:**

- Relies on a **join semilattice**, enabling convergence via monotonic updates.
- **Properties of Join Semilattice:**
    - Idempotence: x∨x=xx \lor x = x
    - Commutativity: x∨y=y∨xx \lor y = y \lor x
    - Associativity: (x∨y)∨z=x∨(y∨z)(x \lor y) \lor z = x \lor (y \lor z)
- **Example:** Grow-only Counter (G-Counter):
    - State is a vector, where each replica increments its own component.
    - Updates merge states by taking element-wise maxima.

---

## **Linearizable and Logless RSM for State-Based CRDTs**

### **Problem Statement:**

- Replicate a state-based CRDT across NN processes, ensuring linearizable reads and updates.
- Updates modify the state, while reads return state values.

#### **Key Conditions:**

1. **Validity:** Learned states correspond to valid sequences of applied updates.
2. **Stability:** Subsequent queries observe non-decreasing states.
3. **Consistency:** Learned states across replicas are comparable.

### **Protocol Overview:**

- **Roles:**
    - **Proposer:** Handles client requests.
    - **Acceptor:** Stores and updates the CRDT state.
- **State Replication:** Updates occur via merge operations, ensuring monotonic state growth.
- **Message Rounds:**
    - Updates require a single round trip.
    - Reads may require multiple round trips to synchronize with concurrent updates.

---

## **Proof of Safety**

- **Key Theorems:**
    - **Validity:** Any learned state is a valid outcome of applying a sequence of updates.
    - **Stability:** Observed states are non-decreasing across queries.
    - **Consistency:** Learned states at any two replicas are comparable.
- **Monotonicity of States:**
    - Merging or applying updates always results in state growth.

---

## **Optimizations**

1. **Reduced Payload Transmission:**
    - Skip sending redundant states in prepare messages.
    - Exclude payloads from votes when the proposer already holds them.
2. **Batching:**
    - Aggregate multiple commands into a single request to reduce synchronization overhead.

---

## **Evaluation**

- **Setup:**
    - Compared with open-source Paxos and Raft implementations.
    - Benchmarked using a replicated counter across three nodes.

### **Results:**

1. **Failure-Free Operation:**
    - Higher throughput than Paxos and Raft for mixed read/update workloads.
    - Superior load distribution across replicas due to leaderless design.
2. **Failure Handling:**
    - No leader means continuous availability as long as a quorum is reachable.
    - Performance degrades gracefully under node failures.

---

## **Related Work**

- **Consensus Protocols:**
    - Paxos, Raft, and their optimizations focus on strict ordering and logs.
- **CRDT Systems:**
    - Employed in systems like Redis and Riak for eventual consistency but limited to non-linearizable applications.
- **Generalized Lattice Agreement:**
    - Focused on semilattices but lacks practical truncation mechanisms.

---

## **Conclusion**

- Provides a lightweight, scalable protocol for linearizable replication of state-based CRDTs.
- Eliminates reliance on leaders and logs, simplifying implementation.
- Offers high throughput and availability, even under high concurrency and failures.

---

