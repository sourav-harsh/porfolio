---
title: "Java Fundamentals"
date: "2026-09-20"
excerpt: "Complete understanding Java Fundamentals."
tags: []
---

## Complete JDK Internals
```text

+-------------------------------------------------------+

| JDK (Java Development Kit)                            |
|  - Compiler (javac), Debugger, Javadoc, Jar Tool       |
|                                                       |
|  +-------------------------------------------------+  |
|  | JRE (Java Runtime Environment)                  |  |
|  |  - Core Class Libraries (java.util, java.io)    |  |
|  |                                                 |  |
|  |  +-------------------------------------------+  |  |
|  |  | JVM (Java Virtual Machine)                |  |  |
|  |  |  - Executes Bytecode (.class files)       |  |  |
|  |  +-------------------------------------------+  |  |
|  +-------------------------------------------------+  |
+-------------------------------------------------------+
```

## All about JVM(Java Virtual Machine)
![JVM](/public/images/jvm_architecture.jpg)

* Class Loader - It is responsible for loading the `.class` files from the disk and loading them into the memory.It will do lazy loading(means it will load the class files only when they are needed).
* Runtime Data Area - It is responsible for storing the metadata like class and object.It will be stored in the heap memory.It will also store the pointer to the line number using PC Register(Program Counter Register).
    * Heap - It is responsible for storing the objects.So anytime you created a new object using the new keyword, it lives here.
    * Stack - Each thread in java has it's own private stack.The stack holds method calls and local variables.Whenever a method is called, a new block called a stack frame is created in the stack.When the method is completed, the stack frame is popped off from the stack.
    * Class Area/Method Area - The class area is where metadata is stored. This includes things like class name, method names, field names and runtime constant pool.
    * PC Register - It is tine but important part of JVM, it keeps track of the current line of code that is being executed.Again each threads has it's own private PC Register.
    * Native Method Stack - Java is designed to interact with native code like C or C++ using something called JNI(Java Native Interface).When the native methods called ,it information goes here,into the native method stack.

* Execution Engine - It is responsible for executing the byte code.Doesn't interpret every line everytime.Uses JIT(Just in time) for the performance.
* Native Method Interface - Acts as the bridge between the JVM and external library.It help to interact with OS directly.Enable system level interaction from java.

## How JIT works?

```text
First time a methods run---> interpreted line-by-line
if called repeatedly---> JIT compiled to native code
Makes Java performance nearly like C++
```

## Core Components and Tools in the JDK

When you install the JDK, you gain access to a variety of essential development utilities via your command line:

* javac (The Compiler): Transforms your human-written .java source code into machine-readable .class bytecode.
* java (The Launcher): Opens the JVM and executes the compiled .class application files.
* jdb (The Debugger): Allows you to step through code line-by-line to inspect variables and find bugs.
* jar (The Archiver): Bundles many separate class files, images, and properties into a single compressed .jar file for easy distribution.
* javadoc (Documentation Generator): Automatically builds clean HTML API documentation straight from the comments in your source code.
* jshell (Read-Eval-Print Loop): An interactive shell introduced in Java 9 that lets you quickly test snippets of Java code without writing a full class.
* Monitoring Tools (jconsole, jvisualvm): Used to audit application performance, memory leaks, and CPU threads.


## String Immutable

So Java gives the string as immutable, means you cannot change the string once it is created.That means you can modifiy the string using the loop, toUpperCase(), concat() but it will produce a new string in the Java Heap Memory. Like it will not change the original one. So this creates an serious issue that if every time any modify operation is be done on the string it will create a new one so Java Heap Memory will be filled up with the new strings, which can cause `OutOfMemoryError`.

So to solve this `OutOfMemoryError` java gives the `StringBuffer` approach(Java 1.0 in 1996) where user can modify the string as StringBuffer which is mutable. It will do this by acquiring a lock on the thread which is will be used to modify the string. But it will create another problem for single thread system it will increase the latency as it will acquire the lock on the thread.

So to solve this later in 2004 of java 5, java gives the `StringBuilder` approach which is also mutable. But it will not acquire the lock on the thread. But for multi thread system it will create another problem. Which is that it will not be thread safe. Means it will corrupt the data. So to solve this we can use the `StringBuilder` in the local variable so each thread has it's own copy of StringBuilder so they can perform the operation without any issue.

```java
// A high-traffic controller handling millions of HTTP requests
public String handleRequest(User user) {
    // This instance lives on the calling thread's STACK. 
    // Another incoming request (Thread B) will create a completely separate instance on its own stack.
    StringBuilder sb = new StringBuilder(); 
    
    sb.append("User: ").append(user.getName());
    sb.append(" Action: ").append(user.getLastAction());
    
    return sb.toString(); // Safe! No two threads ever touch the same 'sb' object.
}

```

## Why String is Immutable?

* So the first reason is to use the `String Pool Effectively`. Like imagine if we are using the mutable string or it is store in the string pool then that string reference by another variable so if it is mutable so if we change the first one then all it reference will not point to that new string which is wrong for them.
* Second reason is to `Security` as we offer store multiple sensitive data as a string like username, db url, password so if string is mutable so any untrusted piece of code can modify the string which is not secure.
* Third reason is to `Thread Safety` as we know that string is immutable so it is thread safe.

## String Pool

It is a special store in the Java Heap Memory where java store it string value, so every time if a new string is created it will check the string pool first and if it is already present it will return the same string else it will create a new string.

```java
String a = "Hello";
String b = "Hello";

// a == b will return true
```

## About equals() and hashcode()

So these are two fundamental methods defined in the base object class. It is helpful for the objects to be compared inside hash-based collections like `HashMap`, `HashSet` and `Hashtable`.

* `equals()` - The main reason to use this is as because if we want to compare two objects and we use `==` then it will compare the reference of the object. But if we want to compare the value of the object then we use `equals()`, or we can override it to compare the actual values/properties of the objects.
* `hashcode()` - It generates 32-bit int value representing the object. By using the hash-based collections will locate the objects quickly, by looking the bucket where the object is stored.

>[!Note]
> If we override the `equals()`, you must override the `hashcode()`. Java establishes a strict relationship contract between them
> 1. If two objects are equal according to `equals()`, then their `hashcode()` must be equal.
> 2. If two objects have the same `hashcode()`, they may or may not be equal according to `equals()`.This scenario is called `hash collision`.

### Example

