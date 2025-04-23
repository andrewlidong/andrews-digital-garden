Meetup 022 - RocksDB: Evolution of Development Priorities in a KV Store Serving Large-scale (Sections 1-3) (August 2, 2024)
- Sections 1-3 provide an overview of RocksDB's architecture and design decisions, including:
	- Why RocksDB was created - to handle Facebook's demanding storage needs
	- LSM-tree structure and its role in write-heavy workloads
	- Challenges in scaling key-value storage systems, such as balancing read/write performance

Meetup 023 - Distributed Storage Systems (August 11, 2024)
1. Bigtable: A Distributed Storage System for Structured Data
	1. Google's Bigtable is a highly scalable, distributed NoSQL database designed for storing structured data across thousands of machines.  It underpins services like Google Search, Google Maps, and Gmail, using a sparse, multidimensional sorted map.  It introduced innovations like Chubby for coordination, SSTables for efficient storage, and column-family-based data models.  
2. RocksDB: Evolution of Development Priorities (Sections 4+)
	1. RocksDB is a high-performance key-value store optimized for flash storage and low-latency workloads.  Sections 4+ discuss:
		1. Write amplification and compaction optimizations
		2. New indexing structures to handle large-scale data
		3. Performance tuning techniques for databases and cloud applications

Meetup 024 - Towards Modern Development of Cloud Applications (2023)
- This paper explores best practices and evolving paradigms in cloud-native application development, covering topics like:
	- Microservices and serverless architectures
	- Efficient API design and observability
	- Security and scaling challenges in distributed systems
	- Emerging trends such as Kubernetes, Istio, and multi-cloud strategies

Meetup 025 - Mastering the Game of Go with Deep Neural Networks and Tree Search (2016)
- This DeepMind paper introduced AlphaGo, the first AI to defeat human Go champions.  It combined deep neural networks with Monte Carlo Tree Search (MCTS) to evaluate board positions and determine the best moves.  By leveraging reinforcement learning and self-play, AlphaGo surpassed traditional rule-based AI methods and demonstrated the power of deep learning in strategic decision-making.  

