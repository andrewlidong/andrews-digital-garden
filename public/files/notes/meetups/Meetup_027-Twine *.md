**

- Meetup 027 - [Twine: A Unified Cluster Management System for Shared Infrastructure](https://www.usenix.org/conference/osdi20/presentation/tang)
    

**

# Twine: Facebook's Unified Cluster Management System

## Overview & Key Contributions

### Core Functions
- Cluster management system for Facebook's infrastructure
- Packages applications into Linux containers
- Manages lifecycle of machines, containers, and applications
- Drives transition from siloed pools to shared infrastructure

### Key Innovations
1. Single Regional Control Plane
   - Manages 1M+ machines across all DCs in a region
   - Sharding vs federation approach
   - Dynamic machine allocation

2. Application Collaboration
   - TaskControl API for lifecycle management
   - Enables coordinated availability management
   - Application-specific customization

3. Host-Level Customization
   - Host profiles for hardware/OS tuning
   - Dynamic profile switching
   - Balance between standardization and customization

4. Power-Efficient Hardware
   - Small machines (1 CPU, 64GB RAM)
   - Optimization for performance/watt
   - Autoscaling for utilization

## Architecture

### Components
1. **Front End**
   - Entry point for job deployment
   - Handles user requests

2. **Scheduler**
   - Manages job/task lifecycle
   - Coordinates with TaskControllers
   - Handles failures and maintenance

3. **Allocator**
   - Assigns machines to entitlements 
   - Places tasks on machines
   - Uses optimistic concurrency control

4. **Resource Broker (RB)**
   - Stores machine information
   - Tracks failures and maintenance
   - One RB per datacenter

5. **Other Components**
   - Health Check Service
   - Agents on each machine
   - ReBalancer for optimization
   - Service Resource Manager for autoscaling

### Scaling Design
1. **Sharding Strategy**
   - Shards by entitlements
   - Each shard manages subset of resources
   - Transparent shard migration
   - No federation layer needed

2. **Component Independence**
   - Separate persistent stores
   - Independent scaling of components
   - Distributed state management
   - Asynchronous optimization

## Key Features

### TaskControl API
- Enables application-specific lifecycle management
- Coordinates maintenance and updates
- Example uses:
  - ZooKeeper follower-first updates
  - Data replica management
  - Coordinated restarts

### Host Profiles
1. **Capabilities**
   - Hardware settings
   - OS configurations
   - Storage options
   - Network settings

2. **Management**
   - Dynamic switching
   - Automated application
   - Per-entitlement settings

### Entitlements
1. **Properties**
   - Resource quota management
   - Machine allocation control
   - Host profile association
   - Cross-DC operation

2. **Usage**
   - Dynamic machine assignment 
   - Support for job stacking
   - Task placement control
   - Fault domain management

## Production Experience

### Scale & Performance
1. **Current Scale**
   - 56% of fleet on shared infrastructure
   - Managing millions of machines
   - Thousands of services supported

2. **Performance**
   - P99 scheduler latency < 1s
   - 1000 job allocations/sec
   - High cache hit ratios

### Utilization Improvements
1. **Capacity Management**
   - 3% from buffer consolidation
   - 2% from Turbo Boost
   - 2% from autoscaling

2. **Hardware Efficiency**
   - 17% TCO savings
   - 18% power savings
   - Higher performance/watt

## Lessons Learned

### Successes
1. **Controlled Customization**
   - Limited number of host profiles
   - Focused TaskControl interface
   - Balance standardization and flexibility

2. **Small Machine Strategy**
   - Successful power optimization
   - Forced architectural improvements
   - Better resource utilization

3. **Shared Infrastructure**
   - Successful large-scale consolidation
   - Improved operational efficiency
   - Better capacity utilization

### Challenges
1. **Entitlement Design**
   - Overloaded responsibilities
   - Quota vs partitioning tension
   - Need for abstraction split

2. **Global Services**
   - Network latency challenges
   - Regional capacity allocation
   - Need for federation layer

3. **Migration Effort**
   - Memory-bound service rearchitecture
   - Hardware vendor coordination
   - Legacy system adaptation

## Future Work

### Areas for Improvement
1. **Abstraction Refinement**
   - Splitting entitlement responsibilities
   - Better global service support
   - Enhanced quota management

2. **Utilization Optimization**
   - SLO guarantees for opportunistic capacity
   - Improved stacking technology
   - Better performance isolation

3. **Hardware Strategy**
   - Ongoing evaluation of machine sizes
   - Power efficiency optimization
   - Workload adaptation support