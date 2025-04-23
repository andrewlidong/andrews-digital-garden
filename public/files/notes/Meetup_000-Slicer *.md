**

- Meetup 000 - on Slicer, Jan 17th, 2024
    

- Paper: [Slicer: Auto-Sharding for Datacenter Applications (2016)](https://research.google/pubs/slicer-auto-sharding-for-datacenter-applications/)
    
- Summary: [“Slicer: Auto-Sharding for Datacenter Applications” – Aleksey Charapko](https://charap.co/one-page-summary-slicer-auto-sharding-for-datacenter-applications/)

**


# Slicer: Auto-Sharding for Datacenter Applications

**Authors**: Atul Adya, Daniel Myers, Jon Howell, Jeremy Elson, Colin Meek, Vishesh Khemani, et al.  
**Affiliation**: Google Inc., Technion - Israel Institute of Technology  
**Conference**: 12th USENIX Symposium on Operating Systems Design and Implementation (OSDI '16)

## Overview

- **Purpose**: Introduce **Slicer**, a general-purpose sharding service used in Google data centers to dynamically shard work across a set of servers.
- **Problem Addressed**: Custom sharding systems are often difficult to maintain and inefficient in resource utilization, leading to issues such as load hotspots and manual intervention during server failures.
- **Goal**: Create a sharding service that can achieve high availability, low latency, and efficient resource utilization while maintaining minimal key churn.

## Key Features

### Dynamic Sharding

- **Dynamic Load Balancing**: Slicer automatically **monitors workload changes** and **rebalances the load** to avoid hotspots and server failures.
- **Separation of Concerns**:
    - **Data Plane**: Reliable request forwarding between clients and servers.
    - **Control Plane**: Decision-making on load balancing off the critical request path.

### Consistent and Eventual Assignments

- **Consistency Modes**: Slicer offers both **strongly consistent assignments** (ensuring only one task is responsible for each key) and **eventually consistent assignments** (allowing overlap during dynamic shifts to minimize unavailability).

### Scalability and Availability

- **Production Use**: Handles **2-7 million requests per second** across production services.
- **Minimized Key Churn**: Designed to minimize **key movement** to reduce the overhead associated with rebalancing.

## Architecture

### Components

1. **Slicer Service**: Centralized service that creates and distributes key assignments.
2. **Clerk and Slicelet Libraries**: Linked to the application for task assignment and routing.
3. **Control Plane and Data Plane**: Data plane forwards requests; the control plane generates and updates sharding assignments.

### Integration

- **Google Services**: Slicer is integrated with **Google’s Stubby RPC system** and **HTTP load balancers**, making it easy to route requests based on shard assignments.

## Use Cases

### In-Memory Caches

- **Flywheel (HTTP Proxy for Mobile Devices)**: Uses Slicer to optimize website reachability data storage, leading to reduced response times for users.
- **Google Speech Recognition**: Assigns languages as keys, allowing tasks to load specific models based on workload distribution. Improves resource multiplexing by dynamically adjusting task assignments based on diurnal patterns.

### Aggregation Applications

- **Event Processors**: Uses key affinity to aggregate write events to reduce storage load. Helps in building efficient in-memory aggregation systems.
- **Cloud DNS**: Uses in-memory stores to make quick local decisions and manage load across multiple tasks with Slicer.

## Evaluation and Results

### Production Results

- **Resource Efficiency**: Reduced resource usage by **63%** compared to static sharding.
- **High Availability**: Slicer achieved **99.98% successful task selection** in production, highlighting its suitability for highly available applications.
- **Balanced Load**: Slicer showed improved load balancing over traditional **consistent hashing**, with a lower key churn rate.

### Algorithmic Contributions

- **Weighted Move Algorithm**: Balances the load by iteratively moving keys to reduce load on hotspots while minimizing overall key movement.
- **Fallback Mechanisms**: Ensures that if the Slicer service fails, existing assignments continue to function to avoid request disruptions.

## Key Contributions

- **Reusable Sharding System**: Slicer abstracts sharding to a level where it can be reused across different applications, similar to using filesystems or lock managers.
- **Control-Plane Optimization**: By decoupling the control and data planes, Slicer achieves centralized global optimization with near-local decision performance.
- **API Simplicity**: Designed to be easily adopted by Google’s varied production systems, making sharding simple and efficient.