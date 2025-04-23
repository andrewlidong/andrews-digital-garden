https://www.youtube.com/watch?v=YIaYoxqpE7E

Relational Database: 
Distributed Reads

Causally consistent state
Snapshots?  

2PL
predicate lock (no new rows can be written)

grabbing locks slows us down.  It takes resources in terms of CPU cycles.  It prevents new writes.  
Analytical query, we are locking every single row on that database, and not a single write can occur in the meantime.  

W1.  Wait 2 seconds, then commit.  Write comes in between 100-102, any number between 100-102 + 2 > 102.  

Any two writes where there's a causal dependency on them, one will have a time after.  

Give me all writes with a timestamp less than or equal to another timestamp.  This is a super super useful principle.  

GPS clock.  In every datacenter that Spanner lives in, we have a clock that's as synchronized as possible.  Still clock drift and network delay.  

We can perform really fast reads without having to lock.  These databases are really expensive.  