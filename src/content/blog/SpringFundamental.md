---
title: "Spring Boot Fundamentals, Microservices & Project Understanding."
date: "2026-09-08"
excerpt: ""
tags: []
---

## Difference between `@conditionalbean` and `@conditionalclass`

The core difference is that `@ConditionalOnClass` checks the application's classpath for the presence of a compiled *.class* file, whereas `@ConditionalOnBean` checks the active Spring ApplicationContext container to see if an object instance (a bean) has already been initialized or registered

### Summary

| Feature          | @ConditionalOnClass                                                    | @ConditionalOnBean                                                     |
|------------------|------------------------------------------------------------------------|------------------------------------------------------------------------|
| Target Area      | Classpath(JARs and build dependencies).                                | Spring ApplicationContext(Active Bean Container).                      |
| Checked Entity   | A specific Java class type or name                                     | An intitialized spring been object or name.                            |
| Phase Checked    | Early phase(during configuration loading)                              | Later phase(after preceding beans are processed).                      |
| Primary Use Case | Inculuding a feature only if an optional library dependency is persent | Linking a bean's creation to the existence of another configured bean. |
 
### @ConditionalOnClass

This annotation determines bean registration based on whether a specific library or class is included in your project dependencies (e.g., inside your pom.xml or build.gradle).

* How it works: The Spring Boot loader attempts to find the class using the JVM classloader. If the class is found, the condition evaluates to true.
* Common Example: Spring Boot uses this heavily for starter modules. For instance, it will only register a RedisCacheManager bean if it detects that the actual Redis driver classes are available on your classpath.

### @ConditionalOnBean

This annotation checks the live Spring container to see if a specific bean has already been configured and registered by your application or another configuration class

* How it works: It queries the internal BeanFactory to check if a bean matching the required type or name already exists.
* Common Example: If you are building an auditing module, you might only want to instantiate the AuditLogger bean if a DataSource bean has already been successfully defined in the environment.
* Warning on Ordering: Because beans are initialized sequentially, you must exercise caution when using this annotation. It is strongly recommended to use @ConditionalOnBean primarily on auto-configuration classes to guarantee that Spring has already processed all standard user configurations.

## What is Debezium?

Debezium is an open-source distributed platform for change data capture (CDC) that turns your databases into real-time event streams.

## What is spring boot auto-configuration?

Spring Boot Auto-Configuration is a core feature that automatically configures a Spring application based on the jar dependencies present on the project's classpath. Before Spring Boot, developers had to write extensive, repetitive XML configurations or Java config classes to set up basic features like database connections, web servers, and security. Auto-configuration eliminates this boilerplate code, allowing applications to "just work" right out of the box.

### 🛠️ What Happens Behind the Scenes

The entire mechanism relies on a simple three-step process at runtime:

1. The Trigger Annotation

   When your application starts, it reads the @SpringBootApplication annotation on your main class. This annotation implicitly includes @EnableAutoConfiguration, which turns on the auto-configuration engine

2. Reading the Imports Registry

    Spring Boot looks inside its core JAR files for a specific metadata file located at META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports. This file contains a massive list of pre-written configuration classes (e.g., DataSourceAutoConfiguration, JacksonAutoConfiguration).

3. Evaluating Conditional Annotations

   Spring Boot loops through that list, but it does not apply every configuration blindly. It uses Conditional Annotations to safely evaluate whether a specific configuration is actually needed at that moment:
    * @ConditionalOnClass: Activates a configuration only if a specific class exists on your classpath (e.g., "Only configure Hibernate if Hibernate classes are present").
    * @ConditionalOnProperty: Activates a configuration only if a specific property is set in your application.properties or application.yml file.
    * @ConditionalOnMissingBean: This is the fallback safety net. It tells Spring Boot, "Only create this default bean if the developer hasn't already defined their own customized bean".

## Singleton bean scope and thread safety?

Spring singleton beans are not automatically thread-safe. The singleton scope simply means that Spring creates exactly one instance of that bean per application context. Since a typical web application handles multiple incoming HTTP requests simultaneously using different threads, every thread shares and executes on that same single bean instance.

Whether a singleton bean is thread-safe depends entirely on how you write its internal code

### 1. The Stateless Case (Naturally Thread-Safe)
The vast majority of Spring beans—such as @Controller, @Service, and @Repository components—are naturally thread-safe because they are stateless.

* What it means: The bean has no instance variables (fields) that store mutable data.
* Why it works: Every thread executing a method inside the bean allocates its own local variables on its own thread stack. Threads do not cross paths or overwrite each other's data

### 2. The Stateful Case (Not Thread-Safe)

If your singleton bean contains mutable instance variables, it is stateful and prone to race conditions, data corruption, and unpredictable bugs

>[!Note]
>### Alternative: Changing the Scope
>If a bean absolutely must hold mutable state that changes per user request or use-case, the singleton scope might be the wrong choice. You can shift away from a singleton by applying a different scope
>* @Scope("prototype"): A brand new instance is created every time the bean is requested.
>* @RequestScope: A new instance is created specifically for each incoming HTTP request (ideal for web layer state)

> (Note: Injecting a Prototype bean directly into a Singleton bean can create an unexpected behavior called the Scoped Bean Injection Problem, as the prototype is only injected once at startup. You may need to use ObjectProvider or Method Injection to fetch new instances repeatedly)

## Circular dependency resolution?

To resolve a circular dependency, you must break the mutual loop where two or more modules, classes, or services directly require each other (A → B → A)

### 🛠️ Architectural Refactoring (Best Practices)

