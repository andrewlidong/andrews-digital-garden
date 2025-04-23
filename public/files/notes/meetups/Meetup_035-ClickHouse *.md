**

- Meetup 035 - [ClickHouse - Lightning Fast Analytics for Everyone](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf)
    

**

# ClickHouse: Lightning Fast Analytics for Everyone

## Overview and Key Challenges

ClickHouse is an open-source columnar OLAP database designed for high-performance analytics. Started in 2009 and open-sourced in 2016.

### Key Challenges Addressed:

1. **Huge Datasets & High Ingestion**
    - Handles petabyte-scale data
    - Efficient indexing and compression
    - Scale-out capabilities
    - Continuous background processing of historical data
2. **Query Performance**
    - Handles many simultaneous queries
    - Low latency expectations
    - Adaptive to workload patterns
    - Resource management for concurrent queries
3. **Integration Capabilities**
    - Connects with diverse data stores
    - Multiple storage locations
    - Various data formats
4. **User Experience**
    - Rich SQL dialect
    - Performance introspection tools
    - Nested data types support
5. **Deployment Flexibility**
    - Data replication for robustness
    - Runs on diverse hardware
    - Native binary deployment

## Architecture

### Core Components

1. **Query Processing Layer**
    - SQL parsing/optimization
    - Vectorized execution
    - Optional code compilation
2. **Storage Layer**
    - MergeTree* family of table engines
    - Parts-based storage format
    - Background merges
3. **Integration Layer**
    - External system connectivity
    - Multiple data formats
    - Table functions

### Deployment Modes

1. **On-premise Mode**
    - Single server or multi-node cluster
    - Sharding and replication support
2. **Cloud Mode**
    - ClickHouse Cloud (managed service)
    - Autoscaling capabilities
3. **Standalone Mode**
    - Command-line utility
    - SQL alternative to Unix tools
4. **In-process Mode (chDB)**
    - Embedded in host process
    - Jupyter notebook integration

## Storage Layer Design

### MergeTree Table Engine

1. **Parts Organization**
    - Tables split into immutable parts
    - Parts created on insert
    - Background merging of small parts
    - Self-contained metadata
2. **Insert Modes**
    - Synchronous: One part per INSERT
    - Asynchronous: Buffer multiple inserts
3. **Data Format**
    - Columnar storage
    - Granules (8192 rows)
    - Compressed blocks
    - Optional column encoding

### Data Pruning Techniques

1. **Primary Key Index**
    - Locally clustered
    - Sparse indexing
    - Binary search capabilities
2. **Table Projections**
    - Alternative sort orders
    - Lazy materialization
    - Cost-based selection
3. **Skipping Indices**
    - Min-max indices
    - Set indices
    - Bloom filter indices

### Data Transformation

1. **Replacing Merges**
    - Keep latest versions
    - Version column support
2. **Aggregating Merges**
    - Continuous aggregation
    - Materialized view support
3. **TTL Merges**
    - Time-based aging
    - Multiple storage tiers
    - Re-compression options

## Query Processing

### Parallelization Levels

1. **SIMD Level**
    - Vectorized instructions
    - Multiple compute kernels
    - Runtime selection
2. **Multi-Core Level**
    - Thread-based parallelism
    - Pipeline execution
    - Dynamic load balancing
3. **Multi-Node Level**
    - Distributed query execution
    - Shard-aware processing
    - Data locality optimization

### Performance Optimizations

1. **Query Optimization**
    - Constant folding
    - Predicate pushdown
    - Sort elimination
2. **Query Compilation**
    - LLVM-based compilation
    - Operator fusion
    - Expression optimization
3. **Data Access**
    - Primary key optimization
    - Predicate evaluation ordering
    - Specialized hash tables

### Resource Management

- Concurrent query control
- Memory usage limits
- I/O scheduling
- Workload isolation

## Integration Capabilities

### External Connectivity

1. **Table Functions**
    - Ad-hoc query support
    - Read/write capabilities
    - Format conversion
2. **Table Engines**
    - Persistent connections
    - Schema mapping
    - Active/passive sync
3. **Database Engines**
    - Schema-level mapping
    - DDL support
    - Relational DB focus

### Data Format Support

- Native format
- 90+ supported formats
- Analytics-optimized formats
- Protocol compatibility

## Performance Results

### Benchmark Performance

1. **ClickBench Results**
    - Outperforms most databases
    - Strong cold/hot query performance
    - Efficient resource utilization
2. **TPC-H Performance**
    - Competitive on supported queries
    - Join optimization needed
    - Future improvements planned

### Performance Tools

- Server/query metrics
- Sampling profiler
- OpenTelemetry integration
- Query explanation

## Future Development

- User transactions
- PromQL support
- Semi-structured data type
- Join optimizations
- Light-weight updates



---

# **ClickHouse: Lightning Fast Analytics for Everyone**

## **Abstract**

- **Problem:** Handling large-scale analytics on petabyte-scale datasets with high ingestion rates and real-time latency requirements.
- **Solution:** ClickHouse, an open-source OLAP database:
    - Uses columnar storage with advanced compression.
    - Offers a vectorized query execution engine.
    - Integrates with diverse storage systems.
    - Optimizes for low-latency, high-concurrency workloads.
