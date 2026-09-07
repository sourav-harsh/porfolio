---
title: "JPA Relationship between Entity."
date: "2026-08-28"
excerpt: "How to define the relationship between entities in JPA, and the annotations used for it."
tags: ["JPA Entity Relationship", "Cascading", "OrphanRemoval", "mappedBy", "JoinColumn","LazyInitializationException"]
---

There is two ways of the directions of the entity relationship:
 1. Unidirectional - 
    * Only one class has the reference field pointing to the other class.
    * You can access the target entity from the source entity,but you cannot go back from the target entity to the source entity.
    * It uses a single owning side that holds the foreign key.
    * Example : An order points to a customer, but the customer does not have a reference to the order list.
2. Bidirectional - 
    * Both classes have the reference field pointing to the other class.
    * You can access the target entity from the source entity and also go back from the target entity to the source entity.
    * It has an owning side(which contains the physical foreign key) and an inverse side(which uses an attribute like mappedBy to point back to the owner).
    * Example : An order points to a customer and the customer has a reference to the order list.

| Aspect      | Owning side                       | Inverse side                                 |
|-------------|-----------------------------------|----------------------------------------------|
| Role        | Manages the Foreign Key in the DB | Mirrors the relationship for java navigation |
| Annotations | Annotated with `@JoinColumn`      | Annotated with `mappedBy="fieldName"       ` |
| DB Updates  | State changes here update the DB  | Changes made here ignored by the DB.         |


## Code Example

### The Owning Side(Employee)
```java
@Entity
public class Employee {
    @Id
    private Long id;
    
    // This side owns the relationship and maps the Foreign Key column
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department; 
}

```

### The Inverse Side(Department)

```java
@Entity
public class Department {
    @Id
    private Long id;

    // "department" matches the name of the Java variable inside the Employee class
    @OneToMany(mappedBy = "department") 
    private List<Employee> employees;
}

```

>[!Important]
> 1. The string value provide in mappedBy should match the name of the field in the owning side.
> 2. You can use mappedBy on `@OneToMany` or `@ManyToMany` or `@OneToOne` mappings, You cannot use it on `@ManyToOne` mappings because the many side is the owner of the relationship.
> 3. Because JPA only monitors the owning side for SQL generation, modifying the mappedBy collection in Java will not automatically update the database. You must set both sides manually.
> 4. If you have a bidirectional relationship, you MUST set both sides in Java, or at least set the Owning Side!

## Difference between CascadingType and OrphanRemoval

If the **cascadingType** is `CascadingType.REMOVE` then if you delete the parent entity, the child entity will also be deleted.

If the **orphanRemoval** is `true` then if you disconnect the child from parent the child got deleted. Even if the parent is not deleted. 


## JPA Cascade Types and Use Cases

1. CascadeType.PERSIST - 
   * When you persist a parent entity, the child entities are also persisted. Example : Creating an Employee and Department at the same time.
   * **Under the Hood**: When you pass a transient (new) parent entity to the `persist` method, JPA will also persist the child entities.
   * **The Problem it solves**: Without this saving a parent with new children throws an error, because the database cannot save a foreign key pointing to a non-existent record.
2. CascadeType.REMOVE -  
    * When you delete a parent entity, the child entities are also deleted.
    * Under the Hood: When you invoke entityManager.remove(parent), JPA loads the children into memory and executes individual SQL DELETE statements for each child record before deleting the parent.
    * The Problem It Solves: It prevents foreign key constraint violations (FK_Constraint_Violation) by cleanly wiping out dependent data in the correct relational order.
3. CascadeType.MERGE - 
   * Updates child entities in the database when updating a detached parent entity.
   * **Under the Hood**: When you pass a detached (previously persisted) parent entity to the `merge` method, JPA copies the state of the parent entity into a new managed instance.
   * **The Problem it solves**: It prevents data syncing failures. If a user modifies both a parent profile and an address on a frontend form, merging the parent without cascading will completely ignore the changes made to the child address.
4. CascadeType.REFRESH - 
   * When you refresh a parent entity, the child entities are also refreshed.
   * **Under the Hood:** If another database process or concurrent transaction modifies the database directly, calling entityManager.refresh(parent) forces JPA to pull the latest database state. Cascading this ensures the child objects match the database precisely.
   * **The Problem it solves**: It eliminates stale data cached inside the application memory without requiring you to manually query and reset every sub-collection.
5. CascadeType.DETACH - 
   * When you detach a parent entity, the child entities are also detached.
   * Under the Hood: Calling entityManager.detach(parent) breaks the link between the entity and the persistence context. The entity becomes a standard Java object, and changes to its fields are no longer tracked or saved. Cascading this detaches the children too.
   * The Problem It Solves: Memory management. If you load a massive entity tree for read-only reporting, keeping them managed wastes CPU cycles on dirty-checking. Detaching the entire tree frees up session memory.
6. CascadeType.ALL - All the above.

## IMPORTANT POINTS
 Developer often blindly use CascadeType.ALL, but it is not recommended.
