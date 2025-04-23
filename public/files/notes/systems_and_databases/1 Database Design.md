Web Browser -> Web Server -> Database Server

Objective:
- Fast reads
- Fast writes
- Persistent data

Quick comment about disks
- Generally we are using hard drives
- Results in slow random reads
- We should always aim for sequential operaetions
- Much cheaper than SSDs but slower

Naive Database Implementation

Better database implementation
Hashmap, O(1) reads and writes

hashmaps good for small amount of data.  

Indexing - making read times much faster.  
Keep extra data on each write to improve database read times
Pro: Faster reads
Con: Slower writes

Types of Index implementations
- Hash Indexes
- LSM trees + SSTables
- B Trees

Hash Index
Keep an in memory hash table of the key mapped to the memory location of the corresponding data, occasionally write to disk for persistence.  

Pros: Easy to implement and very fast (disks are slow, RAM is fast)
Cons: All of the keys must fit in memory, bad for range queries

SSTables and LSM trees
Write first goes to an in-memory buffer (memtable)
When tree becomes too large, write the contents of it (sorted by key name) to an SSTable file held on disk

Write ahead log expresses all the changes we have in the tree.  
Once you write the tree to disk you reset the tree

Write LSM trees to SSTables on disk.  


Writing can be solved with append only.  

Compacted SSTable
Merge two SSTable files
Merge sort, start at the top and start taking the keys in order.  

How to read from SSTables
Query the memtable. O(logn)
secondly look at each SStable from newest to oldest.  

Bloom filters in case the key doesn't exist.  Bad on reads.  

Since SSTables are sorted, we keep a sparse in-memory hashtable for each SS table so we can quickly binary search them.  

SSTables and LSM trees
Pros: 
- High write throughput due to writes going to in memory buffer
- Good for range queries due to internal sorting of data in the index.  
Cons: 
- Slow reads, especially if the key we are looking for is old or does not exist
- Merging process of log segments in background.  

B-Trees
To read: traverse through the tree and find the value
To update: traverse through the tree and change the value
To write: 

B-trees summarized
Pros: 
- Relatively fast reads, most B-trees can be stored in only 3 or 4 levels
- Good for range queries as data is kepy internally sorted
Writes: 
- Relatively slow writes, writing to disk

Conclusion: 
hash indexes fast but only useful on small datasets
SSTables and LSM-trees: better for writing, slower for reading
B-Trees: better for reading, slower for writing


Designing Data Intensive Applications Martin Klepmann
