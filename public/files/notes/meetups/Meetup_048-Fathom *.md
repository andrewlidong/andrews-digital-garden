

---

# **Fathom: Understanding Datacenter Application Network Performance**

## **Abstract**

- **Purpose:** Analyze network performance bottlenecks in Google’s data centers.
- **Approach:** Fathom:
    - Passively samples Remote Procedure Calls (RPCs), the core workload in data centers.
    - Segments RPC latency into host and network components using kernel and RPC stack instrumentation.
    - Aggregates performance data for macroscopic analysis of services.
- **Scale:**
    - Operates on billions of TCP connections, monitoring petabits of traffic globally 24/7.
    - Demonstrates value through real-world troubleshooting and network upgrades.

---

## **Introduction**

- **Challenges in Datacenter Networks:**
    - Performance issues arise due to complex multi-tenant environments with diverse workloads.
    - Identifying root causes for RPC latency (e.g., CPU, memory, network) is difficult.
- **Existing Gaps:**
    - Current tools measure latency but lack insights into underlying causes or provide application-specific data.
    - Averaged metrics can obscure significant performance regressions.
- **Goals:**
    - Improve service performance and infrastructure with fine-grained network visibility.
    - Balance visibility, interpretability, and scalability.

---

## **Fathom Overview**

### **Design Goals**

1. **Visibility into Network Stack:**
    - Break down RPC latency into actionable components.
2. **Scalability:**
    - Handle large-scale data center operations with minimal overhead.
3. **Integration:**
    - Complement existing tools (e.g., Dapper tracing system).

### **Core Components**

- **Sampling and Instrumentation:**
    - Collects kernel-level timestamps for RPCs.
    - Measures metrics like RTT, congestion window, and queuing delays.
- **Data Aggregation:**
    - Uses t-digests to preserve latency distributions while reducing data storage overhead.
- **Analytics Framework:**
    - Gaussian Mixture Models (GMMs) for multidimensional performance clustering.

---

## **Technical Details**

### **1. Host Stack Instrumentation**

- Tracks RPC data at key stages:
    - Serialization, kernel queues, traffic shaping, and NIC transmission.
- Timestamping:
    - Kernel timestamps enabled selectively per RPC for efficiency.
    - New Linux features (e.g., `OPT_STATS`) record TCP state precisely during events.
- Metrics:
    - Latencies (e.g., queuing, transfer, pacing).
    - TCP stats (e.g., congestion window, retransmissions, pacing rate).

### **2. Aggregation and Sampling**

- **Sampling Rates:**
    - Real-time monitoring: 1 in 1,000 RPCs.
    - Offline analysis: 1 in 128,000 RPCs.
- **Aggregation with t-Digests:**
    - Maintains high accuracy for tail latencies.
    - Reduces billions of RPC metrics to manageable distributions.

---

## **Use Cases**

### **1. Diagnosing RPC Latency**

- **Process:**
    - Annotates Dapper RPC traces with Fathom metrics for bottleneck identification.
    - Uses heuristics (e.g., queuing vs congestion vs flow control issues).
- **Example Insight:**
    - Found that 55% of performance issues stemmed from host-level resource contention rather than network congestion.

### **2. Evaluating Infrastructure Changes**

- Uses GMMs to cluster RPC metrics and analyze the impact of network upgrades.
- Case Studies:
    1. **Congestion Control Rollout:**
        - Transition from BBRv1 to BBRv2 reduced queuing delays and achieved fairer bandwidth allocation.
    2. **DCN Fabric Upgrade:**
        - Faster fabrics improved delivery rates but revealed bottlenecks at receiver hosts due to resource constraints.

---

## **Key Results**

1. **Efficiency:**
    - Adds only 0.4% CPU overhead.
    - Aggregates petabytes of data daily while preserving key performance metrics.
2. **Scalability:**
    - Provides 100% fleet coverage across billions of RPCs.
3. **Actionable Insights:**
    - Quickly identifies root causes for performance issues (e.g., slow receivers, WAN throttling).
    - Highlights subtle regressions like c-state wakeup delays in lightly loaded servers.

---

## **Lessons Learned**

1. **Integration is Key:**
    - Close coupling with existing tools like Dapper ensures widespread adoption.
2. **Granular Analysis Matters:**
    - Aggregate metrics hide critical patterns (e.g., tail latencies, specific workload regressions).
3. **Usability:**
    - Simplified heuristics empower developers with limited networking expertise.

---

## **Future Directions**

- **Advanced Analytics:**
    - Join Fathom data with topology, switch metrics, and profiling data for holistic insights.
- **Machine Learning:**
    - Explore predictive models for traffic patterns and bottleneck identification.
- **Continuous Evolution:**
    - Adapt to emerging hardware (e.g., faster NICs, new congestion protocols) and dynamic workloads.

---

## **Conclusion**

- Fathom bridges critical gaps in datacenter network performance analysis, enabling both micro-level debugging and macro-level impact assessment.
- Its scalable design and actionable insights make it indispensable for managing planetary-scale networks.

---
