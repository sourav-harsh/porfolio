---
title: "Caching in Spring Boot."
date: "2026-09-08"
excerpt: "How the JWT and Spring Security works in terms of authentication and authorization."
tags: []
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
