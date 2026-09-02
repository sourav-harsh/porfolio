----
title: "N+1 Query Problem."
date: "2026-09-02"
excerpt: "The N+1 Query Problem is a common issue in database access where a query is executed N times, leading to performance issues."
tags: ["N+1 Query Problem", "Join Fetch", "@EntityGraph", "@BatchSize", "DTO Projections"]

----

#  N+1 Query Problem

## What is N+1 Query Problem?

The N+1 Query Problem is a common issue in database access where a query is executed N times, leading to performance issues.

The N+1 query problem is a performance bottleneck that occurs when an application executes one primary database query to fetch a list of parent records, followed by N additional queries to fetch related child records for each individual parent. This results in N+1 total database roundtrips instead of a single, optimized operation, severely slowing down application performance.

## How to solve N+1 Query Problem?

To solve the N+1 query problem in Spring Boot, you must instruct your database mapper (usually Hibernate/Spring Data JPA) to fetch related entities in a single database call instead of querying them one by one

The primary solutions are `JOIN FETCH` queries, `@EntityGraph` annotations, or global batch fetching configuration.

### Quick Comparison

| Strategy        | When to use it                                                            | Performance Impact                         |
|-----------------|---------------------------------------------------------------------------|--------------------------------------------|
| JOIN FETCH      | When you always need the child entities for a specific repository method. | Best(Reduces to 1 query).                  |
| @EntityGraph    | When you want a declarative, reusable way to alter fetching dynamically.  | Best (Reduces to 1 query).                 |
| @BatchSize      | When you want to keep lazy loading but optimize the loop footprint.       | Good (Reduces N+1 to (N/Batch Size) + 1)). |
| DTO projections | For read-only operations where you only need a few columns.               | Excellent (No full entities managed).      |


### Example

#### Use JOIN FETCH
```java
@Repository
public interface AuthorRepository extends JpaRepository<Author, Long> {

    // Resolves N+1 by fetching authors and their books in 1 SQL query
    @Query("SELECT a FROM Author a LEFT JOIN FETCH a.books")
    List<Author> findAllWithBooks();
}

```

#### Use @EntityGraph

```java

@Repository
public interface AuthorRepository extends JpaRepository<Author, Long> {

    // Overrides default LAZY behavior for this specific method execution
    @EntityGraph(attributePaths = {"books"})
    List<Author> findAll(); 
}

```

#### Use Enable Global Batch Fetching

If you prefer to keep your entities loading lazily (FetchType.LAZY) but want to minimize database roundtrips across your entire application, you can configure batch fetching. Instead of querying one record at a time, Hibernate will pull them in chunks.

Add this parameter to your application.properties file:
```application.properties
# Tells Hibernate to fetch up to 30 collections/entities simultaneously
spring.jpa.properties.hibernate.default_batch_fetch_size=30

```
>[!Important]
>(Alternatively, you can place @BatchSize(size = 30) directly above the collection mapping in your entity class.)

#### Use DTO Projections

```java
public record AuthorDto(String name, String bookTitle) {}

@Repository
public interface AuthorRepository extends JpaRepository<Author, Long> {

    @Query("SELECT new com.example.AuthorDto(a.name, b.title) FROM Author a JOIN a.books b")
    List<AuthorDto> findAuthorProjection();
}

````

>[!Important]
>* Do not attempt to use JOIN FETCH or @EntityGraph on multiple list-type collections within the same query (e.g., fetching books AND hobbies in one query). This triggers a MultipleBagFetchException in Hibernate because it creates a Cartesian product (cross-join mapping every book to every hobby), destroying database performance
>* For multiple collections, combine one JOIN FETCH with Batch Fetching configured globally
>* Note: If you have migrated your application to Spring Boot 3.5+, the framework introduces automatic Single Query Loading through bytecode enhancement and query-plan inferences to dramatically eliminate common N+1 triggers out-of-the-box.


### When fetching collections (@OneToMany), ensure your items field in the Order entity is defined as a Set rather than a List:

```java
@Entity
public class Order {
    @Id
    private Long id;

    // Use Set to prevent duplicate Order records in the returned Java list
    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY)
    private Set<OrderItem> items = new LinkedHashSet<>(); 
}

```
Why? 

A SQL join duplicates parent Order data for every child OrderItem it finds. If you use a List, Hibernate returns duplicate Order objects in your Java collection. Using a Set filters out these memory duplicates automatically.


#### Alternate of using Set

1. Use the `DISTINCT` keyword in JPQL

```java
@Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items")
List<Order> findAllWithItemsDistinct();

```
2. Stream API Deduplication

```java
List<Order> duplicatesList = orderRepository.findAll();
List<Order> cleanList = duplicatesList.stream().distinct().toList();

```

## Performance Summary for pagination

| Approach                | Query Count       | SQL Processing            | Memory Safety            |
|-------------------------|-------------------|---------------------------|--------------------------|
| `JOIN FETCH` + Pageable | 1 Query           | Pulls entire DB(NOT SAFE) | Dangerous(OOM)(NOT SAFE) |
| Default Lazy Loading    | 21 Queries(N + 1) | Applies limits            | Safe but slow            |
| `Batch Size` + Pageable | 2 Queries         | Applies limits            | Excellent                |


## IN SHORT

| Approach                  | N+1        | Parent duplication              | Pagination                       |
|---------------------------|------------|---------------------------------|----------------------------------|
| `JOIN FETCH`              | ✅         | ⚠️ Yes at SQL level             | ⚠️ Problematic with collection   |
| `JOIN FETCH` + DISTINCT   | ✅         | ✅ JPA-level deduplication      | ⚠️ Still problematic             |
| `@EntityGraph`            | Usually ✅ | ⚠️ Can have join multiplication | ⚠️ Collection pagination concern |
| `@Batch Size(20)`         | ✅         | ✅ Avoids join multiplication   | ✅ Good                          |
| Lazy + `@Batch Size(20)`  | ✅         | ✅                              | ✅ Good fit                      |


## Example 

#### Requirement
Page 20 unique Orders → for those 20 Orders, load their OrderItems → avoid N+1 → don't get duplicate Orders because of the OneToMany join.

```java
@Entity
public class Order {

    @Id
    @GeneratedValue
    private Long id;

    @OneToMany(
        mappedBy = "order",
        fetch = FetchType.LAZY
    )
    @BatchSize(size = 20)
    private List<OrderItem> items = new ArrayList<>();
}
```

```java
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findAll(Pageable pageable);
}
```

```java
Pageable pageable = PageRequest.of(0, 20);

Page<Order> orderPage = orderRepository.findAll(pageable);

```
