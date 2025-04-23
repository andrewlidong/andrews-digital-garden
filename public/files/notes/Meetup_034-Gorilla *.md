**

- Meetup 034 - [Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://www.vldb.org/pvldb/vol8/p1816-teller.pdf)
    

**

# Gorilla: A Fast, Scalable, In-Memory Time Series Database

**Authors**: Tuomas Pelkonen, Scott Franklin, Justin Teller, Paul Cavallaro, Qi Huang, Justin Meza, Kaushik Veeraraghavan (Facebook, Inc.)

## Overview

- **Purpose**: Gorilla is an in-memory time series database (TSDB) developed by Facebook to improve efficiency, scalability, and reliability for monitoring and analyzing millions of measurements across systems.
- **Problem**: Traditional TSDBs faced issues balancing high availability, scalability, and low latency, often relying on disk-based storage, which could not handle Facebook's growing data and query demands efficiently.
- **Key Insight**: By emphasizing aggregate analysis rather than individual data points, Gorilla optimizes for high availability, writes, and fast queries. It allows for dropping small amounts of data during write-heavy periods without compromising the overall utility of monitoring data.

---

## Key Concepts

### Time Series Database (TSDB)

- Stores measurements like **CPU load, error rates, and latencies** over time.
- Key requirements:
    - **Always available for writes**.
    - **Efficient reads** for quick diagnosis.
    - **High availability** across failures, even in regional outages.

### Write Optimization

- **Writes dominate** reads in the monitoring system, leading Gorilla to focus on remaining highly available to accept writes.
- Employs **write-through caching** to manage the most recent data (e.g., past 26 hours).

### Compression Techniques

- **Delta-of-Delta for Timestamps**: Efficiently compresses timestamp data using differences between successive deltas.
- **XOR Compression for Values**: Uses XOR to find common patterns between successive values, significantly reducing the storage requirement.
- **Compression Efficiency**: Reduced data storage by approximately 12x, achieving an average of **1.37 bytes per point**, allowing for in-memory storage.

---

## Architecture Overview

### Components

- **In-Memory Database**: Gorilla functions as a **write-through cache** for recent data, storing only the most recent 26 hours in memory.
- **Long-Term Storage in HBase**: Data older than 26 hours is moved to HBase for **long-term retention**.
- **Replication Across Regions**: Two in-memory copies exist in different datacenter regions for redundancy.

### Data Structure

- **Timeseries Map (TSmap)**: Stores time series data in memory using C++ structures.
- **ShardMap**: Maps time series to shards, facilitating efficient horizontal scaling.
- **Data Compression**:
    - **Open Blocks**: Recently written data held in open, append-only strings.
    - **Closed Blocks**: Data moved to compressed slabs once the time period ends (every 2 hours).

---

## Performance Improvements

- **Query Latency**: Achieved a **73x reduction** in query latency compared to HBase-based solutions.
- **Scalability**: Gorilla handles up to **700 million data points per minute** and supports **2 billion unique time series**.
- **Reliability**: Designed to tolerate node, regional failures, and handle large-scale outages with minimal data loss.

### Fault Tolerance

- **Dual Copies**: Data is streamed to two Gorilla instances in separate regions, ensuring availability even if one region fails.
- **ShardManager**: Redistributes data shards upon a node failure to prevent data loss.
- **Recovery**: Failed nodes can recover their data from distributed file storage (e.g., GlusterFS).

---

## New Tools Enabled by Gorilla

1. **Correlation Engine**: Enables interactive, brute-force correlation searches, allowing for efficient root-cause analysis of issues (e.g., "What happened when my service broke?").
2. **Charting and Visualization**: Supports dense visualizations like horizon charts, providing quick visual scans for anomalies.
3. **Aggregations**: Gorilla directly runs aggregations over time-based data (roll-ups), reducing the workload on HBase.

### Use Case Example

- During a **site-wide error rate increase**, Gorilla’s correlation tools helped quickly identify that copying a newly released binary caused a memory drop—speeding up diagnosis and resolution.

---

## Lessons Learned

1. **Prioritize Recent Data**: Recent monitoring data is more valuable than historical data for real-time analysis.
2. **Low Read Latency Matters**: Low query latency encourages exploration and builds advanced analysis tools.
3. **High Availability vs. Resource Efficiency**: High availability, even at the cost of redundant memory usage, was prioritized to ensure no monitoring data is lost during failures.

## Future Work

- **Flash-Based Storage Extension**: Developing a flash-based storage layer to hold compressed Gorilla data for longer than 26 hours (up to two weeks).
- **Improved Write Path for HBase**: Optimizing write operations to reduce disk I/O pressure on the HBase system.



---

# **Gorilla: A Fast, Scalable, In-Memory Time Series Database**

## **Abstract**

- **Problem:** Monitoring large-scale systems involves storing and analyzing millions of data points per second, requiring a balance of **efficiency, scalability, and reliability**.
- **Solution:** Gorilla, Facebook's in-memory **Time Series Database (TSDB)**, prioritizes:
    - **Recent data over historical data**.
    - **High write availability** even under failures.
    - Efficient **compression techniques** for memory optimization.
- **Key Results:**
    - 12x reduction in storage with compression.
    - 73x query latency improvement compared to traditional TSDBs like HBase.

---

## **Introduction**

- **Background:**
    - Modern internet services require real-time monitoring of millions of systems.
    - Efficiently handling data at this scale demands advanced time series solutions.
- **Requirements:**
    - Real-time analysis of millions of measurements (CPU, error rates, latency).
    - Minimized latency for interactive diagnostics.
    - High availability for reads and writes.
- **Key Insight:** Recent data points are more critical for identifying and fixing real-time issues.

---

## **Core Features of Gorilla**

1. **Write Optimization:**
    - Writes are prioritized over reads.
    - Small amounts of data may be dropped to ensure availability.
2. **Compression Efficiency:**
    - Data stored in-memory at an average of **1.37 bytes per point**, enabling 12x reduction.
3. **High Availability:**
    - Replication across geographically separated regions ensures resilience.
4. **Query Performance:**
    - Latency reduced to milliseconds compared to seconds in disk-based systems.

---

## **Operational Data Store (ODS) and Its Limitations**

- **ODS Overview:**
    - Facebook's prior TSDB, based on HBase, stored metrics for long-term data analysis.
    - HBase limitations:
        - High read latency, especially for sparse datasets.
        - Scalability issues for interactive analyses.
- **Transition to Gorilla:**
    - Built as a write-through cache for recent data.
    - Prioritizes in-memory performance for real-time monitoring.

---

## **Gorilla Architecture**

### **In-Memory Design**

1. **Data Model:**
    - Stores time series as a 3-tuple: `(string key, timestamp, floating-point value)`.
    - Optimized for real-time queries and rapid scans.
2. **Sharding and Scaling:**
    - Data is partitioned by string keys across shards, enabling horizontal scalability.
    - Adding hosts and re-sharding is straightforward.

### **Compression Techniques**

1. **Timestamp Compression:**
    - Uses **delta-of-deltas** encoding:
        - Captures differences between successive timestamps.
        - Compresses over 96% of timestamps to a single bit.
2. **Value Compression:**
    - XORs successive floating-point values.
    - Encodes the significant bits, leveraging patterns in data like leading/trailing zeros.
    - Achieves an average of **1.37 bytes per point**.

---

## **High Availability and Fault Tolerance**

1. **Regional Replication:**
    - Two independent instances in separate data centers.
    - During failures, queries and writes automatically failover to the healthy region.
2. **Shard Management:**
    - A Paxos-based ShardManager handles dynamic reassignments.
    - Writes are buffered during shard movement, with prioritization for recent data.
3. **Handling Failures:**
    - Survives single-node failures with no downtime.
    - In disaster scenarios, regions operate independently until restoration.

---

## **Performance Evaluation**

1. **Compression Efficiency:**
    - Achieved a **12x storage reduction**, reducing RAM requirements.
2. **Query Latency:**
    - Median latency reduced from seconds (HBase) to **10ms**.
    - Improved query throughput by 14x.
3. **Write Scalability:**
    - Handles over **700 million data points per minute** across 2 billion unique time series.

---

## **New Tools Enabled by Gorilla**

1. **Correlation Engine:**
    - Enables brute-force correlation searches across millions of time series.
    - Uses **Pearson Correlation** to assist root-cause analysis.
2. **Advanced Charting:**
    - Supports dense visualizations for rapid anomaly detection.
3. **Aggregation Improvements:**
    - Roll-up processes for long-term data are now offloaded to Gorilla, reducing HBase load.

---

## **Lessons Learned**

1. **Prioritize Recent Data:**
    - Most applications value recent data over historical consistency.
2. **Read Latency Drives Adoption:**
    - Low-latency queries encourage exploration and tool development.
3. **Fault Tolerance is Complex but Essential:**
    - Building resilient systems requires significant effort but pays dividends in reliability.

---

## **Future Work**

1. **Extend Data Retention:**
    - Introduce flash-based storage for 2-week retention of full-resolution data.
2. **Optimize Write Path:**
    - Delay writes to HBase for improved efficiency in long-term storage.
3. **Enable More Analytics:**
    - Expand Gorilla’s capabilities for clustering, anomaly detection, and advanced data mining.

---

## **Conclusion**

- Gorilla redefines real-time monitoring at scale with a focus on **efficiency, reliability, and performance**.
- It has successfully supported Facebook's growth, enabling engineers to identify and fix issues faster.
- With its fault-tolerant architecture and innovative compression, Gorilla sets a new standard for TSDBs.