- **Results:** Demonstrates leading performance in real-world benchmarks with scalable, robust architecture.

---

## **Introduction**

- **ClickHouse Goals:**
    1. Manage large datasets with high ingestion rates.
    2. Support many simultaneous queries with low latency.
    3. Integrate diverse storage locations and formats.
    4. Offer an intuitive SQL-like query language.
    5. Ensure robustness and versatile deployment options.
- **Key Features:**
    - Columnar storage optimized for analytics.
    - Built-in data pruning and compression techniques.
    - Supports modern workloads with compatibility for data lakes, ETL pipelines, and distributed systems.

---

## **Architecture Overview**

### **Main Layers**

1. **Query Processing Layer:**
    - Parses and optimizes SQL queries.
    - Executes queries using vectorized operators.
2. **Storage Layer:**
    - Implements a log-structured merge (LSM) tree-like approach.
    - Includes engines for managing physical data distribution and replication.
3. **Integration Layer:**
    - Facilitates seamless interaction with external systems like Kafka, Redis, and S3.

### **Access Layer**

- Manages user sessions and protocols (SQL, HTTP, MySQL-compatible).
- Built-in monitoring and caching systems for enhanced performance.

---

## **Storage Layer**

### **Table Engines**

1. __MergeTree_ Engines:_*
    - Primary persistence format.
    - Organizes data into immutable parts sorted by primary key.
    - Periodic background merges improve query performance.
2. **Special Purpose Engines:**
    - Dictionaries for caching external data.
    - In-memory engines for temporary computations.
    - Distributed engines for global table views.
3. **Virtual Engines:**
    - Enable bidirectional data exchange with external systems (PostgreSQL, Redis, Kafka, etc.).

### **Key Features**

- **Compression:** LZ4 by default; supports custom codecs like Gorilla for time-series data.
- **Partitioning:** Supports range, hash, and round-robin partitioning for scalability.
- **Data Pruning:** Employs primary key indices, projections, and skipping indices to reduce scan overhead.

---

## **Query Processing Layer**

### **Vectorized Execution**

- Processes multiple rows simultaneously using SIMD instructions.
- Reduces overhead by passing data chunks between operators.

### **Parallelization**

1. **Single-Node:**
    - Multi-threaded execution.
    - Operators in a query plan are parallelized across available CPU cores.
2. **Multi-Node:**
    - Distributed query execution across shards.
    - Local computations on nodes minimize data transfer.

### **Optimizations**

- **Query Compilation:**
    - Uses LLVM for fusing query plan operators.
    - Reduces virtual calls and keeps data in CPU caches.
- **Data Skipping:**
    - Filters irrelevant data early using indices.
    - Evaluates predicates sequentially based on selectivity.

---

## **High Availability and Fault Tolerance**

- **Replication:**
    - Multi-master consensus via Raft-based Keeper.
    - Nodes asynchronously replay replication logs for eventual consistency.
- **Failure Recovery:**
    - Supports automatic failover for node and data center failures.
    - Dynamic sharding ensures load balancing.

---

## **Integration Layer**

- **Connectivity:**
    - Supports 50+ integrations including MySQL, Kafka, PostgreSQL, and Redis.
    - Table engines enable seamless data exchange between ClickHouse and external systems.
- **Data Formats:**
    - Reads and writes data in over 90 formats like Parquet, JSON, CSV, and Arrow.

---

## **Benchmarks and Performance**

### **ClickBench:**

- Simulates real-world workloads with 43 queries over a 100M row table.
- **Results:**
    - Outperforms other analytical databases like Snowflake and Redshift in hot and cold runtimes.

### **TPC-H:**

- Handles normalized data schemas with efficient join algorithms.
- Excels in parallel processing but lacks support for correlated subqueries (under development).

### **Performance Analysis Tools**

1. **Explain Query:** Provides insights into logical and physical query plans.
2. **Sampling Profiler:** Captures call stacks for performance debugging.
3. **OpenTelemetry:** Traces queries across distributed systems.

---

## **Conclusion**

- **Key Achievements:**
    - Provides unmatched query performance for analytical workloads.
    - Supports massive scalability with robust fault-tolerance mechanisms.
    - Integrates seamlessly with diverse modern data ecosystems.
- **Future Directions:**
    - Enhancements planned for 2024 include transaction support, PromQL integration, and semi-structured data handling.

---

# **TAO: Facebook’s Distributed Data Store for the Social Graph**

## **Abstract**

- **Problem:** Efficient and scalable access to Facebook’s social graph requires addressing challenges of high read demand and changing datasets.
- **Solution:** TAO, a distributed data store tailored for the social graph, offers:
    - Graph-specific abstractions.
    - High read efficiency and availability.
    - Reduced reliance on traditional caching architectures.
- **Key Features:**
    - Scales to handle **billions of reads and millions of writes per second**.
    - Supports a **geographically distributed deployment**.
    - Prioritizes **availability over strong consistency**.

