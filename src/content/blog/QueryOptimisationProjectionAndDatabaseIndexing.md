---
title: "JPA Query Optimization, Projection & Database Indexing."
date: "2026-09-10"
excerpt: "Understanding the use of JPA Query Optimization, Projection & Database Indexing."
tags: ["JPQL","Query Optimization","Ways of Projection","DTO Projection","Interface based projection","Dynamic Projection","Database Indexing","Composite Index","EXPLAIN And EXPLAIN ANALYZE","Deployment strategies","Blue-green deployment","Canary deployment"]
---
## What is jpql in spring boot?

JPQL (Java Persistence Query Language) is an object-oriented query language used in Spring Boot (via Spring Data JPA) to perform database operations.

The defining characteristic of JPQL is that it queries Java entity classes and their fields, rather than database tables and columns. When you run a JPQL query, the underlying ORM provider (typically Hibernate) translates your object-oriented query into the native SQL dialect required by your specific database

### Why Use JPQL in Spring Boot?

* Database Agnostic: Since JPQL operates on your Java code rather than the specific database, the exact same JPQL query will run seamlessly whether your backend is connected to PostgreSQL, MySQL, Oracle, or H2.
* Object-Oriented Integrity: It aligns perfectly with Object-Relational Mapping (ORM). You handle relations via mapped entity associations (@OneToMany, @ManyToOne) instead of managing manual table foreign-key joins.
* Startup Validation: Spring Boot validates custom JPQL queries when the application boots up. If you misspell a property or entity name, the application will fail immediately, catching errors before they hit production.

### How to Use JPQL in Spring Boot?

In Spring Boot, JPQL queries are typically written inside your Repository interfaces using the @Query annotation.

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // 1. Fetching a full Entity object using an alias (u)
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    // 2. Fetching specific fields (Partial Projection)
    @Query("SELECT u.email FROM User u")
    List<String> findAllUserEmails();
}

```
### Common Traps to Avoid ⚠️

* Don't use SELECT *: JPQL requires you to pass the entity alias to retrieve the whole row (e.g., SELECT u FROM User u).
* Case Sensitivity: JPQL keywords (SELECT, FROM, WHERE) are case-insensitive, but Java Entity names (User) and fields (email) are strictly case-sensitive.
* Table names: Writing SELECT u FROM users u (using the database table name instead of the class name) will result in a startup crash.

## What is DTO projection?

A DTO (Data Transfer Object) projection is a database query technique that fetches only specific columns you need and maps them directly into a custom lightweight class or Java record instead of loading a full database entity.

### Why Use DTO Projections?

* Better Performance: The database sends less data over the network because the SELECT clause only includes requested columns.
* Lower Memory Usage: The application does not track unneeded fields or relationships in memory.
* Read-Only Safety: It prevents accidental updates to the database because projected objects are not managed by the persistence context (like Hibernate).
* Clean APIs: You can design response models specifically tailored for user interfaces, reports, or REST API endpoints.

### How It Works (Example in Java/Spring Data JPA)

Instead of returning a heavy User entity, you define a simple class or record:
```java
public record UserSummary(String firstName, String lastName) {}
```
Then, you write a query using a constructor expression (like the new keyword in JPQL) to populate it:
```java
@Query("SELECT new com.example.UserSummary(u.firstName, u.lastName) FROM User u")
List<UserSummary> getUserSummaries();

```

## What is interface based projections?

Interface-based projections allow you to fetch a specific subset of attributes from a database entity instead of loading the entire object.

In frameworks like Spring Data JPA, you define an interface with getter methods matching the entity's property names, and the framework automatically maps the query results to that interface

### How It Works

* Define an Interface: Create getter methods corresponding to the fields you want to retrieve (e.g., getFirstName()).
* Use in Repository: Set the return type of your repository query method to the newly created interface.
* Automatic Mapping: The underlying database query fetches only the required columns and populates a dynamic proxy implementing your interface.

```java
// 1. The Entity
@Entity
public class User {
    @Id
    private Long id;
    private String name;
    private String email;
    private String address; // Extra field we want to ignore
}

// 2. The Projection Interface
public interface UserSummary {
    String getName();
    String getEmail();
}

