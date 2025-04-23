

---

# **Dapper: A Large-Scale Distributed Systems Tracing Infrastructure**

## **Abstract**

- **Problem:** Complex, large-scale distributed systems at Google require understanding system behavior and diagnosing performance issues.
- **Solution:** Dapper, Google’s distributed tracing infrastructure, meets the following goals:
    - **Low Overhead:** Negligible performance impact.
    - **Application-Level Transparency:** No intervention required from developers.
    - **Scalability:** Handles Google-scale systems and clusters.
- **Impact:** Dapper evolved from a tracing tool to a monitoring platform, enabling unanticipated tools and analysis.

---

## **Introduction**

- **Challenges of Distributed Systems:**
    - Thousands of machines involved in a single task, e.g., web search.
    - Complex interactions between multiple subsystems.
    - Performance degradation in any component affects overall latency.
- **Dapper Goals:**
    - Ubiquitous deployment and continuous monitoring.
    - Fast access to trace data (available within minutes).

---

## **Core Design Principles**

1. **Low Overhead:**
    - Adaptive sampling to minimize performance impact.
    - Efficient instrumentation within common libraries.
2. **Application Transparency:**
    - Trace contexts automatically propagate across threads and processes.
    - Instrumentation limited to threading, control flow, and RPC libraries.
3. **Scalability:**
    - Designed for Google’s large-scale infrastructure.
    - Adaptive mechanisms for balancing trace data volume and performance.

---

## **Tracing Model**

### **Trace Trees and Spans**

- **Trace Tree:**
    - Represents work across distributed components.
    - Nodes (spans) represent individual units of work.
- **Span Attributes:**
    - **Identifiers:** Unique trace and span IDs.
    - **Annotations:** Logs, RPC timing, and application-specific details.
    - **Causal Links:** Parent-child relationships between spans.

### **Annotations**

- Developers can add custom annotations to spans for debugging and monitoring.
- Examples include cache hit/miss logs or request-specific metadata.

---

## **Implementation**

### **Instrumentation**

- **Threading:** Trace contexts stored in thread-local storage and propagated automatically.
- **RPC Framework:** Spans are created for RPC calls, and trace IDs are passed between client and server.
- **Control Flow Libraries:** Asynchronous callbacks inherit the originating trace context.

### **Sampling**

- **Purpose:** Reduce overhead and data volume.
- **Mechanism:** Fixed-rate sampling (e.g., 1 in 1024 requests) with adaptive options for low-traffic workloads.

### **Trace Collection**

- **Pipeline:**
    1. Spans logged to local disk.
    2. Collected by daemons and stored in Bigtable.
    3. Accessible within 15 seconds on average.
- **Out-of-Band Collection:** Avoids interference with application payloads or performance.

---

## **Key Tools and Interfaces**

### **Dapper Depot API (DAPI)**

- Provides programmatic access to trace data:
    - **Trace ID Lookup:** Retrieve specific traces.
    - **Bulk Access:** Analyze trace sets using MapReduce.
    - **Indexed Access:** Search traces by service, host, and timestamp.

### **Web Interface**

- Interactive tools for exploring traces:
    1. Identify problematic patterns using summary views.
    2. Visualize distributed execution paths.
    3. Drill into specific traces with detailed breakdowns of time spent.

---

## **Use Cases**

1. **Performance Tuning:**
    - Pinpoint latency bottlenecks (e.g., Ads Review system optimized latency by 2 orders of magnitude).
    - Identify unnecessary serialization in critical paths.
2. **Service Dependency Analysis:**
    - Infer dynamic dependencies between services and shared resources.
3. **Network Monitoring:**
    - Attribute inter-cluster network load to applications and their requests.
4. **Debugging and Incident Response:**
    - Rapid identification of failures during high-latency or high-error-rate events.

---

## **Evaluation**

### **Overhead**

- **Trace Generation:**
    - Root span creation: ~204ns.
    - Non-root span creation: ~176ns.
    - Disk writes: Amortized to minimize impact.
- **Trace Collection:**
    - Daemon CPU usage: <0.3%.
    - Network traffic: <0.01% of total production traffic.

### **Effectiveness**

- Sampling at 1/1024 captures sufficient data for most analyses.
- Adaptive sampling balances low overhead and trace density.

---

## **Challenges and Lessons Learned**

1. **Batch Workloads:**
    - Existing design focuses on online serving systems; new approaches needed for batch jobs (e.g., MapReduce).
2. **Coalescing Effects:**
    - Batched operations obscure attribution for individual requests.
3. **Kernel-Level Insights:**
    - Difficult to associate kernel events with trace contexts.
4. **Root Cause Analysis:**
    - Traces highlight bottlenecks but may not explain underlying causes (e.g., queuing delays).

---

## **Future Work**

- Enhance integration with debugging tools for kernel-level events.
- Support new frameworks and programming models.
- Improve real-time trace analysis capabilities for shared storage systems.

---

## **Conclusion**

- **Impact:** Dapper transformed how Google monitors and optimizes distributed systems.
- **Scalability and Transparency:** Achieved through minimal, ubiquitous instrumentation and sampling.
- **Extensibility:** Enabled diverse applications, from resource accounting to RPC analysis.

---
