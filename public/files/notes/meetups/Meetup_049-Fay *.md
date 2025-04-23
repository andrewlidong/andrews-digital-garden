

---

# **Fay: Extensible Distributed Tracing from Kernels to Clusters**

## **Abstract**

- **Problem:** Understanding software execution at scale is essential for diagnosing performance bottlenecks and ensuring stability.
- **Solution:** Fay:
    - Provides a platform for efficient collection, processing, and analysis of software execution traces.
    - Combines **dynamic tracing** with **distributed aggregation** across kernels and clusters.
    - Supports extensibility through **safe machine code** for high-performance and low-overhead monitoring.
- **Key Innovations:**
    - High-level declarative query interface.
    - Inline, safe execution for efficient tracing.
    - Demonstrates that general-purpose tracing can match or outperform specialized tools.

---

## **Introduction**

- **Motivation:** Modern distributed systems require visibility into runtime behavior for debugging, performance tuning, and reliability.
- **Core Features of Fay:**
    1. Dynamic, runtime instrumentation for high-frequency tracing.
    2. Support for both kernel-mode and user-mode tracing.
    3. Declarative interface to simplify trace specification and aggregation.
- **Example Query:**
    
    ```csharp
    from io in cluster.Function("iolib!Read")
    where io.time < Now.AddMinutes(5)
    let size = io.Arg(2) // request size in bytes
    group io by size/1024 into g
    select new { sizeInKilobytes = g.Key, countOfReadIOs = g.Count() };
    ```
    
    - Outputs read sizes across a cluster with efficient aggregation and minimal overhead.

---

## **Core Design Goals**

1. **Scalability:**
    - Handle distributed systems with thousands of processes and threads.
2. **Efficiency:**
    - Inline tracing avoids hardware traps for lower overhead.
3. **Extensibility:**
    - Use safe, statically-verified machine code for customizable probes.
4. **Unified Query Interface:**
    - FayLINQ enables high-level declarative queries that integrate with DryadLINQ.

---

## **Fay Architecture**

### **Key Components**

1. **Dynamic Tracing:**
    - Inline instrumentation modifies running binaries.
    - Tracepoints capture events at function boundaries (entry, exit, exceptions).
2. **Probes and Processing:**
    - Probes associated with tracepoints process data in real-time.
    - Support aggregation, filtering, and computation at tracepoints.
3. **Query Language:**
    - Queries specified in LINQ-like syntax for powerful, declarative control.
    - Queries are compiled into optimized code for efficient execution.
4. **Integration:**
    - Seamless use with PowerShell for Windows administrators.
    - Can target kernels, user processes, or entire clusters.

---

## **Mechanisms**

### **Dynamic Instrumentation**

- Modifies machine code at runtime to insert tracepoints.
- Uses **Windows hotpatching** for atomic code modifications.

### **Probe Execution**

- Probes are user-defined functions executed at tracepoints.
- Examples of probe tasks:
    - Count function calls.
    - Aggregate arguments (e.g., histogram of read sizes).
    - Filter rare events for detailed tracing.

### **Safe Machine Code**

- **XFI (eXtensible Framework Isolation):**
    - Ensures probes execute safely without compromising system integrity.
    - Probes confined to accessing and modifying specific memory regions.

### **Trace Data Aggregation**

- Data reduction applied at the source (e.g., CPU-local aggregation).
- Hierarchical aggregation reduces network load.

---

## **Evaluation and Use Cases**

### **Performance**

- **Overhead:**
    - Inline tracing achieves 10x lower overhead compared to traditional tools (e.g., DTrace, SystemTap).
- **Scalability:**
    - Handles thousands of machines while maintaining low latency.

### **Applications**

1. **Debugging:**
    - Capture and analyze rare or transient system events.
2. **Performance Optimization:**
    - Analyze function call frequency and argument distributions.
3. **Fault Diagnosis:**
    - Trace exceptional exits and runtime anomalies in distributed systems.

---

## **Limitations and Challenges**

1. **Debug Information:**
    - Fay relies on debug symbols for meaningful traces.
2. **Scope:**
    - Focused on function-boundary tracing; does not support arbitrary instruction-level instrumentation.
3. **Streaming:**
    - Current implementation is batch-driven; lacks real-time streaming of query results.

---

## **Conclusion**

- Fay demonstrates that general-purpose tracing platforms can achieve:
    - High expressiveness through declarative queries.
    - Efficiency comparable to specialized tools via optimized instrumentation.
- **Future Work:**
    - Extend FayLINQ for real-time queries.
    - Support for additional platforms like Linux.

---
