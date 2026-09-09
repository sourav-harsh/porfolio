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
