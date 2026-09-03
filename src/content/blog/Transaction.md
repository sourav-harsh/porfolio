---
title: "Transactional In Spring"
date: "2026-09-03"
excerpt: "In any real-world application, especially when interacting with databases, managing data integrity is crucial. Transactions allow us to ensure that a group of operations are executed in an "all-or-nothing" fashion. This means that if one operation fails, all changes made by other operations in the transaction should be rolled back, leaving the system in a consistent state."
tags: ["Transaction Isolation","Transaction Propagation","Optimistic Locking","Pessimistic Locking","Dirty Check","Race Condition","Concurrency"]
---

## What is a Transaction?

A transaction is a sequence of operations that are treated as a single unit of work. These operations either succeed together or fail together. For example, in a banking system, transferring money from one account to another involves debiting one account and crediting another. Both operations must succeed, or neither should be completed.

## Why Do We Need Transactions?

Without transactions, partial operations could leave the system in an inconsistent state, resulting in data corruption or loss. Transactions ensure:

* **Atomicity:** All operations in a transaction are completed successfully, or none at all.
* **Consistency:** The system remains in a valid state before and after the transaction.
* **Isolation:** Transactions occur independently, without interference.
* **Durability:** Once a transaction is committed, the changes are permanent, even if the system crashes.

## How Does @Transactional Work Internally?

Spring uses Aspect-Oriented Programming (AOP) and dynamic proxies internally to manage database transactions when you use @Transactional

### 1. Proxy Creation

* When your application starts, Spring scans for the @Transactional annotation.
* Instead of giving your actual service class to other components, Spring creates a proxy object wrapping around your target bean.
* Spring uses JDK dynamic proxies if your class implements an interface, or CGLIB to generate a subclass proxy if it does not.

>[!Important]
> Difference between JDK dynamic proxy and CGLIB proxy
>* **JDK dynamic proxy:** Creates a proxy object that implements the same interfaces as the original class. It is faster and more lightweight.
>* **CGLIB proxy:** Creates a subclass of the original class. It is slower and heavier, but can handle more complex scenarios.

### 2. Method Interception
* When another class calls your annotated method, it actually calls the proxy.
* The proxy intercepts the call and hands control over to the **TransactionInterceptor** via Spring AOP's **"around advice"**

```java
public class TransactionInterceptor {

    @Nullable
    public Object invoke(final MethodInvocation invocation) throws Throwable {
        try {
            beginTransaction(); 
            invocation.proceed(); // your actuall code called here
            commit();
        } catch(Exception ex) {
            rollback();
        }
    }
}
```

```java
@Nullable
public Object invoke(final MethodInvocation invocation) throws Throwable {
    Class<?> targetClass = invocation.getThis() != null ? AopUtils.getTargetClass(invocation.getThis()) : null;
    return this.invokeWithinTransaction(invocation.getMethod(), targetClass, new TransactionAspectSupport.CoroutinesInvocationCallback() {
        @Nullable
        public Object proceedWithInvocation() throws Throwable {
            return invocation.proceed();
        }

        public Object getTarget() {
            return invocation.getThis();
        }

        public Object[] getArguments() {
            return invocation.getArguments();
        }
    });
}
```

### 3. Transaction Management Steps

The **TransactionInterceptor** runs these low-level steps through a **PlatformTransactionManager**:

* **Before execution:** It obtains a database connection, turns off auto-commit (setAutoCommit(false)), and sets parameters like propagation or isolation levels.
* **During execution:** It invokes your real business method. Any database operations on that thread share the active connection.
* **On success:** If the method finishes without errors, the interceptor calls commit().
* **On failure:** If the method throws an unchecked exception (RuntimeException), it calls rollback().
* **Cleanup:** It binds/unbinds resources from the thread and returns the connection to the pool.


## Transaction Propagation

1. **REQUIRED (default):** The default setting. If a transaction is active, join it; otherwise, create a new transaction.
2. **REQUIRES_NEW:** Always create a new transaction. If a transaction is active, suspend it and create a new one.
3. **SUPPORTS:** Support a transaction if one exists; otherwise, execute without a transaction.
4. **NOT_SUPPORTED:** Execute without a transaction. If a transaction is active, suspend it.
5. **MANDATORY:** Execute within a transaction. If no transaction is active, throw an exception.
6. **NEVER:** Execute without a transaction. If a transaction is active, throw an exception.
7. **NESTED:** Execute within a nested transaction. If no transaction is active, throw an exception.

