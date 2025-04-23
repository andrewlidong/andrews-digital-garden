**- Meetup 040 - [Running BGP in Data Centers at Scale - Meta Research](https://research.facebook.com/publications/running-bgp-in-data-centers-at-scale/) 
    

- [More details about the October 4 outage - Engineering at Meta](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)**


# Running BGP in Data Centers at Scale

**Authors**: Anubhavnidhi Abhashkumar, Kausik Subramanian, Alexey Andreyev, et al.  
**Affiliation**: University of Wisconsin - Madison, Facebook  
**Conference**: Paper focused on BGP use in data center environments, specifically at Facebook.

## Overview

- **Purpose**: Describe how Facebook designed a BGP-based routing system for data centers that meets stringent reliability and scalability requirements.
- **Motivation**: Traditional Layer-2 designs using **Spanning Tree Protocol (STP)** have scalability and reliability issues, whereas **BGP**, with its scalability and policy control, presents a better alternative for data center routing.

## Key Features

### 1. BGP as a Data Center Routing Protocol

- **BGP (Border Gateway Protocol)** is traditionally used for inter-domain routing in the Internet.
- Facebook leveraged **BGP's scalability** and **policy-driven control** to design a routing protocol suitable for data centers.
- Unlike SDN-based centralized controllers, which face scalability challenges, BGP provides a **distributed control mechanism** that can react quickly to link/node failures.

### 2. Design Considerations

- **Configuration Uniformity and Simplicity**: Ensures consistent policies across the network and helps maintain ease of management.
- **ASN (Autonomous System Number) Reuse**: Simplifies management by using a uniform ASN scheme across different data centers and utilizing BGP confederations for efficient AS path management.
- **Route Summarization**: Minimizes the size of forwarding tables using hierarchical route aggregation, which reduces hardware resource requirements.

### 3. BGP Configuration and Policies

- **Peer Group Concept**: Devices at the same level in the topology are grouped into **peer groups**, allowing the same configuration to be applied to multiple peers.
- **Routing Policies**:
    - Use **BGP communities/tags** to define the scope of route propagation.
    - **Backup Paths**: Predefined paths ensure deterministic failover, helping maintain reliability during link or node failures.

### 4. Scalability and Load Sharing

- **ECMP (Equal Cost Multi-Path)**: Used for load balancing traffic across multiple equivalent paths, providing redundancy and improving utilization.
- **Avoiding Convergence Issues**: By restricting route propagation to specific scopes, BGP convergence is managed to avoid widespread disruptions.

## Operational Insights

### Software Implementation

- Facebook developed an **in-house BGP agent** to meet its requirements for speed, flexibility, and feature control:
    - The agent is **multi-threaded** and optimized for modern switch hardware.
    - It uses **batch processing** and **policy caching** to improve the performance of routing policy execution.

### Testing and Deployment

- **Multi-Phase Deployment Pipeline**:
    - Facebook uses **unit testing, emulation, and canary testing** to ensure BGP updates do not cause disruptions.
    - Deployment is conducted in **six phases**, progressively increasing the number of switches upgraded, which ensures minimal risk and high reliability during software pushes.

### Challenges and Solutions

- **Convergence Problems**: Addressed by employing **predefined backup paths** and limiting **AS_PATH exploration** during reconvergence to prevent path hunting.
- **Routing Instability**: Common issues like repeated BGP withdrawals (e.g., **WWDup** and **AADup**) are mitigated by maintaining stateful implementations to prevent redundant announcements.

## Lessons Learned and Future Work

- **Operational SEVs (Site Events)**: Discussed several significant outages due to **misconfigurations**, **software bugs**, and **incompatibility between versions** during upgrades.
- **Ongoing Improvements**:
    - Enhancing the **testing framework** to better predict issues.
    - Exploring **Weighted ECMP** to improve load balancing during asymmetric failures.
    - Extending policy verification and network emulation to ensure robustness.

## Key Takeaways

- **BGP Adaptation for DCs**: Facebook effectively adapted BGP, a traditional Internet routing protocol, for data center use by making changes in configuration, ASN management, and adopting robust policies to ensure scalability and reliability.
- **In-House Implementation**: By building a custom BGP agent, Facebook gained greater control over features and performance optimizations, demonstrating the benefits of vertical integration in large-scale network infrastructure.


# Running BGP in Data Centers at Scale - Facebook

## 1. Introduction

- Historical context: Data centers initially used Layer-2 spanning tree protocol
- Problems with early designs:
    - Operational risks from broadcast storms
    - Limited scalability due to redundant port blocking
    - Centralized SDN had scaling challenges
- Why BGP was chosen:
    - Highly scalable for large topologies
    - Supports flexible policy control
    - Uses TCP for reliable transport
    - Good vendor support
    - Engineers familiar with operation
- Paper's key contributions:
    1. Novel BGP routing design for data center
    2. Details of routing policies for reliability/maintenance
    3. Solutions to overcome common BGP problems
    4. Operational experience and challenges

## 2. Routing Design

### 2.1 Topology Design

- Modular data center fabric topology:
    - Server pods connected by spine planes
    - Each pod contains:
        - Up to 48 rack switches (RSWs)
        - Up to 16 fabric switches (FSWs)
        - Each RSW connects to all FSWs
    - Multiple spine planes with spine switches (SSWs)

### 2.2 Design Principles

- Two core principles:
    1. Uniformity
    2. Simplicity
- Implementation:
    - Homogeneous BGP config within network tiers
    - Generic configurations translated to platform-specific syntax
    - Managed through Robotron automation system

### 2.3 BGP Peering & Load-Sharing

- Peer Groups:
    - BGP peers of same tier treated as atomic group
    - Uniform configuration across peer group
    - Simplifies config and update processing
- Load-Sharing:
    - Uses BGP with Equal Cost Multipath (ECMP)
    - Equal traffic distribution among equivalent paths
    - No weighted load-balancing used

### 2.4 AS Numbering

- Uses BGP confederations for reusable AS numbers
- Server Pod Design:
    - Each pod is a BGP Confederation
    - Unique ASNs for FSWs and RSWs within pod
    - Pattern repeats across pods
- Spine Plane:
    - Each plane has unique ASN
    - All SSWs in same plane share ASN

### 2.5 Route Summarization

- Two route categories:
    1. Infrastructure routes
    2. Production routes
- Hierarchical summarization at all levels
- Benefits:
    - Minimizes FIB size
    - Enables efficient routing updates
    - Speeds up convergence
    - Reduces hardware requirements

## 3. Routing Policies

### 3.1 Policy Goals

Four main goals:

1. Reliability
    - Enforce route propagation
    - Define backup paths
2. Maintainability
    - Isolate problematic nodes
    - Remediate without disruption
3. Scalability
    - Enforce route summarization
    - Avoid backup path explosion
4. Service Reachability
    - Handle service instance changes
    - Support migrations

### 3.2 Policy Configuration

- Based on BGP Communities and AS_PATH matching
- Configuration details:
    - 3-31 inbound rules (avg 11 per session)
    - 1-23 outbound rules (avg 12 per session)
    - Applied at peer group level
    - RSWs kept minimal for stability

### 3.3 Policy Churn

- 40 commits over 3 years
- Most changes incremental (80% change <2% of policy lines)
- All changes peer-reviewed and tested

## 4. BGP in DCs versus Internet

### 4.1 BGP Convergence

- Solutions to Internet-scale problems:
    - Defined route propagation scopes
    - Limited backup paths
    - MRAI timer set to 0
    - Topology designed for path diversity

### 4.2 Routing Instability

- Addressed common pathological cases:
    - WWDup: Solved with stateful implementation
    - AADup: Fixed through state tracking
    - AADiff: Used fixed LOCAL_PREF values
    - TUp/TDown: Automated failure detection

### 4.3 BGP Misconfigurations

- Prevention methods:
    - Automated configuration generation
    - Centralized framework
    - Configuration database with transactions
    - Monitoring and auditing tools

## 5. Software Implementation

- Custom in-house BGP agent
- Key features:
    - Limited feature set for simplicity
    - Multi-threading support
    - Policy optimizations
    - Integrated with monitoring (ODS)
    - Direct service VIP injection support

## 6. Testing and Deployment

### 6.1 Testing Pipeline

- Three components:
    1. Unit testing
    2. Emulation testing
    3. Canary testing

### 6.2 Deployment

- Push phases P1-P6
- Monitoring via BGPMonitor
- High release velocity (9 pushes in 12 months)
- 99% upgrade success target

### 6.3 SEVs (Site Events)

- 14 major incidents over 2 years
- Main causes:
    - Policy deployment errors
    - Software bugs
    - Version incompatibilities

## 7. Future Work

- Areas for improvement:
    1. Policy Management
    2. Testing Framework Evolution
    3. Load-sharing under Failures
    4. Policy Verification at Scale

#networking #datacenter #BGP #infrastructure



---

# **Running BGP in Data Centers at Scale**

## **Abstract**

- **Problem:** Adapting Border Gateway Protocol (BGP), designed for Internet-scale routing, to meet the unique demands of data center networks.
- **Solution:** Facebook’s BGP-based data center design:
    - Scalable ASN allocation and hierarchical route summarization.
    - Robust BGP policy sets for reliability, scalability, and service reachability.
    - Custom BGP software with high-frequency updates.
- **Key Outcomes:**
    - Flexible routing control with reduced convergence issues.
    - Enhanced operational efficiency with a tailored testing and deployment pipeline.

---

## **Introduction**

- **Background on Data Center Networks:**
    - Legacy Layer-2 designs (spanning tree protocol) faced limitations in scalability and operational risks.
    - Shift to Layer-3 distributed routing protocols for modern data centers.
- **Why BGP?**
    - Scalability for large topologies and prefix volumes.
    - Policy-based routing flexibility.
    - Vendor support and operational familiarity.
- **Key Contributions:**
    - BGP routing tailored for Facebook’s massive data centers.
    - Innovations in policy configuration, software design, and operations.

---

## **Key Design Principles**

1. **Configuration Uniformity:**
    - Homogeneous BGP configurations across tiers.
    - Peer groups with identical configurations simplify management.
2. **Operational Simplicity:**
    - Automates configurations via centralized templates.
    - Minimizes feature sets for faster, predictable behaviors.

---

## **BGP Routing Design**

### **1. Data Center Topology**

- Modular design with server pods and spine planes:
    - Pods: Up to 48 racks per pod, serviced by 16 Fabric Switches (FSWs).
    - Spine planes: Disjoint paths providing redundancy and scalability.

### **2. Autonomous System (AS) Numbering**

- Uniform AS numbering across data centers using BGP Confederations.
- Enables reuse of AS numbers while avoiding routing loops.

### **3. Route Summarization**

- Hierarchical summarization to minimize FIB size:
    - Rack prefixes aggregate into pod-specific routes.
    - Infrastructure and production routes handled separately.
- Benefits:
    - Reduced hardware requirements for routing tables.
    - Faster convergence during failures.

### **4. Policy-Driven Routing**

- Goals:
    - Reliability: Predefined backup paths for predictable failovers.
    - Maintainability: Graceful draining and traffic diversion during maintenance.
    - Scalability: Controlled route propagation to minimize overhead.
    - Service Reachability: VIPs (Virtual IPs) ensure seamless service access.
- Implementation:
    - Policies operate on BGP communities and AS_PATH matches.
    - Predefined tags simplify propagation and route modifications.

---

## **Operational Framework**

### **1. In-House BGP Implementation**

- **Features:**
    - Minimal feature set tailored for data centers.
    - Multi-threaded design leveraging modern switch CPUs.
    - Policy optimizations like caching and batching.
- **Performance:**
    - Faster convergence (2.3x compared to open-source BGP stacks like Bird).

### **2. Testing and Deployment Pipeline**

- **Testing Stages:**
    - Unit tests for individual components.
    - Emulation for failure scenarios (e.g., link flaps).
    - Canary testing in production environments.
- **Deployment Phases:**
    - Gradual rollout (6 stages), balancing speed and reliability.
    - Graceful Restart (GR) minimizes disruptions during updates.

### **3. Monitoring and Debugging**

- Integrated with in-house tools (e.g., ODS) for fine-grained metrics:
    - Peer session states, route counts, convergence times.
    - Real-time alerts for anomalies.

---

## **Addressing Common BGP Challenges**

1. **Convergence Delays:**
    - Limited path hunting via propagation scopes and predefined backups.
    - MRAI timers set to 0 for rapid updates.
2. **Routing Instabilities:**
    - Stateful implementation prevents duplicate updates (e.g., WWDup, AADup).
    - Fixed LOCAL_PREF values ensure stability.
3. **Misconfigurations:**
    - Automated configuration generation reduces human error.
    - Multi-layer filters prevent propagation of invalid routes.

---

## **Operational Insights**

- Over two years, major outages (SEVs) were primarily due to:
    - Policy misconfigurations.
    - Bugs in the BGP software (e.g., max-route limit errors).
    - Incompatibilities during mixed-version deployments.
- **Lessons Learned:**
    - Improved emulation tools for proactive testing.
    - Enhanced deployment strategies to minimize SEV impacts.

---

## **Future Directions**

1. **Policy Verification at Scale:**
    - Extend network synthesis tools to model and verify complex policies.
2. **Enhanced Testing Frameworks:**
    - Combine fuzz testing and protocol validation for greater robustness.
    - Simulate hardware/software failure scenarios.
3. **Load Balancing:**
    - Investigate Weighted ECMP for handling asymmetric failures.

---

## **Conclusion**

- Facebook’s BGP-based routing design showcases how traditional protocols can be adapted for modern data center needs.
- Key Takeaways:
    - Uniform and simple configurations enable scalability.
    - Custom software and pipelines support rapid innovation.
- **Impact:** Demonstrates the viability of decentralized routing at hyperscale.

---
