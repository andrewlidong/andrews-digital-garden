**

- Meetup 037 - [Jupiter Rising: A Decade of Clos Topologies and Centralized Control in Google’s Datacenter Network](https://research.google/pubs/jupiter-rising-a-decade-of-clos-topologies-and-centralized-control-in-googles-datacenter-network/)
    

**

# Jupiter Rising: A Decade of Clos Topologies and Centralized Control in Google’s Datacenter Network

**Authors**: Arjun Singh, Joon Ong, Amit Agarwal, et al. (Google, Inc.)

## Overview

- **Purpose**: Addressing the high cost, complexity, and scalability issues of traditional datacenter networks.
- **Approach**: Developing five generations of datacenter networks at Google, focused on Clos topologies, merchant silicon, and centralized control.
- **Key Results**: Scale of 1 Petabit/sec bisection bandwidth, deployment across dozens of global sites.

---

## Key Concepts

### Clos Topology

- **Definition**: Multi-stage, modular architecture using commodity switches.
- **Advantages**: Cost-effective, scalable to large datacenters, with redundancy and fault tolerance.
- **Challenges**: Complexity in fiber fanout, routing with multiple equal-cost paths.

### Merchant Silicon

- **Focus**: Use of general-purpose, commodity-priced switches instead of specialized hardware.
- **Benefits**: Higher bandwidth density, frequent hardware updates aligned with Moore's Law.

### Centralized Control

- **Control Plane**: Centralized routing and management vs. traditional autonomous per-switch management.
- **Implication**: Simplified protocols, enabling efficient updates and improved stability in Google's datacenter environment.

---

## Datacenter Network Evolution

1. ### Firehose 1.0
    
    - **Year**: 2005
    - **Bandwidth**: 1 Gbps for 10,000 servers.
    - **Topology**: Custom-built switches, initial trials with Clos architecture.
    - **Limitations**: Complexity in wiring, resilience issues in server-integrated switches.
2. ### Firehose 1.1
    
    - **Year**: 2006
    - **Enhancements**: Introduction of dedicated enclosures and a separate control plane.
    - **Outcome**: Increased reliability, supported up to 20k servers, but faced cable management challenges.
3. ### Watchtower
    
    - **Year**: 2008
    - **Advances**: Integration of high-density 10G chips; introduction of fiber bundling to simplify deployment.
    - **Impact**: Reduced deployment complexity, allowing for broader deployment across Google’s global infrastructure.
4. ### Saturn
    
    - **Year**: 2009
    - **Objective**: Scaling up to 288x10G non-blocking switches for increased server bandwidth (10Gbps burst capacity).
    - **Result**: Enhanced scalability and reduced oversubscription, with dedicated switches for high-bandwidth demands.
5. ### Jupiter
    
    - **Year**: 2012
    - **Scale**: Datacenter-wide Clos fabric with 40G switches, handling 1.3Pbps.
    - **Key Feature**: Modular “Centauri” chassis, designed for easy incremental upgrades and maintenance.
    - **Goal**: Enable seamless compute/storage pooling, resilient to frequent network events.

---

## Key Challenges and Solutions

- **High Availability**: Achieved through fabric redundancy and deployment diversity.
- **Fiber Management**: Bundling to reduce physical complexity and deployment time.
- **Incremental Deployment**: Adopted to enable upgrades without extensive downtime.
- **Inter-Cluster Networking**: Enabled with Cluster Border Routers (CBRs), handling inter-cluster connections and external routing.

---

## Takeaways

- **Impact of Clos and Centralized Control**: Improved datacenter efficiency, bandwidth, and management simplicity.
- **Influence on Industry**: Early Software-Defined Networking (SDN) principles, influencing modern WAN and datacenter designs.
- **Legacy**: Jupiter and prior systems serve as a foundational example of hyperscale networking innovation.

---


1. INTRODUCTION

- Paper presents Google's approach to datacenter networks over 5 generations spanning 10 years
- Three key themes:
    - Multi-stage Clos topologies with commodity switches enable cost-effective building-scale networks
    - Simplified centralized control better than complex decentralized protocols for single-operator datacenters
    - Modular design works for both datacenter and wide-area networks
- Networks scaled 100x over 10 years to >1Pbps bisection bandwidth

2. BACKGROUND & RELATED WORK

- Bandwidth demands doubled every 12-15 months
- Drivers: Growing datasets, network-intensive processing, higher quality web services
- Traditional datacenter architecture limitations:
    - Cost and complexity issues
    - Scale limited by highest-end switches
    - Complex chassis targeting high availability
    - Too many unnecessary protocols
- Solution approach: Scale out with commodity components, like compute infrastructure

3. NETWORK EVOLUTION Details 5 generations of networks:

- Firehose 1.0 (2005): First attempt, never deployed to production
- Firehose 1.1 (2006): First production Clos network
- Watchtower (2008): Introduced chassis design, fiber cabling
- Saturn (2009): Increased scale and bandwidth
- Jupiter (2012): Building-scale 40G fabric with incremental deployment

4. EXTERNAL CONNECTIVITY

- Evolved from using traditional cluster routers to custom Cluster Border Routers (CBRs)
- Developed "Freedome" for inter-cluster networking
- Used modular approach to scale from cluster to datacenter to campus connectivity

5. SOFTWARE CONTROL

- Built custom control plane instead of using traditional routing protocols
- Key components:
    - Neighbor Discovery protocol
    - Firepath routing system with centralized control
    - Custom configuration and management system
- Focus on simplicity and integration with existing server management infrastructure

6. EXPERIENCE Discusses three main challenges:

- Fabric congestion and mitigation techniques
- Categories of outages:
    - Control software issues at scale
    - Aging hardware problems
    - Configuration mistakes
- Lessons learned from each type of failure

7. CONCLUSION

- Successfully delivered building-scale networks using:
    - Multi-stage Clos topologies
    - Merchant silicon
    - Centralized control
    - Integration with server management practices
- Approach enabled significant application benefits


### **Abstract**

The paper outlines Google’s evolution over a decade in designing scalable, cost-effective datacenter networks, primarily using Clos topologies and centralized control. Key innovations include using merchant silicon, a centralized control mechanism for datacenter switches, and modular hardware. Google’s network expanded to dozens of sites worldwide, achieving a 100x increase in capacity to over 1 Pbps.

### **Introduction**

Google faced prohibitive costs and complexity with traditional datacenter networks. To meet exploding data demands, they focused on a scalable, cost-effective approach by using Clos topologies, merchant silicon, and centralized control, streamlining management and enhancing network flexibility.

### **Background and Related Work**

Google’s initial datacenter networks were constrained by bandwidth and had heavy limitations, such as oversubscribed links and limited fault tolerance. Inspired by computing advancements, they sought a scalable, commodity-based solution through Clos topologies, enabling high-bandwidth cluster networking.

### **Network Evolution**

Describes the progression of network designs at Google over five generations:

1. **Firehose 1.0** – An initial attempt using Clos topology but challenged by low ToR (Top of Rack) switch capacity and unreliable server-based switching.
2. **Firehose 1.1** – The first successful production deployment with custom enclosures and external copper cabling to reduce complexity, but still limited by cabling challenges.
3. **Watchtower** – Used a backplane chassis design, simplifying cabling and enabling scalable fabrics through bundled fiber connections.
4. **Saturn** – Increased scale and bandwidth with 10G server connectivity, introducing 24x10G switches.
5. **Jupiter** – Achieved 40G bandwidth, enabling datacenter-wide fabric connections. Required heterogeneous hardware and modular building blocks to manage the massive scale.

### **External Connectivity**

Enhanced network connections between clusters:

- **WCC** – Allowed decommissioning of legacy Cluster Routers, improving inter-cluster data transfer rates.
- **Inter-Cluster Networking** – Employed Freedome fabrics to link clusters within buildings and across campus, replacing expensive vendor hardware with custom solutions.

### **Software Control**

Outlines Google’s custom-built control plane, **Firepath**, designed to handle massive multipath networks. Firepath operates with centralized state distribution but computes forwarding tables locally. Key components include Neighbor Discovery for link verification and Firepath Master Redundancy Protocol for stability.

### **Routing**

Detailed the Firepath protocol, involving a centralized state management that enables scalable, multipath-aware routing across Google’s datacenter fabrics, optimizing for rapid failover and robustness.

### **Configuration and Management**

Focused on scalability and simplicity. Network configurations are pre-defined for each datacenter, reducing individual switch configurations. Tools integrate with server management for unified monitoring and updates, streamlining network management.

### **Experience**

Google encountered challenges such as:

- **Congestion** – Addressed with various traffic management techniques.
- **Outages** – Three main causes: control software issues, aging hardware, and component misconfigurations. Mitigations included refining control software and improving monitoring.

### **Conclusion**

Google’s datacenter network evolution over ten years enabled scalable, cost-effective bandwidth expansion. The shift from traditional distributed control to centralized control allowed Google to scale datacenter fabrics globally, enabling efficient management akin to server fleet practices.




---

# **Jupiter Rising: A Decade of Clos Topologies and Centralized Control in Google’s Datacenter Network**

## **Abstract**

- **Challenge:** Datacenter networks a decade ago suffered from cost, operational complexity, and scale limitations.
- **Solution:** Google’s approach revolves around:
    1. **Clos topologies:** Scalable multi-stage networks using commodity switch silicon.
    2. **Centralized control:** Simplified network management tailored to a single-operator environment.
    3. **Modular hardware and robust software:** Adaptable for inter-cluster and WAN deployments.
- **Results:** Datacenter networks scaled from 1 Tbps to over 1 Pbps in bisection bandwidth across five generations.

---

## **Introduction**

- Datacenter networks are critical for modern cloud computing and web services.
- **Drivers of growth:**
    - Explosion of dataset sizes.
    - Demand for real-time, high-bandwidth applications like search and ads.
- Traditional architectures faced **prohibitive cost and complexity** due to reliance on high-end, WAN-targeted switches.
- **Vision:** Borrow concepts from commodity server scalability to transform networking.

---

## **Key Principles**

1. **Clos Topologies:**
    - Provide path diversity and fault tolerance.
    - Scale by adding stages, limited only by failure domains and control plane scalability.
2. **Merchant Silicon:**
    - Commodity switch components with regular upgrade cycles.
    - Focus on bandwidth density rather than feature-rich hardware.
3. **Centralized Control:**
    - Replace complex distributed protocols with a global, centralized control system.
    - Reduces complexity and enables deterministic behavior.

---

## **Background**

- **Traffic Growth:** Aggregate server traffic grew 50x from 2008 to 2015.
- **Traditional Clusters:**
    - Limited bandwidth per host (~100 Mbps).
    - Inadequate scalability and high oversubscription.

---

## **Network Evolution**

### **1. Firehose 1.0: Experimental Clos Topology**

- Target: 1 Gbps non-blocking bandwidth for 10K servers.
- Challenges:
    - Complex wiring and server-based switching fabric.
    - Uptime issues from server hardware failures.
- **Lessons Learned:** Transition to dedicated switch enclosures.

### **2. Firehose 1.1: First Production Clos**

- Custom enclosures with standardized CompactPCI chassis.
- Improvements:
    - 2x the server scale of Firehose 1.0.
    - Increased robustness to link failures.
- Challenges:
    - Labor-intensive deployment due to copper cable limitations.

### **3. Watchtower: Global Deployment**

- Introduced fiber bundling to reduce deployment complexity.
- Utilized merchant silicon (16x10G chips) for larger fabrics.
- Enabled partial deployment of bandwidth via depopulation.

### **4. Saturn: Scaling to 10G Servers**

- Goals:
    - Support 2 Gbps/server average bandwidth.
    - Burst capabilities of up to 10 Gbps/server.
- Architecture:
    - 288-port non-blocking chassis.
    - Flexible configurations for high-bandwidth servers.

### **5. Jupiter: 40G Datacenter-Scale Fabric**

- Unified inter-cluster and intra-cluster networking.
- Key Innovations:
    - Centauri chassis with 16x40G ports.
    - Modular middle blocks for scalable aggregation and spine layers.
- Capacity:
    - Supports up to 1.3 Pbps of bisection bandwidth.

---

## **Software Control**

### **Firepath: Centralized Control Plane**

- Combines centralized topology state distribution with distributed routing computation.
- Components:
    - **Neighbor Discovery (ND):** Verifies connectivity and prevents misconfigurations.
    - **Master Election Protocol:** Ensures redundancy and availability of control.
- Achievements:
    - Seamless handling of link failures with high path diversity.
    - Fast convergence times (e.g., <4000ms for ToR-S2 link failures).

---

## **Operational Challenges**

1. **Congestion Management:**
    - Root Causes:
        - Limited buffering in merchant silicon.
        - Oversubscription in ToR uplinks.
    - Solutions:
        - Explicit Congestion Notification (ECN).
        - QoS-based packet drops.
        - Dynamic buffer sharing and optimized flow hashing.
2. **Outages:**
    - Examples:
        - Control plane failures during large-scale reboots.
        - Hardware aging exposing unhandled failure modes.
    - Mitigation:
        - Stress testing in virtualized environments.
        - Improved monitoring and alerting systems.

---

## **Management Innovations**

- Centralized configuration pipeline:
    - Simplified deployment with pre-configured templates.
    - Enabled consistency across clusters.
- Integration with Google’s server management tools:
    - Streamlined monitoring and alerting.
    - Extended debugging utilities (e.g., topology-aware traceroute).

---

## **Key Takeaways**

1. **Clos Topologies:**
    - Deliver scalable, cost-effective bandwidth.
    - Simplify redundancy and fault recovery.
2. **Centralized Control:**
    - Reduces operational complexity.
    - Supports massive scaling with predictable behavior.
3. **Iterative Design:**
    - Each generation builds on lessons learned, optimizing for scalability and reliability.

---

## **Conclusion**

- Jupiter’s evolution highlights the importance of adapting traditional networking principles to datacenter-specific needs.
- Leveraging commodity hardware and centralized software allowed for exponential scaling while maintaining cost efficiency.
- Future efforts include improving congestion response and extending the centralized control paradigm to WAN environments.

---