>[!Note]
>How Nested Transaction works?
>* Savepoint Creation: When a nested block starts, the system sets a savepoint in the current physical transaction.
>* Partial Rollback: If the inner nested method fails, it rolls back only to that savepoint. The parent transaction can catch the error, ignore it, and continue running or commit other work
>* Shared Commitment: The nested transaction is not independent. It only commits permanently when the main outer transaction commits. If the outer transaction rolls back, everything—including the nested part—rolls back.
>* Fallback Behavior: If no parent transaction exists when a nested method runs, it acts like a standard REQUIRED transaction and starts a brand-new physical transaction


>[!Important]
>NESTED vs REQUIRES_NEW
>* NESTED uses a single physical connection with savepoints. The inner part cannot commit until the outer part commits.
>* REQUIRES_NEW pauses the parent transaction and opens a completely separate, independent physical transaction that can commit or fail on its own.

## Transaction Isolation

| Isolation Level  | Avoids                               | Example issue                               |
|------------------|--------------------------------------|---------------------------------------------|
| READ_UNCOMMITTED | Nothing                              | Dirty Read: Reads uncommitted data.         |
| READ_COMMITTED   | Dirty Reads                          | Sees only committed data                    |
| REPEATABLE_READ  | Dirty, Non-Repeatable Reads          | Ensures consistent reads in one transaction |
| SERIALIZABLE     | Dirty, Non-Repeatable, Phantom Reads | Fully isolated transactions.                |

## Pessimistic Locking and Optimistic Locking

| Feature       | Optimistic Locking                                                                           | Pessimistic Locking                                                                        |
|---------------|----------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| Core Strategy | Detects conflicts before saving.Assumes conflict are rare                                    | Prevents conflicts by locking early. Assumes conflicts are common                          |
| Mechanism     | Uses versions, timestamps, or atomic CAS operations                                          | Uses database row locks(SELECT FOR UPDATE) or exclusive thread locks.                      |
| Performances  | High performance: no locking overhead. High cost if conflicts are frequent(retries required) | Lower performance due to blocking/waiting threads. Predictable under high contention       |
| Deadlock Risk | None                                                                                         | High(threads can block each other indefinitely if locks are acquired out of order).        |
| Best Used For | High-read, low-write systems(e.g,, e-commerce product listings).                             | High-contention, critical write systems( e.g banking transactions, inventory reservation). |

## Persistence context and EntityManager

The Persistence Context and EntityManager are two core concepts that work together to manage how your application talks to the database.

### Comparison

| Feature     | EntityManger                                                                  | Persistence Context                                                             |
|-------------|-------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| What is it? | An interface(API) used to interact with the database                          | A staging area(cache) where entities are managed                                |
| Visibility  | Visible. You inject it and call methods on it in your code                    | Invisible. It sits behind the EntityManger. you don't interact with it directly |
| Lifespan    | Can be short-lived(per request) or long lived (application scoped)            | Typically lives and dies with a single database transaction.                    |
| Role        | The manager that executes operations like `persist()`,`find()`, or `remove()` | The storage that holds the actual "managed" objects and tracks their changes    |


#### Persistence Context(The Staging Area)

The Persistence Context is a first-level cache. When Java objects are inside this context, they are considered managed.

* Change Tracking: JPA watches these objects. If you change a property on a managed object, JPA automatically updates the database when the transaction commits (Dirty Checking).
* Identity Resolution: If you ask for the same database row twice in the same transaction, the persistence context gives you the exact same Java object instance both times.
* Isolation: It acts as an isolated buffer, ensuring database changes are grouped together efficiently.


#### EntityManger(The Controller)

The EntityManager is the programming interface provided by JPA to command the persistence context. You use it to push objects into the context or pull them out.

Common operations include:
* em.persist(entity) – Puts a new object into the persistence context (schedules it for database insertion).
* em.find(Class, id) – Looks for an object in the persistence context first; if not found, it queries the database and loads it into the context.
* em.merge(entity) – Takes a detached (outside the context) object and copies its state into a managed object.
* em.remove(entity) – Schedules a managed object to be deleted from the database.


### How They Work Together(The Life Cycle)

