**

- Meetup 005 - Percolator, Feb 27th, 2024
    

- Paper: [Large-scale Incremental Processing Using Distributed Transactions and Notifications (2010)](https://research.google/pubs/large-scale-incremental-processing-using-distributed-transactions-and-notifications/)
    



**


# Percolator: Large-Scale Incremental Processing

**Authors**: Daniel Peng, Frank Dabek  
**Affiliation**: Google Inc.  
**Conference**: OSDI

## Overview

- **Purpose**: Introduce **Percolator**, a system for incremental processing of large datasets with **distributed transactions and notifications**.
- **Key Use Case**: Migrating from batch-based processing of Google's web index (using MapReduce) to incremental updates to significantly reduce data freshness latency.
- **Key Achievement**: Reduced the average age of documents in Google’s web search results by **50%**.

## Problem Statement

- **MapReduce Limitations**: Requires reprocessing entire datasets even for small updates, leading to inefficiencies and high latency.
- **Scalability Challenges**: Traditional DBMSs cannot meet the storage and throughput requirements for web-scale indexing, while systems like Bigtable provide scalability but lack tools for managing data consistency under frequent updates.

## Solution Approach: Percolator

- **Incremental Processing**: Designed for efficient processing of small, frequent updates to a large dataset.
- **Components**:
    - **ACID Transactions**: Allows strong consistency across multiple rows in a distributed storage system (Bigtable).
    - **Observers**: Provide a mechanism to trigger computations automatically when specific columns in Bigtable are modified.

## Key Features

### 1. ACID Transactions

- **Multi-row Transactions**: Implemented on top of Bigtable, allowing operations across rows to be atomic.
- **Snapshot Isolation**: Provides consistent views of data without locking the entire dataset.
    - Uses **timestamps** from a **timestamp oracle** for managing versions and maintaining consistency.
- **Lock Mechanism**: Each transaction uses **primary and secondary locks** for write operations to avoid conflicts and support distributed commit.

### 2. Observers for Event-Driven Processing

- **Observers**: Code that runs when data changes, akin to triggers in databases.
    - Used to chain operations, for example, parsing new documents or updating index structures.
    - **Notifications and Acknowledgments**: Observers are triggered based on notifications, which are set when a specific column changes. Acknowledge columns ensure the observer runs only once per change.

### 3. Built on Bigtable

- **Bigtable Integration**: Utilizes Bigtable for scalable storage, where each row represents data, and additional metadata columns manage locks and transaction statuses.
- **Random Access**: Provides efficient random access to individual documents, unlike MapReduce, which processes data in large sequential batches.

## Design and Architecture

- **Three Components**:
    1. **Percolator Worker**: Executes transactions and observer tasks.
    2. **Bigtable Tablet Server**: Provides distributed storage capabilities.
    3. **GFS Chunkserver**: Stores the underlying SSTables used by Bigtable.
- **Transactional Workflow**:
    - Transactions go through a **two-phase commit** process to ensure data consistency across distributed rows.
    - Handles client failures through lazy cleanup, with primary locks acting as the synchronization point.

## Evaluation

- **Latency Reduction**:
    - Average document processing latency reduced by **100x** compared to batch processing.
    - Increased document freshness, resulting in more up-to-date web search results.
- **Performance Trade-offs**:
    - Requires more computational resources compared to the previous batch-based MapReduce approach.
    - Increases overall complexity due to managing distributed transactions and locks.

## Use Cases

- **Google Web Search Index**: Transitioned the indexing process to an incremental model, significantly reducing the time to reflect changes after crawling.
- **Page Rendering**: Used to manage updates of rendered page images when dependencies change (e.g., CSS or linked resources).

## Technical Challenges

- **Lock Management**: Ensures locks persist across failures and prevents conflicting operations.
- **Transaction Failures and Recovery**: Handles transaction rollbacks and retries effectively without a centralized lock service.
- **Efficient Scanning**: To find cells needing observer processing, Percolator uses a distributed scanning strategy with load balancing across workers.

## Future Work

- **Optimization**: The paper suggests potential areas for improving the scalability of timestamp allocation and reducing RPC overhead during transactions.
- **Broader Application**: Investigating whether the overhead of distributed transactions can be reduced to apply this model to other large-scale systems beyond indexing.