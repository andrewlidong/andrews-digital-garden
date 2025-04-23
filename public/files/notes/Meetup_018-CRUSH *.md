**

- Meetup 018 - [CRUSH: Controlled, Scalable, Decentralized Placement of Replicated Data](https://ceph.io/assets/pdfs/weil-crush-sc06.pdf)
    

**


I'll create organized Obsidian notes for the CRUSH paper, breaking down its key concepts and architecture.

# CRUSH (Controlled Replication Under Scalable Hashing)

## Overview
- Distributed data placement algorithm for object-based storage systems
- Efficiently maps data objects to storage devices without central directory
- Designed for large-scale systems (petabytes of data, thousands of devices)
- Supports dynamic addition/removal of storage while minimizing data movement
- Accommodates different replication and reliability mechanisms

## Key Features

### [[CRUSH Data Distribution]]
- Pseudo-random distribution for balanced load
- Maps input value (object ID) to list of storage targets 
- No central metadata directory needed
- Uses compact hierarchical description of storage cluster
- Supports weighted distribution based on device capabilities

### [[CRUSH Architecture]]
- Components:
  - Hierarchical cluster map
  - Bucket types
  - Placement rules
  - Mapping function
- Device types supported:
  - Individual storage devices
  - Logical groupings (shelves, racks, rows)
  - Failure domains

### [[CRUSH Bucket Types]]
1. **Uniform Buckets**
   - For identical devices
   - Constant-time mapping O(1)
   - Poor for additions/removals

2. **List Buckets**
   - Linear performance O(n)
   - Optimal for additions
   - Poor for removals

3. **Tree Buckets**
   - Logarithmic performance O(log n)
   - Good balance for changes
   - Binary tree structure

4. **Straw Buckets**
   - Linear performance O(n)
   - Optimal data movement on changes
   - Fair "competition" between items

### [[CRUSH Placement Rules]]
- Define how replicas are placed
- Support different replication strategies:
  - N-way replication
  - RAID parity schemes
  - Erasure coding
  - Hybrid approaches
- Can enforce:
  - Replica separation across failure domains
  - Physical location constraints
  - Hardware diversity requirements

## Key Benefits

### [[CRUSH Reliability Features]]
- Separation of replicas across failure domains
- Protection against correlated failures
- Support for different redundancy schemes
- Flexible placement policies

### [[CRUSH Performance Characteristics]]
- O(log n) mapping calculation time
- Efficient data redistribution on changes
- Minimal metadata requirements
- Support for heterogeneous devices
- Scales to thousands of devices

### [[CRUSH Data Movement]]
- Minimal data movement when adding/removing devices
- Controlled reorganization through bucket types
- Efficient handling of device failures
- Support for device weighting changes

## Use Cases and Applications
1. Large-scale distributed storage systems
2. Object-based storage
3. Cloud storage infrastructure
4. Replicated storage systems
5. High-performance computing storage

#distributed-systems #storage #algorithms #data-placement