// 3. The Repository Method
public interface UserRepository extends JpaRepository<User, Long> {
    List<UserSummary> findByAgeGreaterThan(int age);
}
```

## Selecting only required columns instead of loading complete entities ways in spring data JPA

### 1. Interface-Based Projections (Best Practice)

This is the cleanest and most popular way. You define a lightweight interface containing only the getter methods for the fields you need. Spring Data JPA automatically optimizes the SQL query to pull only those columns.

```java
public interface UserSummaryDto {
    String getUsername();
    String getEmail();
}

public interface UserRepository extends JpaRepository<User, Long> {
    // Derived query returning only username and email
    List<UserSummaryDto> findByStatus(String status);
}
```

### 2. Class-Based Projections (DTO Constructor Expression)

If you prefer standard Java records or DTO classes instead of interfaces, you can use JPQL’s NEW operator inside a @Query annotation.

```java
public record UserSummaryRecord(String username, String email) {}

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT new com.example.dto.UserSummaryRecord(u.username, u.email) FROM User u WHERE u.status = :status")
    List<UserSummaryRecord> findSummaryByStatus(@Param("status") String status);
}
```
### 3. Dynamic Projections (Reusable Repository)

If you need different sets of columns at different times from the same repository method, you can use a generic type parameter T.

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // Pass the target projection class dynamically
    <T> List<T> findByStatus(String status, Class<T> type);
}

List<UserSummaryDto> shortList = userRepository.findByStatus("ACTIVE", UserSummaryDto.class);
List<UserDetailedDto> longList = userRepository.findByStatus("ACTIVE", UserDetailedDto.class);
```

### 4. Native Queries with Interface Projections

If you need to write complex SQL or native queries instead of JPQL, interface-based projections still work seamlessly as long as you match your aliases to the interface getters.


```java
public interface UserRepository extends JpaRepository<User, Long> {
    @Query(value = "SELECT u.username AS username, u.email AS email FROM users u WHERE u.status = :status", nativeQuery = true)
    List<UserSummaryDto> findSummaryNative(@Param("status") String status);
}
```

## What is database indexing?

Database indexing is a data structure technique used to speed up data retrieval operations by creating shortcuts to locate records without scanning an entire table.

### How It Works

* Search Key and Pointer: An index stores a sorted copy of selected columns (the search key) paired with physical or virtual pointers (references) pointing to the exact disk location of the corresponding data rows.
* Table of Contents Analogy: It functions much like the index at the back of a textbook, allowing the database engine to find specific information immediately instead of reading every single page.
* Data Structures: Most relational databases implement indexes using balanced trees—specifically B-trees—which allow for rapid logarithmic time complexity searches (O(log n)).

### Pros and Cons
* Pros: Drastically reduces query response times, minimizes costly disk I/O operations, and accelerates sorting.
* Cons: Consumes extra storage space and slows down write operations (inserts, updates, and deletes) because the index must be recalculated or updated every time the base table changes.

## What is composite index in database?

A composite index (also called a multi-column index) is a database index created on two or more columns of a table

### How It Works

* Concatenated keys: The database stores and sorts values based on the exact order of the columns you specify.
* Hierarchical sorting: It sorts the data first by the first column (the leftmost column). Then, it sorts by the second column within each group of the first column, and so on.
* Example: If you create an index on (department_id, salary), the database arranges the data by department first. Inside each department, it arranges the records by salary.

### The Leftmost Prefix Rule

A composite index works only if your query uses the leading columns from left to right:
* Works: Filtering by the first column alone, or by the first and second columns together.
* Does not work: Skipping the first column and filtering only by the second column.

### Benefits and Drawbacks

* Pros: Speeds up queries that filter or sort by multiple columns, reduces disk input/output, and can replace multiple single-column indexes.
* Cons: Takes up extra disk space and slows down write operations (INSERT, UPDATE, DELETE) because the database must update the multi-column sort tree every time data changes.


### Example

