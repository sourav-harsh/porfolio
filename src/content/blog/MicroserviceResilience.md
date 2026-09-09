---
title: "Microservice Resilience."
date: "2026-09-09"
excerpt: ""
tags: []
---

## What is cascading failures in microservices?

A cascading failure in microservices is a chain reaction where one struggling service causes dependent services to exhaust their resources and crash.

### Common Causes

* *Slow dependencies:* A downstream service gets slow, forcing upstream threads to wait and block.
* *Resource exhaustion:* Waiting requests fill up connection and thread pools until the parent service runs out of memory.
* *Retry storms:* Upstream clients aggressively retry failing requests, adding a heavy load to an already recovering service.
* *Unbounded queues:* Incoming requests pile up infinitely with no drop policy or limit

### How to Prevent Them

* *Circuit Breakers:* Use tools like the Circuit Breaker to stop sending requests to a failing service once errors pass a set limit.
* *Timeouts:* Set strict time limits on every network call so threads never wait forever.
* *Bulkheads:* Isolate resource pools (like thread pools) for different dependencies so one broken service cannot starve others.
* *Exponential Backoff:* Add growing delays and jitter to retries to stop retry storms.
* *Fallback Pattern:* Provides an alternative response, cached data, or default behavior when a primary service or operation completely fails, maintaining core user functionality.
* *Rate Limiting & Load Shedding:*  Controls incoming traffic by restricting the number of requests allowed over a specific timeframe or dropping non-critical workloads when the system is under heavy stress.

## Why a slow downstream service can affect the calling service.

A slow downstream service affects the calling service by trapping its resources—such as worker threads and connection pools—while it waits for a reply, which causes the calling service to slow down, freeze, or crash entirely.

When one part of a system lags, it creates a traffic jam that spreads backward to the caller. Here is how this happens:

### Thread Pool Exhaustion

* *The Problem:* A thread (a small worker process inside a computer program) handles incoming user requests.
* *The Effect:* When the downstream service is slow, the threads on the calling service must stay awake and wait for the response. They cannot pick up new tasks. Soon, all available threads are busy waiting, and the calling service stops responding to new users.

### Connection Pool Exhaustion

* *The Problem:* A connection is an open digital pipeline used to send data between two services.
* *The Effect:* Services keep a limited number of these pipelines ready. If the downstream service takes too long to finish talking, those pipelines stay occupied. The calling service runs out of open connections and fails to talk to the downstream service at all.

### Memory Build-up

* *The Problem:* The calling service holds onto data while it waits for an answer.
* *The Effect:* If requests pile up faster than they finish, data sits in the computer's memory (RAM). This extra weight can trigger memory limits and crash the calling service's server.

### Cascading Failures and Retries

* *The Problem:* Users or automated systems get impatient when a app is slow.
* *The Effect:* They hit "refresh" or the app automatically retries the failed request. This multiplies the number of incoming requests, throwing a massive wave of extra traffic at an already struggling downstream service.

## Circuit Breaker States and behavior

A circuit breaker in software architecture operates through three main states—Closed, Open, and Half-Open—to prevent cascading failures when calling unstable downstream services.

### The Three States and Their Behaviour

#### 1. Closed State (Normal Operation)
* *Behaviour:* All application requests pass through to the target service normally.
* *Monitoring:* The breaker tracks metrics like error rates, slow response times, and timeouts over a rolling window.
* *Transition:* If failures cross a pre-configured threshold, it trips and moves to the Open state

#### 2. Open State (Tripped / Blocking)
* *Behaviour:* All outgoing requests are immediately rejected or routed to a fallback mechanism without hitting the broken service. 
* *Purpose:* Protects system resources and gives the downstream service time to recover.
* *Transition:* After a set timeout period expires, it shifts to the Half-Open state

#### 3. Half-Open State (Testing the Waters)
* *Behaviour:* A limited number of test requests are allowed to pass through to the target service.
* *Transition:* If these test calls succeed, the breaker assumes the issue is fixed and resets back to Closed. If any test call fails, it reverts back to Open to continue blocking calls

## Retry strategies in microservice resilience

Retry strategies in microservices automatically re-execute failed requests caused by temporary, transient issues like network hiccups or brief server load.

### Core Backoff Strategies

* *Immediate Retry:* Repeats the call instantly; avoid this because it can easily trigger a self-inflicted denial-of-service (DoS) or retry storm on struggling downstream services.
* *Linear Backoff:* Waits a predictable, incrementally increasing fixed amount of time between attempts (e.g., 1s, 2s, 3s)
* *Exponential Backoff:* The industry standard where the wait time doubles or grows exponentially with each failure (e.g., 1s, 2s, 4s, 8s) to give the downstream service time to breathe
* *Exponential Backoff with Jitter:* Adds random variance or "noise" to the exponential delay, preventing synchronized "thundering herd" spikes where hundreds of clients retry at the exact same millisecond.

