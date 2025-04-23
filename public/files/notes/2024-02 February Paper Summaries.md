Meetup 003 - Operating System Evolution (Feb 7, 2024)
1. Perspectives on OS Foundations | SOSP History Day 2015 (Talk)
	1. This talk covers the historical development of OS design, discussing how early foundational concepts (e.g. monolithic vs. microkernel architectures) evolved and influenced modern systems. 
2. The Rise of Cloud Computing Systems | SOSP History Day 2015 (Talk)
	1. Discusses how cloud computing architectures changed the role of operating systems, moving from managing single machines to handling massive distributed environments.  It highlights virtualization, containerization, and service-oriented design.  
3. Fifty Years of Operating Systems (2016) (Short Article)
	1. A concise history of OS evolution, summarizing key milestones from early mainframes to modern cloud-scale systems.  It emphasizes how shifts in hardware and applications demands shaped OS design.  
4. Parallel Computing and the OS | SOSP History Day 2015 (Talk)
	1. Explores how OS design evolved to support parallel computing, from early multiprocessing systems to modern architectures optimized for multi-core and distributed workloads.  

Meetup 004 - KLL Optimal Quantile Approximation in Streams (2016) (Feb 21, 2024)
- The KLL algorithm provides an optimal way to compute approximate quantiles in streaming data using limited memory.  It improves over previous approaches like GK by reducing memory usage while maintaining high accuracy.  The paper is particularly relevant for large-scale data systems that need fast quantile estimation with minimal space overhead.  

Meetup 005 - Percolator (Feb 27, 2024)
1. Large-scale Incremental Processing Using Distributed Transactions and Notifications (2010)
	1. This paper introduces Percolator, a system built by Google to handle incremental updates in large-scale data processing.  Unlike batch-processing systems like MapReduce, Percolator enables near real-time updates by using fine-grained distributed transactions and notifications.  The system was crucial in building Google's web indexing pipeline more efficiently.  

Meet 006 - Facebook's Tectonic Filesystem: Efficiency from Exascale (2021) (Feb 29, 2024)
- This paper describes Tectonic, a distributed filesystem designed for Facebook's exascale storage needs.  Tectonic improves efficiency by decoupling metadata management from data placement, enabling seamless scaling and better fault tolerance.  It replaces older systems like Haystack and f4, optimizing storage for both cold and warm data while reducing operational complexity.  

