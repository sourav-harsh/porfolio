---
title: "SQL & Database Internals"
date: "2026-10-06"
excerpt: "SQL & Database Internals"
tags: ["SQL", "Database", "Inner Join", "Left Join", "Window Functions", "Aggregates Functions", "Dense Rank", "Rank", "Index Type", "BTree", "TID", "Fuzzy Read","Phantom Read","PostgreSQL Deadlock resolve","UPDATE Internals","Autovacuum","Table Bloat"]
visible: true
---

* Three-Valued Logic ($TRUE$, $FALSE$, $UNKNOWN$): The WHERE clause filters out any row where the condition does NOT evaluate strictly to $TRUE$. If a condition evaluates to $UNKNOWN$, it is treated as $FALSE$ by the WHERE clause filter.
* EXISTS vs IN with NULLs: EXISTS operates on set emptiness (does the inner query return any rows?), whereas IN operates on scalar equality checks (=). Because EXISTS cares only about whether at least one tuple is returned, it completely avoids the three-valued logic trap that breaks NOT IN.

## Production Impact
Using NOT IN with a subquery or list that might contain NULL values is a common cause of production bugs. If the subquery returns even a single NULL row, the entire outer query silently returns 0 rows, which can corrupt application logic, skip batch jobs, or return empty API responses without raising any database errors.

## Logical Execution Order vs Written Order
1. FROM - Identifies the base table (orders).
2. WHERE - Filters individual rows (status = 'COMPLETED'). Rows remaining: 101, 103, 104.
3. GROUP BY - Groups remaining rows by customer_id. Group 1: [101], Group 2: [103, 104].
4. HAVING - Filters groups based on aggregate conditions (SUM(amount) > 600).
5. SELECT - Computes expressions, aggregates (SUM, COUNT), and assigns aliases (total_spent).
6. ORDER BY / LIMIT - Sorts and truncates output.

## Inner join vs left join

* Inner Join: An INNER JOIN will only pair up rows where the customer ID matches perfectly in both tables. If there is a duplication in the second table it will return all the matching row not just the first one.
* Left Join: A LEFT JOIN guarantees that every single customer in your left table stays in the final result.  If there is a duplication in the second table it will return all the matching row not just the first one.

>[!Important]
> Query C (WHERE clause breaking LEFT JOIN): You selected user id = 3 (Charlie) for Query C. However, for Charlie, l.login_timestamp is NULL. The predicate l.login_timestamp > '2026-01-01' evaluates NULL > '2026-01-01' to $UNKNOWN$, filtering Charlie out!

## Window Functions and Aggregates Functions
* (OVER): Window functions perform calculations across a frame of rows while retaining every individual row's identity.Filter in `where` is not allowed
* GROUP BY (Data Reduction): Performs a physical aggregation pass where $N$ input rows belonging to a group key are collapsed into $1$ summary tuple. The detail rows disappear from the execution pipeline.  Filter in `where` is allowed.

## Dense Rank vs Rank

DENSE_RANK() assigns rank 2 to both emp 102 and 103 because of their matching $80,000$ salaries. If a 4th employee in IT had a $70,000$ salary, DENSE_RANK() would assign rank 3 (whereas RANK() would assign rank 4).

Dense Rank will assign the same rank for the same value attribute but for the next value it will assign the next rank.But in Rank() it will skip the next rank.

## Database Index Type

* Index Type Assumption: You stated that CREATE INDEX creates a "hash map." In PostgreSQL, standard indexes use a B+Tree / B-Tree structure, not an in-memory hash map. Hash indexes in databases do not handle range queries (<, >, BETWEEN), require high memory footprints, and lack standard B-Tree locking concurrency optimizations.
* Direct Hash Pointer Lookup: A database index does not point directly to raw byte addresses in RAM; it points to a physical Heap Tuple ID (TID) consisting of (BlockNumber, OffsetNumber) inside an 8KB page on disk.

## BTree indexing and TID(Tuple Id)

Every time if you add or make any entity the PostgresSQL store it in the chunk style and assign a unique TID to it. And if you add a index in it, it will store in the B-Tree structure where it store the key-value and TID in the leaf node. 

```text
[ POSTGRES STORAGE ON DISK ]
  ├── Heap File (users table)
  │    ├── Page 0    (8 KB chunk holding multiple rows)
  │    ├── Page 1    (8 KB chunk holding multiple rows)
  │    └── ...
  │    └── Page 402  <--- Contains actual row data!
  │
  └── B-Tree Index File (idx_users_email)
       ├── Root Node Page
       ├── Internal Node Pages
       └── Leaf Pages (Sorted emails + TIDs)
```

```text
[ Root Node Page ]
                 /        |         \
   ['a'...'d']  /   ['e'...'m']      \ ['n'...'z']
               v          v           v
    [ Internal Page ]  [ Internal Page ]  [ Internal Page ]
         /                  |                 \
        v                   v                  v
  [ Leaf Page 1 ]     [ Leaf Page 2 ]    [ Leaf Page 3 ]
  
  Inside Leaf Page 1 (Sorted List):
  ┌─────────────────────────┬──────────────┐
  │ Email Key               │ Heap TID     │
  ├─────────────────────────┼──────────────┤
  │ 'alice@example.com'     │ (Block 12, 4)│
  │ 'bob@example.com'       │ (Block 89, 1)│
  │ 'david@example.com'     │ (Block 402,12) <--- MATCH FOUND!
  └─────────────────────────┴──────────────┘
```
The tree traversal takes 2 to 3 fast disk/RAM operations to locate the exact leaf node entry. The result found at the leaf node is:

