**

- Meetup 012 - [Dynamo: Facebook’s Data Center-Wide Power Management System](https://research.facebook.com/publications/dynamo-facebooks-data-center-wide-power-management-system/)
    

**

Here are my organized Obsidian notes for the Dynamo paper:

# Dynamo: Facebook's Data Center Power Management System

## Overview
- Data center-wide power management system deployed at Facebook
- Monitors entire power hierarchy and makes coordinated control decisions 
- Enables safe and efficient use of provisioned data center power
- Running in production across all Facebook data centers for 3+ years

## Power Delivery Infrastructure

### [[Power Hierarchy]]
- Local utility supplies 30MW to data center
- Main Switch Boards (MSBs) rated at 2.5MW
- Switch Boards (SBs) rated at 1.25MW
- Reactive Power Panels (RPPs) rated at 190KW 
- Rack power shelves rated at 12.6KW
- Power oversubscribed at each level

### [[Circuit Breaker Behavior]]
- Breakers trip based on:
  - Current exceeding rated limit
  - Duration of overdraw
- Lower level devices sustain more overdraw
- Trip times inversely proportional to overdraw amount
- RPPs/Racks sustain 10% overdraw for ~17 minutes

## System Design 

### [[Dynamo Components]]
1. **Agent**
   - Lightweight program on each server
   - Reads power consumption
   - Executes power capping commands
   - Communicates with controllers

2. **Controllers**
   - Leaf controllers for lowest level devices  
   - Upper-level controllers for higher hierarchy
   - Monitor power usage
   - Make capping decisions
   - Coordinate across levels

### [[Control Architecture]]
- Distributed controller hierarchy mirrors power hierarchy
- Controllers communicate via Thrift RPC
- 3-second sampling cycle for leaf controllers
- 9-second cycle for upper-level controllers
- Three-band algorithm for capping decisions

### [[Performance-Aware Capping]]
- Services categorized into priority groups
- High priority services capped last
- Within priority groups:
  - High-bucket-first algorithm
  - Even power cuts within buckets
  - SLA lower bounds enforced

## Production Results

### [[Power Management Benefits]]
- Prevented 18 potential outages in 6 months
- Enabled 13% performance boost for Hadoop
- Enabled 40% performance boost for Search  
- Allowed 8% more servers in existing data centers

### [[Real-World Case Studies]]
1. Load Test Capping
   - PDU breaker protection
   - 6-second response time
   - Minimal performance impact

2. Site Outage Recovery  
   - Protected SB during power surge
   - Coordinated multi-level response
   - Prevented cascading failures

### [[Workload Impact]]
- Web server performance vs power caps:
  - <20% power reduction: minimal impact
  - >20% power reduction: increased latency
- Service-aware capping minimizes critical workload impact
- Load balancing helps mitigate capped server performance

## Lessons Learned

### [[Key Takeaways]]
- Monitoring as critical as capping
- Service-aware design simplifies testing
- Hardware-agnostic design important
- Simple design enables reliability at scale
- Accurate power estimation needed

### [[Future Directions]] 
- Enhanced capping algorithms
- New emergency response actions
- More aggressive power subscription
- Improved power efficiency

#datacenter #power-management #distributed-systems