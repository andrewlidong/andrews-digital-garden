**

- Meetup 028 - [Remus: High Availability via Asynchronous Virtual Machine Replication](http://nil.csail.mit.edu/6.824/2015/papers/remus.pdf) (2015)
    

- Continuation of Xen, 2015 paper on continuous VM migration for availability
    
- Richie saw a guy play doom, unplug the machine, and kept playing as the VM went on to the other machine
    



**

# Remus: High Availability via Asynchronous Virtual Machine Replication

**Authors**: Brendan Cully, Geoffrey Lefebvre, Dutch Meyer, Mike Feeley, Norm Hutchinson, and Andrew Warfield  
**Affiliation**: The University of British Columbia

## Overview

- **Purpose**: Remus is a software system that aims to provide high availability (HA) by replicating virtual machine (VM) states between two hosts. It ensures that applications can survive hardware failures without requiring modifications to the application code or specialized hardware.
- **Problem**: Traditional HA solutions require significant modifications, specialized hardware, and are often cost-prohibitive, making them inaccessible for mid-to-low-end systems.
- **Solution**: Remus uses virtualization to replicate the entire state of a VM to a backup machine asynchronously, with minimal downtime during failover.

---

## Key Concepts

### High Availability (HA)

- **High Availability** ensures systems can withstand failures by seamlessly switching to backup hardware.
- **Traditional HA Problems**:
    - Require specialized hardware or software.
    - Expensive and impractical for smaller setups.

### Remus's Approach to HA

- Remus encapsulates the VM and uses **asynchronous checkpointing** to replicate the system state at intervals as low as every 25 milliseconds.
- Allows for **speculative execution** of the active VM, with external network output buffered until checkpoints are successfully replicated to the backup.
- **Active-Passive Configuration**: Runs a primary VM while maintaining a backup VM that remains inactive until failure.

---

## Design and Implementation

### Goals

1. **Generality**: HA provided as a platform-level service without application-specific customization.
2. **Transparency**: No need to modify OS or application code.
3. **Seamless Recovery**: Minimal service interruption with no loss of externally visible state during failover.

### Key Techniques

1. **Virtualization**: Remus leverages virtualization to encapsulate entire system states.
2. **Speculative Execution**:
    - The primary VM continues execution without waiting for the backup to synchronize fully.
    - Output (e.g., network packets) is buffered and only released once the checkpoint has been acknowledged by the backup.
3. **Asynchronous Replication**:
    - State changes are propagated asynchronously to the backup.
    - Reduces the downtime and prevents performance bottlenecks by not synchronizing every small state change.

### Failure Model

- **Fail-Stop**: The system tolerates any single host failure.
- **Replication**:
    - Remus checkpoints VM state and propagates it to a backup host.
    - Upon detection of failure, the backup VM takes over seamlessly.

---

## System Architecture

### Workflow

- **Checkpointing Process**:
    1. VM execution is paused briefly to take a snapshot of its state.
    2. State changes are sent to a **staging buffer** before being transmitted to the backup.
    3. Once the backup acknowledges the checkpoint, the buffered network outputs are released.
- **Components**:
    - **Primary Host**: Runs the active VM.
    - **Backup Host**: Receives periodic snapshots, keeps memory and disk state ready for failover.
    - **Replication Engine**: Manages checkpoints and replication between primary and backup hosts.

### Buffering Mechanisms

1. **Network Buffering**:
    - Outbound packets are buffered to prevent loss of speculative state during replication.
    - Buffered data is only released after the corresponding checkpoint is committed.
2. **Disk Buffering**:
    - Disk writes are mirrored asynchronously to the backup.
    - Buffered until a full checkpoint has been received to ensure crash consistency.

---

## Performance and Evaluation

### Overhead and Efficiency

- **Latency and Performance**:
    - Overhead from frequent checkpointing includes network latency due to buffering and CPU overhead due to copying VM state.
    - Experiments show up to **50% overhead** for CPU-intensive tasks (e.g., kernel builds) at 20 checkpoints per second.
- **SPECweb Benchmark**:
    - Shows significant performance penalties for **network-heavy workloads** due to the buffered network outputs.
    - Effective checkpoint frequency may fall below configured values due to high memory throughput demands.

### Practical Deployment

- The system effectively ensures HA for VMs without specialized hardware.
- **N-to-1 Configuration**: One backup can protect multiple active hosts, making it resource-efficient for distributed environments.

---

## Lessons Learned and Optimizations

- **Reduced Overheads**:
    - Improvements in **checkpoint signaling** reduced suspend time by **orders of magnitude**.
    - **Memory Copy Enhancements**: Only dirty pages are copied, reducing unnecessary data transmission.
- **Potential Optimizations**:
    1. **Page Compression**: Utilizing **XOR compression** and general-purpose algorithms to reduce the size of replicated data.
    2. **Copy-On-Write Checkpoints**: Potential to reduce the time a VM is paused by implementing copy-on-write mechanisms for dirty pages.

---

## Related Work

- **Virtual Machine Logging and Replay**:
    
    - Similar approaches like **Bressoud and Schneider** used lock-step execution but faced difficulties with non-determinism in multi-core CPUs.
    - **ReVirt** and **Flight Data Recorder** explored deterministic replay for intrusion detection but did not aim at real-time availability.
- **Comparison to Traditional HA Solutions**:
    
    - Unlike conventional HA solutions that only mirror storage, Remus replicates full system state, preserving **live network connections** and **in-memory state**.

---

## Conclusion

- **Contribution**: Remus provides a novel approach to commodify high availability as a virtualization service, enabling failover in real-time while being accessible for systems with modest resources.
- **Impact**: Offers a **generic, cost-effective HA solution** for datacenters, with transparent failover and reduced complexity in provisioning HA for modern servers.




---

# Remus: High Availability via Asynchronous Virtual Machine Replication

## **Abstract**

- **Problem:** High availability (HA) systems are traditionally expensive and require complex engineering.
- **Solution:** Remus provides transparent HA for unmodified software using asynchronous VM replication, enabling seamless failover with minimal downtime (seconds) while preserving host state.
- **Key Contributions:**
    - Encapsulation of software in VMs.
    - Asynchronous propagation of state to backup servers (~40 Hz frequency).
    - Speculative execution to decouple VM activity and replication.

---

## **Introduction**

- HA systems have been historically restricted to high-budget environments.
- Traditional solutions involve:
    - Customized software recovery logic.
    - Specialized hardware.
- **Remus Goals:**
    - Offer general, transparent HA for commodity hardware.
    - Utilize virtualization to replicate VM snapshots asynchronously.

### **Challenges Addressed**

1. Complexity and cost of redundant systems.
2. Application-agnostic and OS-transparent HA mechanisms.
3. Protection against hardware failures without modifying the software stack.

---

## **Design Goals**

### **Generality**

- Supports diverse applications without requiring modification.

### **Transparency**

- Applications and OS remain unmodified.
- Seamless failure recovery for established states (e.g., TCP connections).

### **Seamless Recovery**

- Recovery appears as a temporary network delay to clients.
- Failures cause minimal disruption to the state or functionality.

---

## **System Architecture**

### **Overview**

- **Active-Passive Configuration:** Paired primary and backup servers.
- **VM Encapsulation:** Entire VM state is checkpointed.
- **Speculative Execution:** Primary VM executes ahead of committed backup state.
- **Asynchronous Replication:** Outputs are buffered and transmitted to the backup only after state acknowledgment.

### **Replication Phases**

1. **Checkpoint:** Capture VM state.
2. **Transmit:** Send state to backup.
3. **Acknowledge:** Confirm receipt of state.
4. **Release:** Commit external outputs (e.g., network packets).

### **High-Level Workflow**

- Primary executes speculatively.
- Backup ensures crash consistency by synchronizing at high frequencies.

---

## **Technical Features**

### **Speculative Execution**

- Execution proceeds while outputs (e.g., network) are buffered.
- Checkpoints occur at high frequencies (~40 Hz).
- Ensures outputs are only visible once the backup commits them.

### **Asynchronous Checkpointing**

- Decouples primary execution from backup state propagation.
- Results in a “running system tens of milliseconds in the past.”

### **Memory and Disk State Management**

- **Memory:** Modified pages are captured at checkpoints.
- **Disk:** Writes mirrored asynchronously and buffered until checkpoints are acknowledged.

---

## **Implementation Details**

### **Checkpoint Optimizations**

- **Memory Tracking:** Efficiently tracks "dirty" pages to reduce checkpoint overhead.
- **Suspend Optimization:** Improved suspend/resume process reduces latency to microseconds.

### **Disk and Network Buffers**

- **Disk:** Ensures crash consistency by buffering writes on backup.
- **Network:** Holds outbound packets until the associated checkpoint is committed.

### **Failure Detection**

- Heartbeats monitor communication between primary and backup.
- Failover activates backup VM if the primary fails.

---

## **Evaluation**

### **Benchmarks**

1. **Kernel Compilation:** ~50% performance overhead at 20 checkpoints/sec.
2. **SPECweb:** Network delays lead to reduced throughput (~25% of native speed).
3. **Postmark:** Minimal impact on disk performance during replication.

### **Strengths**

- Seamless failover with intact state.
- Suitable for general-purpose workloads.
- N-to-1 redundancy configurations are cost-effective.

### **Weaknesses**

- High network delays for latency-sensitive applications.
- Memory-heavy workloads may incur higher replication costs.

---

## **Comparison with Related Work**

- **Hardware-Based Replication:** More robust but cost-prohibitive.
- **Deterministic Replay (e.g., Bressoud & Schneider):** Infeasible for multi-core systems.
- **Process-Level Migration:** Complex due to residual dependencies.

---

## **Potential Optimizations**

1. **Deadline Scheduling:** Dynamically slow guest operations to manage dirty page limits.
2. **Page Compression:** Reduce replication bandwidth using XOR or gzip techniques.
3. **Copy-on-Write Checkpoints:** Mitigate pause times by leveraging COW for memory changes.

---

## **Future Work**

- **Cluster Replication:** Extending HA to distributed systems.
- **Disaster Recovery:** Deployment for geographic fault tolerance.
- **Log-Structured Datacenters:** Preserving complete execution histories for advanced debugging.

---

## **Conclusion**

- **Remus as a Platform Service:**
    - HA is simplified and accessible on commodity hardware.
    - Provides robust failover without specialized hardware or application changes.
- **Trade-Offs:**
    - Adds overhead but eliminates application-specific complexity.
- **Use Case:** Ideal for hosting providers or environments requiring flexible HA solutions.

---

## **Key Takeaways**

- Remus commodifies high availability, making it a feasible solution for mid-range systems.
- The asynchronous replication model ensures low-cost, transparent failover mechanisms.

---

Feel free to adapt or add specifics based on discussion focus or group interest!