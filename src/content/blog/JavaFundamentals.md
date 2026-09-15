

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