---

## **Introduction**

- **Facebook’s workload:**
    - Over **1 billion active users** generating massive volumes of social data.
    - Social graph includes users, relationships, posts, comments, and other interactions.
- **Challenges:**
    - Personalized content requires fine-grained, real-time graph queries.
    - Privacy checks and dynamic views demand efficient and scalable reads.
- **TAO replaces traditional lookaside caching** (e.g., memcache) by introducing a graph-aware system designed for read-heavy workloads.

---

## **Motivation and Goals**

1. **Workload Characteristics:**
    - Predominantly read-heavy with minimal write operations.
    - Graph queries dominate, focusing on recent and frequently accessed data.
2. **Challenges with Memcache:**
    - Inefficient edge list representation.
    - Distributed client-side logic leads to failure modes and thundering herds.
    - Read-after-write consistency is expensive to achieve.
3. **Goals of TAO:**
    - Optimize for **read availability** and **machine efficiency**.
    - Provide a **graph abstraction API** for Facebook’s applications.

---

## **TAO Data Model and API**

### **Data Model**

- **Objects (Nodes):**
    - Represent entities like users, posts, and locations.
    - Identified by a 64-bit unique ID (`id`).
- **Associations (Edges):**
    - Typed directed edges connecting two objects.
    - Includes metadata (e.g., timestamps, key-value data).
- **Schemas:**
    - Define the allowed attributes for objects and associations.

### **APIs**

1. **Object API:**
    - Create, retrieve, update, or delete objects.
    - Lacks compare-and-set functionality due to eventual consistency.
2. **Association API:**
    - Supports bidirectional and inverse edges.
    - Operations include `assoc_add`, `assoc_delete`, and `assoc_range`.
3. **Query API:**
    - Enables efficient traversal of association lists, sorted by time.

---

## **System Architecture**

### **Key Components**

1. **Storage Layer:**
    - Uses **MySQL** for persistent storage.
    - Shards data based on object IDs.
    - Association queries leverage secondary indices for efficient lookups.
2. **Caching Layer:**
    - Implements TAO’s API for clients.
    - Uses an **LRU-based in-memory cache** for objects and associations.
    - Supports shard-based partitioning for scalability.
3. **Client Communication:**
    - Handles **all-to-all communication** efficiently to reduce bottlenecks.
    - Supports out-of-order responses to avoid head-of-line blocking.

### **Leader-Follower Configuration**

- **Leaders:**
    - Handle cache misses and writes to the storage layer.
    - Forward updates to follower caches asynchronously.
- **Followers:**
    - Serve most read requests, ensuring low-latency responses.
    - Propagate cache invalidations to maintain consistency.

---

## **Geographical Scaling**

- **Master-Slave Architecture:**
    - Each region hosts a complete copy of the social graph.
    - Master databases handle writes; replicas serve local reads.
- **Asynchronous Replication:**
    - Update notifications propagate through replication streams.
    - Ensures low-latency reads by serving from local regions.
- **Challenges:**
    - High inter-region latencies.
    - Maintaining consistency across regions while optimizing performance.

---

## **Performance Optimizations**

1. **Memory Management:**
    - Slab allocation and type-specific arenas optimize cache usage.
2. **Compression:**
    - Minimizes overhead for storing association counts and metadata.
3. **Hot Spot Mitigation:**
    - Popular objects are cached on the client side to reduce server load.
    - Shard cloning distributes reads for high-demand objects.

---

## **Consistency and Fault Tolerance**

1. **Consistency Model:**
    - Eventual consistency for most operations.
    - Read-after-write consistency within single tiers.
    - Critical reads proxy to the master region for stronger guarantees.
2. **Failure Handling:**
    - Aggressive timeouts detect server failures.
    - Writes and reads rerouted dynamically to maintain availability.
    - Asynchronous jobs repair inconsistencies caused by partial failures.

---

## **Production Insights**

1. **Workload Characteristics:**
    - **99.8% of requests are reads.**
    - Most association queries return empty results due to sparse edges.
2. **Performance Metrics:**
    - TAO handles **1 billion reads and millions of writes per second**.
    - Cache hit rate: **96.4%** for reads.
    - Replication lag: <1 second for 99% of requests.

---

## **Comparison to Related Work**

1. **Graph Databases:**
    - Neo4j, FlockDB focus on transactional ACID guarantees, limiting scalability.
    - TAO prioritizes availability and read efficiency over strong consistency.
2. **Key-Value Stores:**
    - TAO extends beyond simple key-value semantics to support graph traversal.
3. **Distributed Systems:**
    - Shares eventual consistency principles with Dynamo but avoids multi-master complexity.

---

## **Conclusion**

- **Key Contributions:**
    - Introduced a scalable, read-optimized graph data store tailored for Facebook’s social graph.
    - Achieved high availability and efficiency through a cache-persistent store separation.
    - Deployed at scale to support billions of real-time queries.
- **Future Work:**
    - Extend TAO’s API for advanced graph processing.
    - Explore optimizations for high-degree nodes and real-time analytics.

---
