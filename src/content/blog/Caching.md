---
title: "Caching in Spring Boot."
date: "2026-09-08"
excerpt: "Complete understanding of caching in Spring Boot."
tags: ["Cache Stamping", "Cache Penetration","Caching strategies"]
visible: true
---

## Cache Stamping

A cache stampede occurs when a popular cache key expires under heavy load, causing hundreds or thousands of simultaneous requests to bypass the cache and slam the backend database at the same time.

### What Causes It

* Synchronized Expiration: A time-to-live (TTL) hits zero for a high-traffic key.
* High Concurrency: Many requests arrive in milliseconds before the cache is repopulated.
* Cascading Failures: The database runs out of connections or times out under the sudden traffic spike.

### How to Prevent It

* Request Coalescing (Single Flight): Group identical in-flight requests so only one fetch hits the backend while others wait for that result.
* Cache Locking: Allow only a single worker to rebuild the cache key while other threads wait or retry.
* Probabilistic Early Expiration: Give requests an increasing random chance to refresh the cache before the TTL actually expires.
* Stale-While-Revalidate: Serve outdated cache data immediately while fetching a fresh copy in the background.
* Background Warming: Use dedicated workers to proactively update hot keys before expiration.

## Cache penetration problem

Cache penetration happens when an application requests data that does not exist in the cache or the database, forcing every single request to bypass the cache and hammer the database.

### What is Cache Penetration?

*  The Cause: A user or attacker requests non-existent keys (like invalid IDs or negative values).
* The Process: The system checks the cache, gets a miss, queries the database, receives an empty result, and fails to store anything because the data doesn't exist.
* The Risk: High volumes of these requests exhaust database CPU and memory, often leading to a Denial of Service (DoS) attack.

### How to Solve It

* Cache Null/Empty Values: Store a temporary null or placeholder value for missing keys in your cache with a short Time-To-Live (TTL). Future requests for the same fake ID hit the cache instead of the database.
* Use a Bloom Filter: Place a memory-efficient probabilistic data structure (a Bloom filter) in front of your cache. It tracks all valid keys that actually exist in the database. If the filter says a key is missing, your app rejects the request immediately without touching the database or cache.

## Caching strategies

Redis is a powerful in-memory data store commonly used to implement distributed caching and dramatically reduce application latency.

### Core Caching Patterns

* Cache-Aside (Lazy Loading): The application checks Redis first; on a cache miss, it fetches data from the primary database, populates the cache, and returns the result. Best for read-heavy workloads.
* Write-Through: The application writes data to the cache and the primary database simultaneously in a synchronous operation, favoring strong data consistency.
* Write-Behind (Write-Back): The application writes directly to Redis first, and Redis asynchronously updates the backend database in the background. Ideal for write-heavy workloads, though it introduces minor durability risks.
* Cache Prefetching: Data is proactively loaded or updated in Redis ahead of anticipated user requests to eliminate initial cache misses.

### Production Best Practices

* Set TTLs (Time-To-Live): Always assign expiration times to keys to prevent Redis memory from growing unbounded, and add jitter to prevent synchronized cache-miss storms.
* Eviction Policies: Configure appropriate memory management, such as allkeys-lru (Least Recently Used), to automatically discard older data when memory fills up.
* Handle Hot Keys: Protect high-traffic keys from causing cache stampedes by using mutex locks or background refresh mechanisms.

## When caching is appropriate.
Caching is appropriate when data is read frequently, changes slowly, or requires expensive computations to generate

### When Caching Works Best

* High Read-to-Write Ratio: Data is requested many times more often than it is updated, such as user profiles or product catalogs.
* Static and Stable Content: Files or records remain relatively static, including images, stylesheets, JavaScript, or reference data.
* Expensive Computations: Results of complex aggregations, database queries, or heavy computations that take significant CPU time to process.
* Latency-Sensitive Needs: Real-time applications or high-traffic sites where reducing response time improves user experience and protects backend databases from traffic spikes.

### When to Avoid Caching

* Frequently Changing Data: Real-time data or information with a high write-to-read ratio leads to constant cache invalidation overhead.
* Strict Consistency Requirements: Systems that cannot tolerate stale data or delayed synchronization should query the source of truth directly.

## Does we can store the complex data in the cache?

You can store complex domain models in Redis using JSON data types (RedisJSON), nested Hashes, or serialized buffers (e.g., Protobuf, Jackson JSON). The real limitation isn't entity complexity—it's the inability to run complex ad-hoc relational queries or joins across entities without reading/scanning massive keyspaces.

## Differece between storing a cache in disk vs ram?
```text
                RAM (Redis)                    Disk (PostgreSQL)
        ┌─────────────────────────────┐   ┌─────────────────────────────┐
        │ • Microsecond Latency       │   │ • Millisecond Latency       │
        │ • Expensive ($/GB)          │   │ • Inexpensive ($/GB)        │
        │ • Key-Value / Struct Lookups│   │ • Complex Joins & SQL       │
        │ • Asynchronous Durability   │   │ • Strict ACID & WAL         │
        └─────────────────────────────┘   └─────────────────────────────┘
```