```java
import java.util.Objects;

public class Employee {
    private int id;
    private String name;

    public Employee(int id, String name) {
        this.id = id;
        this.name = name;
    }

    // 1. Overriding equals()
    @Override
    public boolean equals(Object o) {
        // Step 1: Check reference equality
        if (this == o) return true;
        
        // Step 2: Check for null and type compatibility
        if (o == null || getClass() != o.getClass()) return false;
        
        // Step 3: Cast and compare fields
        Employee employee = (Employee) o;
        return id == employee.id && Objects.equals(name, employee.name);
    }

    // 2. Overriding hashCode() using the same fields
    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }
}

```

## Collections

The Java Collection Framework (JCF) provides a unified, architecture-based set of classes and interfaces to efficiently store, manipulate, and manage these groups of data dynamically (unlike fixed-size arrays).

All core collection classes and interfaces are part of the java.util package.

The Collection class in extending the Iterable means in the root there is a Iterable which is use for doing loop.

>[!Important]
> Note: The Map interface is technically part of the JCF, but it does not inherit from the Collection interface because it stores data as key-value pairs instead of single elements

### Core Interface 

#### List Interface  

1. ArrayList- It is the implementation of the List interface and is based on the array data structure. It allows duplicate elements. It is fast for data retrieval,but slow for insertion and deletion.
2. LinkedList- It is the implementation of the List interface and is based on the linked list data structure. It allows duplicate elements. It is fast for insertion and deletion, but slow for data retrieval. Store data in doubly linkedlist.
3. Vector- Legacy, synchronized (thread-safe) versions of ArrayList, rarely used in modern applications unless thread safety is explicitly required.

#### Set Interface

1. HashSet- It is the implementation of the Set interface and is based on the hash table data structure. It does not allow duplicate elements. It has offer high speed operations but does not guarantee the order of elements. 
2. LinkedHashSet- Similar to HashSet but maintains a doubly-linked list running through all its entries to preserve insertion order.
3. TreeSet-  Arranges elements in their natural sorted order (or via a custom Comparator). It uses a tree structure, making lookups slightly slower than HashSet.

#### Map Interface

1. HashMap- It is the implementation of the Map interface and is based on the hash table data structure. It does not allow duplicate keys. It has offer high speed operations but does not guarantee the order of elements. 
2. LinkedHashMap- Similar to HashMap but maintains a doubly-linked list running through all its entries to preserve insertion order.
3. TreeMap-  Arranges elements in their natural sorted order (or via a custom Comparator). It uses a tree structure, making lookups slightly slower than HashMap.

#### Queue & Deque Interfaces
* PriorityQueue: Elements are processed according to their natural sorting order or a custom priority rather than arrival time.
* ArrayDeque: A double-ended queue (Deque) that allows inserting or removing elements from both ends. It performs faster than Stack and LinkedList when used as a queue or stack.

## Generics

In java generics are used to create a type-safe and re-usable code. It is a way to create a class, interface, or method that can work with different data types while maintaining type safety. 
Before generics, we used to use the `Object` class as a placeholder for any type, but this approach was type-unsafe and could lead to runtime errors or ClassCastException.

Types or ways to use generics:
1. Generic classes- A generic class is declared with a type parameter inside angle brackets (<>) after the class name. By convention, single letters like T (Type), E (Element), K (Key), and V (Value) are used.
```java

// A simple generic box container
public class Box<T> {
    private T content;

    public void set(T content) {
        this.content = content;
    }

    public T get() {
        return content;
    }
}

// Instantiating with a String type (using the diamond operator '<>')
Box<String> stringBox = new Box<>();
stringBox.set("Hello World");
String text = stringBox.get(); // No explicit type casting required!

// Instantiating with an Integer type
Box<Integer> intBox = new Box<>();
intBox.set(123);

```

2. Generic Methods

```java
public class Utility {
    // Generic method that prints any array type
    public static <E> void printArray(E[] elements) {
        for (E element : elements) {
            System.out.print(element + " ");
        }
        System.out.println();
    }
}

```

3. Bounded Type Parameters

```java
// T is restricted: it must be Number or a subclass of Number (like Integer, Double)
public class NumericBox<T extends Number> {
    private T value;
    
    public double getDoubleValue() {
        return value.doubleValue(); // Safe to call Number methods
    }
}
```

4. Wildcards (?) - In generic code, the question mark (?) represents an unknown type. Wildcards add flexibility when passing arguments to methods.

* Unbounded Wildcard (<?>): Stands for any type.
* Upper Bounded Wildcard (<? extends T>): Restricts the type to T or any subclass of T (useful for reading data).
* Lower Bounded Wildcard (<? super T>): Restricts the type to T or any superclass of T (useful for writing data).

## Exceptions

An exception in Java is an unwanted or unexpected event that occurs during the execution of a program (at runtime) and disrupts the normal flow of instructions.

When an error occurs within a method, the method creates an object—called an Exception Object—and hands it off to the runtime system (JVM). This object contains information about the error, including its type and the state of the program when the error occurred.

All the exceptions and error types are subclasses of the `Throwable` class. `Throwable` is the root of the exception hierarchy in Java.

* Throwable
  * Error: Serious problems that a reasonable application should not try to catch (e.g., OutOfMemoryError, StackOverflowError). These are usually external to the application.
  * Exception: Conditions that a reasonable application might want to catch.
    * RuntimeException: Unchecked exceptions that usually indicate programming bugs (e.g., NullPointerException)

### Type of Exceptions

Java categorizes exceptions into two main groups based on when they are verified:

| feature              | Checked Exceptions                                                      | Unchecked Exceptions                                                    |
|----------------------|-------------------------------------------------------------------------|-------------------------------------------------------------------------|
| Verification Time    | Checked at compoile-time                                                | Checked at runtime                                                      |
| Compiler Enforcement | Mandatory. The Compiler forces you to handle or declare them.           | Optional. The complier does not force you to handle them                |
| Cause                | Generally due to external factors(e.g.. missing files, network issues). | Generally due to programming/logic flaws.                               |
| Examples             | IOException, FileNotFoundException, SQLException                        | NullPointerException,ArithmeticException,ArrayIndexOutOfBoundsException |

### How to handle exceptions

Java provides five keywords to manage exception handling: try, catch, finally, throw, and throws.

### Keyword Breakdown:

* try: Wraps the block of code that might throw an exception. It must be followed by either a catch or finally block.
* catch: Contains the code used to handle the exception if it occurs in the try block. You can have multiple catch blocks for a single try.
* finally: Used to execute critical cleanup code (like closing database connections or files). It runs whether an exception is thrown or handled.