1. Transaction Starts: A new Persistence Context is created.
2. Fetch data: You call em.find(User.class, 1). The EntityManager fetches the user from the database and places it inside the Persistence Context.
3. Modify data: You call user.setName("Alex"). You don't need to call any EntityManager methods here. The Persistence Context notices the change.
4. Transaction Commits: The EntityManager flushes the Persistence Context, generating the UPDATE SQL statement to save "Alex" to the database. The context is then closed.


## Dirty Checking

Dirty checking in Hibernate is an automatic mechanism that detects changes made to managed entities and synchronizes those changes with the database. You do not need to explicitly call methods like session.update() or session.save(); Hibernate handles it automatically during transaction commit.

### How it works(Step-by-Step)

`[Load Entity] ──> [Save Snapshot] ──> [Application Modifies Entity] ──> [Transaction Commit] ──> [Compare & Flush]`

1. Snapshot Creation: When Hibernate loads an entity from the database, it creates an internal snapshot (a copy) of the entity's current state in the First-Level Cache (Session).
2. Modification: Your application modifies the properties of the Java object normally using setters or direct access.
3. Comparison: When the transaction is about to commit (or when a flush is triggered), Hibernate compares the current state of the entity against the original snapshot.
4. SQL Execution: If Hibernate detects any differences ("dirty" data), it automatically generates and executes an UPDATE SQL statement to synchronize the database.

### 🚫 How to Disable Dirty Checking

* ReadOnly Mode: Mark the entity or the entire session as read-only
```java
session.setReadOnly(user, true); // For a specific entity
session.setDefaultReadOnly(true); // For the entire session

```

* Spring's @Transactional: If using Spring, mark your transaction as read-only. This tells Hibernate to optimize flush operations.

```java
@Transactional(readOnly = true)
```
* Detach the Entity: Evicting the entity from the session removes it from Hibernate's tracking.

```java
session.evict(user); // or entityManager.detach(user);
```


## Flush vs Commit

| Feature             | flush()                                                                                            | commit()                                                                         |
|---------------------|----------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| Database Sync       | Translates memory changes into SQL statements(INSERT,UPDATE,DELETE) and sends them to the database | Executes a `flush()` first , then sends the SQL `COMMIT` command to the database |
| Transaction State   | Keeps the transaction open                                                                         | Closes the transaction successfully                                              |
| Visibility          | Changes are visible only within the current transaction.Other users cannot see them yet.           | Changes become permanently visible to all other database users and transactions. |
| Rollback capability | Yes, changes can still be undone using a `rollback()`                                              | No. Once committed, changes cannot be rolled back.                               |
| Database Locks      | Holds onto database row/table locks until a commit or rollback happens                             | Release all database locks held by the transaction.                              |

### When to use each

* Use flush() when you need the database to generate automatic values (like an auto-incrementing ID) so you can use them in subsequent code before the transaction ends, or when you want to execute queries that depend on pending changes.
* Use commit() when your entire business logic unit or application work-step is complete, and you are ready to permanently write the data to the database.


## Race condition and Concurrent updates

A race condition happens when two or more processes or threads read and write shared data at the same time,

Concurrent updates are a common cause of race conditions. When two users try to update the same database record or variable simultaneously, one user's changes can overwrite and erase the other user's updates


### How to prevent and fix them

1. Database-Level Solutions

* Pessimistic Locking: Lock the database row when you read it so other transactions must wait until you finish. You can do this in SQL using SELECT ... FOR UPDATE.
* Optimistic Concurrency Control (OCC): Add a version number or timestamp column to your table. When updating, check if the version matches the one you originally read. If another process changed it in the meantime, reject the update or retry.
* Atomic Conditional Updates: Run updates in a single query that checks the condition inline, such as UPDATE inventory SET qty = qty - 1 WHERE id = 1 AND qty > 0.

2. Application-Level Solutions

* **Mutex Locks:** Use a mutual exclusion lock (Mutex) to block other threads from entering a critical section of code while one thread is working there
* **Atomic Variables:** Use built-in atomic data types (like AtomicInteger in Java or Interlocked in C#) for simple counters and flags. These let the CPU update values safely without heavy locks
* **Queue-Based Processing:** Send high-throughput updates, like payments or orders, into a message queue so a single worker processes them one by one
