

---

# **A Large Scale Study of Data Center Network Reliability**

## **Abstract**

- **Problem:** Ensuring the reliability of data center networks to support highly available web services, particularly amidst hardware failures, fiber cuts, and maintenance errors.
- **Study Overview:**
    - Seven years of intra-data center data and 18 months of inter-data center network incident data at Facebook.
    - Analysis includes reliability trends, impacts on software systems, and evolution with modern fabric networks.
- **Findings:**
    - Transition to fabric networks significantly reduces incident rates.
    - Maintenance failures, human errors, and hardware issues are primary contributors to network incidents.
    - Diverse reliability characteristics across network devices and geographic locations.

---

## **Introduction**

- **Importance of Reliability:**
    - Critical for maintaining the availability of web services like Facebook.
    - Failures impact latency, data consistency, and service availability.
- **Focus Areas:**
    1. Evolution from cluster to fabric networks.
    2. Impact of network reliability on software systems.
    3. Root causes and failure trends.

---

## **Facebook’s Network Architecture**

### **1. Intra-Data Center Networks**

- **Cluster Network Design (Legacy):**
    - Hierarchical structure with cluster switches (CSWs) and aggregators (CSAs).
    - Limited scalability and slow recovery due to vendor-specific hardware and software.
- **Fabric Network Design:**
    - Five-stage Folded Clos topology using commodity hardware.
    - Features automated failover, dynamic resource management, and software-controlled repairs.

### **2. Inter-Data Center Networks**

- **Wide Area Network (WAN) Backbone:**
    - Connects geographically distributed data centers.
    - Uses edge nodes and fiber links to support both user-facing and inter-data center traffic.
- **Key Challenges:**
    - Managing link failures, fiber cuts, and geographic constraints.

---

## **Methodology**

### **Data Sources:**

1. **Intra-Data Center Data:**
    - Seven years of SEV (Site Events) reports documenting incidents affecting software systems.
    - Root cause analysis by device type and network design.
2. **Inter-Data Center Data:**
    - 18 months of repair logs from fiber vendors for backbone links.

### **Metrics:**

- **Mean Time Between Failures (MTBF):** Average time between incidents.
- **Mean Time to Repair (MTTR):** Average time to resolve incidents.
- **Severity Levels:**
    - SEV1 (highest, e.g., data center outages).
    - SEV3 (lowest, minimal impact).

---

## **Findings**

### **1. Root Causes**

- **Top Contributors:**
    - Maintenance failures (17%).
    - Human misconfiguration and software bugs (25%).
    - Hardware failures (13%).
- **Observations:**
    - Maintenance automation reduces failure impacts.
    - Misconfigurations often stem from complex network changes.

### **2. Incident Rates and Trends**

- **Higher Bandwidth Devices:** More frequent incidents due to broader impact radius.
- **Fabric Networks:**
    - Reduced incidents (2.8x lower than cluster networks).
    - Enhanced resilience due to automated failover and repairs.
- **Rack Switches (RSWs):** Increasing incident rates due to scaling challenges.

### **3. Incident Severity**

- **Core Devices:**
    - Highest number of incidents, but mostly low severity (SEV3).
- **Fabric Networks:**
    - Lower severity incidents compared to cluster networks due to better fault tolerance.

### **4. Inter-Data Center Reliability**

- **Edge Nodes:**
    - Failures occur every 2.3 months on average.
    - Recovery times average 10 hours, influenced by location and vendor reliability.
- **Fiber Links:**
    - Vendor MTBF spans from hours to months, with significant variance based on geography and competition.

---

## **Key Observations**

1. **Transition from Cluster to Fabric Networks:**
    - Fabric networks outperform legacy cluster networks in reliability and fault tolerance.
    - Automated repair mechanisms and simplified switch design are critical factors.
2. **Geographic and Vendor Influence:**
    - Edge node and fiber link reliability vary significantly based on location and vendor practices.
3. **Impact on Software Systems:**
    - Failures manifest as increased latency, connection timeouts, and degraded service quality.

---

## **Recommendations**

1. **Enhanced Automation:**
    - Extend automated repair systems to all device types.
    - Improve fault detection and recovery speeds.
2. **Vendor and Geographic Planning:**
    - Prioritize reliable vendors and redundant links in remote or challenging regions.
3. **Design Simplifications:**
    - Adopt commodity-based hardware for new network designs.
    - Implement dynamic resource allocation for high-demand scenarios.

---

## **Conclusion**

- **Impact:** Provides a comprehensive understanding of network reliability in large-scale data centers.
- **Future Work:**
    - Improve repair and failover mechanisms.
    - Address scaling challenges in rack switches and backbone networks.
- **Implications:** Findings applicable to other large-scale web service providers using similar architectures.

---

