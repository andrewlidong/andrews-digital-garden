**- Meetup 022
    

- [RocksDB: Evolution of Development Priorities in a Kv Store Serving Large-scale](https://research.facebook.com/publications/rocksdb-evolution-of-development-priorities-in-a-key-value-store-serving-large-scale-applications/)
    
- Sections 1 to 3
    
- Moved to Friday, Aug 2nd @ 5pm.**

# RocksDB: Evolution of Development Priorities in a Key-Value Store Serving Large-Scale Applications

**Authors**: Siying Dong, Andrew Kryczka, Yanqin Jin, Michael Stumm  
**Published**: ACM Transactions on Storage, 2021

## Overview

- **Purpose**: A retrospective on the evolution of development priorities for RocksDB, focusing on the lessons learned from large-scale production deployments, changing hardware trends, and specific application needs.
- **Background**: RocksDB is an embedded, high-performance key-value storage engine developed at Facebook, built on Google's LevelDB. It is designed for **Solid State Drives (SSDs)** and is widely used across many different applications, both within Facebook and other organizations.

## Key Concepts

### RocksDB Characteristics

- **Embedded Storage Engine**: Designed to be embedded in larger applications, managing data on local storage devices.
- **Customizability**: Highly customizable for different requirements (e.g., write throughput, read throughput, space efficiency).
- **Use Cases**: Widely adopted across multiple scenarios including:
    - **Databases** (e.g., MySQL, TiDB)
    - **Stream Processing** (e.g., Apache Flink, Kafka)
    - **Logging/Queue Systems** (e.g., Uber’s Cherami, Facebook’s LogDevice)
    - **Caching Systems** (e.g., Netflix’s EVCache)

### Evolution of Development Priorities

1. **Write Amplification**:
    
    - Initial focus was on minimizing **write amplification** to reduce SSD wear.
    - Write amplification could be as high as 30 but was improved by adopting **Tiered Compaction**, which lowered it significantly (4-10 range).
2. **Space Amplification**:
    
    - Later focus shifted to reducing **space amplification** to improve disk utilization.
    - **Dynamic Leveled Compaction** was introduced to automatically adjust levels and limit space overhead, providing stable and efficient space utilization compared to traditional LevelDB-style compaction.
3. **CPU Utilization**:
    
    - Recent focus is on reducing **CPU overhead** to optimize performance, especially as SSDs have outpaced CPUs in speed.
    - Efforts included optimizing bloom filters and improving prefix filtering to minimize CPU cycles required for data access.

---

## RocksDB Architecture and Techniques

### LSM-Trees

- **LSM (Log-Structured Merge) Trees** are used as the primary data structure.
    - **MemTable**: In-memory data structure for incoming writes.
    - **Write-Ahead Log (WAL)**: Provides durability for data in the MemTable.
    - **Compaction**: Moves data across different levels, reducing the footprint by removing deleted or outdated entries.
- **Compaction Strategies**:
    - **Leveled Compaction**: Used for space-efficient reads.
    - **Tiered Compaction**: Used for reducing write amplification but with higher read overhead.
    - **FIFO Compaction**: Used for caching applications, providing high write throughput.

### Resource Management

- **Multiple Instances per Node**: RocksDB often runs multiple instances on a single server, which requires effective **resource sharing** (e.g., memory, I/O bandwidth).
- **Global Resource Controllers**: Implemented to manage shared resources across different RocksDB instances efficiently.

### Failure Handling and Data Integrity

- **Data Corruption**: Early detection of data corruption is crucial to prevent its spread across replicas.
- **Multi-Layer Integrity Checks**:
    - **Block Checksums**: Ensures data integrity during read operations.
    - **File-Level Checksums**: Detects corruption when files are moved or transferred.
    - **Write-Ahead Logging**: Differentiated logging mechanisms allow applications to bypass WAL for improved performance under certain distributed setups.

---

## Lessons Learned

### Configuration Management

- **Complex Configuration Options**: Initially focused on flexibility, leading to **many configuration options** that became difficult to manage.
- **Adaptivity**: RocksDB now aims to provide better default configurations and automatic adaptivity, although manual configurations are still supported for specialized use cases.

### Use of Call-Back Functions

- **Compaction Filters**: Allow applications to define actions during compaction, such as data transformations or garbage collection.
- **Merge Operators**: Facilitate efficient in-place updates by allowing incremental value updates without full rewrite cycles.

### Handling Deletions

- **Tombstones**: Used to mark deletions but can lead to performance issues during scans due to accumulation.
- **Efforts to Mitigate Tombstone Issues**:
    - **Compaction Based on Tombstone Density**: Triggers compaction when a certain threshold of tombstones is exceeded.
    - **Range Deletes**: Currently under exploration to more efficiently manage bulk deletions.

### Support for Replication and Backups

- **Logical vs Physical Copying**:
    - **Logical Copying**: Reading data and writing it to a new replica.
    - **Physical Copying**: Direct copying of SSTables, which is more efficient in some cases.
- **Replication Challenges**: Requires support for maintaining **order consistency** across replicas, which can be challenging during updates.

---

## Conclusion

- **Evolution of Priorities**: RocksDB's development priorities have evolved with its growing adoption across different workloads, focusing on reducing write amplification, space amplification, and now CPU overhead.
- **General Purpose Storage Engine**: RocksDB aims to be a flexible, high-performance key-value store that can be customized to support diverse applications effectively.
- **Future Directions**: Ongoing work includes improving **adaptivity**, managing **CPU utilization**, and optimizing for newer storage technologies like **disaggregated storage** and **non-volatile memory**.