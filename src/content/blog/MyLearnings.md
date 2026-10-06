---
title: "Small Concepts"
date: "2026-10-06"
excerpt: "Small concepts which i learned on the fly of doing some works,So read about it and scribed it"
tags: ["Compile-time resolution", "Run-time resolution","Static Method hiding","Field Hiding","String Intern","Object Equals and Hashcode","HashMap","Exceptions & Control Flow","Actual JVM behavior on Thread creation","Variable Increment in JVM","Volatile Keyword","SpringBoot start", "Full vs Lite Configuration Mode", "AutoConfiguration","Spring Manages Database","Transaction","Thread safe variable","Spring MVC Lifecycle Internals","OutOfMemeoryError(Memory Leak) Investigation","ThreadPoolExecutor Load Expansion","@Async using in SecurityContext holder"]
visible: true
---

# My Learning

## Compile-time resolution/Run-time resolution

* Compile-time resolution (Reference Type - Parent): **Fields** and **static** methods are bound at compile time based on the type declared on the left side (Parent obj).
* Runtime resolution (Object Type - Child): Instance methods are bound at runtime via the virtual method table (vtable) using the actual object allocated on the heap (new Child()).

## Static Method hiding

In Java, invoking a static method via an object reference is syntactically legal (though discouraged by standard style guidelines). Static methods are resolved at compile-time using the Reference Type (Parent). This is known as static method hiding, not overriding.

## Field Hiding

In Java, fields are NOT polymorphic. Variable access is resolved at compile-time strictly based on the Reference Type (Parent), not the actual object type on the heap (Child). This is known as field hiding, not field overriding.

## String Intern

You missed the internal contract of String.intern(). When s3.intern() is called, the JVM checks the String Constant Pool for an equal string ("Java"). Since "Java" already exists in the pool (from s1), intern() returns the reference to the existing pool object, NOT a new heap reference. Thus, s4 points directly to s1's address in the pool.

## Object Equals and Hashcode

Every object in Java inherits a default hashCode() method from java.lang.Object. The default implementation (identity hash code) generates a hash derived from the object's memory address, not its internal fields.

### Rules

* If two objects are equal according to equals(Object), they MUST produce the SAME hashCode().
* If hashCode() is not overridden alongside equals(), u1.equals(u2) evaluates to true, but u1.hashCode() != u2.hashCode().
* Because u2 hashes to a completely different bucket index than u1, HashMap searches the wrong bucket and fails to locate the key—returning null without ever invoking .equals().

## HashMap 

This scenario demonstrates why keys in a HashMap (or elements in a HashSet) MUST be immutable. If key state changes after insertion, the object becomes permanently "orphaned" or "lost" inside the map, creating memory leaks and unpredictable bugs in production systems.

### map.size() returns the total number of key-value pairs stored in the map, not the underlying bucket array capacity!


## Exceptions & Control Flow

Returning a value from inside a finally block overrides/discards any pending return statement (or uncaught exception) from the try or catch blocks. The return 1 in the catch block is evaluated, but before it can return control to main(), finally executes its own return 2, overriding the previous return completely.

>[!Important]
> Never use return statements inside a finally block in real applications. Doing so suppresses and swallows all exceptions that occurred in the try or catch blocks, making debugging in production nearly impossible.

## Actual JVM behavior on Thread creation

* t1.run(): Does NOT spawn a new thread. It executes the Runnable's code sequentially on the current calling thread (in this case, main). No new execution stack is created.
* t1.start(): Prompts the JVM to request the underlying Operating System host kernel to create a brand-new Platform/OS thread. Once allocated, the JVM creates a new Call Stack, and the OS thread asynchronously invokes run() inside that new thread context.
* Note on Virtual Threads: Standard new Thread() in Java creates OS-backed platform threads, not Virtual Threads (which require explicit factory methods like Thread.ofVirtual()).


## Variable Increment in JVM

At the JVM bytecode level, count++ is not a single atomic operation. It expands into 3 distinct steps:
1. READ    : Fetch current value of count from main memory into CPU register.
2. MODIFY  : Add 1 to the value inside CPU register.
3. WRITE   : Write the updated value back from CPU register to main memory.

Locks in Java are intrinsic monitor locks attached to objects, not variables or primitive fields like count.

* synchronized on instance method (increment()): Acquires the monitor lock on this (the current instance of SafeCounter).
* synchronized on static method (resetGlobalConfig()): Acquires the monitor lock on the Class object (SafeCounter.class).

## Volatile Keyword