## Primary reason not to use Redis as database

"We don't use Redis as a primary database for all application data due to four primary trade-offs:

1. Cost & Capacity: RAM is roughly 10x–20x more expensive per gigabyte than NVMe storage, making high-volume primary storage in Redis economically unviable.
2. Query Flexibility: PostgreSQL supports multi-column B-tree/GIN indexes, complex ad-hoc SQL queries, and JOIN operations. Redis is primarily optimized for point lookups by key or specific structure operations.
3. Durability Guarantees: Relational databases enforce strict ACID compliance using Write-Ahead Logging (WAL) and synchronous disk flushes. Redis relies primarily on asynchronous persistence (RDB/AOF), which trades absolute durability for high throughput.
4. Architecture Role: PostgreSQL serves as the persistent System of Record, while Redis serves as a transient acceleration layer for high-frequency working data."

## Three Production Solutions to Solve This Race Condition when the following order is occured (Read data from cache --> Cache miss then thread A fetch data and got paused due to GC or network latency --> At same time thread B came and updata the db and delete the cache key ---> Then thread A got release and update the data with invalid cache--> and due to TTL it will wait in the cache or untill another updae request came)

This entire flow is called Cache Aside architecture

### Solution 1: Delayed Double Delete (Simple & Effective)

When updating data in the DB, delete the Redis key twice:

1. Update DB (stock = 9).
2. Delete Redis key item:100:stock.
3. Sleep for a short window (e.g., 500ms).
4. Delete Redis key AGAIN.

### Solution 2: Versioned / Tokenized Key Writes

Store a version or epoch timestamp along with the cached item.
1. item:100:stock $\rightarrow$ { "value": 9, "version": 1728550000 }
2. When writing back on a cache miss, only overwrite if the fetched DB version is equal to or newer than the existing key version.

### Solution 3: Change Data Capture (CDC) via Kafka / Debezium

Instead of the application deleting the cache manually:

1. Application updates PostgreSQL.
2. PostgreSQL writes to its Write-Ahead Log (WAL).
3. Debezium (CDC) reads the WAL entry and publishes a stock_updated event to Kafka.
4. An Invalidation Service reads Kafka and evicts/updates the Redis key asynchronously.

## Caching Pattern

Besides Cache-Aside, there are four other fundamental caching patterns:

1. Read-Through: Application reads only from the Cache Provider. If a miss occurs, the Cache Provider itself fetches data from the DB, populates itself, and returns it to the application.
2. Write-Through: Application writes only to the Cache Provider. The Cache Provider synchronously writes to the DB before confirming success to the application.
3. Write-Behind (Write-Back): Application writes only to the Cache Provider. The Cache Provider acknowledges success immediately and writes to the DB asynchronously in background batches.
4. Write-Around: Application writes data directly to the DB, bypassing the cache entirely. The cache is populated only on subsequent reads.

## Redis Architecture & Internal Mechanics

### Concept 1: The Redis Event Loop & Single-Threaded Core
Many engineers incorrectly say "Redis is single-threaded." As we established in our diagnostic, command execution on data structures is single-threaded, but modern Redis (6.0+) uses multi-threading for network I/O and background tasks.

### How Redis Handles 100,000+ Concurrent Connections on One Core: I/O Multiplexing
How can a single thread process thousands of concurrent client requests without blocking?

In traditional blocking network I/O (e.g., standard Tomcat threads), each socket connection requires a dedicated OS thread. 10,000 connections = 10,000 threads, causing massive context switching and memory overhead.

Redis uses I/O Multiplexing (via Linux system calls like epoll, macOS kqueue, or BSD select):

```text
Clients (10,000 Connections)
    │   │   │   │   │
    ▼   ▼   ▼   ▼   ▼
  [ Network Socket Buffers ]
            │
            ▼
     ┌──────────────┐
     │  epoll()     │  <-- Non-blocking event demultiplexer
     └──────┬───────┘
            │  Returns list of ready file descriptors (sockets)
            ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ REDIS MAIN EVENT LOOP (ae.c)                                │
 │                                                             │
 │  1. Read requests from ready sockets                        │
 │  2. Parse RESP protocol                                     │
 │  3. Execute Command sequentially (O(1) Memory Hashtable)   │
 │  4. Write response back to socket output buffers            │
 └─────────────────────────────────────────────────────────────┘
```

### SCAN vs KEYS

SCAN does not run on another thread. It runs on the exact same single-threaded main event loop as KEYS. The crucial difference is that KEYS iterates through all 15 million keys in one single, massive blocking execution step, whereas SCAN iterates through a small batch (default ~10 keys, configurable via COUNT) and immediately returns a numerical cursor. Between consecutive SCAN calls, the main event loop is freed to process hundreds of regular $O(1)$ client requests (GET/SET).


#### What Happens During KEYS session:* (The Cascading Failure Timeline)

