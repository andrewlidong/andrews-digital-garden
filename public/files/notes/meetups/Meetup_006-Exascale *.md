**

- Meetup 006 - [Facebook’s Tectonic Filesystem: Efficiency from Exascale (2021)](https://www.usenix.org/system/files/fast21-pan.pdf), Feb 29th, 2024
    

**


# Facebook’s Tectonic Filesystem: Efficiency from Exascale

**Authors**: Satadru Pan, Theano Stavrinos, Yunqiao Zhang, Atul Sikaria, Pavel Zakharov, et al.  
**Affiliations**: Facebook, Inc.; Princeton University; Columbia University  
**Conference**: 19th USENIX Conference on File and Storage Technologies (FAST21)

## Overview

- **Purpose**: To introduce **Tectonic**, Facebook's exabyte-scale distributed filesystem.
- **Problem Addressed**: Consolidation of various specialized storage systems (e.g., Haystack, f4, HDFS) into a unified, efficient multitenant storage system.
- **Goals**:
    - **Scalability**: Achieve exabyte-scale storage capabilities.
    - **Multitenancy**: Enable multiple tenants with different workloads (e.g., blob storage, data warehouse) to coexist efficiently.
    - **Operational Simplicity**: Reduce complexity in managing storage by using a single system for multiple use cases.

## Key Features

### Multitenancy and Consolidation

- **Consolidation of Tenants**:
    - **Blob Storage** and **Data Warehouse** were initially managed by distinct systems: **Haystack** and **f4** for blobs, **HDFS** for data warehouse.
    - Tectonic consolidates these tenants to increase **resource efficiency** by sharing disk IOPS and capacity.
- **Operational Improvements**: Moving to Tectonic reduced the number of clusters required by **10x** for data warehouse, simplifying operations significantly.

### Scalability and Metadata Management

- **Metadata Disaggregation**:
    - Metadata is split into layers: **Name layer**, **File layer**, and **Block layer**.
    - Each layer is **hash-partitioned** to balance load and avoid hotspots, unlike other systems that use range partitioning.
- **Scalable Chunk Storage**: Supports billions of files, with the ability to scale linearly as storage nodes are added.

### Tenant-Specific Optimizations

- **Reed-Solomon (RS) Encoding**:
    - Data warehouse writes use **RS-encoding** for space efficiency.
    - Blob storage uses **replicated quorum append protocol** for lower latency during small writes, followed by re-encoding for space optimization.
- **Isolation and Fair Sharing**:
    - Resource management is designed around **TrafficGroups** and **TrafficClasses** to ensure fair sharing while maintaining low latency for high-priority applications.

## Architecture

### System Components

1. **Chunk Store**: The core storage unit, managing data in flat distributed objects called "chunks."
2. **Metadata Store**:
    - Built on a **key-value store** (**ZippyDB**), which provides sharding and replication for scalability and fault tolerance.
3. **Client Library**: Provides orchestration between metadata and chunk storage, supporting tenant-specific customizations.
4. **Stateless Background Services**:
    - Include garbage collection, rebalancing, and health checking.

### Performance Isolation

- **TrafficGroups** manage applications with similar latency requirements, reducing complexity.
- **Ephemeral Resource Management**: Ephemeral resources (like IOPS) are managed at the granularity of **TrafficGroups** rather than per application, ensuring scalability.

## Technical Challenges and Solutions

### Metadata Hotspot Mitigation

- Tectonic avoids metadata hotspots using **hash-partitioning**, which helps balance directory operations across shards.
- **Caching** of sealed metadata is also used to reduce load on the metadata store.

### Efficient Resource Utilization

- **Ephemeral Resource Sharing**: Blob storage and data warehouse share IOPS, enabling efficient handling of data warehouse spikes without overprovisioning.
- **Hedging Writes**: Data warehouse writes are optimized using **hedged quorum writes**, which reduce latency by using reservation requests to select the best-performing storage nodes.

## Evaluation and Results

- **Exabyte-Scale Operation**: Tectonic clusters are operational at exabyte-scale, hosting tenants such as blob storage and data warehouse in the same cluster.
- **Performance Gains**:
    - Consolidation has reduced **replication factors**, leading to significant savings in storage and operational overhead.
    - Tectonic manages to deliver **comparable or better performance** than previous specialized systems.

## Lessons Learned and Limitations

- **Trade-offs**: The transition to Tectonic introduced additional metadata latency compared to HDFS, which required compute engines to adapt by parallelizing certain operations.
- **Design Evolution**: The microservice-based architecture allowed iterative improvements, such as evolving the metadata store to reduce hotspots.