You stated that volatile makes count++ thread-safe. It does NOT:
* Why volatile works for boolean running: running = false is a single WRITE operation. volatile guarantees Visibility (flushing CPU write buffers to main memory and invalidating CPU caches).
* Why volatile FAILS for count++: count++ is READ-MODIFY-WRITE. volatile ensures every thread reads the newest value, but if Thread A and Thread B read 10 simultaneously, both calculate 11 in local CPU registers, and both write 11 back. volatile provides Visibility, but NOT Atomicity.

## The Crucial Rule to Remember

Static methods are resolved at compile time based on the class where the call is written or the reference type used at the invocation site.
* Call from main() via obj.display() (where obj is Base) $\rightarrow$ Resolves to Base.display().
* Call inside Derived.show() via display() $\rightarrow$ Resolves to Derived.display().

## How the SpringBoot starts?

1. At first it check the classpath of the project that what kind of servlet is persent or not. Like it checks,Is it a Reactive type or a traditional Servlet type or there is no servlet present, then it marks it as NONE, maybe it is used for some background work, or CLI tool.
2. Then after this an environment preparation started, In the is checks the command line arguments, JVM system properties, environment variables and application.yml/propreties. Then after this it fires an event of ApplicationEnvironmentPreparedEvent.
3. An application contex creation starts,During this two critical engine components are created: 
   1. DefaultListableBeanFactory: The core IOC engine that holds BeanDefinitions and Singletons.
   2. AnnotatedBeanDefinitionReader: The reader responsible for registering built-in-post-processors like ConfigurationClassPostProcessor and AutowiredAnnotationBeanPostProcessor.

>[!Note]
> What is Built-in-post-processors?
> In Spring, built-in post-processors are special infrastructure components that Spring automatically registers during container initialization to drive the core magic of the framework—such as processing annotations (@Configuration, @Autowired), registering bean definitions dynamically, and applying cross-cutting concerns like proxying (@Transactional, @Async).
> There are two primary categories of post-processors in Spring: 1. BeanPostProcessors(Operates on Bean Instances during instantiation and initialization) and 2. BeanFactoryPostProcessors(Operates on Bean Definitions before any beans are created).

4. Context Refresh Phase this is the most important phase in the entire spring framework. The make the application live as this is a master blueprint which is used to execute the steps sequentially during application lifecycle.
5. At last finishRefresh() is called which is the last step in the context refresh phase. This is the point where the application context is fully initialized and ready to serve requests. And it fires a ContextRefreshedEvent.

## Full Vs Lite Configuration Mode

In Full Configuration mode, the application use the CGLIB proxy interceptor to intercept the method calls and apply the aspect. BTW Full Configuration happens when we use the @Configuration and @Bean annotations. The advantage of using Full Configuration it will give you the only one instance of the class which you are trying to create.Although you use the new keyword to create the Object it will check the BeanFactory that is that BeanName object is present or not if it is then it will directly return that instead of creating new one.

In Lite Configuration mode, the application will create new instance of the class every time you call that method to get the instance. So there is no proxy intercepts call happening when you use the Lite Configuration mode.BTW Lite Configuration happens when we use the @Component and @Bean annotations.

### To change the Lite Configuration to Full configuration we have two ways:

1. We can directly upgrade the Lite Configuration to Full configuration by using the @Configuration and @Bean annotations.
2. We can use the parameterized method of the previous configuration method to get the same instace of the element.

```java
@Component // Lite mode preserved
public class PaymentConfig {

    @Bean
    public AuditLogger auditLogger() {
        return new AuditLogger();
    }

    @Bean
    public PaymentService paymentService(AuditLogger auditLogger) {
        // Spring resolves auditLogger directly from DefaultListableBeanFactory!
        return new PaymentService(auditLogger);
    }

    @Bean
    public RefundService refundService(AuditLogger auditLogger) {
        // Spring passes the SAME singleton instance from DefaultListableBeanFactory!
        return new RefundService(auditLogger);
    }
}
```

>[!Important]
> Why this works: When Spring registers a @Bean method, it treats method parameters as implicit @Autowired dependencies. Spring fetches the singleton AuditLogger directly from the BeanFactory cache rather than relying on Java method invocation interception.


## AutoConfiguration

When AutoConfigurationImportSelector runs during Phase 4 of startup (ConfigurationClassPostProcessor), it follows this pipeline:

```text
1. Reads AutoConfiguration.imports
    └── Finds: META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
 
 2. Loads Candidate Configuration Classes
    └── Example: DataSourceAutoConfiguration.class, SecurityAutoConfiguration.class
 
 3. Evaluates @Conditional Annotations
    ├── @ConditionalOnClass(DataSource.class)
    ├── @ConditionalOnMissingBean(DataSource.class)
    └── @ConditionalOnProperty(prefix = "spring.datasource", name = "url")
 
 4. Filters & Registers Valid BeanDefinitions
    └── Registers surviving classes into DefaultListableBeanFactory.beanDefinitionMap
```

