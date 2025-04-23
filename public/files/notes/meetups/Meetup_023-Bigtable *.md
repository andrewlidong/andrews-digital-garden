**

- Meetup 023
    

- [Bigtable: A Distributed Storage System for Structured Data](https://static.googleusercontent.com/media/research.google.com/en//archive/bigtable-osdi06.pdf)
    
- [RocksDB: Evolution of Development Priorities](https://research.facebook.com/publications/rocksdb-evolution-of-development-priorities-in-a-key-value-store-serving-large-scale-applications/) continued, section 4+
    
- Rescheduled date: August 11, 1pm EST
    



**

# Google Bigtable: Distributed Storage System

## Overview

### Core Concept
- Distributed storage system for structured data
- Scales to petabytes across thousands of servers
- Used by 60+ Google products
- In production since April 2005

### Key Properties
1. Wide Applicability
   - Web indexing
   - Google Earth
   - Google Analytics 
   - User data storage
   
2. Scalability
   - Petabytes of data
   - Thousands of machines
   - Automatic load balancing

3. High Performance
   - Low latency access
   - Batch processing support
   - Optimized storage

## Data Model

### Basic Structure
- Sparse, distributed, persistent multi-dimensional sorted map
- Indexed by: (row key, column key, timestamp)
- Values are uninterpreted byte arrays

### Key Components

#### Rows
- Row keys up to 64KB
- Atomic transactions at row level
- Lexicographically ordered
- Dynamic partitioning into tablets
- Tablets are unit of distribution/load balancing

#### Column Families
- Groups related columns
- Basic unit of access control
- Must be created before use
- Relatively small number (hundreds)
- Format: family:qualifier

#### Timestamps
- 64-bit integers
- Multiple versions per cell
- Can be assigned by system or client
- Automatic garbage collection options
  - Keep last N versions
  - Keep versions newer than X

## Architecture

### Components

1. **Master Server**
   - Assigns tablets to tablet servers
   - Handles tablet server crashes
   - Load balances across servers
   - Manages schema changes

2. **Tablet Servers**
   - Handle read/write requests
   - Manage tablet splits
   - 10-1000 tablets per server

3. **Client Library**
   - Interfaces with tablet servers directly
   - Caches tablet locations
   - Handles failures and retries

### Storage Layout

1. **Write Path**
   - Write first goes to commit log
   - Update applied to in-memory memtable
   - When memtable full, convert to SSTable
   - Background merger compacts SSTables

2. **Read Path**
   - Check memtable
   - Check SSTables in memory
   - Load required SSTables from disk
   - Merge results across sources

### Dependencies

1. **Chubby**
   - Lock service
   - Coordinates master election
   - Stores schema/access control
   - Five active replicas

2. **GFS**
   - Stores log and data files
   - Handles replication
   - Provides persistence

3. **SSTable**
   - Immutable ordered file format
   - Maps keys to values
   - Internal block structure
   - In-memory block index

## Features & Optimizations

### Locality Groups
- Separate storage for column families
- Improves read performance
- Can be memory-mapped
- Controls compression

### Compression
- Per locality group setting
- Multiple algorithms supported
- Block-level compression
- Custom two-pass scheme
  1. Bentley-McIlroy long strings
  2. Fast local compression

### Caching
1. **Scan Cache**
   - Caches key-value pairs
   - Application-level cache

2. **Block Cache**
   - Caches SSTable blocks
   - OS-level cache

### Bloom Filters
- Optional per locality group
- Reduces disk lookups
- Memory efficient
- Helps avoid disk seeks

## Performance & Scale

### Production Metrics
- 388 clusters
- 24,500 tablet servers
- 1.2M requests/second
- 741MB/s in, 16GB/s out

### Performance Optimizations
1. **Tablet Splits**
   - Automatic at 100-200MB
   - Load balancing trigger
   - Parallel processing

2. **Compactions**
   - Minor: memtable to SSTable
   - Merging: combine SSTables
   - Major: full compaction

### Real Applications

1. **Google Analytics**
   - Raw clicks table (200TB)
   - Summary table (20TB)
   - High compression ratio
   
2. **Google Earth**
   - 70TB imagery table
   - Geographic locality
   - Heavy MapReduce processing

3. **Personalized Search**
   - Per-user data storage
   - Multi-cluster replication
   - Shared infrastructure

## Lessons Learned

### Design Principles
1. Simple designs over complex ones
2. Practical monitoring crucial
3. Early feature restraint valuable
4. Plan for varied failure modes

### Key Insights
1. Favor simple/understandable solutions
2. Build robust failure handling
3. Focus on monitoring/debugging
4. Plan for system evolution

### Future Directions
1. Secondary indices
2. Cross-datacenter replication
3. Service-oriented deployment
4. Resource sharing improvements