```java
@Entity
@Data
@Table(
    name = "employees",
    indexes = {
        @Index(name = "idx_dept_salary", columnList = "department_id, salary")
    }
)
public class Employee {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "salary")
    private Double salary;
}


@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // ✅ Uses Index: Uses BOTH columns in correct order
    List<Employee> findByDepartmentIdAndSalaryGreaterThan(Long departmentId, Double salary);

    // ✅ Uses Index: Uses the leftmost column alone
    List<Employee> findByDepartmentId(Long departmentId);

    // ❌ DOES NOT use the index effectively (or skips it entirely)
    // It violates the leftmost prefix rule by skipping departmentId
    List<Employee> findBySalaryGreaterThan(Double salary);
}

```

### How to Verify It Works

When you start your Spring Boot application with spring.jpa.properties.hibernate.ddl-auto=update, Hibernate will automatically generate the database schema. In your logs, you will see a SQL command similar to this:
```sql
CREATE INDEX idx_dept_salary ON employees (department_id, salary);
```

## What is query optimization in JPA?

Query optimization in JPA (Jakarta Persistence API) is the practice of tuning how your application interacts with the database to ensure that generated SQL queries are efficient, minimize database load, and reduce response times. Because JPA abstracts SQL using Java objects, it is easy to accidentally write code that triggers hundreds of unnecessary database round-trips or loads massive amounts of unused data into memory.

### 1. Eliminating the N+1 Query Problem
The N+1 problem is one of the most common performance killers in JPA. It happens when you fetch a parent entity, and JPA executes an additional separate query for every single child entity association.
* The Solution: Use JOIN FETCH in your JPQL/HQL queries or define an @EntityGraph. This forces JPA to bring back the parent and all related child records in a single SQL query.

### 2. Using DTO Projections Instead of Entire Entities

By default, developers often fetch whole entities when they only need a couple of columns (e.g., loading a massive User entity with profile pictures just to display a list of usernames). This wastes network bandwidth and database memory.

* The Solution: Use DTO (Data Transfer Object) projections or tuples. Write queries like SELECT new com.example.UserDTO(u.id, u.username) FROM User u to fetch strictly what you need

### 3. Tuning Fetch Types (Avoid EAGER)

Using @OneToMany(fetch = FetchType.EAGER) tells JPA to always load the related collections immediately, whether you plan to use them or not. This leads to massive, accidental join queries.

* The Solution: Keep association mappings set to FetchType.LAZY by default. This ensures data is only fetched on-demand, and you can explicitly override it using JOIN FETCH when needed

### 4. Applying Pagination for Large Datasets

Requesting thousands of records at once can trigger memory overloads and slow down application APIs.
* The Solution: Always restrict your queries using a Pageable object or setFirstResult() / setMaxResults() to pull data in smaller, controlled chunks.

### 5. Leveraging JPA Query Hints

Query hints pass specific optimization parameters straight to the underlying persistence provider (like Hibernate).

* org.hibernate.readOnly: Setting this to true tells JPA to skip "dirty checking" (tracking if objects changed), which speeds up read-only operations significantly.
* org.hibernate.fetchSize: Controls how many rows are pulled from the database driver in a single batch, reducing memory spikes for large result sets.

### 6. Batching Inserts and Updates

Modifying or inserting 10,000 records in a loop defaults to executing 10,000 separate network requests to the database.

* The Solution: Configure JDBC batching properties (hibernate.jdbc.batch_size) so JPA groups these operations together and sends them in bulk packages.


## EXPLAIN/ EXPLAIN ANALYZE

EXPLAIN and EXPLAIN ANALYZE are database commands used to inspect and troubleshoot how a database executes a SQL query.

### EXPLAIN
* What it does: Shows the execution plan chosen by the database optimizer without running the query.
* Details provided: Estimated costs, estimated row counts, and access methods (like index scans or full table scans).
* Safety: Completely safe to run on any query because it does not execute code or touch data.
* Use case: Quick check to see if an index is being used or if a heavy full table scan is planned.

### EXPLAIN ANALYZE
* What it does: Executes the query in the background, discards the final result, and measures real performance statistics.
* Details provided: Actual execution time per step, actual rows processed, and comparison against the planner's initial estimates.
* Safety: Use caution. Because it actually runs the query, write operations (like UPDATE or DELETE) will modify data unless wrapped in a transaction rollback.
* Use case: Deep performance profiling to find exact time bottlenecks and compare real rows versus estimated rows.

