Google Spanner (2013)
1. Strongly Consistent SQL database
2. Supports causally consistent non blocking read only snapshots
	1. Via the use of TrueTime API
	2. Ability to generate accurate timestamp estimations controls database performance

Causal Consistency
Write B is causally dependent on write A if
- The submission of write B depends on the existence of write A

Causal Consistency - Lamport Clocks


Distributed Clocks
Not synchronized due to: 
1. Network latency to clock server
2. Quartz clock drift (gets worse between clock server synchronizations)

Spanner Details
Spanner's design looks similar to Megastore to ensure strong consistency!
1. Paxos group per partition
	1. Can describe table hierarchies for colocation with a partition like Megastore
2. Lender per paxos group maintained by leases
	1. Megastore does not use Paxos leaders
	2. Locks for read write transactions only maintained by the leader
	3. Leader lease extensions piggybacked on normal writes when possible
3. Two phase commit for cross partition read/write transactions

 The leader in a paxos group is always up to date.  Can followers ever serve local reads?  

only block reads for rows that are affected by this two phase commit.  

Snapshot Transactions are consistent across multiple paxos groups.  Just choose a time.  

Specify group leaders in advance.  Get the last log entry, user the lowest time.  

Use current time

lease end

Now we can serve reads with timestamp < M
each lease extension goes in a paxos log

single vote