### throw vs throws

These two keywords serve completely different purposes in the exception architecture: 

* throw: Used to explicitly throw an exception from any method or block of code.
```java
if (age < 18) {
    throw new IllegalArgumentException("Not eligible to vote.");
}
```

* throws: Used in a method signature to declare that this method might throw specific exceptions during execution. It shifts the responsibility of handling the exception to the caller of the method.
```java
public void readFile(String path) throws IOException {
    // Code that reads a file
}
```

## Interface Vs Abstract Class

In abstract class you can add a method which can be used directly by the extended classes. And you can add a overridable method which is not implemented and can be overriden by the extended classes.

```java
// Focuses on identity and shared structure
abstract class Appliance {
    int powerRating; // Can hold instance state

    Appliance(int powerRating) { // Has a constructor
        this.powerRating = powerRating;
    }

    abstract void turnOn(); // Abstract method

    void showPower() { // Concrete method
        System.out.println("Power: " + powerRating + "W");
    }
}

class Toaster extends Appliance {
    Toaster() { super(1200); }
    
    @Override
    void turnOn() { System.out.println("Heating coils..."); }
}

```

Interface is a blueprint not implemented. You have a strict blueprint you just need to implement it in you extended classes.

```java

// Focuses strictly on capabilities/behavior
interface RemoteControllable {
    int MAX_DISTANCE_METERS = 10; // Implicitly public static final constant

    void pressPowerButton(); // Implicitly public abstract method
}

// Unrelated classes can implement the same interface
class SmartTV implements RemoteControllable {
    public void pressPowerButton() { System.out.println("TV turning on..."); }
}

class GarageDoor implements RemoteControllable {
    public void pressPowerButton() { System.out.println("Garage door opening..."); }
}

```
## About `static`,`final`,`this` and `super`.

### Static

This can be used to define a property or method that belongs to the class itself, not the instances of the class. Memory is loaded only once in the class area when the class is loaded. Can only access other static data and call other static methods directly. They cannot use this or super.


```java
class Counter {
    static int count = 0; // Shared among all instances

    Counter() {
        count++;
    }
    
    static void displayCount() {
        System.out.println("Total count: " + count);
    }
```

### Final

This final keyword is used to make a variable, method, or class immutable. 

* Variables: Makes the variable a constant. Once a value is assigned, it cannot be changed.
* Methods: Prevents the method from being overridden by child classes.
* Classes: Prevents the class from being inherited (extended)

```java
final class Vehicle { // Cannot be extended
    final int SPEED_LIMIT = 60; // Constant value

    final void run() { // Cannot be overridden
        // SPEED_LIMIT = 90; // Compile-time error
        System.out.println("Running safely");
    }
}

```

### This

The this keyword is a reference variable that points directly to the current object instance.

* Shadowing Fix: Most commonly used to differentiate between instance variables and local variables/parameters when they share the exact same name.
* Constructor Chaining: Can be used as this() to invoke another constructor within the same class (must be the first line of the constructor).

```java
class Student {
    String name;

    Student(String name) {
        this.name = name; // 'this.name' refers to the instance variable above
    }

    Student() {
        this("Unknown"); // Calls the constructor above
    }
}

```

### Super 

The super keyword is a reference variable used to interact with the immediate parent class. It is heavily used in object inheritance.

* Variable/Method Overriding conflicts: Accesses a parent class method or variable if the child class has overridden it.
* Parent Constructors: Can be used as super() to invoke the parent class's constructor (must be the first statement in the child constructor).

```java
class Animal {
    void eat() { System.out.println("Eating..."); }
}

class Dog extends Animal {
    void eat() { System.out.println("Eating dog food..."); }

    void barkAndEat() {
        super.eat(); // Calls Animal's eat() method
        this.eat();  // Calls Dog's eat() method
    }
}
```

## Java 8+ features

Java 8 was a monumental release that completely revolutionized Java development by introducing functional programming capabilities, cleaner syntax, and better data processing APIs.

### ⚙️ Core Functional Programming Features

* Lambda Expressions: Anonymous functions that let you pass behavior as an argument to a method. It drastically eliminates boilerplate code when working with anonymous inner classes.
* Functional Interfaces: Interfaces that contain exactly one abstract method (e.g., Predicate, Function, Consumer, Supplier). They are marked with the optional @FunctionalInterface annotation and serve as the target types for lambda expressions.
* Method References: A shorthand notation (Class::methodName) used to refer to a method without executing it, making lambdas even more readable.

### 📊 Data Processing & Collection Enhancements

* Stream API: A powerful abstraction for processing collections of data in a declarative manner (similar to SQL queries). It supports functional-style operations like filter(), map(), and reduce().
* Parallel Streams: A simple way to partition collection data across multiple threads automatically via parallelStream(), maximizing multi-core CPU utilization.
* forEach() Method: A new utility method added to the Iterable interface to easily iterate through collections using a single line of code.

### 🛠️ Architecture & Structural Changes

* Default and Static Methods in Interfaces: Interfaces can now have fully implemented methods. Default methods (using the default keyword) allow adding new functionality to existing interfaces without breaking the classes that implement them. Static methods allow interfaces to hold utility functions.
* Optional Class: A container object (java.util.Optional) used to represent the presence or absence of a value. It helps developers explicitly handle missing data and avoid notorious NullPointerException errors.

### ⏳ Utilities & Engine Upgrades

* New Date & Time API: A completely overhauled, immutable, and thread-safe date-time framework under the java.time package (featuring LocalDate, LocalTime, and ZonedDateTime) to replace the flawed java.util.Date and Calendar classes.\
* CompletableFuture: An extension of Java's Future API that simplifies asynchronous programming, allowing developers to chain tasks and handle callback events easily.
* Base64 Encoding & Decoding: A built-in, efficient standard utility (java.util.Base64) for handling data serialization securely without relying on third-party libraries.

## Lambdas 
Lambda expressions, introduced in Java 8, allow you to write concise, functional-style code by representing anonymous functions. They essentially let you treat code as data—meaning you can pass a block of code as a parameter to a method or assign it to a variable without creating a whole new class.

### The Core Concept: Functional Interfaces

A lambda expression can only be used where a Functional Interface is expected. A functional interface is simply an interface that has exactly one abstract method.

