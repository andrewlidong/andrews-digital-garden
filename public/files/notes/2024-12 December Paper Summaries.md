Meetup 042 - A Large-Scale Study of Data Center Network Reliability (2018)
- A detailed analysis of failure patterns in Google's data center networks, based on:
	- Tens of thousands of network incidents over several years
	- Causes of failures: hardware, software bugs, misconfigurations, and environmental factors
	- Findings highlight the need for automation, redundancy, and predictive failure models to improve reliability

Meetup 043 - Beyond Fat-Trees without Antennae, Mirrors, and Disco-Balls
- Proposes alternatives to fat-tree topologies for data center networks, aiming for:
	- Better scalability and lower cost than traditional Clos networks
	- New routing designs without requiring exotic hardware (e.g. optical switches, antennas, or complex network devices)
	- A focus on practical improvements to topology design

Meetup 044 - Google-Wide Profiling: A Continuous Profiling Infrastructure for Data Centers (2010)
- Google-Wide Profiling (GWP) enables continuous performance profiling across all of Google's data centers.  
	- Samples CPU and memory usage without disrupting applications.  
	- Helps identify performance regressions, inefficiencies, and optimization opportunities
	- Paved the way for tools like eBPF-based profiling in modern observability stacks

Meetup 045 - Dapper: A Large-Scale Distributed Systems Tracing Infrastructure
- Dapper is Google's distributed tracing system, designed to debug and optimize large-scale microservices
	- Uses low-overhead sampling to track end-to-end request flows across services
	- Helps diagnose latency bottlenecks and failure points
	- Inspired later tracing frameworks like Zipkin and OpenTelemetry

