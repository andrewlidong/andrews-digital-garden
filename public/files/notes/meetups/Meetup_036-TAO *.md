**

- Meetup 036 - [TAO: Facebook’s Distributed Data Store for the Social Graph](https://www.usenix.org/system/files/conference/atc13/atc13-bronson.pdf)
    

**

# TAO: Facebook's Distributed Data Store for the Social Graph

## Overview

- TAO (The Associations and Objects) is Facebook's distributed data store designed specifically for serving the social graph
- Handles billions of reads and millions of writes per second
- Geographically distributed system optimized for read-heavy workloads
- Replaced memcache for many data types at Facebook
- Explicitly favors efficiency and availability over consistency

## Core Data Model

### Objects

- Typed nodes in the graph
- Identified by 64-bit unique integers
- Contains key-value pairs for data
- Schema defines possible keys and value types

### Associations

- Typed directed edges between objects
- Identified by (id1, atype, id2)
- Contains:
    - 32-bit time field (central to queries)
    - Optional key-value pairs
- At most one association of given type between any two objects
- Can have inverse associations automatically maintained

## API

### Object Operations

- Create new object with ID
- Retrieve object by ID
- Update object
- Delete object

### Association Operations

- `assoc_add`: Add/overwrite association
- `assoc_delete`: Remove association
- `assoc_change_type`: Change association type

### Association Queries

- `assoc_get`: Get specific associations
- `assoc_range`: Get association list by position
- `assoc_time_range`: Get associations within time range
- `assoc_count`: Count associations of given type

## Architecture

### Storage Layer

- Uses MySQL as persistent storage
- Data divided into logical shards
- Object ID contains embedded shard ID
- Associations stored on same shard as id1

### Caching Layer

- Two-level caching hierarchy:
    1. Leader tier (coordinates writes)
    2. Multiple follower tiers (handle most reads)
- Each tier capable of serving any TAO request
- Followers forward cache misses to leaders
- Leaders coordinate with databases

### Geographic Distribution

- Master/slave architecture across regions
- Each region has:
    - Complete set of databases
    - One leader cache tier
    - Multiple follower tiers
- Writes go to master region
- Reads served from local region
- Async replication between regions

## Consistency Model

- Eventually consistent system
- Read-after-write consistency within single tier
- Asynchronous cache invalidation between regions
- Consistency messages embedded in DB replication stream
- Version numbers used to resolve race conditions

## Production Workload Characteristics

- Read/Write ratio: 99.8% reads, 0.2% writes
- Most edge queries return empty results
- Query frequency and node connectivity show long-tail distribution
- 96.4% cache hit rate
- Replication lag typically <1 second (85% of time)
- Can handle:
    - Billions of reads per second
    - Millions of writes per second
    - Many petabytes of data

## Failure Handling

### Types of Failures Handled

- Database failures
- Leader cache failures
- Follower cache failures
- Network timeouts
- Replication delays

### Recovery Mechanisms

- Automatic master promotion for DB failures
- Request rerouting around failed components
- Asynchronous queue for missed invalidations
- Bulk invalidation for consistency recovery
- Multiple follower tiers for redundancy

## Design Trade-offs

- Availability over consistency
- Read performance over write performance
- Efficiency over strong guarantees
- Structured data model over flexible queries
- Geographic distribution over simplicity

## Key Benefits

1. Efficient read access to graph data
2. High availability
3. Geographic distribution
4. Scalability
5. Simple API for developers
6. Automatic inverse edge maintenance
7. Built-in caching system
8. Support for high-degree nodes

## Limitations

- No advanced graph processing
- Limited consistency guarantees
- Write availability sacrificed for simplicity
- Fixed set of query patterns
- Upper bounds on association queries

## Historical Context

- Replaced direct MySQL + memcache architecture
- Addressed issues with lookaside cache design:
    - Inefficient edge list handling
    - Distributed control logic complications
    - Expensive read-after-write consistency



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