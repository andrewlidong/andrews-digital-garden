Spanner: 

A database created by Google in 2012 that falls under the category of NewSQL.  

Spanner mainly relies on using synchronized clocks.  

Spanner Guarantees: 
- ACID transactions
	- Atomicity
		- Achieved by two phase commit
	- Serializability
		- Two phase locking (shared and exclusive locks)
- Replicas kept consistent via Paxos, not Raft
- Linearizable reads and writes (every single read and write is totally ordered and trying to keep consistent with causality)
- All while maintaining great performance

The Issue with Two Phase Locking
- In two phase locking, a transaction can hold the lock in either shared or exclusive mode.  Reads and writes actually block each other.  
- Spanner makes it so that reads do not require grabbing locks (huge for backups or analytics queries).  

Consistent Snapshots
- If a snapshot contains a write, all writes that the writer had read in order to make its own write must be present.  

Lamport Timestamps
- Not linearizable.  You can have a bunch of writes that are concurrent that didn't happen at the same time.  
- Not consistent with physical time.  

Centralized Timestamps
- Single point of failure
- Huge bottleneck

TrueTime
- return an uncertainty interval.  

Spanner Writes

Conclusion: 
- use specialized hardware to get a lower uncertainty bound on reads and writes.  