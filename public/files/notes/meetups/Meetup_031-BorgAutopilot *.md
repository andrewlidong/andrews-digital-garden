**

- Meetup 031 - [Borg Autopilot](https://dl.acm.org/doi/abs/10.1145/3342195.3387524)
    

**

# Autopilot: Workload Autoscaling at Google

**Authors**: Krzysztof Rzadca, Pawel Findeisen, Jacek Swiderski, Przemyslaw Zych, Przemyslaw Broniek, et al.

**Conference**: EuroSys '20

## Overview

- **Purpose**: Introduce _Autopilot_, Google's automated system for workload autoscaling in the cloud to reduce resource wastage while ensuring optimal performance.
- **Problem**: Users tend to over-provision CPU and memory for workloads to avoid throttling or crashes, leading to **resource wastage**.
- **Solution**: Autopilot provides **automatic resource scaling**, both horizontally (task count) and vertically (CPU/memory limits per task) using **machine learning** and **historical data**.

---

## Key Concepts

### Autoscaling Approaches

- **Horizontal Scaling**: Adjusting the number of tasks (or instances) for a given workload based on the demand.
- **Vertical Scaling**: Adjusting the resources (CPU and memory) allocated to each task dynamically.

### Challenges of Manual Resource Allocation

- Users **overestimate** resources, causing low resource utilization.
- Changing workload requirements over time due to **diurnal patterns**, **software updates**, and **feature changes** make manual adjustment inefficient.
- Resource misallocation leads to **performance issues** (e.g., CPU throttling or OOM - Out of Memory - errors).

### Autopilot’s Goal

- **Minimize Slack**: Slack is the difference between allocated resources and actual usage.
- **Reduce OOM Events**: Minimize the risk of tasks being terminated due to running out of memory.
- Achieve **optimal resource utilization** without impacting workload performance.

---

## System Architecture

### Borg Integration

- **Borgmaster**: The centralized scheduler in Google's infrastructure that works with **Borglets** (agents on each machine).
- **Autopilot Service**: Interfaces with Borgmaster to adjust resources dynamically.
    - **Recommender**: Uses **historical usage data** to predict the optimal limits for tasks.
    - **Actuator**: Enforces changes in resource limits or task count.

### Data Flow

- Resource usage is monitored and logged.
- **Machine Learning Algorithms** and **historical data** are used to recommend adjustments.
- Borgmaster applies changes via Borglets.

---

## Algorithms for Vertical Scaling

1. **Sliding Window Algorithm**:
    - Uses historical data with **exponentially decaying weights** to adjust limits.
    - Works well for smoothing out short-term load spikes.
2. **ML-Based Meta Algorithm**:
    - Applies a **reinforcement learning approach** to optimize resource allocation.
    - Runs multiple variations of the sliding window algorithm and selects the one with the **best historical performance**.

### Resource Limits for Jobs

- **Memory Management**:
    - Different approaches for OOM-sensitive jobs vs. those more tolerant of failures.
    - Methods used: Maximum of recent samples, 98th percentile, or load-adjusted peak.
- **CPU Limits**:
    - Batch jobs use average load.
    - Latency-sensitive jobs use 90-95th percentile values.

---

## Evaluation and Results

- **Reduction in Slack**:
    - Autopilot achieves an average slack of **23%** compared to **46%** for manually managed jobs.
- **Improved Reliability**:
    - Jobs using Autopilot experienced **10x fewer OOM errors** compared to manual limits.
- **Adoption Challenges**:
    - Encouraging adoption required making Autopilot's recommendations visible and providing easy opt-in capabilities.

### Key Metrics Used

- **Footprint**: Measure of resources allocated.
- **Slack**: Difference between allocated vs. used resources.
- **OOM Rate**: Frequency of tasks running out of memory.

---

## Horizontal Scaling

- Adjusts the number of tasks based on metrics such as **CPU utilization** and **job-specific factors**.
- Requires more customization by job owners to define appropriate metrics for scaling decisions.

### Smoothing Techniques

- **Deferred Downscaling**: Delays task removal to prevent rapid changes.
- **Slow Decay**: Gradual reduction in the number of tasks.
- **Growth Limits**: Restrictions on how many new tasks can be initiated at once.

---

## Lessons Learned

- **Default Opt-In**: Autopilot is becoming the default for most workloads to ensure better resource efficiency.
- **Trust Building**: Developing user trust involved showing reliability and providing detailed insights into Autopilot’s decisions.
- **High Availability**: The infrastructure is designed to be **resilient** to failures, with tasks being easily replaced or redistributed as needed.

---

## Conclusion

- **Impact**: Autopilot is responsible for autoscaling **over 48%** of Google's fleet, significantly improving resource efficiency.
- **Future Work**: Further expansion of autoscaling capabilities, particularly exploring additional machine learning models and optimizations for new workload patterns.



---

# **Autopilot: Workload Autoscaling at Google**

## **Abstract**

- **Problem:** Cloud users must specify resource limits (CPU, RAM) for workloads, often leading to over-provisioning.
- **Solution:** Google’s **Autopilot** automatically adjusts:
    - **Horizontal scaling:** Number of job replicas.
    - **Vertical scaling:** Resource limits for individual tasks.
- **Benefits:**
    - Reduces resource slack to 23% compared to 46% for manual configurations.
    - Reduces severe out-of-memory (OOM) events by a factor of 10.
- Adoption is facilitated via user-friendly recommendations and automated migration tools.
- Autopiloted jobs account for 48% of Google’s fleet-wide resource usage.

---

## **Introduction**

- **Challenge:** Predicting optimal resource limits is complex due to:
    - Diurnal/weekly workload variations.
    - Traffic fluctuations over time.
    - Changes in software or hardware stacks.
- Overestimations waste resources; underestimations lead to OOM errors or throttling.
- **Goal:** Automate resource management to balance utilization and reliability.

### **Key Features of Autopilot**

1. **Horizontal Autoscaling:** Adjusts job replicas dynamically.
2. **Vertical Autoscaling:** Adjusts CPU and memory limits for individual tasks.
3. **Machine Learning Integration:** Leverages historical usage data and heuristics.

---

## **Borg Overview**

### **Infrastructure**

- Clusters consist of thousands of physical machines across regions.
- Tasks run in Linux containers managed by **Borgmaster** and **Borglet** agents.
- Resource limits ensure performance isolation.

### **Job Categories**

1. **Serving Jobs:**
    - Require low-latency, high-reliability.
    - Resources explicitly reserved.
2. **Batch Jobs:**
    - Focus on throughput, utilize leftover resources.

### **Resource Management**

- CPU and RAM limits enforce isolation.
- Tasks exceeding limits:
    - **CPU:** Throttled via cgroups.
    - **Memory:** Terminated with OOM errors.

---

## **Autopilot Architecture**

- **Components:**
    - **Recommenders:** Propose resource adjustments based on past usage.
    - **Actuator Service:** Implements recommendations by communicating with Borgmaster.
    - **Monitoring System:** Collects usage data.

### **Data Flow**

1. Usage data aggregated in 5-minute windows.
2. Recommenders evaluate historical trends.
3. Recommendations passed to Borgmaster.
4. Adjustments applied (e.g., resizing tasks, adding replicas).

---

## **Vertical Autoscaling**

### **Goals:**

- Reduce slack (unused resources).
- Avoid OOM errors and CPU throttling.

### **Recommenders**

1. **Sliding Window Algorithms:**
    - Use weighted historical data with exponential decay.
    - Key metrics:
        - **Peak (Smax):** Captures highest resource usage.
        - **Percentiles (e.g., S95):** Targets specific load tolerances.
    - Tuning: Memory recommendations prioritize stability; CPU recommendations favor agility.
2. **Machine Learning Models:**
    - Optimizes limits by balancing costs (overrun, underrun, limit changes).
    - Uses historical costs to refine recommendations.

### **Post-Processing**

- Adds safety margins (e.g., 10–15%).
- Smooths fluctuations by averaging recent values.

---

## **Horizontal Autoscaling**

### **Mechanisms:**

1. **CPU Utilization-Based Scaling:**
    - Adjust replicas based on average or percentile CPU usage.
2. **Custom Metrics:**
    - Users define metrics like queue size or file space managed.

### **Stabilization Policies:**

- **Deferred Downscaling:** Delays reductions for stability.
- **Slow Decay:** Gradually terminates excess replicas.
- **Growth Limiting:** Caps initialization rates.

---

## **Evaluation**

### **Metrics**

1. **Slack:**
    - Relative slack: Fraction of unused resources.
    - Absolute slack: Total unused resources in machine-equivalent units.
2. **Reliability:**
    - OOM rate per task-day.
    - Percentage of OOM-free job-days.
3. **Efficiency:**
    - Number of limit changes per day.

### **Findings**

1. **Slack Reduction:**
    - Manual jobs: 46% slack.
    - Autopiloted jobs: 23% (ML) and 31% (Sliding Window).
    - Savings translate to ~12,000 machine equivalents.
2. **OOM Reliability:**
    - 99.5% of Autopiloted job-days are OOM-free.
    - OOM rates 5–10× lower than manually managed jobs.
3. **Stability:**
    - Median jobs experience <6 limit changes/day.

---

## **Adoption Strategies**

1. **User-Friendly Interface:**
    - Transparent recommendations for non-opt-in jobs.
    - Supports custom recommenders.
2. **Automated Migration:**
    - Migrates jobs gradually, retaining user overrides.
3. **Dry Runs & A/B Testing:**
    - Validates new recommenders before production rollout.

---

## **Lessons Learned**

1. **High Variability:**
    - Long-running jobs benefit most from historical data.
    - Short-lived jobs are cautiously scaled.
2. **Trade-Offs:**
    - Occasional OOMs accepted for aggressive resource optimization.
    - Trust-building essential for user adoption.
3. **Iterative Tuning:**
    - Simulations and monitoring refine algorithms over time.

---

## **Future Directions**

1. **Advanced ML Techniques:**
    - Integrate reinforcement learning for continuous improvement.
2. **Cross-Job Optimization:**
    - Explore interdependencies for better scaling decisions.
3. **User Education:**
    - Empower users to understand and trust automated decisions.

---

## **Conclusion**

- Autopilot demonstrates significant improvements in resource utilization and reliability.
- Google’s approach highlights the importance of balancing automation with user trust.
- Paves the way for widespread adoption of autoscaling solutions in cloud systems.

---