1. Accidental Deletions: If you unintentionally delete a parent entity, all its children will also be deleted means you might wipe out thousands of historical records linked to it.
2. Performance Degradation: An operation meant only to update a single flag on a parent will force JPA to inspect, dirty-check,and potentially lock every single child entity in the graph.
3. NEVER USE CascadeType.REMOVE OR CascadeType.ALL ON `@MANY-TO-MANY` RELATIONSHIPS. if you delete User A who belongs to Group A, cascading the deletion will delete Group A entirely.This inadvertently deletes all other users belonging to Group A, creating a catastrophic demo effect across your database.


## JoinColumn and JoinTable Difference

The primary difference is that `@JoinColumn` maps a relationship by adding a foreign key column to the table of the entity that owns the relationship, while `@JoinTable` defines a new table that contains foreign keys column directly into an existing table, while `@JoinTable` maps it by creating a seprate, third table to store the association.


| Feature            | @JoinCloumn                                         | @JoinTable                                           |
|--------------------|-----------------------------------------------------|------------------------------------------------------|
| Database Structure | Creates a new column in the same table              | Creates a separate intermediate table                |
| Primary Use Case   | Best for `@OneToOne` and `@ManyToOne` relationships | Mandatory for `@ManyToMany` relationship             | 
| Performance        | Faster(fewer database joins required)               | Slower(requires an extra join operation)             |
| Null Values        | Can lead to optional columns with null values       | Eliminates null values, creating a normalized schema |

## Code Example

Use @JoinColumn when you want a direct link between two tables via a foreign key.

```java
@Entity
public class Employee {
    @Id
    private Long id;

    @OneToOne
    @JoinColumn(name = "laptop_id", referencedColumnName = "id")
    private Laptop laptop;
}

```

Use @JoinTable when a relationship cannot fit cleanly into existing tables or when you need a decoupled, highly normalized schema.

```java
@Entity
public class Student {
    @Id
    private Long id;

    @ManyToMany
    @JoinTable(
        name = "student_course",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private List<Course> courses;
}

```
>[!Important]
> 1. In a Relational Database, for a One-to-Many (1:N) / Many-to-One (N:1) relationship, the Foreign Key ALWAYS lives on the "Many" side
> 2. Reality: nullable = false on @JoinColumn is purely a DDL schema generation annotation. It tells Hibernate: "When you generate DDL SQL script (CREATE TABLE), mark this column as NOT NULL."
> 3. Hibernate itself does not perform Java-side bean validation for @JoinColumn(nullable = false) before executing SQL!
> 4. The Database engine itself rejects the SQL execution and throws a SqlException / DataIntegrityViolationException (Column 'user_id' cannot be null).
> 5. Note: If you want pre-flush validation inside Java memory before SQL is sent, you use Java Bean Validation: @NotNull private User user;
> 6. By default, in a Relational Database, a Foreign Key constraint prevents you from deleting a parent row if child rows reference it!
> 7. Any relationship ending in `ToOne` defaults to EAGER. Any relationship ending in `ToMany` defaults to LAZY


## What causes a LazyInitializationException?

A Hibernate LazyInitializationException is caused by attempting to access a lazily-loaded association or proxy object after the persistence context (the active database session) has already been closed.

### Why it happens?

* **Lazy Loading Default:** Relationships like @OneToMany and @ManyToMany are set to FetchType.LAZY by default. This means Hibernate loads only the parent entity and replaces the related child data with a placeholder proxy object.
* **Session Closure:** The active transaction or database session ends (for example, at the end of a service layer method), closing the connection to the database.
* **Delayed Access:** When you later try to call a getter method on that uninitialized proxy or collection (such as in your controller or UI layer), Hibernate tries to query the database for the data but fails because no active session remains.

## REST API Direct Return Problem (Jackson Serialization):
 * Actually happens is JsonMappingException / StackOverflowError (Infinite Recursion).
 * Why? User has List<Order> orders, and each Order has User user.
 * When Jackson tries to serialize User to JSON:User $\rightarrow$ serializes orders $\rightarrow$ serializes user inside Order $\rightarrow$ serializes orders inside User $\rightarrow$ Infinite loop!
 * Additionally, if the session is already closed when Jackson attempts to read the LAZY field, Jackson triggers a LazyInitializationException.
 * Production Best Practice: NEVER return JPA Entities directly from Controller endpoints! Always map entities to DTOs (Data Transfer Objects).


| JPA & HIBERNATE CHEAT SHEET                                                         |
|-------------------------------------------------------------------------------------|
| 1. Foreign Key Rule  : The table holding the FK is ALWAYS the Owning Side.          |
| 2. mappedBy Rule     : Always goes on the Inverse (Non-Owning) Side.                |
| 3. Fetch Defaults    : *ToOne = EAGER (Change to LAZY!), *ToMany = LAZY.            |
| 4. N+1 Fix           : Use 'JOIN FETCH' in JPQL or @EntityGraph.                    |
| 5. Pagination Warning: NEVER use 'JOIN FETCH' on @OneToMany with Pageable!          |
| 6. REST Controllers  : NEVER return Entities directly. Always map to DTOs.          |
