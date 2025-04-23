Meetup 051 - Practical Uses of Synchronized Clocks in Distributed Systems (1991)
- A foundational paper on time synchronization in distributed computing.  
	- Introduces how high-precision clocks can be leveraged for ordering events, enforcing consistency, and detecting anomalies.  
	- Discusses the impact of clock drift, network latency, and synchronization protocols on distributed systems.  
	- Lays the groundwork for later innovations like Google's TrueTime in Spanner

Meetup 052 - Spanner: Google's Globally-Distributed Database
- Spanner is Google's globally distributed, strongly consistent database, designed to scale across datacenters worldwide.  
	- Uses TrueTime, a highly synchronized clock system, to provide external consistency and global transactions.  
	- Supports multi-version concurrency control (MVCC) and automatic sharding.  
	- Enables SQL-like querying with strong consistency guarantees, making it ideal for mission-critical applications like Google's Ads and Cloud services.  
- Spanner, TrueTime & the CAP Theorem
	- Explores how Spanner challenges the traditional interpretation of the CAP theorem.  
		- By leveraging TrueTime for bounded clock uncertainty, Spanner achieves both consistency and high availability in distributed transactions.  
		- It operates in a space where latency is carefully controlled, showing that strong consistency at a global scale is possible with the right engineering choices.  