1. Order of Processing: You correctly identified that user-defined configurations (@Configuration) are processed BEFORE auto-configuration classes (@AutoConfiguration).
2. Phase Matching: User beans are scanned during the standard @ComponentScan phase. When Spring Boot processes AutoConfigurationImportSelector, your custom customDataSource BeanDefinition is already sitting inside the DefaultListableBeanFactory.beanDefinitionMap.
3. Condition Evaluation (@ConditionalOnMissingBean): When Spring evaluates DataSourceAutoConfiguration, the @ConditionalOnMissingBean(DataSource.class) condition checks the BeanFactory registry. Finding customDataSource already registered, the condition evaluates to false. Spring Boot gracefully skips its auto-configured DataSource creation.

```text
ConfigurationClassPostProcessor
                             │
     ┌───────────────────────┴───────────────────────┐
     ▼                                               ▼
1. User Configuration (@ComponentScan)     2. Auto-Configuration (@Import)
   - DatabaseConfig parsed                    - Loaded via AutoConfigurationImportSelector
   - customDataSource BeanDefinition          - AutoConfigurationSorter orders them
     registered FIRST into BeanFactory         - Conditionals evaluated against current BeanFactory
                                              - @ConditionalOnMissingBean returns FALSE!
```

## Spring manages database connections and boundaries through a structured interceptor pipeline:

```text
Client Invocation
         │
         ▼
TransactionInterceptor.invoke()
         │
         ▼
PlatformTransactionManager.getTransaction()
         │
         ▼
TransactionSynchronizationManager (Binds Connection to ThreadLocal)
         │
         ▼
Target Business Method Execution
         │
    ┌────┴────────────────────┐
    ▼                         ▼
Success                    Exception
    │                         │
    ▼                         ▼
commit()                  rollback()
```

## Transaction

How to handle a exception in the method if we are using the try-catch block in the method. There are two ways to solve this:

### Solution 1: Rethrow the Exception (Best Practice)

If you need to catch the exception for logging or metric reporting, rethrow it so TransactionInterceptor detects it:

```java
@Transactional
public void processOrder(Order order) {
    orderRepository.save(order);

    try {
        inventoryService.deductStock(order.getItems());
    } catch (InsufficientStockException e) {
        log.error("Failed to deduct stock for order: {}", order.getId(), e);
        // Rethrow so TransactionInterceptor executes completeTransactionAfterThrowing!
        throw e; 
    }
}
```

### Solution 2: Explicit Programmatic Rollback Marker

If you cannot rethrow the exception (e.g., because you must return a fallback response object), manually mark the current transaction as rollback-only via TransactionAspectSupport:

```java
@Transactional
public void processOrder(Order order) {
    orderRepository.save(order);

    try {
        inventoryService.deductStock(order.getItems());
    } catch (InsufficientStockException e) {
        log.error("Failed to deduct stock for order: {}", order.getId(), e);
        
        // Instructs TransactionSynchronizationManager to set rollbackOnly = true
        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
    }
}
```
>[!Important]
> How setRollbackOnly() works internally: It sets a boolean flag on the underlying TransactionStatus bound to the current thread via TransactionSynchronizationManager. When TransactionInterceptor attempts to execute commit(), PlatformTransactionManager checks this flag, sees rollbackOnly = true, cancels the commit, and rolls back the database transaction instead.

### Advanced Transaction Nuance: UnexpectedRollbackException

What happens if inventoryService.deductStock() itself has @Transactional(propagation = Propagation.REQUIRED) and throws an exception, but processOrder() swallows it?


```text
processOrder() [@Transactional REQUIRED]
       │
       ▼
  inventoryService.deductStock() [@Transactional REQUIRED]  
       │
       └── Throws InsufficientStockException!
           └── Marks shared physical transaction as ROLLBACK-ONLY!
       │
  processOrder() catches exception and attempts COMMIT...
       │
       ▼
  🔴 Spring throws UnexpectedRollbackException!
```
Because both methods join the same physical database transaction, deductStock() marks the transaction as rollbackOnly. When processOrder() tries to commit, Spring refuses to commit a dirty transaction and throws org.springframework.transaction.UnexpectedRollbackException.

## Thread safe variable how to use a stateful service in concurrent environment

### Use ThreadLocal (Thread-Isolated Memory)
ThreadLocal creates a separate copy of the variable for each specific thread:

