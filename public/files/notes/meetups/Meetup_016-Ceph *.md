**- Meetup 016 - [Ceph: A Scalable, High-Performance Distributed File System | USENIX](https://www.usenix.org/conference/osdi-06/ceph-scalable-high-performance-distributed-file-system)**

# Ceph: A Scalable, High-Performance Distributed File System

**Authors**: Sage A. Weil, Scott A. Brandt, Ethan L. Miller, Darrell D. E. Long, Carlos Maltzahn  
**Conference**: 7th USENIX Symposium on Operating Systems Design and Implementation (OSDI), 2006

## Overview

- **Purpose**: Ceph is designed to provide a scalable, high-performance distributed file system, addressing the limitations of traditional distributed file systems.
- **Core Innovations**:
    - **CRUSH Algorithm**: A pseudo-random data distribution function for efficient and balanced storage.
    - **Decoupled Metadata Management**: Data and metadata management are separated to maximize scalability and performance.

## Key Concepts

### Challenges with Traditional File Systems

- Traditional distributed file systems like **NFS** suffer from **centralization**, limiting their scalability.
- **Object-Based Storage Devices (OSDs)** help distribute block allocation but still face metadata management bottlenecks.
- **Scalability Issues**: Traditional methods struggle with workload management, leading to performance limitations when dealing with dynamic and heterogeneous systems.

### Ceph's Design Goals

1. **Scalability**: Designed to scale to hundreds of petabytes and beyond.
2. **High Performance**: Capable of handling large workloads, including many clients reading and writing to the same files.
3. **Reliability**: Built with the assumption that failures are the norm, using distributed responsibility for recovery.

## Architecture

### System Components

- **Clients**: Expose a near-POSIX file system interface.
- **OSD Cluster**: Stores all data and metadata, handling replication, data migration, and recovery.
- **Metadata Server (MDS) Cluster**: Manages the namespace, directory hierarchies, and coordinates security, consistency, and coherence.

### Key Features

#### Decoupled Data and Metadata

- **Eliminates File Allocation Tables**: Instead of storing allocation metadata, Ceph uses **CRUSH** to calculate where data is stored.
- **Client Interaction**: Clients directly interact with OSDs for data operations (reads/writes), while metadata operations are managed by MDS.

#### Dynamic Metadata Management

- **Dynamic Subtree Partitioning**:
    - Metadata is distributed across MDS nodes based on current workload.
    - **Adaptive Distribution**: Adjusts metadata server responsibilities according to workload, allowing near-linear scaling.

#### Reliable Object Storage with CRUSH

- **CRUSH (Controlled Replication Under Scalable Hashing)**:
    - Replaces allocation tables with a pseudo-random data distribution function.
    - **Placement Groups (PGs)**: Data is first mapped to PGs, which are then assigned to OSDs.
    - Allows all nodes to calculate the location of objects, reducing the need for metadata lookup and improving scalability.

## Performance Considerations

### Efficient Metadata Operations

- **Caching and Prefetching**:
    - Uses **in-memory caching** for frequently accessed metadata to reduce latency.
    - **Readdirplus Extension**: Allows the results of `readdir` and `stat` to be bundled, reducing MDS interaction and improving performance.

### Load Balancing and Hotspot Management

- **Subtree Migration**: Popular directories are dynamically redistributed across multiple MDSs.
- **Replication for Hotspots**: Directories accessed by many clients are selectively replicated across nodes.

### Client Synchronization and Consistency

- **POSIX Semantics**: Reads and writes reflect changes immediately to maintain POSIX compliance.
- **Relaxed Consistency**: Ceph provides extensions for performance-conscious applications that do not require strict POSIX compliance, such as the **O LAZY** flag for write buffering.

## Evaluation and Results

### Scalability and Performance

- **I/O Performance**: Ceph achieves near-linear scaling of data throughput as OSDs are added, leveraging CRUSH for efficient data distribution.
- **Metadata Operations**: The MDS cluster scales well with up to **250,000 metadata operations per second** under heavy workloads, outperforming existing systems in scenarios with high metadata demands.

### Experiments

- **Cluster Setup**: Experiments were conducted on a dual-processor Linux cluster, demonstrating:
    - **Data Throughput**: Balanced data distribution allowed efficient scaling as more OSDs were added.
    - **Metadata Handling**: Ceph’s adaptive metadata strategy led to significant performance improvements in managing large directories.

## Future Work

- **Dynamic Data Replication**: Plan to adjust replication levels for data based on workload to further optimize hot data access.
- **Quality of Service (QoS)**: Developing mechanisms to prioritize workloads and manage replication traffic effectively.
- **Security Enhancements**: Incorporating scalable security protocols for large storage systems.

## Conclusion

- **Scalable and Adaptable**: Ceph's design separates metadata from data operations, enabling independent scaling for both, thus providing high scalability, reliability, and performance.
- **CRUSH Algorithm**: Key to scalability by allowing data placement without metadata lookups.
- **Dynamic Metadata Management**: Adapts to workload changes in real-time, ensuring balanced load distribution and high performance.