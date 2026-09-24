---
title: "Caching in Spring Boot."
date: "2026-09-08"
excerpt: "Complete understanding of caching in Spring Boot."
tags: ["Cache Stamping", "Cache Penetration","Caching strategies"]
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
