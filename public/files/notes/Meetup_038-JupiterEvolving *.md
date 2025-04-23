**- Meetup 038 - [Jupiter Evolving: Transforming Google's Datacenter Network via Optical Circuit Switches and Software-Defined Networking](https://research.google/pubs/jupiter-evolving-transforming-googles-datacenter-network-via-optical-circuit-switches-and-software-defined-networking/)**

# Jupiter Evolving: Transforming Google's Datacenter Network

**Authors**: Leon Poutievski, Omid Mashayekhi, Joon Ong, Arjun Singh, Mukarram Tariq, et al.  
**Affiliation**: Google Inc.  
**Conference**: SIGCOMM 2022

## Overview

- **Purpose**: Describes the evolution of **Jupiter**, Google's datacenter network, from a traditional **Clos** architecture to a **direct-connect** topology using **Optical Circuit Switches (OCSes)** and **Software-Defined Networking (SDN)**.
- **Main Contributions**:
    - Achieved **5x higher speed and capacity**.
    - Reduced **capital expenditure (capex) by 30%** and **power consumption by 41%**.
    - Transformed the network to support **dynamic topology reconfiguration** and incremental capacity upgrades.

## Key Technologies

### 1. Clos vs. Direct-Connect Architecture

- **Clos Topology**:
    - Consists of top-of-rack switches, aggregation blocks, and spine blocks.
    - Provides high scalability but is challenging for **incremental upgrades**, especially as technologies advance (e.g., transitioning from 40Gbps to 100Gbps).
- **Direct-Connect Architecture**:
    - Eliminated the spine layer and used **Optical Circuit Switches (OCSes)** to dynamically connect aggregation blocks.
    - Allowed **incremental capacity upgrades** and technology refresh without full rewiring.

### 2. Optical Circuit Switches (OCSes)

- **Role**: Enabled **restriping** of the datacenter fabric, maintaining full burst bandwidth between blocks.
- **MEMS-based OCSes**: Used to quickly and reliably change inter-block connections, allowing dynamic reconfiguration of the physical topology.
- **Benefits**:
    - Reduced **fabric reconfiguration time by 3x** compared to traditional patch panels.
    - Allowed incremental addition of network blocks and increased flexibility in handling heterogeneity.

### 3. Software-Defined Networking (SDN)

- **Traffic and Topology Engineering**:
    - **Traffic Engineering (TE)**: Dynamically adjusted traffic flows based on demand using centralized control.
    - **Topology Engineering (ToE)**: Optimized the physical network topology to match traffic patterns, ensuring efficient use of resources.
- **Control Plane**: Implemented through **Orion**, Google's SDN control plane, which managed data plane configurations and reconfiguration.

## Technical Challenges and Solutions

### Incremental Network Upgrades

- **Traditional Clos Network Challenges**: Limited ability to increase bandwidth incrementally without full-scale upgrades.
- **OCSes as a Solution**: Allowed for incremental upgrades by connecting new aggregation blocks without upgrading the entire spine layer.
- **Interoperability Across Generations**: Used **Coarse Wavelength Division Multiplexing (CWDM)** to allow different network speeds (40Gbps, 100Gbps, 200Gbps) to coexist.

### Load Balancing and Resilience

- **Dynamic Reconfiguration**: Traffic and topology engineering worked together to dynamically adjust both paths and physical topology.
- **Direct Paths and Multi-Hop**: Around **60%** of traffic takes a direct path, with the remainder utilizing one-hop indirect paths. This reduced the average **block-level path length** to **1.4**.

## Evaluation and Results

- **Performance Gains**:
    - Achieved similar throughput as traditional Clos fabrics while reducing cost and improving energy efficiency.
    - **Higher Burst Bandwidth**: Enabled aggregation blocks to achieve full burst bandwidth without the bottlenecks inherent in spine layers.
- **Fleet-Wide Impact**: Improved both **capex** and **operational expenditure (opex)** by eliminating costly spine layer upgrades and reducing power consumption.

## Key Takeaways

- The transition to **direct-connect topology** using **OCSes** and **SDN** control allowed Google’s datacenter network to evolve flexibly and incrementally.
- The architecture provided substantial improvements in speed, capacity, power efficiency, and adaptability, highlighting a significant advancement in datacenter network design.



# Jupiter Evolving: Google's Datacenter Network

## [[Key Points]]

- Evolution of Google's datacenter network over a decade
- Shift from Clos to direct-connect topology
- Integration of Optical Circuit Switches (OCS)
- Software-Defined Networking (SDN) implementation
- 5x higher speed/capacity, 30% capex reduction, 41% power reduction

## [[Introduction]]

- Traditional Clos-based networks face challenges with:
    - Incremental evolution
    - Heterogeneous hardware
    - Pre-building spine layer constraints
- Key problems:
    - Speed derating with older spine blocks
    - Expensive/disruptive spine refresh
    - Limited bandwidth utilization

## [[Jupiter's Approach to Evolution]]

### [[DCNI Layer]]

- Datacenter Network Interconnection layer using MEMS-based OCS
- Enables dynamic topology reconfiguration
- Supports incremental expansion

### [[Multi-generational Interoperability]]

- Coexistence of different switch generations
- CWDM4 optical modules for cross-generation compatibility
- ~2/3 of fabrics have multiple generation blocks

### [[Cost Optimization]]

- Optical circulators to halve OCS ports needed
- Incremental radix upgrades
- Phased DCNI deployment (1/8 → 1/4 → 1/2 → full)

### [[Direct-connect Architecture]]

- Removes spine layer bottlenecks
- Traffic pattern predictability enables simpler topology
- Reduced power consumption
- Better scaling with new technologies

## [[Direct-Connect Jupiter]]

### [[DCNI Layer Implementation]]

- OCS racks deployment strategy
- Physical diversity for fault tolerance
- Even distribution of links across OCS

### [[Logical Topology]]

- Initial uniform mesh for homogeneous blocks
- Traffic-aware topology for heterogeneous blocks
- Multi-level factorization for port-level connectivity

## [[Traffic and Topology Engineering]]

### [[Control Plane Design]]

- Orion SDN control plane
- Two-level routing hierarchy
- Four separate failure domains

### [[Traffic Engineering]]

- Real-time traffic matrix collection
- Multi-commodity flow optimization
- Variable hedging for uncertainty

### [[Topology Engineering]]

- Alignment with traffic patterns
- Optimization for heterogeneous speed fabrics
- Joint formulation with traffic engineering

## [[Live Fabric Rewiring]]

- Incremental rewiring process
- Safety considerations:
    - Maintaining SLOs
    - Avoiding correlated failures
- Loss-free reconfiguration

## [[Evaluation]]

### [[Traffic Characteristics]]

- Gravity model for inter-block traffic
- Varying offered load across blocks

### [[Performance Analysis]]

- Throughput comparison with Clos
- Stretch optimization
- MLU (Maximum Link Utilization) improvements

### [[Production Experience]]

- RTT and FCT improvements
- OCS vs patch panel performance
- Topology conversion benefits

### [[Cost Model]]

- 70% capex of baseline
- 59% power consumption of baseline
- OCS cost amortization benefits

## [[Hardware Components]]

### [[Palomar OCS]]

- Custom MEMS-based design
- 136x136 non-blocking switch
- Low insertion loss (<2dB)

### [[WDM Transceivers]]

- CWDM4 wavelength grid
- Generation compatibility
- Technology evolution path

### [[Optical Circulators]]

- Three-port non-reciprocal device
- Enables bidirectional operation
- Cost amortization across generations

---

# **Jupiter Evolving: Transforming Google’s Datacenter Network**

## **Abstract**

- **Key Transformation:** Over a decade, Google evolved Jupiter, its datacenter network, transitioning from a **Clos topology** to a **direct-connect architecture**.
- **Innovations:**
    - **Optical Circuit Switches (OCS):** Enabled dynamic reconfiguration and topology optimization.
    - **Software-Defined Networking (SDN):** Centralized traffic and topology management.
    - Incremental deployment techniques minimized disruptions and reduced costs.
- **Outcomes:**
    - Achieved a 5x increase in speed and capacity.
    - Reduced **CapEx** by 30% and **power consumption** by 41%.

---

## **Introduction**

- **Traditional Challenges with Clos Topologies:**
    - Fixed topology limits scalability with emerging technologies.
    - Expensive and disruptive upgrades required for scaling.
    - Inefficient resource utilization due to static configurations.
- **Jupiter’s Goal:**
    - Adapt the network dynamically for growing and heterogeneous workloads.
    - Transition to a topology that supports **modular, incremental deployment**.

---

## **Key Innovations**

### **1. Direct-Connect Topology**

- **Replaced Clos Topology:**
    - Directly connected machine aggregation blocks, removing the spine layer.
    - Achieved lower path length and increased capacity flexibility.
- **Dynamic Reconfiguration:** Utilized Optical Circuit Switches (OCS) to adapt the network dynamically to traffic patterns.

### **2. Optical Circuit Switches (OCS)**

- **Role in Dynamic Topology:**
    - Allowed physical rewiring of network connections without manual intervention.
    - Enabled **loss-free, incremental deployment** as new blocks were added.
- **Interoperability:**
    - Incorporated multi-generational switch technologies using **Wavelength Division Multiplexing (WDM)** optics.
    - Reduced hardware requirements by diplexing transmission (Tx) and reception (Rx) into a single fiber strand.

### **3. Traffic and Topology Engineering**

- **Traffic Engineering (TE):**
    - Optimized traffic routing in real-time using Weighted Cost Multi Path (WCMP).
    - Addressed path imbalances and congestion dynamically.
- **Topology Engineering (ToE):**
    - Adjusted the physical and logical topology to match observed traffic patterns.
    - Achieved optimal **stretch** (path efficiency) and **throughput**.

---

## **System Architecture**

### **1. Modular Aggregation Blocks**

- **Building Blocks of Jupiter:**
    - Connected directly to OCS for flexible inter-block communication.
    - Designed to support heterogeneous speeds (e.g., 40G, 100G, 200G).

### **2. Software-Defined Networking (SDN)**

- **Orion SDN Control Plane:**
    - Centralized management of OCS and packet switches.
    - Partitioned domains to minimize blast radius during failures.
- **Logical Connectivity:**
    - Abstracted OCS operations to maintain Layer-2 and Layer-3 compatibility with existing software.

### **3. Efficient Routing**

- **Non-Shortest Path Routing:**
    - Allowed transit through intermediary blocks to balance bandwidth utilization.
    - Reduced network congestion under high-demand scenarios.

---

## **Performance Improvements**

1. **Throughput:**
    - Improved by dynamically reassigning bandwidth based on real-time traffic.
    - Direct-connect topology achieved higher capacity than Clos under production traffic.
2. **Latency:**
    - Reduced **minimum round-trip time (RTT)** by up to 11%.
    - Faster completion times for small flows due to shorter paths.
3. **Energy Efficiency:**
    - Eliminated spine layers reduced power consumption by 41%.
    - Passive circulators further minimized operational energy costs.

---

## **Evaluation**

### **1. Production Metrics**

- Transition from Clos to direct-connect topology:
    - **Median RTT reduction:** ~7%.
    - **Flow Completion Time (FCT):** Improved by 5–12% for small flows.
- **Traffic-Aware Topology Engineering:**
    - Reduced path stretch from 1.64 to 1.04, further lowering RTT.

### **2. Cost Savings**

- **CapEx:** Reduced to 70% of baseline Clos architecture.
- **OpEx:** Lowered via simplified rewiring and reduced power demands.

### **3. Reconfiguration Speed**

- OCS-based rewiring achieved a **9.6x speedup** compared to manual rewiring with patch panels.

---

## **Challenges and Lessons Learned**

1. **System Complexity:**
    - Increased due to integration of SDN and OCS.
    - Mitigated with automated analysis and debugging tools.
2. **Traffic Prediction:**
    - Short-term traffic variability made precise optimization challenging.
    - Emphasized hedging strategies to balance robustness and efficiency.
3. **Scaling Heterogeneity:**
    - Adapting to multiple generations of network hardware required careful planning.

---

## **Conclusion**

- Jupiter’s transformation demonstrates the power of combining **optical switching**, **traffic engineering**, and **SDN** to achieve scalable, cost-effective datacenter networks.
- **Key Achievements:**
    - Dynamic, high-throughput networking tailored to real-world workloads.
    - Modular and incremental upgrades reduced disruptions and costs.
- **Future Directions:**
    - Co-optimization of compute and network resources for emerging AI/ML workloads.
    - Extending Jupiter’s architecture to campus and inter-datacenter networking.

---
