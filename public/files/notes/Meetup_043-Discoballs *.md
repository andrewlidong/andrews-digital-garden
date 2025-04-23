

---

# **Beyond Fat-Trees Without Antennae, Mirrors, and Disco-Balls**

## **Abstract**

- **Problem:** Current data center network designs rely heavily on either:
    1. Expensive, full-bandwidth static topologies (e.g., fat-trees).
    2. Dynamic, reconfigurable topologies requiring costly optical/wireless setups.
- **Proposal:**
    - Static, cabling-friendly, and cost-effective network topologies can achieve comparable performance without reconfiguration.
    - Static networks outperform dynamic counterparts for skewed traffic at the same cost.
- **Contributions:**
    1. Introduced a metric for **network flexibility** to evaluate topologies for skewed traffic.
    2. Compared static vs. dynamic networks under optimal conditions.
    3. Demonstrated efficient routing for static networks.
    4. Proposed deployable alternatives to current data center designs.

---

## **Introduction**

- **Context:**
    - Large-scale data centers (e.g., with 100K+ servers) face significant challenges in achieving cost-efficient, high-bandwidth connectivity.
    - Skewed traffic patterns (hotspots) exacerbate inefficiencies in traditional designs.
- **Two Approaches:**
    1. **Static Networks:** Fat-trees are bandwidth-limited for non-uniform traffic.
    2. **Dynamic Networks:** Use optical/wireless connections to adapt topology in real-time but at higher cost and complexity.
- **Research Goals:**
    - Evaluate the potential of static networks for handling skewed traffic.
    - Demonstrate that static networks, using modern designs, can match or outperform dynamic solutions.

---

## **Key Contributions**

1. **Metric for Network Flexibility:**
    - Introduced "Throughput Proportionality" (TP) as a measure of a network’s ability to handle skewed traffic.
    - TP evaluates how throughput scales as the number of active servers decreases.
2. **Static vs. Dynamic Comparison:**
    - Used fluid-flow models to compare ideal static and dynamic networks under skewed traffic.
    - Static networks achieve equivalent performance at lower cost.
3. **Routing on Static Networks:**
    - Static designs like **Xpander** and **Jellyfish** enable efficient, oblivious routing.
4. **Deployable Alternatives:**
    - Highlighted deployable, cabling-friendly topologies like **Xpander**, offering better performance than current fat-trees.

---

## **Metric: Throughput Proportionality**

- **Definition:**
    - Measures throughput per active server as the fraction of participating servers decreases.
    - Ideal network is throughput-proportional, achieving full per-server bandwidth for smaller active subsets.
- **Challenges:**
    - Fat-trees struggle with skewed traffic and are bottlenecked even when unused capacity exists.

---

## **Static Network Designs**

### **State-of-the-Art Topologies**

1. **Xpander:**
    - Based on expander graphs for low-diameter, high-connectivity.
    - Cabling-friendly with deterministic design for simplicity.
2. **Jellyfish:**
    - Randomized design with high throughput for diverse workloads.
3. **SlimFly:**
    - Optimized for minimal latency with fewer switches and links.

### **Key Advantages:**

- Avoid hierarchical layers, directly wiring ToRs for better performance.
- Substantial cost savings (~33%) compared to fat-trees.

---

## **Dynamic Network Designs**

- **Key Features:**
    - Use optical or wireless links to adapt connectivity based on traffic.
    - Examples include ProjecToR and FireFly.
- **Limitations:**
    - Higher hardware costs (e.g., optical components).
    - Operational challenges like reconfiguration latency and reliability.
- **Cost Comparison:**
    - Static networks have a lower per-port cost than dynamic setups.

---

## **Evaluation**

### **Static vs. Dynamic Networks**

1. **Fluid-Flow Model Results:**
    - Static networks outperform dynamic ones under skewed workloads.
    - Xpander achieves near-optimal throughput even without dynamic reconfiguration.
2. **Cost Efficiency:**
    - Static designs achieve comparable performance at 2/3 the cost of dynamic networks.
3. **Scalability:**
    - Static networks scale efficiently with modern workloads.

### **Routing Efficiency**

1. **Oblivious Routing:**
    - Simple routing strategies (e.g., ECMP, Valiant Load Balancing) perform well.
    - Hybrid approaches (e.g., ECMP-VLB) balance short and long flows effectively.
2. **Performance under Skewed Workloads:**
    - Xpander and Jellyfish provide consistent performance even with dynamic traffic shifts.

---

## **Comparison with Fat-Trees**

- **Challenges with Fat-Trees:**
    - Limited flexibility for skewed traffic.
    - Inefficient use of capacity during non-uniform workloads.
- **Static Network Benefits:**
    - Equal-cost static designs (e.g., Xpander) outperform oversubscribed fat-trees.
    - Provide higher throughput and lower latency for skewed traffic.

---

## **Future Directions**

1. **Improving Static Designs:**
    - Investigate hybrid designs combining static and dynamic elements.
    - Optimize routing algorithms for expander-based networks.
2. **Evaluating Larger Scales:**
    - Study performance at exascale data centers with diverse workloads.
3. **Dynamic Networks:**
    - Explore cost-effective methods to overcome reconfiguration and reliability challenges.

---

## **Conclusion**

- **Key Findings:**
    - Static network designs like Xpander and Jellyfish challenge the notion that dynamic networks are essential for skewed traffic workloads.
    - These designs achieve high throughput and flexibility at reduced cost.
- **Implications:**
    - Future data center networks can achieve substantial performance and cost gains by adopting advanced static topologies.

---