```java
@Service
public class UserContextService {

    private static final ThreadLocal<String> currentUser = new ThreadLocal<>();

    public void processUserRequest(String userId) {
        try {
            currentUser.set(userId); // Bound strictly to the current Tomcat Thread!

            doSomeLongRunningWork();

            System.out.println("Processing completed for User ID: " + currentUser.get());
        } finally {
            // CRITICAL IN TOMCAT THREAD POOLS: Must remove to prevent memory leaks / thread pollution!
            currentUser.remove(); 
        }
    }
}
```
>[!Important]
> Why currentUser.remove() is mandatory: Tomcat reuses threads from its thread pool for future HTTP requests. If you don't call .remove(), a future request handled by the same thread will inherit the previous user's ThreadLocal state!

### Request Scope Bean (@RequestScope)
If you must maintain a stateful context object across multiple services during a single request:

```java
@Component
@RequestScope // Spring creates a NEW instance for every incoming HTTP request!
public class UserContext {
    private String userId;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
```


## Spring MVC Request Lifecycle Internals

```text
Client Request (POST /api/orders)
                │
                ▼
      Servlet Filter Chain (Logging, CORS, Security)
                │
                ▼
       DispatcherServlet (The Front Controller)
                │
                ├── 1. Consults HandlerMapping (Finds OrderController.createOrder)
                │
                ├── 2. Obtains HandlerAdapter (RequestMappingHandlerAdapter)
                │
                ├── 3. ArgumentResolvers parse JSON/Params (@RequestBody, @PathVariable)
                │
                ├── 4. Interceptors (preHandle)
                │
                ├── 5. Invokes Target Controller Method
                │
                ├── 6. MessageConverters (HttpMessageConverter / Jackson) format response
                │
                └── 7. Interceptors (afterCompletion)
                │
                ▼
 Client Response (200 OK + JSON Payload)
```

## The True Spring MVC Execution Pipeline

```text
Client Request
        │
        ▼
  Filter.doFilter() [Before]
        │
        ▼
  DispatcherServlet.doDispatch()
        │
        ├── 1. HandlerInterceptor.preHandle()
        │
        ├── 2. HandlerAdapter.handle()
        │      ├── Controller method executed
        │      └── HttpMessageConverter (Jackson) serializes JSON 
        │          and COMMITS response output stream! ⚡
        │
        ├── 3. HandlerInterceptor.postHandle() 
        │      └── (Response is ALREADY committed! Cannot modify body/headers)
        │
        └── 4. HandlerInterceptor.afterCompletion()
        │
        ▼
  Filter.doFilter() [After]
        │
        ▼
  Client Response
```

## End-to-End Architectural Pipeline Map

```text
HTTP POST /api/orders
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Servlet Filter Chain (Security, CORS, Logging)           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. DispatcherServlet                                        │
│    ├── HandlerMapping -> Resolves OrderController           │
│    └── HandlerInterceptor.preHandle()                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. HandlerAdapter Execution                                 │
│    └── Invokes OrderController.createOrder()                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. CGLIB / JDK Dynamic Proxy (OrderService)                 │
│    ├── TransactionInterceptor -> PlatformTransactionManager  │
│    ├── Binds DB Connection to ThreadLocal                   │
│    └── Executes Aspect Around Advice (Audit Log)            │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Target Service & JPA Persistence Context                 │
│    ├── Mutates Entity in Memory                             │
│    ├── Session.flush() -> Dirty Checking against Snapshot   │
│    └── Issues UPDATE/INSERT SQL via JDBC PreparedStatement │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Response Processing                                      │
│    ├── PlatformTransactionManager.commit()                  │
│    ├── HttpMessageConverter (Jackson) serializes DTO to JSON│
│    ├── HandlerInterceptor.postHandle()                      │
│    └── HandlerInterceptor.afterCompletion()                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
  HTTP 200 OK (JSON Payload returned to Client)
```

## OutOfMemeoryError(Memory Leak) Investigation
 Why is Hibernate's First-Level Cache (Persistence Context) causing an OutOfMemoryError in this batch process?Why does keeping @Transactional open for the entire duration of a 500,000-record batch processing method paralyze JVM heap memory?How would you refactor this batch service to run cleanly in production with constant $O(1)$ memory consumption?


 Ans : Hibernate's Session (First-Level Cache) retains a hard managed reference and a snapshot copy of every single entity in memory for Dirty Checking until the transaction completes.Because the transaction stays open for the entire duration of the loop, Java's Garbage Collector cannot collect a single Order entity, even after you finish processing it in the for loop!Accumulated total on heap: $500,000 \text{ entities} \times 2 \text{ (entity + snapshot)} = 1,000,000 \text{ managed objects}$ residing in Old Gen space, triggering java.lang.OutOfMemoryError

