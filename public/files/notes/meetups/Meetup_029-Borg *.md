**- Meetup 029 - [Large-scale cluster management at Google with Borg](https://dl.acm.org/doi/abs/10.1145/2741948.2741964)**

# Google Borg: Large-Scale Cluster Management

## Overview
Borg is Google's cluster management system that runs hundreds of thousands of jobs across tens of thousands of machines. Key benefits:
1. Hides management complexity from users
2. Operates with high reliability/availability
3. Effectively manages workloads at scale

## Core Architecture

### Components
1. **Borgmaster**
   - Central controller for each cluster
   - Handles client RPCs, state management
   - 5-way replicated for availability
   - Maintains in-memory state with Paxos store
   - Includes separate scheduler process

2. **Borglet**
   - Per-machine agent
   - Starts/stops tasks
   - Manages resources and reporting
   - Restarts failed tasks
   - Reports machine state

3. **Fauxmaster**
   - High-fidelity simulator for Borgmaster
   - Used for debugging and capacity planning
   - Runs actual production code

### Cell Organization
- **Cell**: Basic unit of management (cluster)
  - Typically ~10k machines each
  - Single logical unit with unified management
  - Contains heterogeneous machine types
  - Multiple cells per datacenter

## Workload Characteristics

### Types of Work
1. **Production (Prod) Jobs**
   - Long-running services
   - User-facing and critical infrastructure
   - High priority, strict SLAs
   - ~70% of CPU allocation

2. **Non-production (Non-prod) Jobs**
   - Batch jobs
   - Development/testing workloads
   - Lower priority
   - Opportunistic resource usage

### Job & Task Organization
1. **Jobs**
   - Primary scheduling unit
   - Collection of related tasks
   - Includes name, owner, resources needed
   - Can specify constraints and requirements

2. **Tasks**
   - Individual units of work
   - Run in containers on machines
   - Have resource limits and permissions
   - Can be restarted/moved as needed

3. **Allocs**
   - Reserved sets of resources
   - Can contain multiple tasks
   - Used for resource reservation and co-location
   - Persist between task restarts

## Resource Management

### Priority System
1. **Priority Bands**
   - Monitoring (highest)
   - Production
   - Batch
   - Best Effort (lowest)

2. **Quota System**
   - Controls resource allocation
   - Expressed as resource vectors
   - Charged differently by priority
   - Used for admission control

### Resource Reclamation
- Overcommits resources safely
- Uses limits vs actual usage monitoring
- Reclaims unused resources for low-priority work
- Provides performance isolation between tasks

## Scheduling

### Scheduling Process
1. **Feasibility Checking**
   - Finds machines meeting task constraints
   - Considers available resources
   - Accounts for existing reservations

2. **Scoring**
   - Ranks feasible machines
   - Considers multiple factors:
     - Resource availability
     - Task constraints
     - Machine attributes
     - Current workload

3. **Optimization Techniques**
   - Score caching
   - Equivalence classes
   - Relaxed randomization

### Placement Strategies
- E-PVM variant for scoring
- Balances spreading vs packing
- Considers resource stranding
- Handles machine heterogeneity

## Availability Features

### Failure Management
1. **Task Recovery**
   - Automatic rescheduling
   - Spread across failure domains
   - Rate-limited disruptions
   - Crash detection/handling

2. **Infrastructure Resilience**
   - 5-way Borgmaster replication
   - Paxos-based state management
   - Independent cell operation
   - Graceful degradation

### Performance Isolation
- Linux cgroups for resource isolation
- Priority-based CPU scheduling
- Memory usage enforcement
- I/O throttling capabilities

## Lessons Learned

### Successful Approaches
1. **Alloc Abstraction**
   - Enables resource reservation
   - Supports helper patterns
   - Facilitates co-location

2. **Introspection**
   - Critical for debugging
   - Enables self-service
   - Multiple debugging levels

3. **Borgmaster as Kernel**
   - Evolved into microservices
   - Separates core functionality
   - Enables extensibility

### Areas for Improvement
1. **Job Limitations**
   - Single grouping mechanism
   - Inflexible for service management
   - Complex naming requirements

2. **IP/Port Management**
   - One IP per machine complicates things
   - Port scheduling overhead
   - Complex naming requirements

3. **API Complexity**
   - Optimized for power users
   - High learning curve
   - Requires automation tools

## Impact on Kubernetes

### Influenced Features
1. **Labels vs Jobs**
   - More flexible grouping
   - Multiple categorization options
   - Better service management

2. **IP Per Pod**
   - Simpler networking model
   - Eliminates port management
   - Better isolation

3. **Simplified API**
   - More user-friendly defaults
   - Lower barrier to entry
   - Maintains power user capabilities




---

# **Borg: Large-scale Cluster Management at Google**

## **Abstract**

- Borg is a cluster management system at Google.
- Handles **hundreds of thousands of jobs** across **thousands of clusters**.
- Combines **task-packing**, **over-commitment**, **process isolation**, and **runtime fault recovery**.
- Features:
    - Declarative job specification.
    - Real-time monitoring.
    - High-level tools for simulation and analysis.
- Focuses on **high availability** and efficient resource utilization.

---

## **Introduction**

- Borg’s functions include **admitting, scheduling, monitoring, and restarting tasks**.
- Benefits:
    - Hides complexities of resource management.
    - Supports highly available applications.
    - Handles large-scale workloads across clusters.
- Scales to tens of thousands of machines with high reliability.

---

## **User Perspective**

### **Workload Types**

1. **Production (Prod):**
    - Long-running services (e.g., Gmail, Google Search).
    - High priority, latency-sensitive.
2. **Non-Production (Non-Prod):**
    - Batch jobs with flexible runtimes.
    - Low priority and opportunistic.

### **Clusters and Cells**

- **Cell:** Unit of management within a cluster.
    - Median size: ~10,000 machines.
    - Machines vary in CPU, RAM, disk, and capabilities.
- **Task Isolation:** Ensures tasks are unaffected by hardware differences.

### **Jobs and Tasks**

- **Job:** Composed of multiple tasks running the same binary.
- **Task:** Runs as a Linux process inside a container.
- **Resource Requirements:** Defined for each task (CPU, RAM, etc.).

### **Key Features**

- **Declarative Configurations:** Written in Borg Configuration Language (BCL).
- **Priority and Quota:**
    - Ensures critical jobs are prioritized.
    - Allocates resources based on quota.

---

## **Architecture**

### **Components**

1. **Borgmaster:**
    - Centralized controller for managing job states.
    - Replicated for fault tolerance.
2. **Scheduler:**
    - Assigns tasks to machines based on constraints.
3. **Borglet:**
    - Local agent on machines.
    - Executes tasks and reports health.

### **Scalability Techniques**

- **Score Caching:** Reduces computation for assigning tasks.
- **Equivalence Classes:** Groups tasks with identical constraints for efficiency.
- **Relaxed Randomization:** Speeds up machine selection for scheduling.

---

## **Resource Management**

### **Resource Allocation**

- Fine-grained resource requests for CPU and memory.
- Avoids predefined "bucket" sizes.

### **Resource Reclamation**

- Reclaims unused resources for lower-priority tasks.
- Ensures production jobs are never impacted.

### **Overcommitment**

- Allows batch jobs to utilize slack resources opportunistically.

---

## **Fault Tolerance**

### **Handling Failures**

- **Automatic Rescheduling:** Evicted tasks are restarted elsewhere.
- **Task Spreading:** Reduces correlated failures by distributing tasks across racks and power domains.
- **Idempotent Operations:** Ensures recovery actions are safe and repeatable.

### **Borgmaster Redundancy**

- Replicated using Paxos.
- Achieves 99.99% availability.

---

## **Performance Isolation**

### **Security Isolation**

- Uses Linux `chroot` jails and cgroups for isolation.
- Hosted VMs run in KVM instances managed by Borg.

### **Latency-Sensitive Tasks**

- Reserved physical cores for high-priority tasks.
- Batch tasks dynamically throttled to ensure responsiveness.

---

## **Lessons Learned**

### **The Good**

1. **Allocs Are Useful:**
    - Grouping of tasks simplifies resource sharing.
    - Example: Logsaver tasks for data persistence.
2. **Cluster Management as a Service:**
    - Introspection tools simplify debugging for users.
    - Built-in naming and load balancing.

### **The Bad**

1. **Restrictive Job Grouping:**
    - Leads to inflexibility in managing related tasks.
2. **Single IP Address per Machine:**
    - Complicates task scheduling and networking.

---

## **Evaluation and Results**

### **Utilization**

- Shared cells achieve higher utilization (98% of machines run both prod and non-prod tasks).
- Cell compaction experiments show reduced fragmentation.

### **Resource Policies**

- Effective reclamation reduces machine requirements by ~20%.
- Aggressive policies lead to higher efficiency without major risks.

---

## **Comparison to Other Systems**

- Compared with **Mesos**, **YARN**, and **Apollo**:
    - Borg centralizes scheduling for efficiency.
    - Focuses on long-running services and batch workloads simultaneously.
- Influenced the development of **Kubernetes**:
    - Applies lessons from Borg (e.g., API-driven architecture, pods).

---

## **Conclusion**

- Borg has transformed Google’s operations by enabling high efficiency and reliability at scale.
- Key lessons have informed the development of Kubernetes, extending Borg's concepts to the open-source community.

