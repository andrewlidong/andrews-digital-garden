Meetup 000 - Slicer (Jan 17, 2024)
1. Slicer: Auto-Sharding for Datacenter Applications
	1. This paper presents Slicer, a system that automatically shards and rebalances data across distributed applications in a datacenter.  It improves efficiency, reduces operational overhead, and adapts to workload changes dynamically.  

Meetup 001 - Huge Pages (Jan 24, 2024)
1. Adaptive Hugepage Subrelease for Non-moving Memory Allocators in Warehouse Scale Computers (2021)
	1. This paper introduces a method for dynamically releasing unused portions of huge papers in non-moving memory allocators.  It aims to improve memory utilization in large-scale systems without significant performance trade-offs.  
2. Beyond malloc efficiency to fleet efficiency: a hugepage-aware memory allocator (Addon)
	1. Discusses optimizing memory allocation at scale by designing malloc-like allocators that efficiently use huge pages, reducing fragmentation and improving performance.  
3. Unleashing the Power of Allocator-Aware Software Infrastructure (Addon)
	1. Explores how software infrastructure can be designed to be allocator-aware, improving memory efficiency across fleets of servers.  

Meetup 002 - Metldown and Spectre (Jan 31, 2024)
1. Project Zero: Reading privileged memory with a side-channel (2018) (Blog post)
	1. Google's Project Zero team detailed how speculative execution flaws in modern processors allow an attacker to leak privileged memory via a side-channel attack.  It discusses Meltdown and Spectre, their discovery, and their impact on hardware security.  
2. Spectre Attacks: Exploiting Speculative Execution
	1. This paper describes the Spectre attack, which manipulates speculative execution to trick the processor into leaking sensitive information via cache-based side channels.  It highlights various Spectre variants and proposes mitigations.  
3. Meltdown Attack - meltdownattack.com
	1. Meltdown is an attack that allows unprivileged processes to read kernel memory by exploiting out-of-order execution in CPUs.  The paper provides an in-depth analysis of the attack mechanism and discusses its impact on security.  
4. The Intel 80x86 Processor Architecture: Pitfalls for Secure Systems (1995)
	1. This early paper examines security issues inherent in the Intel x86 architecture, including privilege escalation risks and architectural choices that later contributed to vulnerabilities like Meltdown and Spectre.  