## Index maintenance overhead during INSERT/UPDATE operations.

Index maintenance overhead during INSERT and UPDATE operations forces the database to write to both the base table and every associated B-tree index structure, which slows down write performance.

### How INSERT Operations Create Overhead

* Tree Traversal: The database must read specific index blocks to find the correct leaf node for the new value.
* Page Splits: If a leaf node is full, the database splits it into two, redistributing entries and updating parent branch nodes all the way up to the root if necessary.
* Cascading Cost: Each additional index on a table multiplies this traversal and writing effort, substantially increasing execution time.

### How UPDATE Operations Create Overhead

* Indexed Column Changes: Modifying a column included in an index requires the database to delete the old index entry and insert a brand-new one.
* Unchanged Columns: Updates to non-indexed columns incur zero index maintenance overhead.
* Fragmentation: Frequent updates scramble leaf-level physical order, leading to higher I/O costs over time.

### Best Practices to Minimize Write Overhead

* Avoid Over-Indexing: Limit indexes strictly to columns heavily used in WHERE, JOIN, or ORDER BY clauses.
* Monitor Usage: Review metrics like those in Stack Exchange DBA Discussion to identify and drop unused indexes that still incur write penalties.
* Bulk Loading: For massive data loads, drop or disable non-clustered indexes before running your INSERT statements and recreate them afterward.

## what is blue green deployment?

A blue-green deployment is a software release strategy that uses two identical production environments—labeled blue and green—to update applications with zero downtime and minimal risk.

At any given time, only one environment is live and serving all production traffic. For example, if the blue environment is currently live (handling live users), the green environment remains idle or hosts a newly updated version of the software in secret.

### How It Works

* Deploy to Inactive: Your team deploys the new software version to the idle environment (green).
* Test and Validate: You run comprehensive tests and checks on the green environment while it is isolated from real users.
* Switch Traffic: Once verified, a router or load balancer instantly flips the switch to redirect all user traffic from blue to green.
* Standby or Rollback: The old environment (blue) stays on standby. If a critical bug appears in green, you can instantly revert traffic back to blue. If everything runs smoothly, blue becomes the staging ground for the next update.

### Pros and Cons

* Pros: Eliminates scheduled maintenance downtime, allows safe final testing in a production-like setting, and enables instant rollbacks if something fails.
* Cons: Requires double the infrastructure resources because you must run two full production environments simultaneously, and managing tricky database migrations between versions can add complexity.

## What is Canary Deployment?

* How it works: The new version is deployed to a tiny subset of infrastructure. A small percentage of live traffic (e.g., 5%) is routed to it. If no errors occur, traffic is gradually increased until it reaches 100%.
* Pros: Minimizes blast radius; if a bug exists, only a fraction of users are affected.
* Cons: Managing split traffic routing and monitoring two parallel versions can be complex.

## What is Rolling (Incremental) Deployment?

* How it works: The application instances are updated gradually in batches. For example, if you have 10 servers, the system updates 2 servers at a time, taking them offline temporarily while the remaining 8 handle the traffic.
* Pros: No extra infrastructure costs; no downtime for users.
* Cons: During the rollout, two different versions of the app run simultaneously. Rollbacks require redeploying the old version across all batches, which takes time.

## What is Recreate (Big Bang) Deployment?

* How it works: All existing application instances (Version A) are completely shut down before the new instances (Version B) are powered on.
* Pros: Simple to execute; no version mismatch issues; ideal when the new version is completely incompatible with the old database schema.
* Cons: Causes noticeable downtime for users while the new system boots up.

## What is Shadow Deployment (Dark Launching)?

* How it works: The new version runs parallel to production. The production load balancer clones/forks all incoming traffic and sends a copy to the new version silently in the background, but the user only receives the response from the old version.
* Pros: Zero risk to users; allows testing how the new code handles real-world production load and performance.
* Cons: Extremely expensive (doubles infrastructure) and highly complex to set up, especially preventing side effects like duplicate database writes or double-charging a credit card.
