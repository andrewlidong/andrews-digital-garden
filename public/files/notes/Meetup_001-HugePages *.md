**- Meetup 001 - on Huge Pages, Jan 24th, 2024 
    

- Paper: [Adaptive Hugepage Subrelease for Non-moving Memory Allocators in Warehouse-Scale Computers (2021)](https://research.google/pubs/adaptive-hugepage-subrelease-for-non-moving-memory-allocators-in-warehouse-scale-computers/)
    
- Addon: [Beyond malloc efficiency to fleet efficiency: a hugepage-aware memory allocator](https://research.google/pubs/beyond-malloc-efficiency-to-fleet-efficiency-a-hugepage-aware-memory-allocator/)
    
- Addon: [Unleashing the Power of Allocator-Aware Software Infrastructure — BDE Documentation documentation](https://bloomberg.github.io/bde/white_papers/unleashing-aa-software.html)
    
- We’re switching it up a little this week, with one main paper and two other potential papers.**

# Adaptive Huge-Page Subrelease for Non-moving Memory Allocators

**Authors**: Martin Maas, Chris Kennelly, Khanh Nguyen, Darryl Gove, Kathryn S. McKinley, Paul Turner  
**Affiliation**: Google Inc., Texas A&M University  
**Conference**: ISMM 2021, ACM Symposium on Memory Management

## Overview

- **Purpose**: Introduce an **adaptive huge-page subrelease mechanism** to optimize the performance of **memory allocators** in warehouse-scale data centers, specifically for non-moving memory allocators like **TCMalloc**.
- **Problem Addressed**: Balancing **memory fragmentation** and **performance** by managing the use and release of huge pages (2 MB).
- **Key Contribution**: Developing a new **adaptive release policy** and a metric called **realized fragmentation** that better captures the impact of memory release strategies on system-wide performance.

## Key Concepts

### Huge Pages and Memory Allocators

- **Huge Pages**: Using 2 MB huge pages instead of standard 4 KB pages can improve **TLB hit rates** and CPU efficiency.
- **User-Level Allocators**: TCMalloc is a memory allocator designed to manage memory at huge page granularity to achieve high performance.
- **Fragmentation Issue**: Allocating memory from the OS at 2 MB chunks can lead to **fragmentation**—if part of a huge page remains allocated, it becomes inefficient to return the rest of the page to the OS.

### Problem and Trade-off

- **Static Release Policies**: Current huge page-aware allocators break up huge pages when returning memory to the OS. This results in reduced performance, especially when the released memory is quickly reallocated.
- **Multiple Applications**: In data centers, multiple workloads often share a machine, and memory release is only beneficial if other applications can use the released memory effectively.

## Contributions

### Realized Fragmentation Metric

- **Traditional Fragmentation Metrics** are misleading as they may count **short-lived free memory** that cannot be effectively reused.
- **Realized Fragmentation**: Represents memory that is free for long enough to be reused by other workloads. This metric provides a more accurate assessment of memory utilization, particularly in warehouse-scale environments.

### Adaptive Release Policy

- **Adaptive Subrelease Mechanism**:
    - Uses **historical memory usage** to decide whether to break up a huge page.
    - If a huge page has been **partially freed**, the allocator considers how likely the memory will be needed soon before deciding to break it up.
    - This dynamic approach improves huge page coverage and reduces unnecessary subrelease, which negatively affects performance.

## System Design and Implementation

### TCMalloc Enhancements

- TCMalloc was modified to include the adaptive subrelease policy, considering the **recent peak memory usage** within a specific time interval (denoted as **Δ**).
- **Release Rate and Δ**:
    - The release rate determines how quickly free pages are returned to the OS.
    - The parameter Δ represents the time window used to predict whether memory will be needed again soon.

### Realized Fragmentation Tracking

- Implemented using a **time series** that tracks memory usage over the last Δ interval.
- The allocator only releases memory if it estimates that the released memory will not be needed for at least Δ time, improving system stability and performance.

## Evaluation

### Redis Workload

- Experiments on a **Redis** server workload showed:
    - Improved **huge page coverage** (91% vs. 73% without adaptive subrelease).
    - **Reduced fragmentation** without impacting overall system performance.

### Proprietary Workloads

- Deployed in **Google data centers**:
    - **Web Server Workload**: Improved throughput by 0.9% with better huge page coverage (98% vs. 87%).
    - **Storage Backend**: Reduced **minor page faults** by 50% and improved huge page coverage by 3.12×.

### Fleet-Wide Results

- Rolled out across Google’s fleet, adaptive subrelease improved **application throughput by 1.44%** for latency-tolerant workloads.
- **Huge Page Coverage** increased from **58% to 72%**, while the number of **broken huge pages** decreased by 40%.

## Conclusion

- **Fleet-wide Impact**: The adaptive subrelease mechanism demonstrated a **1% throughput improvement** across Google’s data centers, a significant gain for highly optimized production systems.
- **Realized Fragmentation**: By focusing on long-lived free memory, the new metric better aligns allocator performance with overall system efficiency.