### How to Refactor Scenario 1 for $O(1)$ Constant Memory

#### Senior Solution A: Paginated Chunking / Batching (Slice or Page)

```java
@Service
public class BatchOrderService {

    @Autowired
    private OrderProcessingChunkService chunkService;

    // NO @Transactional HERE! Allows memory & connections to be released per batch.
    public void processPendingOrders() {
        int pageSize = 1000;
        int pageNumber = 0;
        Slice<Order> orderSlice;

        do {
            // Process each chunk in its OWN isolated transaction boundary!
            orderSlice = chunkService.processChunk(pageNumber, pageSize);
            pageNumber++;
        } while (orderSlice.hasNext());
    }
}

@Service
public class OrderProcessingChunkService {

    @Autowired
    private OrderRepository orderRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Slice<Order> processChunk(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Slice<Order> slice = orderRepository.findByStatus(OrderStatus.PENDING, pageable);

        for (Order order : slice) {
            order.setStatus(OrderStatus.PROCESSED);
            order.setProcessedAt(LocalDateTime.now());
        }
        return slice; // Transaction commits HERE -> Session clears & GC reclaims memory!
    }
}
```

#### Senior Solution B: Streaming with Stream<T> and EntityManager.clear()

```java
@Transactional(readOnly = true)
public void processPendingOrdersStream() {
    // Uses JDBC Cursor / Stream instead of loading a 500,000-item List
    try (Stream<Order> orderStream = orderRepository.streamAllByStatus(OrderStatus.PENDING)) {
        orderStream.forEach(order -> {
            processSingleOrder(order);
            
            // Periodically clear Hibernate Session to free memory!
            if (++count % 1000 == 0) {
                entityManager.flush();
                entityManager.clear(); // Detaches entities so GC can sweep them!
            }
        });
    }
}
```

## How Java's ThreadPoolExecutor Expands under Load (Counter-Intuitive!)

```text
                            New Task Arrives
                                 │
                                 ▼
              Are active threads < corePoolSize (10)?
                                 │
                   ┌─────────────┴─────────────┐
                  YES                          NO
                   │                           │
                   ▼                           ▼
         Spawn Core Thread            Is Queue Full (100)?
                                               │
                                 ┌─────────────┴─────────────┐
                                NO                          YES
                                 │                           │
                                 ▼                           ▼
                        Enqueue Task            Are active threads < maxPoolSize (50)?
                                                             │
                                               ┌─────────────┴─────────────┐
                                              YES                          NO
                                               │                           │
                                               ▼                           ▼
                                      Spawn Max Thread           Trigger RejectedExecutionHandler!
```

In Java/Spring, an @Async method must return void or a Future / CompletableFuture.

## Security context holder while using @Async

The failure is not about timing or cleanup order. It is about thread memory boundaries. When @Async offloads logUserAction() to a ThreadPoolTaskExecutor worker thread (Async-Worker-1), that worker thread is a completely different thread from the Tomcat request thread (http-nio-8080-exec-1). Because SecurityContextHolder defaults to MODE_THREADLOCAL, the security context never existed on Async-Worker-1's memory stack in the first place!

### Two Production Solutions for Security Context Propagation

1. Global Spring Security Strategy Configuration
   You can configure Spring Security to use MODE_INHERITABLETHREADLOCAL via JVM system properties or programmatically at startup:

🔴 Warning for Thread Pools: InheritableThreadLocal only propagates context when a NEW thread is created. If your ThreadPoolTaskExecutor reuses existing pooled threads, a reused thread will retain its old context!

2. Decorating TaskExecutor with DelegatingSecurityContextAsyncTaskExecutor (Best Practice)
   The robust enterprise approach is to wrap your ThreadPoolTaskExecutor with Spring Security's DelegatingSecurityContextAsyncTaskExecutor.

This decorator captures the SecurityContext from the submitting HTTP thread at the exact moment @Async is called and explicitly binds/unbinds it to the background pool thread during task execution!

### How DelegatingSecurityContextAsyncTaskExecutor Works Under the Hood:

```text
HTTP Thread (Tomcat-1)
    ├── SecurityContext present in ThreadLocal
    │
    ▼
  Submits @Async Task to Executor
    ├── Captures Runnable task
    ├── Copies current SecurityContext reference
    │
    ▼
  Worker Thread (AsyncWorker-1)
    ├── 1. SecurityContextHolder.setContext(capturedContext);
    ├── 2. Executes target method: logUserAction();
    └── 3. FINALLY block: SecurityContextHolder.clearContext(); // Prevents thread pollution!
```