## Limited Retries

Limited retries is a software and system design pattern that restricts the maximum number of times an operation is repeated after a failure before giving up.

### Why Use Limited Retries

* *Prevents infinite loops:* Stops background processes or clients from hammering a dead service forever.
* *Avoids retry storms:* Protects recovering servers from being overwhelmed by a "thundering herd" of endless automated requests.
* *Fails fast:* Surfaces persistent underlying errors quickly rather than masking them with endless latency

## What is retry stroms?

A retry storm is a failure pattern where a degraded or busy downstream service is bombarded with an overwhelming surge of synchronized, repeated requests from multiple upstream clients trying to recover from an error.

### How It Happens
* *The Trigger:* A service experiences a temporary (transient) glitch, slow response, or brief outage.
* *The Amplification:* Upstream clients or microservices immediately try again (retry) to complete their failed operations.
* *The Synchronization:* Without built-in randomness, thousands of clients timeout and retry at the exact same moment (the "thundering herd" effect).
* *The Collapse:* Instead of healing, the downstream service gets crushed by 10x or more of its normal traffic load, making recovery impossible.

### Key Symptoms

* *Massive Traffic Spikes:* Request volume multiplies exponentially far beyond normal baseline levels.
* *Severe Latency:* Processing times crawl or completely freeze as servers run out of CPU, memory, or connection pools.
* *Endless Outage Loops:* The backend repeatedly crashes, attempts to recover, and gets knocked down again by incoming retry waves.

### How to Prevent Retry Storms

* *Exponential Backoff:* Increase the wait time incrementally after each failed attempt (e.g., waiting 1s, then 2s, then 4s).
* *Jitter:* Add random variance to retry intervals so that clients do not hit the server at the exact same synchronized second.
* *Circuit Breakers:* Fail fast instead of hammering a broken service, allowing the downstream system time to actually stabilize and heal.
* *Retry Budgets:* Set strict quotas on the maximum number of allowable retries across a system to prevent compounding amplification

## Fallback and graceful degradation

Graceful degradation is a design philosophy where a system maintains core functionality and preserves user value instead of failing completely when a component or dependency breaks, while a fallback is the specific alternative mechanism (like cached data or a default state) used to achieve that resilience.

## What is resource isolation?

Resource isolation is a technique that separates computing, storage, or network resources to ensure that workloads or users do not interfere with or impact each other.

### 💡 Why it matters?

* Prevents the noisy neighbor problem where one heavy task starves others.
* Limits the blast radius if a single service or tenant is compromised.
* Guarantees fair share allocation of hardware capacity

### 📊 Common Implementation Layers

* Compute (Hypervisors/VMs): Separates physical hardware using virtual machine boundaries.
* OS/Containers (Namespaces & Cgroups): Restricts what processes can see and limits maximum consumption.
* Network (VLANs/VPCs): Segregates traffic to block unauthorized lateral movement.
* Access/Policy (IAM): Controls who or what can view specific administrative or data boundaries


## Thread/Connection exhaustion

Thread and connection exhaustion occur when an application runs out of reusable worker threads or database/network connections to handle incoming work, causing requests to queue up, latency to spike, and services to appear down even when CPU and memory usage look normal.

### What Causes Exhaustion

* Blocking I/O: Threads freeze waiting for slow external microservices, payment gateways, or APIs.
* Database Saturation: Long-running queries or connection leaks hold sessions too long, forcing incoming threads to block at getConnection().
* Unbounded Concurrency: Default thread pools (like Tomcat's 200 limit in Spring Boot) get completely consumed under burst traffic or slow dependencies.
* Cascading Failures: Health-check probes time out because worker threads are stuck, causing load balancers to kill or evict pods and dump all traffic onto the remaining healthy instances.

### How to Prevent and Fix It

* Bound and Separate Pools: Set strict limits on thread pools and never share high-throughput API pools with heavy background jobs.
* Enforce Timeouts: Add aggressive connect and read timeouts for all external HTTP clients and database queries so threads release quickly instead of waiting forever.
* Adopt Non-Blocking/Reactive I/O: Use asynchronous or reactive programming models where appropriate to handle high concurrency without locking up a dedicated thread per request.
* Monitor Queue Depth & Wait Times: Track active vs. maximum threads, queue length, and thread wait times rather than just looking at CPU and memory metrics.