Examples of built-in functional interfaces include Runnable (with run()), Comparator (with compare()), or standard functional types like java.util.function.Consumer.

## Optional

Introduced in Java 8, the java.util.Optional<T> class is a generic container object that may or may not contain a non-null value. It was primarily designed to serve as a clearer way for method return types to signal the absence of a value, helping developers prevent NullPointerException (NPE) and write cleaner, more functional code without messy if (x != null) blocks.

### 1. How to Create an Optional

There are three static methods used to initialize an Optional object:
* Optional.empty(): Creates an empty Optional instance.
* Optional.of(value): Wraps a non-null value. Warning: If you pass null into this method, it immediately throws a NullPointerException.
* Optional.ofNullable(value): Wraps a value that might be null. If the value is null, it safely falls back and returns an empty Optional.

```java
Optional<String> emptyOpt = Optional.empty();
Optional<String> fullOpt = Optional.of("Hello");

String name = null;
Optional<String> nullableOpt = Optional.ofNullable(name); // Safely becomes empty

```

### 2. Common Ways to Consume an Optional

Instead of blindly calling .get() (which throws a NoSuchElementException if empty), you should use fluent, safe approaches to extract or handle the values.

#### Providing Fallbacks (Defaults)

* orElse(defaultValue): Returns the value if present, otherwise returns the specified default value.
* orElseGet(Supplier): Similar to orElse, but takes a lambda expression. The fallback code runs only if the value is missing (lazy evaluation).
* orElseThrow(Supplier): Throws a custom exception if the value is absent

```java
// Using orElse
String finalName = nullableOpt.orElse("Guest User");

// Using orElseThrow
String result = nullableOpt.orElseThrow(() -> new IllegalArgumentException("Name missing!"));

```

#### Functional Actions

* ifPresent(Consumer): Executes a block of code only if a value is inside the container.
* isPresent(): Returns true if there is a value, false if empty (similar to a null check).

### 3. Transforming Optionals (Fluent API)

Much like the Stream API, Optional supports functional manipulation via mapping and filtering.
* filter(Predicate): If a value is present and matches the condition, it returns the Optional; otherwise, it returns an empty Optional.
* map(Function): If a value is present, transforms it using the function.
* flatMap(Function): Similar to map, but used when the transforming function itself returns an Optional, avoiding nested wrappers (Optional<Optional<T>>).

## Date Time Api

Java 8 introduced the java.time API, completely replacing the old, problematic java.util.Date and java.util.Calendar classes. The new API is immutable, thread-safe, aligned with the ISO-8601 standard, and explicitly separates different aspects of time.

### Core Classes & Use Cases

* LocalDate: Represents a date only (Year, Month, Day) without time or zone information.
* LocalTime: Represents a time only (Hour, Minute, Second, Nanosecond) without a date or zone.
* LocalDateTime: Combines both date and time into a single object without timezone context.
* ZonedDateTime: Handles full date and time tracking alongside specific timezone rules (e.g., Asia/Kolkata).
* Instant: Captures a single specific moment on the timeline, measured in nanoseconds from the Unix epoch (useful for timestamps/logging).

### Measuring Differences (Period vs Duration)

* Period: Calculates difference in human terms (Years, Months, Days).
* Duration: Calculates difference in machine terms (Seconds, Nanoseconds).

## I/O Basics

Java I/O (Input/Output) is the mechanism Java uses to read data from a source (like the keyboard, a file, or a network) and write data to a destination. Java processes this data sequentially using Streams, which act like pipes transferring data byte-by-byte or character-by-character

### The Two main Stream Type

1. Byte Stream - Process data as 8-bit bytes.They are used for raw binary data like image, audio, or video files.
   * Base Classes: InputStream and OutputStream.
   * Common Implementations: FileInputStream, FileOutputStream, ByteArrayInputStream, ByteArrayOutputStream.
2. Character Stream - Process data as 16-bit Unicode characters. They are used for text data.
   * Base Classes: Reader and Writer.
   * Common Implementations: FileReader, FileWriter, BufferedReader, BufferedWriter.

### Improving Performance of reading and writing using Buffered Streams

Reading a file byte-by-byte or character-by-character can be slow because it requires interaction directly with the native operating system API every time.

Buffered Streams(BufferedReader and BufferedWriter) fix the by reading large chunks of data into a temporary memory buffer first, reducing system overhead.

```java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class BufferedReadExample {
    public static void main(String[] args) {
        try (BufferedReader br = new BufferedReader(new FileReader("output.txt"))) {
            String line;
            while ((line = br.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

```

### Binary Data Streams(DataInputStream & DataOutputStream)

While basic byte streams (FileInputStream/FileOutputStream) read and write raw individual bytes, Data Streams allow you to read and write primitive data types(int,double,boolean) directly in a portable, binary format.

### Java NIO(New I/O) Framework
Introduced in Java 1.4 (and majorly updated in Java 7 as NIO.2), Java NIO is an alternative to the standard stream-based I/O. It was built for high-performance applications, like web servers, that need to handle thousands of simultaneous connections.It is a non-blocking as a thread can request data and continue doing other tasks if data isn't ready yet.

Core Building Blocks of NIO
* Buffers: Containers for data. In NIO, you never write directly to a channel or file; you write data into a buffer, and then pass that buffer to a channel.
* Channels: Think of channels as a smarter version of streams. They represent open connections to hardware devices, files, or network sockets. Unlike streams, channels are bi-directional (you can read and write using the same channel).
* Selectors: A mechanism that allows a single thread to monitor multiple channels for events (like a socket receiving data). This is the secret behind building massive, non-blocking network servers.

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.io.IOException;

