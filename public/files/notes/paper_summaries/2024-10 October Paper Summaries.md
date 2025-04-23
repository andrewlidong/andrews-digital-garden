Meetup 031 - Borg Autopilot
- Borg Autopilot is an enhancement to Google's Borg cluster manager, introducing:
	- Automated workload tuning based on real-time metrics
	- Intelligent resource allocation using ML-driven scheduling
	- Self-healing mechanisms to minimize human intervention

Meetup 032 - Applied Machine Learning at Facebook: A Datacenter Infrastructure Perspective
- This paper discusses how Facebook deploys large-scale ML infrastructure in its datacenters.  
	- Describes model training and inference workloads across GPUs and TPUs
	- Optimizes resource allocation and scheduling for ML jobs
	- Balances latency-sensitive inference with batch training processes

Meetup 033 - Linearizable State Machine Replication of State-Based CRDTs without Logs
- This paper explores log-free replication of state-based CRDTs (Conflict-Free Replicated Data Types) to achieve linearizability.  
	- CRDTs provide eventual consistency, but this method ensures stronger guarantees
	- Eliminates log-based consensus overhead found in traditional state machine replication
	- Helps improve fault tolerance and efficiency in distributed systems

Meetup 034 - Gorilla: A Fast, Scalable, In-Memory Time Series Database
- Gorilla is Facebook's in-memory time series database, built to handle high-throughput metric storage.  It:
	- Uses delta-of-delta encoding for efficient compression
	- Offers fast, real-time retrieval of monitoring data
	- Supports high availability and replication across clusters

Meetup 035 - ClickHouse: Lightning Fast Analytics for Everyone
- ClickHouse is an open-source columnar database designed for high-performance analytical queries.  It:
	- Uses vectorized execution and compression for speed
	- Excels at real-time analytics with OLAP (Online Analytical Processing)
	- Powers large-scale platforms like Yandex, Cloudflare, and Uber

Meetup 036 - TAO: Facebook's Distributed Data Store for the Social Graph
- TAO is Facebook's highly scalable, eventually consistent data store optimized for social graph queries.  It:
	- Provides low-latency reads and writes for billions of users
	- Uses a cache-first architecture to minimize database load
	- Supports efficient graph traversal for friend connections, posts, and interactions
