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