public class NioExample {
    public static void main(String[] args) {
        // NIO uses the Path and Paths classes instead of File
        Path source = Paths.get("source.txt");
        Path destination = Paths.get("destination.txt");

        try {
            // NIO.2 provides high-level static utility methods for fast file operations
            Files.copy(source, destination, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("File copied efficiently using NIO!");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## MultiThreading

Multithreading in Java is a powerful feature that allows a program to execute multiple threads concurrently to maximize CPU utilization. A thread is the smallest, independent unit of execution within a single program (or process). All threads share the same memory space, making communication between them incredibly fast and resource-efficient.

Imagine a modern video game or an app like Microsoft Word: while one thread is processing user keystrokes, another thread is auto-saving the file, and a third thread is checking spelling in the background.

### 🛠️ Ways to Create a Thread in Java

#### 1. By Extending the Thread Class

You create a custom class that inherits from java.lang.Thread and override its run() method.

```java
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Thread is running via extending the Thread class!");
    }
}

public class Main {
    public static void main(String[] args) {
        MyThread thread = new MyThread();
        thread.start(); // Spawns a new thread and internally calls run()
    }
}

```

#### 2. By Implementing the Runnable Interface (Preferred)

You implement the Runnable interface, pass an instance of it to a Thread object, and execute it. This is the preferred approach because Java does not support multiple inheritance; implementing an interface keeps your class free to extend something else.

```java
class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("Thread is running via implementing Runnable interface!");
    }
}

public class Main {
    public static void main(String[] args) {
        Thread thread = new Thread(new MyRunnable());
        thread.start(); 
    }
}

```
>[!Important]
>⚠️ Crucial Note: Always call thread.start() to begin thread execution. If you call thread.run() directly, it won't start a new thread; it will just execute sequentially like a regular method on the current thread.


### 🔄 The Thread Lifecycle

* New: The thread is created (e.g., new Thread()) but start() has not been called yet.
* Runnable: The thread is ready to run and waiting for CPU allocation from the OS scheduler.
* Running: The thread scheduler has selected the thread, and it is actively executing.
* Blocked/Waiting: The thread is temporarily inactive because it is waiting for a lock, a resource, or an external signal from another thread.
* Terminated (Dead): The thread has finished executing its run() method

### 🛡️ Synchronization: Managing Thread Collisions

Java uses the synchronized keyword to lock a method or code block, ensuring that only one thread can access it at a time.


## Thread Pool/ ExecutorService

In Java, creating new threads manually is expensive. Every time you create a new Thread(), the operating system allocates system memory and takes time to set up and tear down the thread.

To solve this, Java introduced Thread Pools and the Executor Framework in Java 5 (java.util.concurrent). Instead of creating a new thread for every task, a thread pool keeps a fixed number of worker threads active and assigns arriving tasks to them.

### Common type of thread pools

1. Fixed Thread Pool - Creates a pool with a fixed number of threads. If all threads are busy, new tasks are queued until a thread becomes available.
2. Cached Thread Pool - Creates a new thread as needed, but reuses existing ones if they become free. Idle threads are terminated after 60 seconds of inactivity.
3. Single Thread Executor - Uses exactly one worker thread. Tasks are executed sequentially in the exact order they arrive.
4. Scheduled Thread Pool - Allows you to schedule tasks to run after a delay or at regular intervals.

## Runnable vs Callable
When submitting tasks to an ExecutorService, you can use two types of tasks:

1. Runnable: Executes a task but cannot return a result and cannot throw checked exceptions. Use executor.submit(RunnableTask).
2. Callable<V>: Executes a task and returns a result of type V, and can throw exceptions. Use Future<V> future = executor.submit(callableTask).


>[!Note]
>A Future acts as a placeholder for a result that hasn't arrived yet.

### ⚠️ Critical Rule: Always Shut Down Your Executor

An ExecutorService creates non-daemon threads. If you forget to call executor.shutdown(), your Java application will never exit, even if the main method finishes executing.

* shutdown(): Soft shutdown. Allows currently running and queued tasks to finish, but rejects new ones.
* shutdownNow(): Hard shutdown. Attempts to stop actively running tasks immediately and returns a list of waiting tasks.

## Concurrency

Java concurrency is the ability of the Java platform to execute multiple tasks or threads overlapping in time. Built into the language from its inception, Java's concurrency model centers around Threads—lightweight processes that share the application's memory space but execute independently. Managing how these threads interact with shared data is critical to building fast, scalable, and responsive programs.

### 1. Core Mechanics: Threads and Runnables

* Runnable: Defines the task code inside a run() method.
* Thread: The actual execution engine that schedules and runs the task via start().

### 2. The Danger Zone: Concurrency Pitfalls

* Race Conditions: Occur when two threads read and write a shared variable at the same time. Because operations like count++ are not atomic (they involve reading, modifying, and writing), updates can get lost.
* Visibility Problems: CPU cores cache data. If Thread A updates a variable, Thread B might not see that update immediately because it's reading from its own cache rather than main memory.
* Deadlocks: Occur when Thread A holds Resource 1 and waits for Resource 2, while Thread B holds Resource 2 and waits for Resource 1. Neither can proceed.

### 3. Essential Synchronization Tools

* synchronized blocks/methods: Prevents multiple threads from entering a critical section of code at the same time, enforcing thread safety.
* volatile keyword: Forces Java to read and write a variable directly from main memory rather than a CPU cache, solving the visibility problem.
* Atomic Variables (java.util.concurrent.atomic): Classes like AtomicInteger use low-level CPU instructions to perform lock-free, atomic operations (like incrementing) safely.

### 4. High-Level Concurrency Utilities

* Executor Framework (Thread Pools): Instead of creating threads manually, you submit tasks to an ExecutorService (like a fixed thread pool), which manages a reuseable queue of threads efficiently.
* Callable & Future: Unlike Runnable, a Callable task can return a specific result or throw an exception. A Future represents the pending result of that asynchronous computation.
* Synchronizers: Advanced coordination structures like Semaphore (limits concurrent access via permits) and CyclicBarrier (makes a group of threads wait for each other).

### 5. Modern Java Concurrency

* Virtual Threads (Project Loom): Introduced to make high-throughput, concurrent applications much lighter. Traditional platform threads map 1:1 to OS threads (heavyweight). Virtual threads are managed by the JVM, allowing you to run millions of concurrent threads with minimal memory overhead.
* Structured Concurrency: Treats groups of related tasks running in different threads as a single unit of work, making error handling and cancellation easier and cleaner.

## Synchronization

Synchronization in Java is a mechanism that controls the access of multiple threads to shared resources. In a multi-threaded environment, two or more threads might try to modify the same variable or data structure simultaneously. Without synchronization, this leads to data inconsistency and race conditions (unpredictable behavior depending on which thread executes first).

Java relies on an internal locking mechanism known as an intrinsic lock or monitor. Every object in Java has a monitor associated with it. When a thread enters synchronized code, it automatically acquires that object's lock and releases it when it exits.

1. Synchronized Methods

```java
public class Counter {
    private int count = 0;

    // Only one thread can execute this method on a specific Counter object at a time
    public synchronized void increment() {
        count++;
    }

    public synchronized int getCount() {
        return count;
    }
}
```

2. Synchronized Blocks

```java
public class BetterCounter {
    private int count = 0;
    private final Object lock = new Object(); // Custom dummy object used purely for locking

    public void increment() {
        // Non-critical operations can go here and run concurrently
        
        synchronized (lock) { 
            // Only this specific part is locked
            count++;
        }
    }
}
```

3. Static Synchronization

```java
public class GlobalCounter {
    private static int globalCount = 0;

    // The lock is applied to GlobalCounter.class
    public static synchronized void incrementGlobal() {
        globalCount++;
    }
}

```

## Locks

In Java, a lock is a synchronization mechanism used to control access to a shared resource by multiple threads. It ensures mutual exclusion, meaning only one thread can access a critical section of code at any given time, preventing data inconsistency and race conditions.

Java provides two primary ways to implement locking: Intrinsic Locks (built into the language via the synchronized keyword) and Explicit Locks (introduced in the java.util.concurrent.locks package).

### 1. Intrinsic Locks (Implicit Locking)

* Object-Level Lock: Restricts access to instance methods or specific blocks of code for a single object instance.

```java
public synchronized void updateData() {
    // Only one thread can enter this method per object instance
}
```

* Class-Level Lock: Restricts access to static synchronized methods or blocks. It locks the Class object itself, affecting all instances of that class.

```java
public static synchronized void globalUpdate() {
    // Only one thread can enter this method across the entire application
}
```

### 2. Explicit Locks (The java.util.concurrent.locks Package)

* A. ReentrantLock

The most common implementation of the Lock interface. A "reentrant" lock allows a thread that already holds the lock to re-acquire it without deadlocking itself

```java
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class Counter {
    private final Lock lock = new ReentrantLock();
    private int count = 0;

    public void increment() {
        lock.lock(); // Acquire the lock
        try {
            count++; // Critical section
        } finally {
            lock.unlock(); // Always release in finally block
        }
    }
}

```

* B. ReentrantReadWriteLock

This implementation manages a pair of locks: a ReadLock and a WriteLock. It maximizes performance when a resource is read frequently but updated infrequently.

  * Multiple threads can hold the ReadLock concurrently.
  * Only one thread can hold the WriteLock exclusively, blocking all readers and other writers

```java
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class Cache {
    private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
    private String data = "Hello";

    public String readData() {
        rwLock.readLock().lock();
        try { return data; } finally { rwLock.readLock().unlock(); }
    }

    public void writeData(String newValue) {
        rwLock.writeLock().lock();
        try { data = newValue; } finally { rwLock.writeLock().unlock(); }
    }
}

```

* C. Advanced Methods in Explicit Locks
  * tryLock(): Attempts to acquire the lock immediately. Returns true if successful, or false if it is held by another thread, avoiding thread blocking. You can also pass a timeout duration.
  * lockInterruptibly(): Acquires the lock unless the current thread is interrupted while waiting, allowing the thread to abort waiting.

## Atomic Classes

Atomic classes in Java are a set of utility classes found in the java.util.concurrent.atomic package that enable lock-free, thread-safe operations on single variables.  They allow multiple threads to concurrent read and write values without causing data corruption or requiring heavy synchronization primitives like the synchronized keyword or explicit locks.

1. Atomic Primitives
   * AtomicInteger - Manages an underlying int value
   * AtomicLong - Manages an underlying long value
   * AtomicBoolean - Manages an underlying boolean value
   * AtomicReference - Manages an underlying reference value
2. Atomic Arrays
   * AtomicIntegerFieldUpdater - Provides atomic operations for int fields in an object
   * AtomicLongFieldUpdater - Provides atomic operations for long fields in an object
   * AtomicReferenceFieldUpdater - Provides atomic operations for reference fields in an object

## Future Vs CompletableFuture

| Feature                 | Future                                | CompletableFuture                              |
|-------------------------|---------------------------------------|------------------------------------------------|
| Execution Style         | Blocking(Require Polling or waiting)  | Non-blocking(Event driven/ Callbacks)          |
| Task Chaining           | Not Supported                         | Supported using thenApply(), thenAccept(), etc |
| Combining Futures       | Cannot combine multiple futures       | Supported using thenCombine() or allOf().      |
| Manual Completion       | Cannot be completed manually          | Supported via .complete(value) method.         |
| Built-in Error handling | Manual try-catch blocks around .get() | Supported using exceptionally() and handle().  |

## Concurrent Collections

Concurrent collections in Java are thread-safe data structures designed for highly concurrent, multi-threaded environments. Found in the java.util.concurrent package, they allow multiple threads to read and write data simultaneously without corrupting the structure or throwing ConcurrentModificationException. Unlike older thread-safe alternatives, they achieve high performance by avoiding coarse-grained global locks.

### Key Concurrent Collection Classes

1. Maps
   * *ConcurrentHashMap* - A thread-safe implementation of the Map interface that provides high concurrency and fast access.
   * *ConcurrentSkipListMap* - A thread-safe implementation of the Map interface that provides sorted order and fast access.
2. List & Sets
   * *CopyOnWriteArrayList* - A thread-safe implementation of the List interface that provides fast read access and thread-safe write operations.
   * *CopyOnWriteArraySet* - A thread-safe implementation of the Set interface that provides fast read access and thread-safe write operations.
3. Queues
   * *ConcurrentLinkedQueue* - A thread-safe implementation of the Queue interface that provides fast access and thread-safe write operations.
   * *LinkedBlockingQueue* - A thread-safe implementation of the Queue interface that provides fast access and thread-safe write operations.

## JMM(Java Memory Model)

The Java Memory Model (JMM) is a specification that defines how threads interact through memory in concurrent applications. Essentially, it acts as a rulebook specifying how and when changes made by one thread become visible to others.

People often confuse the Java Memory Model (JMM) with JVM Memory Structure (Heap, Stack, Metaspace). While the JVM Structure defines where data lives, the JMM defines how data moves between hardware caches and main memory in a multi-threaded environment.

### ⚠️ The Problem: Why Do We Need the JMM?

Modern computers use aggressive optimizations to maximize speed, which introduces massive bugs in multithreaded applications:

* CPU Caches: Every CPU core has its own ultra-fast cache (L1, L2, L3). A thread running on Core A might update a variable, but if that value stays in Core A's cache, Core B will read a stale value from the main RAM.
* Instruction Reordering: To keep the execution pipeline busy, both the Just-In-Time (JIT) compiler and the CPU itself will rearrange the order of your execution instructions as long as it doesn't change single-threaded outcomes. In multi-threading, this can cause a reader thread to see a half-initialized object.

### 📜 Core Principles of the JMM

1. Visibility: Visibility ensures that when one thread modifies a shared variable, other threads can immediately see the update. By default, there is no guarantee when an update will flush to main memory.
2. Ordering: Ordering refers to the sequence in which memory operations take place. The JMM guarantees that within the same thread, execution looks sequential, but to an outside thread, actions can appear out of order unless synchronized.
3. Atomicity: Atomicity means an operation happens all at once or not at all. For example, reading or writing a reference variable is atomic, but operations like count++ are actually three distinct steps (Read-Modify-Write) and are not atomic.

### 🛠️ The "Happens-Before" Relationship

The core engine of the JMM is the Happens-Before rule. If action A happens-before action B, the memory effects of A are guaranteed to be visible to the thread executing B.

You can enforce this relationship using Java's built-in tools:
* volatile Keyword: Writing to a volatile variable flushes it straight to main memory and invalidates other CPU caches. It ensures any subsequent read gets the freshest value. It also stops the compiler from reordering code around it.
* synchronized Blocks / Locks: Acquiring a lock automatically flushes the local cache and forces the thread to read from main memory. Releasing a lock forces all local writes out to main memory.
* Thread Start/Join: Calling thread.start() establishes a happens-before relationship, meaning everything the parent thread did before starting the child is visible to the child. Similarly, anything a thread did is visible to the parent after a successful thread.join().
* Final Fields: Variables marked final are safely frozen after object construction, meaning other threads will never see a half-initialized value if the object is published safely.

## CAS(Compare-and-Swap)
Compare-and-Swap (CAS) is a low-level, CPU-supported atomic instruction used in multithreaded programming to achieve lock-free thread safety without the heavy overhead of traditional locking. Instead of blocking threads using synchronized blocks or ReentrantLock, CAS relies on hardware coordination to update shared variables efficiently.

### How CAS Works
A CAS operation checks if a memory location holds a specific "expected" value. If it does, it updates the location to a "new" value. If it doesn't (meaning another thread changed the value in the meantime), the operation fails, and the current thread typically retries the operation.

It requires three parameters:
1. Memory location (V): The variable being updated.
2. Expected value (A): What the thread thinks the variable currently is.
3. New value (B): The value to write if the expected value matches.

#### The CAS Loop Pattern
Because CAS can fail under high concurrency, it is almost always wrapped in a loop (often called a lock-free retry loop). The thread reads the value, calculates the new value, and attempts a CAS. If it fails, it loops back, reads the updated value, and tries again.

### Drawbacks of CAS

* The ABA Problem: If a thread reads value A, another thread changes it to B and back to A, a subsequent CAS operation will succeed because the value is still A. If this matters to your logic, you must use AtomicStampedReference or AtomicMarkableReference, which pair the value with a version stamp.
* CPU Overhead under High Contention: If hundreds of threads try to update the same variable simultaneously, many will repeatedly fail and loop, causing high CPU utilization without accomplishing work

## Virtual Threads 

Virtual threads are lightweight, JVM-managed threads introduced as a production feature in Java 21 via JEP 444. They are designed to dramatically increase the throughput of concurrent applications—especially server applications—by eliminating the operating system (OS) thread as the primary bottleneck.

Unlike traditional threads, your application can easily spin up millions of virtual threads simultaneously on a single standard machine without running out of memory

### How They Work Behind the Scenes

Virtual threads operate using a concept called mounting and unmounting:
* Mounting: When a virtual thread starts executing code, the JVM schedules it onto a platform thread, known as the carrier thread.
* Parking (Unmounting): The moment the virtual thread runs into a blocking operation (like an HTTP call, database query, or Thread.sleep()), it unmounts from the carrier thread. Its call stack is moved to the JVM heap, leaving the carrier thread free to run a different virtual thread.
* Resuming: Once the blocking I/O operation finishes, the JVM transparently schedules the virtual thread back onto any available carrier thread to finish its job.

### Golden Rules & Best Practices

* Do NOT Pool Virtual Threads: Traditional pooled thinking says thread creation is expensive, so we use FixedThreadPool. With virtual threads, this is an anti-pattern. Never pool them. Create a fresh virtual thread every time you have a concurrent task and throw it away when done.
* Avoid CPU-Intensive Work: Virtual threads do not make code execute faster. If your thread is running heavy cryptographic math or machine learning loops, it will never unmount, hogging the underlying carrier thread. Keep CPU-heavy work on platform threads.
* Beware of "Pinning": A virtual thread can get "pinned" to its carrier thread if it blocks while inside a synchronized block or a native method. When pinned, the underlying OS thread is trapped and cannot pick up other tasks. Use java.util.concurrent.locks.ReentrantLock instead of synchronized blocks if pinning occurs.

## Rest Principle

REST (Representational State Transfer) is a software architectural style governed by six core principles, or constraints, that dictate how web systems should interact. Originally defined by computer scientist Roy Fielding in 2000, these design principles ensure that systems are scalable, flexible, and simple to maintain over the internet.
1. Client-Server Decoupling: 
   * Concept: The client (the front-end or user interface) and the server (the back-end data storage and logic) must remain completely independent.
   * Benefit: You can update the user interface without changing the database logic, and vice versa. Each component only needs to know how to communicate via standard requests 
2. Statelessness: 
   * Concept: Every single request from a client must contain all the information the server needs to understand and process it. The server is not allowed to store any session memory about past requests on its side.
   * Benefit: This increases scalability. If a server goes down, another server can handle the next incoming request because it doesn't rely on cached session history.
3. Cacheability:
   * Concept: Server responses must explicitly define themselves as cacheable or non-cacheable.
   * Benefit: If a response is cacheable, the client can store that data and reuse it for future identical requests. This drastically reduces server load and speeds up client performance.
4. Layered System:
   * Concept: An API should be designed so that the client cannot tell whether it is connected directly to the end server or an intermediate proxy, load balancer, or security layer.
   * Benefit: This allows developers to add security layers, distribute server traffic across multiple machines, or inject caching servers without requiring any modifications to the client-side code.
5. Uniform Interface:
   * Resource Identification: Every resource (e.g., a user, an image, a product) must have a unique identifier, usually a URI (Uniform Resource Identifier).
   * Manipulation through Representations: When a client holds a representation of a resource (like a JSON payload), it has enough information to modify or delete that resource on the server.
   * Self-descriptive Messages: Each message must contain enough context for the receiver to process it. For instance, it should specify the data format (e.g., Content-Type: application/json).
   * HATEOAS (Hypermedia As The Engine Of Application State): The server response should dynamically provide links to other actions or resources the client can take next, much like how a user clicks links on a webpage.
6. Code on Demand (Optional):
   * Concept: The server can temporarily extend or customize client functionality by transferring executable code directly to it (such as compiled Java applets or JavaScript scripts).
   * Benefit: This reduces the number of pre-installed features a client needs to have ready. Note: This is the only optional constraint in the REST architecture.

## HTTP Headers
HTTP headers are metadata fields passed back and forth between a client (like your web browser) and a server during an HTTP request and response. Think of them as the shipping label on a package—the message body is the actual item inside, but the headers provide instructions on who sent it, what format it is in, how to handle it, and where it is going.

### 🛠️ Common HTTP Headers by Use Case

#### 1. Authentication & State Management
* Authorization: Passes credentials (like a JWT token or API key) from the client to access protected areas of a server.
* Cookie: Sent by the client to return small pieces of data previously saved by the server.
* Set-Cookie: Sent by the server to instruct your browser to store a specific piece of state data

#### 2. Content Negotiation & Representation
* Accept: Tell the server what media types (e.g., text/html, application/json) the browser is capable of reading.
* Content-Type: Dictates the actual media type of the current payload (e.g., Content-Type: application/json) so the recipient knows how to parse it.
* Content-Length: Specifies the exact size of the message body in bytes.

#### 3. Caching & Performance

* Cache-Control: The primary command center for caching policies, defining directives like max-age or no-store.
* ETag: A unique fingerprint string assigned to a specific version of a resource. If the fingerprint hasn’t changed, the browser doesn't need to re-download the file.

#### 4. Security Controls

* Strict-Transport-Security (HSTS): Forces the browser to communicate with the website exclusively over encrypted HTTPS connections.
* Content-Security-Policy (CSP): Restricts where scripts, images, and other assets can be loaded from, blocking unauthorized cross-site scripting (XSS) injections.
* Access-Control-Allow-Origin: A core part of Cross-Origin Resource Sharing (CORS) that tells browsers which external domains are permitted to fetch data from this server.

## Cookies

An HTTP cookie is a small data file that a website saves on your computer or phone through your web browser. It helps websites remember who you are, keep items in your shopping cart, save your language choices, and remember your login details so you do not have to sign in on every page.

## HTTP1.1 vs HTTP2 vs HTTP3

The primary difference lies in the underlying transport layer and how data and connections are handled. HTTP/1.1 uses plain-text and processes requests sequentially; HTTP/2 introduces multiplexing over TCP; and HTTP/3 replaces TCP with the QUIC protocol over UDP to eliminate transport-level blocking.

### Core Differences
* HTTP/1.1 (1997): Uses a text-based format. It allows persistent connections, but handles requests one after another or requires multiple distinct TCP connections, leading to head-of-line blocking where a single slow request delays everything behind it.
* HTTP/2 (2015): Shifts to a binary framing layer and supports true multiplexing (sending multiple concurrent requests over a single TCP connection), header compression (HPACK), and server push. However, it still suffers from head-of-line blocking at the underlying TCP level.
* HTTP/3 (2022/Modern): Replaces TCP entirely with QUIC (which runs on UDP). This completely solves transport-level head-of-line blocking so that packet loss in one data stream does not stall other independent streams, making it ideal for mobile and unstable networks.

## TLS

Transport Layer Security (TLS) is a cryptographic security protocol that encrypts data and authenticates communication between applications over a network, serving as the foundation for HTTPS.

### How TLS Works
* Handshake Phase: The client and server agree on a TLS version, select a cipher suite, and verify the server's digital certificate
* Key Exchange: Both parties securely establish a shared secret key using asymmetric cryptography (like Diffie-Hellman).
* Encrypted Communication: The rest of the session uses fast symmetric encryption to protect data confidentiality and a Message Authentication Code (MAC) to ensure data integrity.

## what is multiplexing?
Multiplexing is a technique that combines multiple signals or data streams into a single signal so they can travel over a shared communication channel at the same time.

### How It Works
* Multiplexer (MUX): A hardware device at the sending end that takes multiple separate input signals and merges them into one combined (composite) output signal.
* Shared Medium: The single physical cable, fiber optic strand, or wireless radio frequency link that carries the combined signal.
* Demultiplexer (DEMUX): A device at the receiving end that reverses the process, separating the composite signal back into the original individual data streams.

### Main Types of Multiplexing
* Frequency Division Multiplexing (FDM): Divides the total bandwidth of a channel into non-overlapping frequency bands so each signal travels on its own distinct frequency.
* Time Division Multiplexing (TDM): Shares a single channel by rapidly cycling through sequential time slots, giving each data stream a turn to transmit data.
* Wavelength Division Multiplexing (WDM): A version of FDM used in fiber optics that combines multiple distinct light wavelengths into a single fiber cable.
* Code Division Multiplexing (CDM): Assigns a unique code to each signal so multiple users can share the exact same frequency and time bandwidth simultaneously.

## what is Resource oriented design

Resource-oriented design (ROD) is a software design pattern for building APIs and network architectures. It focuses on named data entities (nouns) rather than actions (verbs). Systems use unique identifiers like URIs to name each resource and apply a small, standard set of methods—like GET, POST, and DELETE—to manage them.

If you are working with frameworks like Spring Boot or NestJS, you have described it perfectly.You map the base noun to the class using a single @RequestMapping("/projects"), and then you let the specific HTTP method annotations (@GetMapping, @PostMapping, @PutMapping, @DeleteMapping) do the heavy lifting.

## what is uniform interface in rest

The uniform interface is a core design constraint of the REST (Representational State Transfer) architectural style. It requires that all client-server interactions follow a standardized, predictable contract, which completely decouples the client from the server’s underlying database or software.

## hateoas in rest api

HATEOAS, which stands for Hypermedia As The Engine Of Application State, is a core constraint of the REST application architecture. It is the mechanism that separates a truly RESTful API from a simple HTTP-based Web API.

Under HATEOAS, an API client interacts with the server entirely through hypermedia (links) provided dynamically in the server responses. The client needs little to no prior knowledge about how to interact with the application beyond a basic understanding of generic hypermedia formats.