```text
Time (ms)    Redis Main Thread (ae.c)                OS Socket Buffers / Spring Boot
─────────    ────────────────────────                ───────────────────────────
T = 0ms      Receives `KEYS session:*`              
T = 100ms    Scanning 15M keys hashtable...          Incoming 8,000 requests fill OS socket buffers
T = 500ms    Still scanning...                      Socket buffers full! Backpressure sent to clients
T = 1,000ms  Still scanning...                      Spring Boot Lettuce/Jedis connection pool exhausted
T = 2,000ms  Finishes scan & returns result         Spring Boot throws `RedisCommandTimeoutException`
```

1. Redis Event Loop Stall: The single thread enters an internal loop traversing the main dictionary hash table. It cannot break out until all 15 million bucket pointers are evaluated.
2. Kernel Socket Backpressure: While the thread is stuck for ~2–3 seconds, new TCP packets for the 80k req/sec arrive at the OS network interface and sit in the OS SO_RCVBUF (receive buffer).
3. Application Thread Pool Exhaustion: Spring Boot application threads issuing GET/SET commands block waiting for Redis socket responses. Their connection pools (Lettuce/Hikari) max out, blocking incoming web HTTP traffic across all 50 microservice instances.
4. Widespread Outage: Web clients receive 504 Gateway Timeout or 500 Internal Server Error.

#### How SCAN Works at the Event Loop Level

```text
Client                                  Redis Main Event Loop
──────                                  ─────────────────────
1. SCAN 0 MATCH session:* COUNT 1000 ──> Iterates 1,000 buckets (takes 0.05ms)
   <── Returns [Cursor: 4096, Keys...]   Event loop immediately released!

   [Processes 500 normal GET/SET commands for other users]

2. SCAN 4096 MATCH session:* COUNT 1000 ─> Iterates next 1,000 buckets (takes 0.05ms)
   <── Returns [Cursor: 8192, Keys...]   Event loop released again!
```

### Redis Persistence Mechanics: RDB vs. AOF.

Redis provides two distinct persistence mechanisms to balance raw memory performance with disk durability:

1. RDB (Redis Database Snapshots): Point-in-time compact binary snapshots of the dataset written to disk (e.g., dump.rdb) at fixed intervals (e.g., every 5 minutes or every 10,000 writes).
2. AOF (Append-Only File): Logs every write command received by the server to an append-only log file (appendonly.aof).

### The Copy-on-Write (CoW) Mechanism in RDB

When Redis creates an RDB snapshot via BGSAVE (Background Save), it does not lock the dataset while writing to disk. Instead, it calls the Linux fork() system call:

```text
Parent Process (Redis Main Thread) ──fork()──> Child Process (RDB Writer)
         │                                              │
         ▼                                              ▼
  Shared Virtual Memory Pages ◄───────────────── Reads Memory Pages &
  (Point-in-time Snapshot)                        Writes to `dump.rdb`
```
fork() creates a child process that shares the parent's virtual memory pages using OS Copy-on-Write (CoW).

## Concept Primer: Linux Copy-on-Write (CoW) & fork()

When Redis executes BGSAVE to create an RDB snapshot:

1. The main Redis process calls fork(). This creates a child process.
2. The child process doesn't duplicate all 32 GB of RAM instantly. Instead, Linux marks all physical memory pages as Read-Only and shares them between the parent and child process via page tables.
3. The child process iterates through the shared pages and writes them to the dump.rdb file.
4. The CoW Trigger: If a client sends a write command (SET key value) while BGSAVE is running, the parent Redis process needs to modify a memory page. Because that page is marked Read-Only, the OS kernel intercepts the write, allocates a brand-new 4 KB memory page, copies the original data over, and updates it for the parent.


### Question(You manage a Redis server with 32 GB RAM occupied on a host server with 40 GB total RAM.)

1. Traffic: 20,000 high-frequency write operations per second (SET, HSET, INCR).
2. Trigger: An automated BGSAVE starts to write an RDB snapshot to disk.
3. Duration: Writing 32 GB to disk takes 40 seconds.

During those 40 seconds, incoming user writes modify 10 GB worth of existing keys.

#### Host Memory Usage Spike

* At $T=0$, total RAM used is 32 GB (shared between parent and child).
* As 20,000 writes/sec arrive over 40 seconds, incoming writes modify 10 GB of existing memory pages.
* The OS allocates new memory pages for every modified page via Copy-on-Write.
* Total RAM consumption rises from 32 GB $\rightarrow$ 32 GB + 10 GB = 42 GB RAM.

#### The Catastrophic Event: Linux OOM Killer

* The host server only has 40 GB of total physical RAM.
* When memory demand hits 42 GB, memory is completely exhausted, and swap space (if disabled or full) cannot fulfill allocation requests.
* The Linux Kernel invokes the OOM Killer (Out-Of-Memory Killer). It evaluates process memory footprints and forcibly terminates the main Redis process with SIGKILL (Exit Code 137), causing an immediate outage.

#### Production Prevention Strategies

