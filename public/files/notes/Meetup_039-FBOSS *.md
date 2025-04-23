**

- Meetup 039 - [FBOSS: Building Switch Software at Scale - Meta Research](https://research.facebook.com/publications/fboss-building-switch-software-at-scale/)
    

**

# FBOSS: Building Switch Software at Scale

**Authors**: Sean Choi, Boris Burkov, Alex Eckert, Tian Fang, Saman Kazemkhani, Rob Sherwood, Ying Zhang, Hongyi Zeng  
**Affiliation**: Facebook Inc., Stanford University  
**Conference**: SIGCOMM 2018

## Overview

- **FBOSS** is an in-house switch software developed by Facebook to overcome the limitations of conventional, vendor-supplied networking software.
- Designed using **Switch-as-a-Server** and **Deploy-Early-and-Iterate** principles to manage Facebook's large-scale data center network.
- Allows for rapid iteration, testing, deployment, and management, enabling a 30x growth in the number of FBOSS instances over two years.

## Motivation

- **Vendor Limitations**: Traditional switch software is often **closed-source** and includes many unnecessary features, resulting in high complexity and difficulty in managing cloud-scale data centers.
- **Custom Requirements**: Facebook's data center requirements differ from other vendors, necessitating a **leaner, tailored switch software** to meet their unique needs effectively.

## Key Design Principles

### 1. Switch-as-a-Server

- Treat switches as servers: run **switch software in the same way** Facebook runs server-side software.
- Use general-purpose hardware (e.g., **x86 CPUs**) within switches, allowing the use of commodity servers for network operations.
- Software components in FBOSS are continuously updated and treated as part of Facebook’s standard software development lifecycle.

### 2. Deploy-Early-and-Iterate

- FBOSS was initially deployed with **minimal features**, emphasizing a fast feedback loop to derive the actual necessary features dynamically.
- Iterative deployment allowed for **early production impact** and the ability to quickly fix any issues found in practice.

## FBOSS Architecture

### Hardware and Software Components

- FBOSS interacts with several switch components:
    - **Switch ASIC**: Custom silicon designed for fast packet processing.
    - **PHY**: Connects ASIC to physical medium, handling noise reduction and signal processing.
    - **CPU Board**: An x86 microserver that allows for running Linux, enabling rich monitoring and management features.

### Key Modules

- **FBOSS Agent**: The core process managing ASIC interactions, responsible for handling hardware and software abstractions.
- **QSFP Service**: Manages physical network ports (e.g., monitoring insertion/removal).
- **State Management**: Uses a **copy-on-write tree** model for state management, allowing high concurrency and easy versioning of network state.

### Deployment and Testing

- **fbossdeploy**: A specialized deployment framework that allows continuous integration and safe deployment by reacting to network-wide failures.
- FBOSS uses a **three-tier deployment model**:
    - **Continuous Canary**: Deploys new code to a few switches.
    - **Daily Canary**: Deploys to more switches for longer-term testing.
    - **Staged Deployment**: Full deployment with manual intervention.

## Operational Experience and Challenges

### Rapid Deployment Risks

- **Warm Boot**: Restarting the control plane without affecting the data plane allowed for rapid updates, but led to state management complexities.
- **Cascading Failures**: Initial deployments occasionally led to cascading switch failures due to misconfigurations, which highlighted the need for **control plane policing** to mitigate rapid packet routing loops.

### Interoperability Issues

- **Link Aggregation Challenges**: FBOSS needed modifications to ensure interoperability with third-party network devices, demonstrating the advantage of having direct control over the software stack.

## Advantages and Insights

- **Modularity**: The separation of various functions (e.g., QSFP service) has improved reliability and allowed isolated changes.
- **Rapid Feature Addition**: Due to Facebook's control over the codebase, they can quickly add and test new features compared to relying on vendor-supplied implementations.
- **Open Source and Experimentation**: FBOSS is made available as an open-source project, providing a platform for network research and collaboration.


# FBOSS: Building Switch Software at Scale
#networking #facebook #datacenter #paper

## Paper Overview
- Published: SIGCOMM '18
- Authors: Facebook Network Systems team
- Focus: Building and deploying custom switch software at scale

## Abstract & Introduction

### Problem Statement
- Vendor-supplied switch software has limitations:
	- Proprietary and closed-source nature
	- Excess features rarely utilized fully
	- Misalignment with cloud-scale requirements
	- [[Vendor Lock-in]]

### FBOSS Solution
Facebook's custom switch software built on two principles:
1. [[Switch-as-a-server]]
2. [[Deploy-early-and-iterate]]

### Impact & Results
- Timeline: Successfully operated for 5+ years
- Growth: 30x increase in FBOSS instances over 2 years
- Benefits:
	- Rapid iteration capability
	- Improved testing workflows
	- Scalable deployment

### Business Context
- Scale factors:
	- Network connects 100,000s of servers
	- Serves billions of users
	- Small improvements = large impact
- Traditional vendor model limitations:
	- Assumes common requirements across customers
	- Not suitable for hyperscale operations

## Related Notes
- [[Data Center Networking]]
- [[Network Operating Systems]]
- [[Facebook Infrastructure]]

###### Tags
#networking #infrastructure #facebook #datacenter #switch-software

# FBOSS Design Principles
#networking #facebook #design

## Two Core Principles

### 1. Switch-as-a-Server
- Motivation:
   - Leverage experience from building large-scale software services
   - Apply successful server practices to switch management
   - Treat switches like any other distributed system

- Key Benefits:
   - Better reliability
   - Increased agility
   - Operational simplicity
   - Rapid deployment capability

- Example Implementation:
   - Like database deployment:
   	- Open source base
   	- Heavy customization for internal use
   	- Daily code modifications
   	- Continuous integration
   	- Staged deployment
   	- Commodity hardware usage

### 2. Deploy-Early-and-Iterate
- Core Philosophy:
   - Start with minimal features
   - Deploy to production early
   - Iterate based on real needs
   - Avoid implementing "must-have" features until proven necessary

- Initial Deployment Strategy:
   - Skipped traditional "must-have" features:
   	- Control plane policing
   	- ARP/NDP expiration
   	- IP fragmentation/reassembly
   	- Spanning Tree Protocol (STP)
   - Focused instead on:
   	- Infrastructure building
   	- Tooling development
   	- Efficient update systems
   	- Warm boot capabilities

- Benefits:
   - Faster development cycle
   - Smaller initial team needed
   - Early production impact
   - Naturally minimal feature set
   - Resource efficiency

## Impact
- Derived simplest possible network for environment
- Quick positive impact on production network
- Justified additional engineering resources
- Many "must-have" features still not implemented years later

## Related Concepts
- [[Continuous Deployment]]
- [[Infrastructure as Code]]
- [[Network Automation]]
- [[DevOps]]

###### Tags
#network-design #infrastructure #deployment #automation #best-practices

# FBOSS Hardware Platform
#networking #hardware #infrastructure

## Key Components

### Switch ASIC
- Core hardware for packet processing
- Capabilities:
   - Up to 12.8 terabits per second switching
   - Specialized integrated circuit
   - Memory types: CAM, TCAM, SRAM

- Main Components:
   1. Memory
   	- Quick access storage
   	- Stores packet processing info
   2. Parse Pipeline
   	- Parser and deparser
   	- Locates/extracts data from packets
   	- Rebuilds packets before egress
   3. Match-action Units
   	- Processes packets based on:
   		- Packet data
   		- Processing logic
   		- ASIC memory content

### PHY (Physical Layer)
- Purpose:
   - Connects link-layer to physical medium
   - Translates analog ↔ digital signals

- Key Features:
   - Can be ASIC-integrated
   - Requires noise reduction
   - PHY tuning capabilities:
   	- Preemphasis control
   	- Variable power settings
   	- Forward Error Correction selection

### Port Subsystem
- Responsibilities:
   - Port configuration management
   - Port type detection
   - Port initialization
   - PHY interaction interface

- QSFP Ports:
   - Compact, hot-pluggable transceivers
   - Up to 100Gb/s data rates
   - Dynamic lane mapping
   - Health monitoring

### CPU Board
- Components:
   - x86 CPU
   - RAM
   - Storage medium
   - PCI-E ASIC interconnect

- Design Choices:
   - Uses commodity Linux
   - Server-grade CPU power
   - Example: Wedge 100 uses Quad Core Intel E3800
   - Runs under 40% utilization
   - Size limitations prevent more powerful CPUs

## Event Handlers

### Link Event Handler
- Purpose: Notifies ASIC/FBOSS of port events
- Implementation:
   - Busy polling method
   - Monitors PHY status
   - Calls user-supplied callbacks
   - Syncs link states

### Slow Path Packet Handler
- Function:
   - Handles CPU port packets
   - Enables custom processing
   - Extends feature set
   - Supports packet sampling

- Limitations:
   - Not suitable for line rate processing
   - Only for sample-based use cases

## Related Notes
- [[Network Hardware]]
- [[Switch Architecture]]
- [[Data Center Infrastructure]]

###### Tags
#network-hardware #switch #infrastructure #asic #physical-layer

# FBOSS Software Architecture
#networking #software-architecture #facebook 

## Core Components
![[FBOSS Architecture Overview.png]]

### System Overview
- Runs on standard Linux distribution
- Deployed on:
   - ToR (Top of Rack) switches
   - Aggregation switches
- Open Source Project Stats:
   - 91 authors
   - 609 files
   - 115,898 lines of code
   - Example: Link aggregation = 5,932 lines

### Main Components Breakdown

#### 1. Switch SDK
- Vendor-provided software
- Exposes ASIC APIs
- Handles:
   - ASIC initialization
   - Forwarding table rules
   - Event handler listening

#### 2. HwSwitch
- Abstraction layer for switch hardware
- Generic interfaces for:
   - Port configuration
   - Packet sending/receiving
   - State change callbacks
   - Port events
- Benefits:
   - Switch-agnostic interaction
   - Ported to multiple ASIC families

#### 3. Hardware Abstraction Layer
- Extends HwSwitch interface
- Supports multiple ASICs
- Features:
   - Minimal required functionalities
   - Custom feature support
   - Example additions:
   	- Link aggregation
   	- ASIC status monitoring
   	- ECMP configuration

#### 4. SwSwitch
- Hardware-independent logic
- Provides:
   - L2/L3 table interfaces
   - ACL entries
   - State management
   - Hardware command translation

#### 5. State Observers
- Enables protocol implementation:
   - ARP
   - NDP
   - LACP
   - LLDP
- Features:
   - State change notifications
   - Callback registration
   - Decoupled protocol implementation

#### 6. Thrift Management Interface
- Enables split control configuration
- Components:
   - Local control plane
   - BGP/OpenR protocols
   - Centralized management system
- Benefits:
   - Simple management
   - Flexible operations
   - Improved stability

#### 7. QSFP Service
- Separate process from main agent
- Manages:
   - QSFP port detection
   - Product information reading
   - Hardware function control
   - Port monitoring

## State Management

### Software State
- Design:
   - Versioned copy-on-write tree
   - Root = main switch state
   - Children = state categories

- Benefits:
   - High concurrency
   - Fast reads
   - Safe updates
   - No read locks
   - Simple versioning
   - Easy debugging
   - State restoration capability

### Hardware State
- Managed through switch SDK
- Uses read/write locks
- State update process:
   - Lock acquisition
   - State modification
   - Lock release

## Related Concepts
- [[Software Architecture]]
- [[State Management]]
- [[Hardware Abstraction]]
- [[Network Management]]

###### Tags
#software-design #networking #state-management #system-architecture #fboss

# FBOSS Testing and Deployment
#deployment #testing #infrastructure

## Context & Challenges
### Outage Statistics
- 60% of switch outages = software related
- Similar to industry average (51% for data center devices)

### Traditional Problems
- Vendor releases:
   - Lengthy development cycles
   - Manual QA testing
   - Months between updates
   - Large change sets = higher risk

## Deployment System: fbossdeploy

### Why Custom Deployment?
- Chose not to use:
   - Chef
   - Jenkins
   - Existing frameworks
- Reasons:
   - Need tighter feedback loops
   - Network-specific monitoring
   - Topology-aware deployment
   - Quick reaction to network-wide failures

### External Monitoring Integration
Monitors for:
- Link failures
- BGP convergence times
- Network reachability
- Global network health

## Three-Phase Deployment Process

### 1. Continuous Canary
- Scope:
   - 1-2 switches per type
   - Production environment
- Process:
   - Automatic deployment of new commits
   - Immediate health monitoring
   - Instant rollback on failure
- Catches:
   - Initialization issues
   - Configuration errors
   - Race conditions
   - Warm boot problems

### 2. Daily Canary
- Scope:
   - 10-20 switches per type
   - Runs once daily
- Features:
   - Tests latest successful continuous canary commit
   - Full-day monitoring
- Catches:
   - Memory leaks
   - Performance regressions
   - Slow-developing issues

### 3. Staged Deployment
- Characteristics:
   - Only manual step
   - Takes about one day
   - Human operator supervised

- Process:
   - Gradual rollout
   - Subset-by-subset deployment
   - Failure threshold monitoring (0.5% of fleet)
   - Manual investigation of issues

### Why Keep Manual Final Stage?
1. Speed sufficient:
   - Single server can handle deployment
   - No bottleneck
2. Better monitoring:
   - Catches unpredicted bugs
   - Handles unique failures
3. System maturity:
   - Still improving testing
   - Enhancing monitoring
   - Developing auto-remediation
   - Plan to automate eventually

## Monthly Deployment Cycle
- Includes:
   - All canary phases
   - Full staged deployment
- Goal: Maximum operational stability

## Related Notes
- [[Continuous Deployment]]
- [[Canary Deployments]]
- [[Network Operations]]
- [[Testing Strategies]]

###### Tags
#deployment #testing #network-operations #reliability #canary-deployment

# FBOSS Management
#network-management #operations #monitoring

## Configuration Management

### Design Philosophy
- Centralized control
- Standardized deployments
- Template-based approach

### Configuration Process
1. Generation
   - Source: Robotron (network management system)
   - Automated template filling
   - Topology-aware configuration

2. Distribution
   - Central → Individual switches
   - Local config generator creates active config
   - Old configs stored as staged versions

### Benefits
✅ Prevents concurrent modifications
✅ Reproducible configurations
✅ Version controlled
✅ Eliminates manual errors

### Limitations
❌ No complex CLI for debugging
❌ No incremental config changes
❌ Requires agent restart for changes

## Draining Operations

### Purpose
- Safely remove aggregation switches from service
- Common during:
   - Feature updates
   - Deployments
   - Maintenance

### Process Flow
1. Configuration Retrieval
   - FBOSS agent gets drained BGP config
   - Pulls from central database

2. Trigger
   - Central management initiates via Thrift
   - Automated process

3. Execution
   - Activates drained config
   - Restarts BGP daemon

### Undraining Process
1. Reverse steps with undrained config
2. Health verification:
   - Management system pings agent
   - Checks switch statistics

## Monitoring System

### Data Collection Methods
1. Thrift Management Interface
   - High-level switch usage
   - Link statistics
   - Query-based data

2. Linux System Logs
   - Low-level system health
   - Hardware failures
   - Categorized events

### Monitoring Architecture
- System: FbFlow
- Storage:
   - Scuba: For some metrics
   - Gorilla: For other metrics
- Features:
   - Long-term analysis
   - High-level querying
   - Historical trending

### Automated Failure Handling
1. Detection
   - Continuous monitoring
   - Automatic failure detection

2. Categorization
   - Maps to known root causes
   - Identifies patterns

3. Remediation
   - Automatic recovery steps
   - Logs details for analysis

### Advantages Over Traditional Approaches
1. Flexible Data Model
   - Easy specification changes
   - Quick adaptation
   - No vendor dependencies

2. Performance
   - Optimized data transfer
   - Reduced collection time
   - Lower network load

3. Enhanced Debugging
   - Detailed error logs
   - Focus on new issues
   - Efficient problem resolution

## Related Concepts
- [[Network Automation]]
- [[Monitoring Systems]]
- [[Configuration Management]]
- [[Network Operations]]

## Tools Referenced
- [[Robotron]] - Network management system
- [[FbFlow]] - Monitoring system
- [[Scuba]] - Metrics storage
- [[Gorilla]] - Time-series database

###### Tags
#network-operations #monitoring #configuration #automation #maintenance 

# FBOSS Real-World Experiences
#case-studies #lessons-learned #networking 

## 1. Infrastructure Reuse Challenges
#infrastructure 

### Warm Boot Feature Context
- Purpose:
   - Non-disruptive FBOSS releases
   - Critical for single ToR topology
   - Maintains forwarding during restarts

### Complex State Management
- Involved Components:
   - FBOSS
   - Routing daemons
   - Switch SDK
   - ASIC

### Case Study: Kerberos Library Issue
- Problem:
   - Kerberos library caused outages
   - Affected small % of switches
- Root Cause:
   - Slow thread joining times
   - Exceeded warm boot timeouts
- Why Missed:
   - Less strict timing in other services
   - Existing monitors not tuned for this
   
### Key Lesson
> "Simply reusing widely-used code, libraries or infrastructure that are tuned for generic software services may not work out of the box with switch software."

## 2. Rapid Deployment Side Effects
#deployment

### Cascading Failures
- Pattern:
   - Started with single device
   - Spread to nearby devices
   - High packet loss in clusters
   - Sometimes self-recovered

### Investigation
- Observation:
   - Failures limited to 16-device groups
   - Connected to backup group configuration
   - Related to failover mechanisms

### Technical Deep-Dive
Problems cascade:
1. ToR failure
2. Backup route confusion
3. Packet ping-pong
4. CPU spikes
5. TTL expired packets
6. BGP session timeouts

### Key Lesson
> "A feature that works well for conventional networks may not work well for networks deploying FBOSS. More frequent outages require careful feature adoption."

## 3. Interoperability Issues
#interoperability

### Case Study: Link Aggregation Problem
- Scenario:
   - FBOSS ↔ Vendor device connection
   - Interface flapping issues
   - IP operations disabled

### Root Cause Analysis
1. Race condition between:
   - LACP
   - Duplicate Address Detection (DAD)
2. Hardware quirk causing packet loop
3. DAD interpreting looped packets incorrectly

### Resolution Approach
- Facebook:
   - Quick FBOSS modification
   - Direct problem solving
- Vendor Response:
   - Recommended DAD extension
   - Longer resolution timeline

### Key Lesson
> "FBOSS allows quick diagnosis and direct problem solving, versus waiting for vendor updates or using workarounds."

## Impact Points

### Infrastructure Reuse
- Careful evaluation needed
- Performance requirements differ
- Timing constraints critical

### Deployment Strategy
- New failure modes possible
- Traditional features need review
- Monitoring must adapt

### Interoperability
- Direct control beneficial
- Faster problem resolution
- Independent solution capability

## Related Notes
- [[Network Reliability]]
- [[Deployment Strategies]]
- [[Interoperability]]
- [[Network Debugging]]

###### Tags
#lessons-learned #network-operations #debugging #reliability #case-study

# FBOSS Design Discussions
#design #architecture #networking

## Existing Switch Programming Standards
#standards

### Academic Approaches
- Historical attempts:
   - Active networking
   - FORCES
   - PCE
   - OpenFlow

### Industry Initiatives
- Vendor Programs:
   - JunOS SDK access
   - Arista SDK program
- Incumbent Responses:
   - I2RS
   - Cisco's OnePK

### Why Not Use Existing Standards?
#### Problem: "Top Down" Approach
- Layered on vendor software
- Limited control capabilities
- Dependent on vendor timelines
- Restricted customization

#### FBOSS Advantage: "Bottom Up"
- Complete stack control
- Full state management
- Custom API development
- Rapid evolution capability

## FBOSS for Larger Switches
#scalability 

### Chassis Switch Implementation
- Scale: 128x100Gbps links
- Architecture:
   - 8 line cards (CPU + ASIC each)
   - 4 fabric cards (CPU + ASIC each)
   - CLOS topology internally

### Deployment Strategy
- Separate FBOSS instance per CPU (12 total)
- Internal BGP peering
- Functions as single high-capacity switch
- Used in aggregation layers

### Benefits
- No supervisor cards needed
- Leverages data center automation
- Minimal architectural changes
- Scales to larger form factors

## Dependency Challenges
#dependencies

### Circular Dependencies
Problem: Hidden network dependencies in server software

#### Case Study: Task Scheduling
- Initial Approach:
   - Used standard server task scheduler
   - Required network access
- Issue:
   - Created bootstrap problem
   - Network needed scheduler
   - Scheduler needed network

#### Solution:
- Created custom task scheduler
- Specifically for FBOSS deployments
- Eliminated circular dependency

### Ongoing Challenges
1. Server-focused development
2. Subtle implicit dependencies
3. Independent package evolution
4. Testing complexity

### Mitigation Strategies
- Strengthen testing procedures
- Enhance deployment checks
- Continuous dependency audit
- Custom solutions when needed

## Design Trade-offs Analysis
#design-decisions

### Benefits
1. Complete Control
   - Full software stack access
   - Custom feature development
   - Rapid iteration capability

2. Operational Efficiency
   - Integrated with DC automation
   - Streamlined deployment
   - Unified monitoring

3. Flexibility
   - Hardware-agnostic design
   - Scalable architecture
   - Custom protocol support

### Challenges
1. Development Overhead
   - Custom tooling required
   - Dependency management
   - Testing complexity

2. Integration Issues
   - Server software conflicts
   - Circular dependencies
   - Interoperability concerns

3. Operational Complexity
   - Custom solutions needed
   - Training requirements
   - Documentation needs

## Related Concepts
- [[Network Architecture]]
- [[Software Dependencies]]
- [[System Design]]
- [[Network Automation]]

## Referenced Technologies
- [[OpenFlow]]
- [[BGP]]
- [[CLOS Networks]]
- [[Network Operating Systems]]

###### Tags
#network-design #system-architecture #scalability #dependencies #trade-offs

# FBOSS Future Work
#future #roadmap #networking

## 1. FBOSS Agent Partitioning
#architecture 

### Current State
- Single monolithic binary
- Multiple features combined
- QSFP service already separated

### Planned Changes
- Goal: Break into smaller binaries
- Independent process execution
- Benefits:
   - Improved reliability
   - Isolated failures
   - Easier maintenance

### Example Structure
- State observers as external processes
- Independent communication with agent
- Prevents cascade failures
- Similar to QSFP service separation

## 2. Novel Experiments
#research

### Current Areas of Investigation
1. Custom Routing Protocols
2. Slow Path Isolation
   - Better experiment handling
   - Bug containment

3. Performance Monitoring
   - Micro-burst detection
   - Macro-scale traffic monitoring

4. Analytics
   - Hardware statistics processing
   - Failure detection improvements
   - Big data analysis

### Research Goals
- Aid academic research
- Provide production-ready platform
- Enable direct implementation
- Support novel networking ideas

## 3. Programmable ASIC Support
#hardware

### Current Status
- Multiple ASIC support
- Successful ASIC iterations
- No major design changes needed

### Future Integration
- Support for programmable ASICs
- P4 language integration
- Benefits:
   - Increased flexibility
   - Custom packet processing
   - Hardware optimization

### Development Areas
1. API Extensions
2. Programming Interfaces
3. Compiler Integration
4. Performance Optimization

## Impact on Research Community
#academic

### Contributions
1. Open Source Access
   - Real production code
   - Working implementation
   - Deployment examples

2. Research Platform
   - Experimentation base
   - Feature testing
   - Performance analysis

3. Industry Insights
   - Scale challenges
   - Operation practices
   - Design decisions

### Research Opportunities
- Novel protocol development
- Performance optimization
- Failure detection methods
- Traffic analysis techniques

## Related Concepts
- [[Microservices Architecture]]
- [[Programmable Networks]]
- [[Network Research]]
- [[P4 Programming]]

## Future Technologies
- [[Programmable ASICs]]
- [[Network Analytics]]
- [[Traffic Monitoring]]
- [[Failure Detection]]

###### Tags
#future-work #research #network-architecture #programmable-networks #asic

# FBOSS Paper: Key Takeaways
#networking #facebook #infrastructure #summary

## Core Innovations
1. Switch-as-a-Server Paradigm
  - Treats switches like regular servers
  - Uses standard Linux environments
  - Enables rapid deployment and iteration
  - Breaks from traditional network management

2. Minimal Feature Philosophy
  - Start with basics
  - Add features only when needed
  - Avoid unnecessary complexity
  - Challenge "must-have" assumptions

## Major Achievements
- Scaled 30x in two years
- Powers significant portion of Facebook's DC
- Successful open-source project
- Improved deployment speed and reliability

## Key Lessons Learned

### 1. Infrastructure Reuse
> "Not all server software practices work for network devices"
- Timing requirements differ
- Performance constraints matter
- Need careful evaluation of reused components

### 2. Deployment Challenges
> "Traditional network features need rethinking at scale"
- New failure modes emerge
- Rapid deployment creates unique issues
- Need robust monitoring and rollback

### 3. Interoperability
> "Control over software enables quick problem solving"
- Direct problem resolution
- No vendor dependence
- Faster bug fixes

## Impact on Industry

### Technical Impact
1. Demonstrated feasibility of:
  - Custom switch software
  - Rapid network iteration
  - Scale-out management

2. Challenged conventions about:
  - Required features
  - Deployment methods
  - Management approaches

### Business Impact
1. Cost Efficiency
  - Reduced vendor dependence
  - Optimized feature set
  - Efficient operations

2. Operational Agility
  - Quick feature deployment
  - Fast problem resolution
  - Custom solution capability

## Future Directions
1. Architecture Evolution
  - Microservices approach
  - Component separation
  - Improved isolation

2. Technology Integration
  - Programmable ASICs
  - P4 language support
  - Advanced analytics

## Discussion Points

### Technical Questions
1. How does FBOSS balance reliability vs innovation?
2. What makes their deployment strategy effective?
3. Why did they choose custom solutions over existing ones?

### Business Questions
1. When does building custom switch software make sense?
2. How to evaluate build vs buy for network infrastructure?
3. What are the operational implications of this approach?

### Scale Questions
1. How does FBOSS handle growth?
2. What makes their architecture scalable?
3. How do they manage complexity at scale?

## Related Notes
- [[Network Architecture]]
- [[Infrastructure at Scale]]
- [[DevOps Practices]]
- [[Network Automation]]

###### Tags
#facebook #networking #infrastructure #case-study #lessons-learned

# FBOSS Deep-Dive Discussion Points
#discussion #networking #infrastructure

## 1. Unconventional Approaches
#innovation

### A. Switch-as-Server Philosophy
- Traditional Approach:
   - Specialized network OS
   - Vendor-controlled updates
   - Limited access
   - Infrequent releases

- FBOSS Approach:
   - Standard Linux environment
   - Continuous deployment
   - Full stack access
   - Daily updates possible

### B. Feature Philosophy
- Traditional: "Must have all features"
   - Complex protocols
   - Full feature set
   - "Enterprise ready"
   
- FBOSS: "Add as needed"
   - Started without:
   	- Spanning Tree Protocol
   	- IP fragmentation
   	- Many "standard" features
   - Result: Simpler, more stable network

### C. Development Model
- Traditional:
   - Lengthy release cycles
   - Complete testing before release
   - All features bundled
   
- FBOSS:
   - Continuous integration
   - Canary deployments
   - Feature isolation
   - Rapid iteration

## 2. Real-World Challenges
#challenges

### A. Infrastructure Conflicts
- Case Study: Kerberos Issue
   - Server software timing ≠ Network timing
   - Caused unexpected outages
   - Required custom solutions

### B. Cascading Failures
- Backup Route Problem:
   1. Single switch fails
   2. Triggers backup routes
   3. Creates traffic loops
   4. Causes CPU spikes
   5. Leads to wider outage

### C. Integration Issues
- Vendor Interoperability:
   - Protocol implementations differ
   - Race conditions emerge
   - Need custom fixes

## 3. Key Lessons
#lessons

### A. Infrastructure Reuse
1. Server software ≠ Network software
   - Different timing requirements
   - Different reliability needs
   - Different failure modes

2. Need careful evaluation
   - Performance implications
   - Dependency chains
   - Failure scenarios

### B. Deployment Insights
1. Fast deployment requires:
   - Strong monitoring
   - Quick rollback
   - Isolated testing
   - Gradual rollout

2. Feature consideration:
   - Question traditional requirements
   - Test in production
   - Iterate based on needs

### C. Control Benefits
1. Software control enables:
   - Quick problem resolution
   - Custom solutions
   - Rapid iteration

2. Trade-offs:
   - More responsibility
   - Need expertise
   - Higher complexity

## 4. Future Implications
#future

### A. Architecture Evolution
1. Microservices Direction
   - Breaking monolith
   - Service isolation
   - Independent scaling

2. Hardware Integration
   - Programmable ASICs
   - Custom protocols
   - Flexible processing

### B. Industry Impact
1. Network Operations
   - More automation
   - Faster deployment
   - Custom solutions

2. Vendor Relationships
   - Different engagement model
   - Focus on hardware
   - Software independence

## Discussion Questions

### Technical Deep-Dive
1. "How does FBOSS maintain stability with daily updates?"
2. "What makes their testing strategy effective?"
3. "How do they handle the complexity of custom software?"

### Strategic Decisions
1. "When should companies consider building custom switch software?"
2. "What are the prerequisites for this approach?"
3. "How to evaluate the ROI of custom network software?"

### Operational Impact
1. "What organizational changes are needed?"
2. "How does this affect network operations?"
3. "What skills are required for this approach?"

## Related Notes
- [[Network Architecture]]
- [[DevOps Practices]]
- [[Infrastructure Scaling]]
- [[Software Development]]

###### Tags
#network-design #infrastructure #case-study #facebook #lessons-learned




---

# **FBOSS: Building Switch Software at Scale**

## **Abstract**

- **Problem:** Traditional network switches are vendor-supplied, proprietary, and loaded with unnecessary features, which:
    - Increase complexity.
    - Limit operational flexibility.
    - Slow feature iteration.
- **Solution:** FBOSS (Facebook Open Switching System):
    - Treats switches like servers (“Switch-as-a-Server” principle).
    - Employs a “Deploy-Early-and-Iterate” strategy.
    - Focuses on rapid development and efficient operation for cloud-scale networks.
- **Outcome:** FBOSS enables efficient deployment, operation, and scaling of Facebook’s data center networks, growing deployments by over 30x in two years.

---

## **Introduction**

- **Challenges with Traditional Switch Software:**
    - Proprietary and inflexible, limiting customization.
    - Contains a union of all customer-requested features, increasing bugs and operational complexity.
    - Delayed feature availability (e.g., monitoring IPv6 took vendors years).
- **Motivation for FBOSS:**
    - Custom software simplifies operations and integrates seamlessly with Facebook’s infrastructure.
    - Open ecosystems (merchant silicon, disaggregated hardware) allow custom software stacks.
- **FBOSS Goals:**
    - Rapid iteration for new features.
    - Seamless scaling for Facebook’s unique workload.
    - Simplicity and operational efficiency.

---

## **Design Principles**

1. **Switch-as-a-Server:**
    - Switch software is treated like general-purpose services running on servers.
    - Encourages rapid updates, monitoring, and debugging.
    - Simplifies scaling with a modular architecture.
2. **Deploy-Early-and-Iterate:**
    - Initial deployments included only essential features, iterating based on observed issues.
    - Avoids overloading software with unnecessary complexity.
    - Focuses on fault-tolerant, simplified network designs.

---

## **FBOSS Architecture**

### **Hardware Overview**

- Components include:
    - Switch ASIC for packet forwarding.
    - x86 CPU running Linux for control plane tasks.
    - Peripheral components like PHYs, QSFP ports, CPLDs, and BMCs for management and signal handling.

### **Software Components**

1. **FBOSS Agent:**
    - Central process managing switch state and hardware interaction.
    - Interfaces with the Switch SDK to program ASICs.
2. **Hardware Abstraction Layer (HwSwitch):**
    - Generic interfaces for hardware-agnostic operations (e.g., port management, packet I/O).
3. **State Management:**
    - Employs a versioned copy-on-write tree for safe, lock-free state updates.
4. **QSFP Service:**
    - Manages transceivers for port configuration and health monitoring.
    - Decoupled from FBOSS Agent to improve modularity.
5. **Thrift Management Interface:**
    - Provides APIs for configuration, monitoring, and diagnostics.

---

## **Operational Workflow**

### **Testing and Deployment**

1. **Continuous Canary:**
    - Deploys new code to a small subset of switches.
    - Monitors health and reverts on failure.
2. **Daily Canary:**
    - Runs approved updates on a larger set of switches for extended observation.
3. **Staged Deployment:**
    - Gradual rollout across the network with human intervention for anomaly handling.

### **Configuration Management**

- Centralized configuration database generates deterministic, reproducible switch settings.
- Draining and undraining processes handle switch updates with minimal disruption.

### **Monitoring and Failure Handling**

- Data collected via:
    - **Thrift API:** High-level statistics.
    - **Linux logs:** Low-level health metrics.
- **FbFlow:** Analyzes and stores monitoring data for long-term diagnostics.
- Automated remediation handles common failure patterns, reducing operational overhead.

---

## **Challenges and Lessons Learned**

1. **Warm Boot Complications:**
    - State synchronization issues during control plane restarts.
    - Required enhanced testing for graceful failure recovery.
2. **Cascading Failures:**
    - Misconfigurations in backup routing caused feedback loops and CPU spikes.
    - Fixed through control plane policing and route validation.
3. **Interoperability Issues:**
    - Custom software expedited fixes for vendor-specific bugs, ensuring seamless operation.

---

## **Advantages of FBOSS**

1. **Flexibility:**
    - Full control over software stack enables rapid feature iteration.
    - Adaptable to multiple ASIC types and evolving workloads.
2. **Scalability:**
    - Modular architecture supports expansion without redesign.
    - Seamless upgrades minimize downtime.
3. **Improved Reliability:**
    - Automated monitoring and remediation enhance fault tolerance.
    - Simplified configurations reduce human error.

---

## **Future Work**

- Partitioning FBOSS Agent for finer modularity and resilience.
- Supporting programmable ASICs (e.g., P4 language).
- Expanding tools for traffic monitoring, burst detection, and failure analytics.

---

## **Conclusion**

FBOSS demonstrates that adopting principles from general-purpose software development can revolutionize switch software:

- Enables rapid innovation and operational simplicity.
- Provides a robust foundation for scaling cloud-scale networks.
- Serves as a model for future open-source and vendor-agnostic networking solutions.

---

