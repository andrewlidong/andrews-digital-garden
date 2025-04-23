

---

# **Dhalion: Self-Regulating Stream Processing in Heron**

## **Abstract**

- **Problem:** Manual tuning of stream processing systems is time-consuming, error-prone, and inadequate for maintaining Service Level Objectives (SLOs) under unpredictable load variations and performance degradations.
- **Solution:** Dhalion:
    - Adds self-regulating capabilities to stream processing systems.
    - Implements policies for auto-tuning, self-stabilizing, and self-healing.
- **Implementation:** Built on Twitter's Heron, evaluated in cloud environments, demonstrating effectiveness in meeting throughput SLOs and scaling resources dynamically.

---

## **Introduction**

- **Real-Time Analytics Needs:**
    - Analyze massive data streams in real-time (e.g., trending topics on Twitter, detecting system failures).
    - Growing reliance on distributed streaming systems like Apache Storm, Spark Streaming, Heron.
- **Challenges in Stream Processing:**
    - Manual configuration of resource allocation and fault management.
    - Handling unpredictable workload spikes and maintaining SLOs without resource overprovisioning.
- **Key Goals of Dhalion:**
    1. **Self-Tuning:** Automatically optimize configuration parameters for throughput and resource efficiency.
    2. **Self-Stabilizing:** React to load variations dynamically to ensure SLO adherence.
    3. **Self-Healing:** Identify and resolve system degradations caused by slow or failing components.

---

## **Dhalion Overview**

- **Design Philosophy:**
    - Modular and extensible architecture.
    - Policies define system behavior during instability.
- **Key Components:**
    1. **Symptom Detection:** Identify issues in system health (e.g., backpressure, processing skew).
    2. **Diagnosis Generation:** Pinpoint root causes of detected symptoms (e.g., underprovisioning, slow instances).
    3. **Resolution Phase:** Apply corrective actions to resolve diagnosed issues (e.g., scaling resources, relocating tasks).

---

## **Dhalion Architecture**

### **Core Components**

1. **Health Manager:**
    - Periodically invokes policies to monitor and adjust topology health.
    - Supports invasive (resource adjustments) and non-invasive (alerts only) policies.
2. **Action Log:**
    - Logs all policy actions for debugging and tuning.
3. **Action Blacklist:**
    - Prevents repeating actions that previously failed to resolve an issue.

### **Policy Workflow**

- **Phases of Policy Execution:**
    1. **Symptom Detection:**
        - Collect metrics (e.g., tuple processing rates, queue sizes) to detect potential bottlenecks.
        - Examples:
            - **Backpressure:** Indicates insufficient resources or load imbalance.
            - **Processing Skew:** Uneven workload distribution across tasks.
    2. **Diagnosis Generation:**
        - Use collected symptoms to diagnose root causes.
        - Examples:
            - **Underprovisioning Diagnoser:** Insufficient parallelism causing backpressure.
            - **Slow Instances Diagnoser:** Identify tasks lagging due to hardware/software issues.
            - **Data Skew Diagnoser:** Uneven data distribution causing overload on specific tasks.
    3. **Resolution Phase:**
        - Invoke resolvers to apply fixes:
            - **Scale Up Resolver:** Add parallelism to overloaded stages.
            - **Restart Resolver:** Relocate tasks running on underperforming hardware.
            - **Data Skew Resolver:** Adjust hash functions to balance load.

---

## **Use Cases**

### **1. Dynamic Resource Provisioning**

- **Problem:** Manual overprovisioning wastes resources; underprovisioning violates SLOs.
- **Solution:** Dynamically scale resources up or down based on load.
- **Workflow:**
    - Detect backpressure or idle resources.
    - Diagnose root cause (e.g., underprovisioning or overprovisioning).
    - Adjust resources accordingly (e.g., add/remove instances).
- **Example:**
    - Increased tweet volume due to global events triggers scale-up.
    - Stabilized load triggers scale-down.

### **2. Throughput SLO Policy**

- **Problem:** Ensuring throughput meets specific thresholds without manual tuning.
- **Solution:** Automatically adjust spout and bolt parallelism to meet user-defined SLOs.
- **Workflow:**
    - Compare observed throughput against SLO.
    - Scale spout/bots to match throughput demand.
    - Alert users if SLO cannot be met due to external constraints.

---

## **Evaluation**

### **Key Findings:**

1. **Dynamic Load Handling:**
    - Automatically adjusts resources during spikes or declines in workload.
2. **Throughput Optimization:**
    - Meets throughput SLOs by reconfiguring topology dynamically.
3. **Resilience to Noise:**
    - Ignores transient metric fluctuations to prevent unnecessary actions.
4. **Complex Scenarios:**
    - Handles mixed conditions (e.g., simultaneous underprovisioning and slow instances).
5. **Efficiency:**
    - Reduces manual intervention while maintaining system stability and performance.

---

## **Lessons Learned**

- **Modularity Benefits:**
    - Independent symptom detectors, diagnosers, and resolvers improve reusability and debugging.
- **Threshold Challenges:**
    - Diagnosers rely on thresholds for outlier detection; incorrect thresholds may produce suboptimal diagnoses.
- **Future Opportunities:**
    - Explore machine learning for more accurate diagnosis generation and policy optimization.

---

## **Conclusion**

- **Impact:** Dhalion adds robust self-regulation capabilities to streaming engines, reducing operator burden and improving reliability.
- **Future Work:**
    - Incorporate latency-based SLO policies.
    - Apply Dhalion concepts to batch processing and machine learning systems.
    - Enhance decision-making with predictive analytics and ML models.

---

Let me know if you'd like further refinements or additional details!