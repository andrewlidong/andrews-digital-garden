**

- Meetup 030 - [Borg the Next Generation](https://dl.acm.org/doi/abs/10.1145/3342195.3387517)
    

**

# Borg: The Next Generation (2011 vs 2019)

## Overview

Analysis of new 2019 Google Borg traces compared to 2011 traces, covering 8 different clusters for May 2019. Highlights changes and evolution in Google's cluster management over 8 years.

## Key Findings

### 1. Workload Changes

- Job submission rate 3.7× higher than 2011
- Task scheduling rate increased 7×
- Workload moved from free tier to best-effort batch tier
- Production tier usage remained constant
- Significant inter-cluster workload variation
- Extremely heavy-tailed distribution where top 1% jobs consume >99% resources

### 2. Resource Management Evolution

## Resource Usage

- Higher average utilization compared to 2011
- More aggressive over-commitment
- Memory over-allocation now comparable to CPU
- Best-effort batch tier now ~20% of capacity
- Reduced usage from free tier

## Machine Utilization

- 20-40% increase in median CPU utilization
- 3-30% increase in median memory utilization
- Lower variation in utilization
- Fewer machines with >80% CPU utilization
- Better workload distribution across cells

### 3. New Features

## Alloc Sets

- Resource reservation mechanism
- 2% of collections but 20% of CPU allocations
- 18% of RAM allocations
- Mainly used by production tier (95%)
- Higher memory utilization (73% vs 41%)

## Vertical Autoscaling

- Automated resource scaling (Autopilot)
- Three strategies:
    1. Not autoscaled
    2. Fully autoscaled
    3. Autoscaled with constraints
- Reduces peak NCU slack by >25%
- More efficient than manual configuration

## Job Dependencies

- Parent-child relationships
- Automatic cleanup of child jobs
- Explains high termination rates
- 87% of jobs with parents experience kill events

## Infrastructure Changes

### Cell Characteristics

- Similar size to 2011 (~12k machines/cell)
- Greater variety in CPU-memory ratios
- More hardware platforms (7 vs 3)
- More machine shapes (21 vs 10)

### Priority System

- Expanded priority range (0-450 vs 0-11)
- New tier structure:
    1. Free tier (≤99)
    2. Best-effort batch (110-115)
    3. Mid-tier (116-119)
    4. Production tier (120-359)
    5. Monitoring tier (≥360)

## Resource Consumption Analysis

### Distribution Characteristics

- Extremely high variability
    - CPU: C² = 23,312
    - Memory: C² = 43,476
- Power-law (Pareto) distribution
    - CPU: α = 0.69
    - Memory: α = 0.72
- Strong correlation between CPU and memory usage

### Hogs vs Mice Phenomenon

- Top 1% jobs ("hogs"):
    - 99.2% of CPU consumption
    - 99.1% of memory consumption
- Remaining 99% ("mice"):
    - <1% of resource consumption
    - Need isolation from hogs for better performance

## Scheduling Implications

### Queue Management

- High C² values affect queueing delay
- Need strategies to protect mice from hogs
- Resource correlation enables unified handling
- Scheduling rate increased despite similar cell sizes

### Load Distribution

- Better handling of machine utilization
- More even workload distribution
- Improved handling of peak loads
- Regional variations in load patterns

## Future Research Directions

1. Explainable Scheduling
    - Understanding scheduler decisions
    - Improving user guidance
2. Overcommitment Optimization
    - Statistical multiplexing limits
    - Risk/benefit trade-offs
3. Gang Scheduling Improvements
    - Beyond simple greedy heuristics
    - Start-time optimization
4. Utilization Enhancement
    - Understanding current limitations
    - Improvement strategies
5. Heavy Tail Management
    - Hog/mice isolation techniques
    - Performance optimization
6. Inter-cell Variations
    - Understanding differences
    - Optimization opportunities

## Data Considerations

### Trace Format

- BigQuery tables vs CSV files
- 2.8 TiB total data
- 350 GiB per cell (compressed)
- Improved accessibility via SQL

### Validation Methods

- Automated validation pipeline
- Logical invariant checking
- Repeatable analysis process
- Simplified data exploration


---

# **Borg: The Next Generation**

## **Abstract**

- This paper analyzes a new trace dataset covering **8 Borg clusters** for May 2019.
- **Key findings**:
    - **Heavy-tailed workloads**: Top 1% of jobs consume over 99% of resources.
    - Significant evolution in scheduling behavior compared to the 2011 dataset.
    - Features like **alloc sets**, **job dependencies**, and **vertical autoscaling** have matured.
    - Increased **workload mix** diversity and scheduler efficiency.
- Published to enhance cluster workload and scheduling research.

---

## **Introduction**

- Modern cluster management systems, such as Borg, efficiently handle large-scale, resource-intensive applications.
- **Comparative Analysis**:
    - 2011 trace: Single cluster, foundational in workload study.
    - 2019 trace: Eight clusters, enriched with detailed metadata for enhanced analysis.
- Research aims:
    - Understand workload evolution.
    - Examine the impact of cluster manager advancements on scheduling decisions.

---

## **Quick Summary of Borg**

- **System Architecture**:
    - Centralized **Borgmaster** scheduler and distributed **Borglets** on machines.
    - Logical clusters called **cells** as management units.
- **Key Features**:
    - Tiered job prioritization: Free, best-effort batch, mid-tier, production, monitoring.
    - Resource allocation: Fine-grained limits for CPU, memory, and other resources.
    - High-priority production jobs are protected from resource contention.

---

## **2011 vs. 2019 Traces**

### **High-Level Changes**

|Feature|2011 Trace|2019 Trace|
|---|---|---|
|Clusters (Cells)|1|8|
|Machines per Cell|~12,000|~12,000|
|Machine Shapes|10|21|
|Workload Priorities|0–11|0–450|
|Batch Queueing|No|Yes|
|Vertical Autoscaling|No|Yes|

### **Key Observations**

1. **Workload Distribution**:
    - Shifted from the free tier to best-effort batch jobs.
    - Production tier usage remained stable.
2. **Scheduling Rate**:
    - Job submission rate increased 3.7×.
    - Task scheduling grew 7×, but delays remained comparable.
3. **Resource Allocation**:
    - Overcommitment increased for both CPU and memory.
    - Better statistical multiplexing for higher utilization.

---

## **Resource Utilization**

- **2019 Improvements**:
    - CPU and memory usage across cells increased by 20–40%.
    - Reduced variance in machine utilization.
- **Heavy-Tailed Workloads**:
    - Top 1% of jobs (hogs) consume 99% of resources.
    - Remaining 99% (mice) consume negligible resources.
- **Machine Utilization**:
    - Improved distribution to avoid over- or under-utilization.

---

## **New Features in 2019**

1. **Alloc Sets**:
    - Resource reservation units for flexible workload deployment.
    - Represent 20% of CPU and 18% of RAM allocations.
2. **Job Dependencies**:
    - Parent-child relationships simplify job cleanup (e.g., MapReduce).
3. **Batch Queueing**:
    - Introduced queueing for best-effort batch workloads.
4. **Vertical Autoscaling**:
    - Autopilot dynamically adjusts resources to reduce slack and improve efficiency.

---

## **Evolution in Scheduling**

- **Job Submission**:
    - Median job arrival rate grew from 885 to 3309 jobs/hour.
- **Task Scheduling**:
    - Task scheduling rate grew 3.6×, with more churn due to rescheduling.
- **Delay Improvements**:
    - Median scheduling delays decreased, especially for production jobs.

---

## **Vertical Autoscaling**

- **Autopilot Strategies**:
    - **Fully Autoscaled**: Dynamic resource limits.
    - **Constrained Autoscaling**: Adjustments within predefined bounds.
    - **Manual**: Static user-defined resource requests.
- **Results**:
    - Reduced peak slack by over 25%.
    - Improved resource utilization and cost savings.

---

## **Lessons Learned from Trace Generation**

- Generating meaningful datasets required:
    - Cleaning and validating inconsistencies in Borg's extensive monitoring data.
    - Automating validation with distributed pipelines.
    - Leveraging BigQuery for efficient large-scale analysis.

---

## **Research Directions**

1. **Explainable Scheduling**:
    - Enhance interpretability of scheduler decisions for operators and users.
2. **Overcommitment Limits**:
    - Study trade-offs between higher utilization and failure risks.
3. **Improved Scheduling for Hogs and Mice**:
    - Isolate high-resource-consuming jobs from smaller workloads to reduce queuing delays.
4. **Inter-Cell Variations**:
    - Explore differences in workload behavior across clusters.

---

## **Conclusion**

- **Borg 2019 Trace**:
    - Reflects advances in workload diversity and cluster management.
    - Highlights extreme variability in job resource demands.
    - Provides a rich dataset for future research.
- **Impact**:
    - Demonstrates progress in managing warehouse-scale computing systems.
    - Sets a foundation for innovative scheduling and resource allocation methods.

---

Feel free to adapt or expand on specific sections to align with your group's focus!