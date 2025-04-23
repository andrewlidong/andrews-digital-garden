**- Meetup 011 - [Maglev: A Fast and Reliable Software Network Load Balancer](https://research.google/pubs/pub44824/)**


Here are my organized Obsidian notes for the Maglev paper:

# Maglev: Google's Software Network Load Balancer

## Overview
- Distributed software load balancer running on commodity Linux servers
- Part of Google's frontend serving infrastructure since 2008
- Handles packet processing in userspace bypassing kernel
- Achieves line-rate throughput (10Gbps) on single machine
- Uses consistent hashing and connection tracking for reliability

## System Architecture

### [[Core Components]]
1. **Controller**
   - Announces VIPs over BGP
   - Monitors forwarder health
   - Handles config management

2. **Forwarder**
   - Processes packets in userspace
   - Implements connection tracking
   - Performs backend selection
   - Handles packet encapsulation

### [[Packet Processing Pipeline]]
1. Steering module assigns packets to queues
2. Packet threads process packets:
   - Match to VIP
   - Lookup/update connection table  
   - Select backend using consistent hashing
   - Encapsulate packets
3. Muxing module sends packets to NIC

### [[Connection Management]]
- Connection tracking tables per packet thread
- Consistent hashing for backend selection
- Local hash tables vs distributed state
- Special handling for IP fragments

## Key Features

### [[Performance Optimizations]]
- Kernel bypass for fast packet processing
- Batched packet processing
- Lock-free data structures
- CPU core pinning
- Zero-copy packet handling

### [[High Availability]]
- N+1 redundancy vs traditional 1+1
- ECMP for load distribution
- Connection persistence
- Fast failure detection
- Graceful degradation

### [[Load Balancing]]
- Even distribution across backends
- Priority-based service handling 
- Connection affinity
- Health checking
- Dynamic capacity adjustment

## Implementation Details

### [[Maglev Hashing]]
- Custom consistent hashing algorithm
- Better load balancing than traditional methods
- Slight tradeoff in disruption resistance 
- Default table size of 65,537 entries
- Fast lookup table generation

### [[VIP Configuration]]
- VIP matching uses prefix/suffix rules
- Config objects control VIP handling
- Multiple shards supported
- Service-specific backend pools
- Flexible health checking

### [[Operational Aspects]] 
- Monitoring and debugging tools
- Rolling upgrades
- Fragment handling
- Multiple cluster support
- Service isolation through sharding

## Results

### [[Performance Metrics]]
- 10Gbps line rate on single machine
- Up to 15Mpps with 40Gbps NIC
- Sub-millisecond latency
- Excellent load balancing
- High connection persistence

### [[Production Experience]]
- Running since 2008
- Handles all Google external traffic
- Supports Google Cloud Platform
- Evolution from active-passive to ECMP
- Migration from kernel to userspace networking

#networking #load-balancing #distributed-systems #google