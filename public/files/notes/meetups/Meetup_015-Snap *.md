**

- Meetup 015 - [Snap: a Microkernel Approach to Host Networking](https://research.google/pubs/pub48630/) - (2024-06-03)
    

**


Here are organized Obsidian notes for the Snap paper:

# Snap: Microkernel Approach to Host Networking

## Overview
- Userspace networking system designed at Google
- Provides flexible modules for network functions
- Supports rapid development and deployment of new features
- Achieves high performance through modular architecture
- Has been running in production for 3+ years

## Core Architecture

### [[Snap Design Principles]]
- Microkernel-inspired approach running in userspace
- Centralized coordination and management
- Address space isolation 
- Fast IPC leveraging modern multicore hardware
- Transparent software upgrades

### [[Module Types]]
- **Control Plane**
  - RPC-based management interface
  - Module setup and configuration
  - Policy updates
  - Authentication

- **Data Plane**
  - Packet processing engines
  - Memory-mapped I/O communication
  - Single-threaded execution model
  - Real-time scheduling properties

### [[Engine Architecture]]
- Engines are stateful, single-threaded tasks
- Components:
  - Input/output queues
  - Lock-free communication
  - Memory mapping
  - Plug-in system for packet processing

### [[CPU Scheduling Modes]]
1. **Dedicating Cores**
   - Pinned to dedicated hyperthreads
   - Minimal latency via spin polling
   - Fixed CPU budget
   
2. **Spreading Engines**
   - Scales with load
   - Interrupt-driven
   - Optimized for tail latency
   
3. **Compacting Engines**
   - Consolidates work on fewer cores
   - Load-based scaling
   - Polling-based load balancing

## Key Features

### [[Resource Management]]
- MicroQuanta kernel scheduling class
- Strong CPU and memory accounting
- Dynamic CPU scaling
- Resource isolation between applications

### [[Transparent Upgrades]]
- In-place upgrades without application disruption
- Two-phase migration approach:
  - Brownout phase (background transfer)
  - Blackout phase (<200ms)
- Incremental engine-by-engine upgrades

### [[Memory Management]]
- Zero-copy operation where possible
- Shared memory between applications and Snap
- Efficient bounce buffer handling
- Memory registration with NICs

### [[Security Considerations]]
- Non-root execution
- Address space isolation
- Authentication mechanisms
- Sanitizer support

## Pony Express Transport

### [[Pony Express Architecture]]
- Custom reliable transport protocol
- Asynchronous operation interface
- One-sided and two-sided operations
- Zero-copy data movement
- RDMA-like functionality

### [[Performance]]
- 3x better transport efficiency vs Linux kernel
- Sub-10μs latency
- Up to 5M IOPS/core for one-sided ops
- Efficient scaling across multiple cores

## Implementation Lessons

### [[Challenges and Solutions]]
- Memory management complexity
- Dynamic CPU scaling
- State rebalancing between engines
- Hardware offload integration 

### [[Future Directions]]
- Stateful NIC offloads
- Enhanced CPU scheduling
- Memory mapping optimizations
- Rebalancing improvements

#networking #microkernel #distributed-systems #datacenter