* Key: 'david@example.com'
* TID: (402, 12)

### Heap Page

Heap TID - A Tuple ID consists of two numbers: (BlockNumber, OffsetNumber).
* Block Number (402): The exact 8 KB page number in the main table file on disk.
* Offset Number (12): The slot index inside that specific 8 KB page.

```text
Heap Page / Block 402 (8 KB Structure)
 ┌─────────────────────────────────────────────────────────┐
 │ PAGE HEADER (Meta information about page 402)           │
 ├─────────────────────────────────────────────────────────┤
 │ ITEM POINTERS (Line Pointers / Array of offsets):       │
 │ Pointer 1  ──> [Points to Offset 1 Tuple Location]      │
 │ Pointer 2  ──> [Points to Offset 2 Tuple Location]      │
 │ ...                                                     │
 │ Pointer 12 ──> [Points to Tuple 12] ─────────┐          │
 ├──────────────────────────────────────────────│──────────┤
 │                                              │          │
 │              <--- UNALLOCATED FREE SPACE --->│          │
 │                                              │          │
 ├──────────────────────────────────────────────│──────────┤
 │ ACTUAL ROW TUPLES (Grows upward from bottom) v          │
 │ ...                                                     │
 │ [ Tuple 12 Data ]:                                      │
 │   id: 8492                                              │
 │   email: 'david@example.com'                            │
 │   name: 'David Miller'                                  │
 │   created_at: 2026-01-15 10:30:00                       │
 └─────────────────────────────────────────────────────────┘
```

### Summary: B-Tree Index Scan vs. Sequential Scan

| Feature            | IndexScan                                                 | Sequential Scan                                                                          |
|--------------------|-----------------------------------------------------------|------------------------------------------------------------------------------------------|
| How Pages are Read | Reads 2-3 index pages, then jumps directly to 1 heap page | Reads every single page sequentially                                                     |
| I/O Cost           | Extremely low(a few page reads)                           | High(reads the entire table file from disk/RAM)                                          |
| TID Role           | Index provides the explicit TID directly                  | Engine generated TID's dyanmically as it loops through every item pointer on every page. |

## Fuzzy Read(Non-Repeatable Read)

A Non-Repeatable Read (also known as a Fuzzy Read) occurs when a single transaction reads data twice and sees different values because another concurrent transaction modified and committed changes to those rows in between the reads.

## Phantom Read

Phantom Read: Reading a different number of rows (a changing row count) when re-executing a range query because another transaction inserted or deleted matching rows.

## How PostgreSQL Resolves Deadlocks

When a transaction blocks waiting for a lock, PostgreSQL starts a timer (deadlock_timeout, default 1s). If the lock isn't granted within that time:
1. The Deadlock Detector constructs a directed graph of transaction dependencies ("Txn A waits for Txn B").
2. It runs a cycle-detection algorithm on the graph.
3. If a cycle is found, PostgreSQL cancels the statement of the younger transaction, raising error 40P01: deadlock detected, forcing that transaction to ROLLBACK.

## The Production Fix: Lock Ordering Rule

To prevent deadlocks without altering row lock semantics, enforce a strict deterministic sorting order on primary keys before acquiring locks:

Always lock the row with LOWER(id) first, followed by HIGHER(id):
Because both Endpoint A and Endpoint B lock id = 1 first, Endpoint B will block at the very start before acquiring id = 2. Endpoint A finishes completely, commits, releases both locks, and Endpoint B proceeds safely without any deadlock.

## What Physically Happens on Disk during an UPDATE?

PostgresSQL table are append only heap files. Every row tuple has invisible header attributes: xmin(creating transaction ID) and xmax(deleting/superseding transaction ID).

When `UPDATE users SET status = 'ACTIVE' WHERE id = 42'` executes:

1. PostgresSQL does not overwrite the old row in place.
2. It writes an entirely new tuple into an 8KB heap page with xmin = Current_Txn_ID.
3. It updates the old tuple's header metadata, setting xmax = Current_Txn_ID.

```text
[ Heap Page ]
+-------------------------------------------------------------+
| Tuple 1 (Old): id=42, status='PENDING', xmin=100, xmax=105  | <-- Dead Tuple
| Tuple 2 (New): id=42, status='ACTIVE',  xmin=105, xmax=0    | <-- Live Tuple
+-------------------------------------------------------------+
```

### Autovacuum & Table Bloat

* Dead Tuple: A tuple where xmax is set and lower than any active transaction's snapshot horizon. No running or future transaction can ever see it.
* Autovacuum Worker: A background daemon that scans heap and index pages, marks space occupied by dead tuples as reusable in the Free Space Map(FSM), and updates the Visibility Map(VM).
* Table & Index Bloat: VACUUM usually does not shrink the physical file size on disk or return space to the OS; it merely marks space within the 8KB page as reusable for future INSERT. If Autovacuum falls behind or is blocked by long-running transactions, dead tuples accumulated across thousands of pages.Queries must read those dead pages into memory anyway, causing severe query degradation and high disk I/O. 