1. Set maxmemory conservatively: Never allocate 100% of host RAM to Redis. A common rule of thumb is to set maxmemory to 60%–70% of host RAM (e.g., set maxmemory to ~22 GB on a 40 GB server) to leave a safety margin for Copy-on-Write allocations.
2. Configure Kernel Memory Overcommit: Set the Linux sysctl configuration vm.overcommit_memory = 1 so fork() calls don't fail immediately under high memory allocation.
3. Disable Huge Pages: Disable Transparent Huge Pages (THP) on the Linux host (echo never > /sys/kernel/mm/transparent_hugepage/enabled). Standard page sizes are 4 KB, but THP allocates 2 MB pages. With THP enabled, modifying a single 10-byte string forces Linux to copy an entire 2 MB page, multiplying Copy-on-Write memory overhead by hundreds of times!

## AOF (Append-Only File) Persistence & Fsync Policies.

Instead of point-in-time snapshots, AOF appends every write command (SET, INCR, HDEL) to an in-memory buffer, which is then written to disk (appendonly.aof).

Redis provides three configuration modes for flushing the AOF buffer from kernel page cache to physical disk using the fsync() system call:

1. appendfsync always: Calls fsync() after every single write command.
2. appendfsync everysec: Calls fsync() asynchronously in a background thread once per second (Default).
3. appendfsync no: Hands data to OS page cache and lets Linux decide when to flush (typically every 30 seconds).

### AOF(Rewrite)
AOF Rewrite (BGREWRITEAOF) is file size compaction, not node replication. If a key is updated 100 times (INCR counter), the AOF file grows to store 100 separate command lines. An AOF Rewrite scans the current in-memory state and replaces those 100 lines with a single SET counter 100 command, shrinking file size and drastically speeding up server startup recovery times.

```text
Before Rewrite (Raw AOF - 100 MB):     After Rewrite (Compacted AOF - 1 KB):
----------------------------------     ------------------------------------
SET user:100 "Alice"                   SET user:100 "Bob"
SET user:100 "Bob"                     INCR counter 3
INCR counter 1
INCR counter 1
INCR counter 1
```

| Property            | appendfsync always                             | appendfsync everysec             |
|---------------------|------------------------------------------------|----------------------------------|
| Data Loss Window    | 0 bytes(Strict Durability)                     | Up to 1-2 seconds                |
| Throughput Impact   | Drops from 100k+ ops/sec to ~2k-5k ops/sec     | High performance (~100k ops/sec) |
| Main Thread Latency | High(stuck waiting for SSD write confirmation) | Low (~sub millisecond)           |


### Why appendfsync always Slows Down 50,000 Writes/sec

* Writing to RAM takes nanoseconds.
* Executing fsync() forces the OS kernel to flush its page cache to physical SSD storage, taking 1ms to 10ms.
* Because Redis executes commands sequentially on its single main thread, performing a synchronous disk fsync() on every command drops throughput to match physical disk write speeds, completely destroying Redis's speed advantage.

## Structural Selection & Memory Internals

| Data Structure   | Internal Implementation              | O(1) Operations     | Best Production Use Case                               |
|------------------|--------------------------------------|---------------------|--------------------------------------------------------|
| String           | SDS (Simple Dynamic String)          | GET, SET, INCR      | Simple Caching, Counters, Distributed Locks            |
| Hash             | ZipList / ListPack / HashTable       | HGET, HSET          | Objects, User Profiles, Partial Updates                |
| List             | QuickList (Linked list of zip lists) | LPUSH, RPOP         | Message Queues, Activity Feeds                         |
| Set              | IntSet / HashTable                   | SADD, SISMEMBER     | Unique Identifiers, Tagging, Intersections             |
| Sorted Set(ZSet) | SkipList + HashTable                 | ZADD, ZRANGEBYSCORE | Leaderboards, Rate Limiters, Delayed Job Queues        |
| Stream           | Radix Tree                           | XADD, XREADGROUP    | Multi-consumer Durable Event Streaming                 |
| Bitmap           | String Bitfield                      | SETBIT, GETBIT      | DAU / Attendance Tracking, Presence                    |
| HyperLogLog      | Probabilistic Cardinality            | PFADD, PFCOUNT      | Approximate Unique Counts (Millions of items in 12 KB) |

## Redis Object Overhead(robj)
Every single key stored in Redis comes with a fixed metadata tax called the Redis Object Structure (robj).

Even if you store a tiny 1-byte String, Redis wraps it in a 16-byte header containing type info, encoding info, LRU timestamps, and reference counts, plus a pointer in the global dictionary hashtable (~32 bytes).

* Approach A (40 Million String Keys): You pay this metadata tax 40 million times. The metadata overhead alone easily exceeds 3 GB to 4 GB of RAM before you even store user data!
* Approach B (10 Million Hash Keys): You pay the main key tax 10 million times instead of 40 million, instantly cutting key overhead by 75%.

## How Small Hashes Save Memory: listpack / ziplist
When a Hash has a small number of fields (default < 64 fields), Redis does not create a full hashtable with pointers for every field.

