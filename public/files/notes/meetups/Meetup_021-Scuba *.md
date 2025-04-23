**

- Meetup 021 - [Scuba: Diving into Data at Facebook](https://research.facebook.com/publications/scuba-diving-into-data-at-facebook/)
    

**

I'll create organized Obsidian notes for the Scuba paper, breaking it down into key sections with relevant links.

# Scuba: Facebook's Real-Time Data Analytics System

## Overview
- Built by Facebook for real-time data analysis
- In-memory database system processing millions of rows per second
- Runs on hundreds of servers with 144GB RAM each
- Processes ~1 million queries per day
- Sub-second query response time over live data

## Key Features
- [[Data Model]]
	- Table-based with rows and columns
	- Supported data types:
		- Integers
		- Strings  
		- Sets of strings
		- Vectors of strings
	- No float support (must convert to integers)
	- Every row has mandatory timestamp

- [[Data Storage]]
	- Fully in-memory storage
	- Data compressed using various techniques:
		- Variable length integers
		- Dictionary encoding for strings
		- Fibonacci encoding for sets
	- Row-oriented storage layout
	- Random partitioning across servers
	- No indexes except time ranges

- [[Data Lifecycle]]
	- Ingestion through logging calls in Facebook code
	- Uses Scribe messaging system for data collection
	- Data available for queries within ~1 minute
	- Automatic data pruning based on:
		- Age (default 30 days)
		- Space limits (default 100GB per table)
	- Optional subsampling to keep older data

## Query System
- [[Query Interfaces]]
	- Web-based UI with visualizations
	- SQL command line
	- Thrift API (multiple languages)

- [[Query Features]]
	- SQL-like syntax
	- Aggregation functions
	- Group by and Order by
	- Regular expression support
	- No join support

- [[Query Execution]]
	- Tree-based aggregation architecture
	- Fanout of 5 at each level
	- Parallel processing at leaf nodes
	- Timeout-based fault tolerance
	- Best-effort availability

## Use Cases
1. [[Performance Monitoring]]
	- Real-time server metrics
	- Code regression analysis
	- Bug report tracking

2. [[Trend Analysis]]
	- Content trend detection
	- Real-time word frequency analysis

3. [[Pattern Mining]]
	- Product usage analysis
	- User behavior analysis

## Key Differences from Traditional Databases
- Automatic data pruning
- Built-in sampling support
- Schema-less data import
- First-class visualization support
- Best-effort query results
- Focus on real-time analytics

## Performance Characteristics
- Sub-second query response times
- Scales well with additional servers
- Memory (not CPU) is primary constraint
- Query throughput plateaus at ~8 concurrent clients

## Limitations
- No join support
- No nested queries
- Limited data types
- Memory-bound storage
- Best-effort results (may miss some data)

#database #facebook #real-time-analytics #distributed-systems