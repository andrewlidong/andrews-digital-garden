Meetup 018 - CRUSH: Controlled, Scalable, Decentralized Placement of Replicated Data
- CRUSH is an algorithm used in Ceph for efficiently distributing data across large-scale storage clusters.  Unlike traditional hashing, CRUSH enables decentralized, deterministic data placement while ensuring fault tolerance and even distribution.  It eliminates reliance on centralized metadata services, significantly reducing overhead and improving scalability.  

Meetup 019 - Build Systems a la Carte (July 10, 2024)
- This paper presents a formalized approach to analyzing build systems, such as Make, Bazel, and Ninja, by categorizing their trade-offs in incrementality, correctness and expressiveness.  It introduces a modular framework that allows developers to construct custom build systems by combining features like incremental builds, caching, and dependency tracking in a principled way.  

Meetup 020 - ThinLTO: Scalable and Incremental Link-Time Optimization (LTO)
- ThinLTO improves link-time optimization (LTO) by making it scalable and incremental.  Traditional full LTO compiles an entire program at once, which can be computationally expensive.  ThinLTO partitions the process into smaller, parallelizable units, significantly reducing build times while maintaining performance improvements from cross-module optimization.  It is widely used in LLVM-based compilers for optimizing large-scale software.  

Meetup 021 - Scuba: Diving into Data at Facebook
- Scuba is Facebook's real-time data analytics system designed for debugging, monitoring, and ad-hoc querying at scale.  It enables engineers to quickly analyze large, rapidly changing datasets by prioritizing low-latency ingestion and query execution over strong consistency.  The system is optimized for distributed storage, in-memory processing, and automatic load balancing, making it crucial for Facebook's internal observability.  