Instead, it encodes the Hash internally as a listpack (a compact, sequential array in memory):

```text
Standard Hashtable (Pointers + Hashes):
[ Key Pointer ] ──> [ Hash Node ] ──> [ Key robj ] ──> [ Value robj ] (Huge RAM tax!)

Listpack Encoding (Contiguous Memory Array):
┌────────────┬────────────┬─────────────┬─────────────────┬───────────┬───────────┐
│ field:name │ val:"Alice"│ field:email │ val:"a@ex.com"  │ field:age │ val:"30"  │
└────────────┴────────────┴─────────────┴─────────────────┴───────────┴───────────┘
```
Because elements sit side-by-side in a contiguous memory block, there are zero pointers, zero hash overheads, and zero extra robj headers. This achieves up to 80% memory reduction for object datasets!

* Why Hash (Approach B) saves RAM: Storing fields inside a single Hash avoids creating millions of separate global dictionary keys. Each global key incurs roughly ~80 bytes of overhead for dict entries and robj headers. Grouping fields under 10M Hash keys saves 30M global dictionary entries.
* listpack / ziplist Encoding: Small Hashes convert to contiguous byte arrays in RAM. This removes memory fragmenting pointers, packing fields and values tightly together.
* When to choose Approach A (Individual Strings):
  * When fields need independent TTLs (e.g., user:1000:session expires in 10 mins, but user:1000:profile never expires). Fields inside a Hash cannot have individual TTLs in standard Redis!
  * When fields require individual string operations, like atomic bit operations (SETBIT) or string appends.

## Sorted Sets (ZSet)

A Sorted Set (ZSet) holds unique String elements, but maps every element to a floating-point Score. Redis automatically keeps the elements ordered by their score.

* Internal Implementation: Dual structure consisting of a HashTable (for $O(1)$ score lookups by element) + a SkipList (for $O(\log N)$ range queries and ordering).

### SkipLists & Sorted Sets (ZSet)
A Sorted Set stores unique elements, where every element is assigned a numerical Score. Redis keeps all elements ordered by score using a SkipList (a multi-level linked list that allows binary-search-like jumps) paired with a HashTable.

### The Redis Commands for a Leaderboard

| Requirement       | Redis Command                        | What it Does                                                 |
|-------------------|--------------------------------------|--------------------------------------------------------------|
| Update Score      | ZADD leaderboard 4500 "player_100"   | Inserts or updates player_100's score to 4500.               |
| Fetch Global Rank | ZREVRANK leaderboard "player_100"    | Returns 0-based rank ordered from highest score to lowest.   |
| Fetch Top 10      | ZREVRANGE leaderboard 0 9 WITHSCORES | Returns the top 10 players and their scores in milliseconds. |

### Time Complexity at 10 Million Users
* ZADD (Update): $O(\log N)
* $ZREVRANK (Rank): $O(\log N)
* $For $N = 10,000,000$, $\log_2(10,000,000) \approx 24$ operations! Whether you have 1,000 players or 10 million, Redis calculates rank in less than 1 millisecond.

### Why SQL Databases Fail at Scale for Real-Time Leaderboards

Running SELECT user_id, score FROM players ORDER BY score DESC LIMIT 10 on PostgreSQL under thousands of concurrent updates causes severe bottlenecks:

1. Index Maintenance Overhead: Frequently updating scores requires rebuilding B-Tree index pages on disk synchronously.
2. Rank Calculation Cost: Finding a specific user's rank in SQL requires scanning all rows above them (COUNT(*) WHERE score > my_score), taking hundreds of milliseconds and consuming heavy DB CPU IOPS under peak write traffic.

## Probabilistic Data Structures & HyperLogLog

When counting unique items (cardinality) at massive scale—like unique visitors, unique IP addresses, or unique search queries—storing every single ID in a standard Set takes gigabytes of memory because the set must remember every raw value to check for duplicates.

HyperLogLog doesn't store the actual IDs. Instead, it runs a hash function on incoming inputs and uses the distribution of leading zeros in the hash binary representations to estimate the total number of unique items with high mathematical accuracy.

* Memory Consumption:
  * Standard Set: ~3.5 GB for 50 million user IDs.
  * HyperLogLog: 12 KB fixed size. Whether you track 100 unique users or 1 billion unique users, a Redis HyperLogLog never exceeds 12 KB of RAM!