* Extract a Shared Component: Move the tightly coupled code that causes the loop into a new, independent third file or library. Both original components then depend on this shared piece (A → C and B → C)
* Merge the Components: If two classes or modules are constantly passing data back and forth, they might naturally belong together. Combine them into a single file or class to entirely eliminate the boundaries causing the cycle.
* Apply Dependency Inversion: Create abstract interfaces or contracts. Instead of Class A depending directly on Class B, make Class A depend on an Interface B, which Class B implements.
* Use Event-Driven Architecture: Switch from direct synchronous calls to an asynchronous model. Have Component A publish an event to a message broker or system listener, which Component B consumes without A needing to know B exists.

### Fixes

* Use @Lazy Annotation: Delay the initialization of one of the beans until it is actually needed. Spring will inject a proxy bean instead of the real object, breaking the startup cycle.
* Switch to Setter Injection: Avoid constructor injection for the looping dependencies. Using setter methods allows Spring to instantiate the beans first and wire their properties afterward.

## How @lazy fix it?

By default, Spring beans are singletons and are eagerly initialized. This means Spring tries to create and fully wire every bean up front when the application starts.

### The Problem: Eager Constructor Injection

Imagine BeanA requires BeanB in its constructor, and BeanB requires BeanA in its constructor.

1. Spring tries to create BeanA.
2. Spring sees it needs BeanB first, so it pauses BeanA and tries to create BeanB.
3. Spring sees BeanB needs BeanA, so it looks for BeanA.
4. Because BeanA is not finished initializing, Spring realizes it is stuck in an infinite loop and throws a BeanCurrentlyInCreationException.

### The Solution: How @Lazy Breaks the Loop

When you add the @Lazy annotation to one of the injection points, you tell Spring: "Do not create or look for the real bean right now during startup. Wait until I actually call a method on it."

```java
@Component
public class BeanA {
    private final BeanB beanB;

    // @Lazy tells Spring to inject a proxy instead of the real BeanB at startup
    public BeanA(@Lazy BeanB beanB) {
        this.beanB = beanB;
    }
}
```
Instead of looking for the fully constructed BeanB, Spring performs a clever trick using a `Dynamic Proxy Object`:

1. Proxy Injection: Spring creates BeanA. When it sees the @Lazy BeanB dependency, it instantly generates a lightweight, hollow Proxy object (a fake version of BeanB) and injects it into BeanA.
2. Loop Broken: Because the proxy is injected immediately, BeanA finishes its instantiation successfully.
3. Normal Resolution: Now that BeanA exists in the context, Spring can go ahead and instantiate BeanB normally, injecting the real BeanA into it.
4. Application Starts: The startup cycle completes without errors.

### What happens at Runtime? (Behind the Scenes)
The proxy object acts as a middleman or a "lazy pointer.

"When your application is running and BeanA finally calls a method on beanB (e.g., beanB.doSomething()), the Proxy intercepts the call. The proxy looks inside the Spring Context, grabs the real fully-initialized BeanB instance, and delegates the method call to it.

Every subsequent call goes through this proxy straight to the real bean.

### ⚠️ A Word of Warning
While @Lazy is a quick and effective fix, it acts as a band-aid for a design flaw. A circular dependency usually means your classes know too much about each other. It is highly recommended to eventually refactor the shared logic into a third bean rather than relying heavily on @Lazy.

To see if @Lazy is the best choice for your specific code, let me know:
* Are you using Constructor injection (recommended) or Field injection (@Autowired)?
* What version of Spring Boot are you running? (Spring Boot 2.6+ disables circular references by default, making this error much more common).

## Maven lifecycle commands 

When you run a Maven phase command, Maven automatically runs every preceding phase within that specific lifecycle in sequential order.

### 🧹 The Clean Lifecycle (mvn clean)
The Clean lifecycle is responsible for wiping away the remnants of old builds to ensure you are compiling your project from a completely fresh slate.

* Command: mvn clean
* What it does: It invokes the clean phase, which deletes the /target folder where Maven stores all compiled .class files, generated resources, and packaged JAR/WAR files
* Phases executed in order:
  * pre-clean (prepares for cleanup)
  * clean (deletes the build directory)
  * post-clean (handles post-cleanup tasks)

### 📦 The Default Lifecycle (mvn install)
The Default lifecycle is the main, core lifecycle used to validate, compile, test, package, and distribute your code

* Command: mvn install
* What it does: It compiles your project, runs your tests, bundles the code into a package (like a .jar or .war), and then installs that package into your local repository (~/.m2/repository). This makes the artifact available as a dependency for your other local projects.
* Phases executed in order: Because install is near the end of the chain, running it triggers all the major preceding phases sequentially:
  * validate – Verifies the project structure and POM configuration.
  * compile – Compiles the source code (src/main/java) into bytecode.
  * test – Runs unit tests using frameworks like JUnit.
  * package – Bundles the compiled bytecode into a distributable format (e.g., JAR).
  * verify – Runs integration tests and quality checks.
  * install – Installs the package into your local machine's repository

>[!Note]
>(Note: The final phase after install is deploy, which pushes the package to a remote team repository like Nexus).

## How measuring performance improvement using proper metrics?

Measuring performance improvement in a Spring Boot application requires tracking key operational metrics using Spring Boot Actuator and Micrometer combined with external tools like Prometheus and Grafana.

### Essential Performance Metrics
* Duration (Latency): Measures the time a method or HTTP request takes to complete. Use Micrometer's Timer or the @Observed annotation to track execution speeds.
* Rate (Throughput): Monitors the number of requests or transactions processed per second or minute. Track this using Micrometer Counter objects.
* Errors: Tracks the percentage or total count of failed requests and exceptions thrown during service execution.
* Resource Utilization: Evaluates JVM heap memory usage, Garbage Collection (GC) pauses, and HikariCP database connection pool metrics.