* The "Catch" (Trade-off):
  * Standard Error Rate: It is a probabilistic structure. It provides an estimated count with a standard error rate of 0.81%. (e.g., if true count is 1,000,000, HLL might report 991,900 or 1,008,100).
  * No Value Retrieval: You cannot retrieve the actual user IDs (you can't ask "Did user_123 visit today?" or list the members). You can only ask for the overall distinct count.
* The Redis Commands:
  * PFADD daily_users:2026-10-13 "user_1001" (Adds user ID to HLL)
  * PFCOUNT daily_users:2026-10-13 (Returns estimated unique count in $O(1)$ time)

## Why Simple DECRBY Fails for Conditional Rules
If you try to use DECRBY user:100:credits 50 directly:

1. Redis will subtract 50 regardless of whether the user had enough credits.
2. If the user only had 30 credits, their balance drops to -20 (negative credits!).
3. To undo it, you'd have to issue an INCRBY to roll it back, creating a window where another thread sees invalid negative credits and causes race condition anomalies.

### 1. Why DECRBY Alone Fails

DECRBY is a simple subtraction command—it cannot perform conditional if/else checks. It cannot check if credits >= cost before deciding whether to deduct.

### 2. How Lua Scripting Guarantees 100% Atomicity
Redis executes Lua scripts entirely inside its main single-threaded event loop. When you run a script using EVAL:

```shell
-- Atomic Lua Script executed directly on Redis Server
local current_credits = tonumber(redis.call('GET', KEYS[1]))
local cost = tonumber(ARGV[1])

if current_credits and current_credits >= cost then
    redis.call('DECRBY', KEYS[1], cost)
    return 1  -- Success!
else
    return 0  -- Insufficient funds!
end
```
The GET, the comparison current_credits >= cost, and the DECRBY all execute in a single, uninterruptible atomic step. No other application thread can modify user:100:credits in between the check and the write!

### 3. What Happens to Other Commands During Lua Execution?

Because Redis runs command execution on a single thread:
* All other incoming client commands wait in line while the Lua script is running.
* Once the Lua script finishes, Redis picks up the next queued command in the event loop.
* Production Rule: Lua scripts must be lightweight and fast ($O(1)$ or small operations). Never run long loops inside a Redis Lua script, or it will block the entire server!

## What is Redlock?

To avoid relying on a single primary node (which might crash before replicating the lock to its replica), Redlock uses $N$ fully independent Redis primary nodes (typically 5 separate master servers with no replication between them).

### How Redlock Acquires a Lock (Majority Quorum)

To acquire a lock using Redlock:
* The application gets a current timestamp $T_1$.
* It tries to acquire the lock (SET resource token NX PX 10000) sequentially across all 5 independent Redis nodes with a small timeout per node (e.g., 5–50ms).
* The application calculates time spent: $\text{Elapsed Time} = T_2 - T_1$.
* Acquisition Rule: The lock is considered successfully acquired ONLY IF:
  * It was acquired on a majority of nodes (at least 3 out of 5).
  * The total elapsed time is less than the lock validity time (e.g., acquiring took 1 second on a 10-second lock, leaving 9 seconds of safe validity).

### Why Distributed Systems Experts Criticize Redlock

Distributed systems researcher Martin Kleppmann published a famous critique of Redlock, highlighting two major vulnerabilities in asynchronous network environments:
* Unsynchronized System Clocks (Clock Drift): Redlock relies on physical system clocks to measure time decay across 5 independent servers. If Network Time Protocol (NTP) updates a server's clock forward, the lock on that node expires prematurely.
* Process Pauses (GC / Stop-the-World Pauses):
  * Node A acquires locks on 3 of 5 Redis nodes.
  * Node A enters a 15-second Java Garbage Collection (GC) pause.
  * While Node A is frozen, the locks expire on all Redis nodes.
  * Node B requests the lock, acquires it on 3 nodes, and starts executing.
  * Node A wakes up from GC pause thinking it still owns the valid lock! 
  * Result: Node A and Node B run concurrently inside the critical section.

### What to Use Instead for Critical Safety
For systems requiring 100% strict correctness (like financial balance updates or inventory allocations), distributed consensus tools like Apache ZooKeeper, etcd, or Consul are preferred. They use formal consensus protocols (Raft or ZAB) and issue sequential Fencing Tokens (monotonically increasing IDs) to reject stale writes from paused processes.

## Redis Replication & Primary-Replica Topology

To scale read throughput and provide fault tolerance, Redis uses a Primary-Replica architecture:

1. Primary (Master): Handles 100% of Write commands and async-replicates mutations to Replicas.
2. Replica (Slave): Serves Read queries to offload read traffic from the Primary.


```text
                  ┌────────────────────────┐
                  │ Redis Primary (Master) │  <-- Writes (SET, INCR)
                  └───────────┬────────────┘
                              │
               Asynchronous Replication Stream
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
    ┌────────────────────┐        ┌────────────────────┐
    │  Redis Replica 1   │        │  Redis Replica 2   │  <-- Reads (GET)
    └────────────────────┘        └────────────────────┘
```
## The Replication Process (Full Sync vs. Partial Resync)

* Replication Backlog Buffer: The Primary maintains a circular memory buffer in RAM storing recent write stream commands, tracked by a Replication Offset counter.
* Partial Resynchronization (PSYNC): If a Replica briefly disconnects and reconnects, it sends its last offset to the Primary. If the missing commands are still inside the backlog buffer, the Primary sends only the missing delta.
* Full Synchronization: If the Replica was offline too long and the buffer wrapped over, the Primary forks a child process to create a full RDB snapshot, streams the entire RDB file over the network to the Replica, and the Replica loads it into RAM from scratch.

## Asynchronous Replication Data Loss

* Asynchronous Data Loss: Excellent! You correctly deduced that under asynchronous replication, if the primary acknowledges the write and crashes before streaming it, the write is permanently lost when the replica is promoted.
* Why Asynchronous is Default (Latency Protection): You nailed the main trade-off: synchronous replication forces the primary to wait for network round-trips to replicas before responding, destroying Redis's sub-millisecond write latency.
* min-replicas-to-write Purpose: You correctly identified that min-replicas-to-write forces the primary to ensure a minimum number of healthy replicas are connected and acknowledging replication stream progress before accepting writes.

## The Replication Crash Timeline

```text
Client               Primary Node                Replica Node
──────               ────────────                ────────────
1. SET user:100 ───> Executes in RAM
2. Returns "OK" <───
                     [Primary Crashes!] ⚡
                     (Write never reached network buffer to Replica)
                                                 3. Sentinel promotes Replica
                                                    (Data for user:100 is LOST)
```
## Asynchronous vs. Synchronous Trade-offs

### Asynchronous (Default):
* Primary writes to its local RAM $\rightarrow$ Returns success to client $\rightarrow$ Asynchronously flushes delta to replica socket buffer.
* Latency: ~0.2ms (Ultra-fast).
* Risk: Small window of lost writes if Primary dies before sending data.

## Synchronous (WAIT command):
* Primary writes to local RAM $\rightarrow$ Streams to Replicas $\rightarrow$ Waits for $N$ replicas to confirm $\rightarrow$ Returns success to client.
* Latency: Driven by network RTT across servers (~2ms–10ms).

## min-replicas-to-write vs min-replicas-max-lag

To protect against lost writes and split-brain scenarios, we configure min-replicas-to-write N and min-replicas-max-lag M. If fewer than $N$ healthy replicas are sending heartbeats within $M$ seconds, the primary halts write operations, preventing data divergence during failovers."

## Replication asynchronous

Replication is asynchronous by default to protect low-latency performance. Synchronous replication forces the primary event loop to stall while waiting for network round-trips (RTT) and replica acknowledgments, dropping throughput from 100k ops/sec to network-bound limits.

## Redis Cluster Architecture & Hash Slots.

### Hash Slots & Sharding Mechanics

* Redis Cluster splits the entire key space into 16,384 Hash Slots (numbered 0 to 16383).
* Every Primary Node in the cluster is assigned a subset of these 16,384 slots.
* Every key is mapped to a slot using the formula:

```markdown
Slot = CRC16(key) (mod 16384)
```

## Multi-Key Operations in a Sharded Cluster
In a single Redis instance, all keys live in the same memory dictionary, so commands operating on multiple keys (like MGET, MSET, multi-key transactions, or Lua scripts) execute easily.

In Redis Cluster, data is partitioned across multiple primary nodes based on 16,384 Hash Slots:

* Node A might own Slots 0–5460.
* Node B might own Slots 5461–10922.
* Node C might own Slots 10923–16383.

If you request an operation involving two keys:

1. CRC16("user:100:profile") % 16384 $\rightarrow$ Maps to Slot 2410 (Node A).
2. CRC16("user:100:cart") % 16384 $\rightarrow$ Maps to Slot 8912 (Node B).

To execute an atomic transaction or Lua script across both keys, Redis would have to coordinate distributed locking across Node A and Node B over the network. To avoid massive network latency and distributed lock complexity, Redis Cluster strictly forbids multi-key commands if the keys belong to different hash slots, throwing a CROSSSLOT error!

## Hash Tags {...}

Redis Cluster provides a feature called Hash Tags.

If a key contains {...} curly braces, Redis ignores the rest of the string and calculates the CRC16 hash slot ONLY on the text inside the braces.

```text
Standard Hashing:
  CRC16("user:100:profile") -> Slot 2410 (Node A)
  CRC16("user:100:cart")    -> Slot 8912 (Node B)
  Result: CROSSSLOT Error!

Hash Tag Hashing:
  CRC16("{user:100}:profile") -> Hashes ONLY "user:100" -> Slot 5210 (Node A)
  CRC16("{user:100}:cart")    -> Hashes ONLY "user:100" -> Slot 5210 (Node A)
  Result: Both keys guaranteed to land on Node A! Multi-key operation succeeds!
```

1. Why CROSSSLOT Happens: Redis Cluster executes multi-key operations (pipelines, transactions, Lua scripts) on a single node's event loop to guarantee performance and atomicity. If keys map to different hash slots residing on separate cluster nodes, Redis refuses the command.
2. How Hash Tags Solve It: By wrapping the common entity identifier in curly braces—{user:100}:profile and {user:100}:cart—Redis forces the hashing algorithm to calculate the slot based only on user:100. This guarantees both keys land on the exact same hash slot and same cluster node.

## The Hot Slot Hazard

While Hash Tags allow atomic multi-key operations in a Cluster, use them carefully! If you put the same Hash Tag {popular_tag} on millions of keys, all of those millions of keys will be routed to the same single node, creating a Hot Slot / Hot Node and defeating the purpose of horizontal cluster sharding.

## The Problem with Fixed-Window Rate Limiting

If you use a simple fixed-window counter (INCR user:100:2026-10-13-10:00 with 60s TTL), a user can exploit the boundary window:

* Sends 100 requests at $t = 59\text{s}$ (End of Window 1).
* Sends 100 requests at $t = 61\text{s}$ (Start of Window 2).
* Result: User successfully executed 200 requests within a 2-second period, bypassing your rate limit!

```text
Fixed Window Spike Vulnerability:
  Window 1 (0s - 60s)         │ Window 2 (60s - 120s)
  ────────────────────────────┼────────────────────────────
                   [100 reqs] │ [100 reqs]
                      59s     │ 61s
                   └──────────┴──────────┘
                    200 reqs in 2 seconds!
```

## The Sliding Window Pattern
Instead of counting requests in fixed 1-minute blocks (e.g., 10:00 to 10:01), a Sliding Window tracks every request as a timestamp in a rolling 60-second time frame (e.g., looking back exactly 60 seconds from the current millisecond $T_{\text{now}}$).

To do this, we use a Redis Sorted Set (ZSet) where:

* Key: rate_limit:{user_id}
* Score: UNIX timestamp in milliseconds (T_now)
* Member/Value: Unique request identifier (or timestamp + random UUID)

### Purge Stale Requests (ZREMRANGEBYSCORE):
Remove all requests from the Sorted Set older than 60 seconds ago (T_now - 60000ms):
```text
ZREMRANGEBYSCORE rate_limit:user_123 0 (T_now - 60000)
```

### Count Active Requests (ZCARD):
Count the total remaining elements in the set:

```text
ZCARD rate_limit:user_123
```

### Evaluate Limit & Add (ZADD):

* If count < 100: Add the new request timestamp to the set (ZADD rate_limit:user_123 T_now T_now_uuid), set key TTL to 60 seconds (EXPIRE), and ALLOW the request.
* If count >= 100: REJECT the request (Return HTTP 429 Too Many Requests).

### Why It MUST Be an Atomic Lua Script
If you run ZREMRANGEBYSCORE, ZCARD, and ZADD as separate network calls from your Spring Boot application:

* Under high concurrency, 50 requests from user_123 can pass the ZCARD check simultaneously when the count is at 99.
* All 50 requests see count = 99 < 100 and proceed to execute ZADD, pushing the count to 149 and failing the rate limit.

```shell
-- KEYS[1]: rate_limit:{user_id}
-- ARGV[1]: Current Timestamp (ms)
-- ARGV[2]: Window Size (ms) -> 60000
-- ARGV[3]: Max Limit -> 100
-- ARGV[4]: Unique Request ID (UUID)

local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local clear_before = now - window

-- 1. Remove timestamps outside the current sliding window
redis.call('ZREMRANGEBYSCORE', key, 0, clear_before)

-- 2. Count current requests in window
local current_requests = redis.call('ZCARD', key)

-- 3. Check limit
if current_requests < limit then
    -- Add current request
    redis.call('ZADD', key, now, ARGV[4])
    redis.call('EXPIRE', key, math.ceil(window / 1000))
    return 1 -- ALLOWED
else
    return 0 -- BLOCKED
end
```

## Big Keys & Memory Deallocation

### Why HGETALL Took 120ms and Blocked Redis

HGETALL is an $O(N)$ command that reads every single field and value inside a Hash.

* If a Hash key contains 2 million fields ("Big Key"), Redis must serialize all 2 million items into the RESP protocol and send them over the network.
* Because Redis executes commands on a single main thread, processing that 120ms HGETALL halts the entire event loop. Thousands of lightweight $O(1)$ GET and SET commands queued behind it are forced to wait, causing system-wide latency to jump from 1ms to over 200ms!

### How to Find Big Keys Safely: redis-cli --bigkeys
To detect oversized keys in production without crashing the server, run:

```text
redis-cli -h <host> -p <port> --bigkeys
```
This tool uses non-blocking cursor-based SCAN commands under the hood to sample the key space, identifying the largest Strings, Hashes, Sets, Lists, and Sorted Sets without locking the event loop.

### How to Delete Big Keys Safely: UNLINK vs. DEL

If you execute a standard DEL my_big_hash on a key containing 5 million elements:

* Redis synchronously traverses the entire memory block on the main thread to free memory bytes, blocking the server for several seconds.

The production-safe alternative is UNLINK:

```text
redis-cli> UNLINK my_big_hash
```

* UNLINK (Lazy Freeing): Instantly detaches the key pointer from the global dictionary in O(1) time, making it invisible to clients immediately.
* It hands the heavy memory deallocation work to a background thread (bio.c) to reclaim memory asynchronously without blocking the main event loop!








