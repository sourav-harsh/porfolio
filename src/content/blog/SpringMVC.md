---
title: "Spring MVC, Validation & Exception Handling."
date: "2026-09-05"
excerpt: "How to define the spring mvc, validation and exception handling."
tags: ["@Valid", "@Validated", "@ControllerAdvice","@RestControllerAdvice", "@ExceptionHandler", "Custom Annotations","DTO vs Business Validation","ConstraintViolationException","Nested Validation","HTTP Status Code"]
---

## Why to use the `@Valid` at controller level?

Using `@Valid` at the controller level is spring boot automatically triggers bean validation on incoming request bodies or model attributes before your method runs.

### How it works?

1. **Request Body Validation:** Place `@Valid` directly on a method parameter annotated with `@RequestBody` to check fields against annotations like `@NotNull`, `@Size`, or `@Email`.
2. **Early Rejection:** If any field fails validation, Spring stops execution and throws a `MethodArgumentNotValidException`.
3. **Error Handling:** Catch this exception globally using `@ControllerAdvice` to return clean, custom error responses to the client.


### `@Valid` Vs `@Validated` at Controller Level

1. Use `@Valid` on method parameters (the DTO object itself) for standard request body validation.
2. Use Spring's `@Validated` on the controller class level if you need to validate simple method parameters like `@RequestParam` or `@PathVariable` (which throws a `ConstraintViolationException` on failure).

#### More on `@Validated`

The Spring Framework annotation `@Validated` is used to enable validation on method parameters and specify validation groups

1. Validated Groups

Validation groups let you apply different rules to the same data transfer object (DTO) depending on the action, such as creating versus updating a record

Step 1: Create Marker Interfaces for Groups

```java
public interface CreateGroup { }
public interface UpdateGroup { }
```

Step 2: Apply Groups to your DTO

```java
public class UserDto {
    @NotNull(groups = OnUpdate.class, message = "ID is required for update")
    private Long id;

    @NotBlank(message = "Name cannot be blank") // Applies to default group / all actions
    private String name;

    @NotBlank(groups = OnCreate.class, message = "Password is required on creation")
    private String password;
}

```

Step 3: Use `@Validated` with Groups in a Controller

```java
@RestController
@RequestMapping("/users")
public class UserController {

    @PostMapping
    public ResponseEntity<String> createUser(@Validated(OnCreate.class) @RequestBody UserDto userDto) {
        // Only triggers rules with OnCreate group and default constraints
        return ResponseEntity.ok("User created");
    }

    @PutMapping
    public ResponseEntity<String> updateUser(@Validated(OnUpdate.class) @RequestBody UserDto userDto) {
        // Triggers rules requiring the ID field
        return ResponseEntity.ok("User updated");
    }
}

```

2. Method-Level Validation

When placed at the class level on a @Service or @Controller, @Validated validates individual parameters like path variables or request parameters directly

```java
@Service
@Validated // Required at class level for method parameter checks
public class NumberService {

    public int doubleNumber(@Min(value = 1, message = "Value must be at least 1") int num) {
        return num * 2;
    }
}

```
>[!Note]
>If a caller passes 0 to doubleNumber, Spring throws a `ConstraintViolationException`.


### Nested Validation using `@Valid`

You can perform cascaded or nested validation in Java by placing the @Valid annotation on the field of the inner/nested object or collection inside your parent class.

#### How it works?

When the validation engine (like Hibernate Validator) validates the parent object, the @Valid annotation tells it to recursively trigger validation constraints inside the child object or the elements of a collection (List, Set, Map). Without @Valid, constraints on nested properties are ignored.

```java
public class UserRequest {

    @NotBlank(message = "Name cannot be blank")
    private String name;

    // Triggers cascading validation for the nested Address object
    @NotNull(message = "Address is required")
    @Valid
    private AddressRequest address;

    // Triggers cascading validation for elements inside a collection
    @Valid
    private List<@NotBlank(message = "Tag cannot be blank") String> tags;
}

public class AddressRequest {

    @NotBlank(message = "City cannot be blank")
    private String city;

    @NotBlank(message = "Zipcode cannot be blank")
    private String zipcode;
}

```
## Custom Validation annotations

You can create custom validation annotations in Spring Boot by combining the `@Constraint` meta-annotation with an implementation of the `ConstraintValidator` interface

### Steps to Create a Custom Validation Annotation

**1. Create a custom annotation**

Define your custom annotation using `@interface` and link it to a validator class using the `@Constraint` attribute. You must also include `message`, `groups`, and `payload` attributes for Jakarta Bean Validation compatibility.

```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = CustomValidator.class)
public @interface ValidCustomValue {
    String message() default "Invalid value provided";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

```
**2. Implement the Constraint Validator**

Create a validator class that implements `ConstraintValidator`, specifying your annotation and the target data type as generic parameters. Write your validation rules inside the `isValid` method.

```java
public class CustomValidator implements ConstraintValidator<ValidCustomValue, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return false; // Decide if null is valid or use @NotNull separately
        }
        return value.startsWith("PREFIX_"); // Your custom business logic
    }
}

```

**3. Apply the Annotation to a DTO**

Use your new annotation on fields inside your request body or Data Transfer Object (DTO) classes just like built-in constraints.

```java
public class UserRequest {
    @ValidCustomValue(message = "Value must start with PREFIX_")
    private String code;
}

```

## DTO Validation VS Service/Business Validation


| Feature               | DTO Validation                                                                  | Service/Business Validation                                  |
|-----------------------|---------------------------------------------------------------------------------|--------------------------------------------------------------|
| Where it lives        | Controller/API layer (on the DTO itself)                                        | Service/Domain layer (Business logic).                       |
| What it checks        | Structure, format, type, and presence.                                          | State, context, permissions, and side-effects.               |
| External Dependencies | Isolated (No database or external API calls required).                          | Connected (Queries databases, calls external microservices). |
| Common Tools          | Annotations (e.g., `@NotNull`,` @Email` in Java/Spring; Class-validator in TS). | Custom code, domain entities, or workflow engines.           |
| Failure Cost          | Extremely cheap (Fails instantly at the edge of your app).                      | Expensive (Requires database trips or partial execution).    |

### Detailed Breakdown

#### 1. DTO Validation(The "Gatekeeper")

DTO validation acts as a filter at the very edge of your application. It answers the question: *“Is the payload structured correctly so the application can read it without throwing a formatting error?”*

* Typical examples:
  * Is the email address formatted properly (e.g., contains @ and .com)?
  * Is the age field a positive integer?
  * Are required fields like username present and not blank?

* Why it matters: It stops malformed data from ever reaching your core application logic, preventing unnecessary processing and saving database resources

#### 2. Service/Business Validation(The "Business Logic")

Service validation evaluates context and application state. Even if a DTO is perfectly formatted, it might still fail business validation. It answers the question: *“Does this data make sense right now based on our business rules and database state?”*

* Typical examples:
  * The email is formatted correctly (DTO pass), but is it already taken in our database? (Service fail)
  * The withdrawal amount is a positive number (DTO pass), but does the user have enough balance? (Service fail)
  * The date format is valid (DTO pass), but is the booking date in the past or on a holiday? (Service fail)

* Why it matters: It preserves data integrity and enforces your system's invariants, ensuring your database never enters an illegal state.

>[!Note]
>### Best Practices for Architecture
>1. Validate at the edge first: Use built-in framework features (like Hibernate Validator or Zod) to check DTOs before passing them down to your services.
>2. Never skip Service Validation: Do not rely only on DTO validation. If your service layer is ever called by a different controller, a cron job, or an internal event message, it must be able to protect its own data integrity.
>3. Use meaningful errors: DTO validation failures usually map to a 400 Bad Request HTTP status, while business validation failures might map to a 422 Unprocessable Entity or 409 Conflict.

## `@ControllerAdvice` VS `@RestControllerAdvice`

The core difference is that `@RestControllerAdvice` is a shortcut annotation that combines `@ControllerAdvice` and `@ResponseBody`.

This means that while `@ControllerAdvice` expects your global interceptor methods to return HTML views by default, `@RestControllerAdvice` automatically serializes your return values directly into the HTTP response body—most commonly as JSON or XML data

### Direct Feature Comparison

| Feature                  | @ControllerAdvice                                                                               | @RestControllerAdvice                                                                        |
|--------------------------|-------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| Primary Use Case         | Traditional Spring MVC applications that render templates or HTML views (e.g., Thymeleaf, JSP). | Modern REST APIs and microservices that return data structures.                              |
| Default Return Semantics | View Resolution: It treats string return values as view names to look up a template.            | Response Body Serialization: It serializes return values directly via HttpMessageConverters. |
| Response Formats         | Typically HTML, unless you manually add @ResponseBody to the methods.                           | JSON, XML, or plain text.                                                                    |
| Under the Hood           | Evaluated as a specialized @Component.                                                          | Composed annotation containing @ControllerAdvice + @ResponseBody.                            |

### Understanding the Target Behavior

A common point of confusion is how these annotations intercept controllers. By default, both annotations intercept all exceptions across all controllers—regardless of whether they are annotated with `@Controller` or `@RestController`.

If you use `@ControllerAdvice` in a REST API, you will run into an issue where Spring looks for an HTML error page rather than returning raw JSON, unless you explicitly append `@ResponseBody` to every `@ExceptionHandler` method. `@RestControllerAdvice` eliminates this boilerplate.

### Code Example Implementation

1.  The REST API Approach (Recommended for JSON responses)

```java
@RestControllerAdvice
public class GlobalRestExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("NOT_FOUND", ex.getMessage());
        // No @ResponseBody needed; Java object automatically converts to JSON
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND); 
    }
}
```
2. The Traditional MVC Approach (For HTML views)

```java
@ControllerAdvice
public class GlobalMvcExceptionHandler {

    @ExceptionHandler(DatabaseException.class)
    public String handleDatabaseError(DatabaseException ex, Model model) {
        model.addAttribute("errorMessage", ex.getMessage());
        // Maps directly to an HTML view file named "error/database-error.html"
        return "error/database-error"; 
    }
}
```
## Consistent Error Response Structures

A consistent error response structure is critical for preventing integration friction, streamlining frontend debugging, and safeguarding backend security. When an API encounters an unexpected state, returning a predictable payload allows client-side applications to handle failure gracefully.

### 🧩 Core Component Breakdown

* **Status Codes:** Use proper HTTP status codes at the transport level (e.g., 400 for client errors, 500 for system faults).
* **Machine Codes (code):** Provide a stable, uppercase string token (e.g., INSUFFICIENT_FUNDS). Frontends use this token rather than the text message to toggle UI logic, multi-language localization, or specific error states.
* **Human Messages (message):** A high-level description of what went wrong.
* **Validation Details (errors):** An optional array breaking down specific fields that caused the issue. Essential for web forms so the client can map error text back to corresponding UI inputs.
* **Observability Keys (traceId, timestamp):** A unique Request or Correlation ID linked to your server logs. If a client experiences a bug, they can share this ID so your operations team can pinpoint the exact trace without digging blindly.
* **Documentation (helpUrl):** A hyperlink directing developers to explicit debugging guides or API remediation recommendations.

## HTTP Status Codes

HTTP status codes are three-digit numbers returned by a web server to a client (like a browser or an API consumer) indicating the outcome of an HTTP request

They are categorized into five distinct classes based on their first digit:

1. **1xx (Informational)**: These codes indicate that the request has been received and is being processed.
2. **2xx (Success)**: These codes indicate that the request has been successfully processed.
3. **3xx (Redirection)**: These codes indicate that the request has been redirected to a different URL.
4. **4xx (Client Error)**: These codes indicate that the request has failed due to a client-side error.
5. **5xx (Server Error)**: These codes indicate that the request has failed due to a server-side error.

### Detailed Overview

#### 1. 1xx: Informational Responses

These codes indicate that the provisional request has been received and the client should continue or switch protocols.

* **100 Continue:** The server has received the request headers, and the client should proceed to send the request body.
* **101 Switching Protocols:** The server agrees to switch the application protocol (e.g., upgrading to WebSockets).

#### 2. 2xx: Success Responses

These indicate that the action requested by the client was received, understood, and accepted.

* **200 OK:** The request succeeded, and the payload is returned in the response.
* **201 Created:** The request succeeded, and a new resource was successfully created.
* **202 Accepted:** The request has been accepted for processing, but processing is not yet complete.
* **204 No Content:** The request succeeded, but there is no payload data to return (common for DELETE or PUT requests).

#### 3xx: Redirection Messages

These tell the client that they need to take a different path or go to a different URL to retrieve the resource.

* **301 Moved Permanently:** The target resource has been assigned a new permanent URL.
* **302 Found:** The resource is temporarily located at a different URL.
* **304 Not Modified:** The resource has not changed since the last request, allowing the client to use its cached version.
* **307 Temporary Redirect / 308 Permanent Redirect:** Modern equivalents of 302 and 301 that explicitly forbid the client from changing the HTTP method (e.g., changing a POST to a GET).

#### 4xx: Client Error Responses

These signal that the client did something wrong, such as providing bad data, missing credentials, or requesting something that doesn't exist.

* **400 Bad Request:** The server cannot process the request due to a client error (e.g., malformed syntax, invalid framing).
* **401 Unauthorized:** The user lacks valid authentication credentials for the requested resource.
* **403 Forbidden:** The user's credentials are valid, but they do not have administrative permission to access the resource.
* **404 Not Found:** The server cannot find the requested resource or URL.
* **405 Method Not Allowed:** The request method (like POST or DELETE) is recognized but not supported by the target resource.
* **429 Too Many Requests:** The user has sent too many requests in a given amount of time (rate-limiting).

#### 5xx: Server Error Responses

These indicate that the server is aware it has encountered an error or is otherwise incapable of performing the request.

* **500 Internal Server Error:** A generic error message given when the server encounters an unexpected condition.
* **502 Bad Gateway:** The server, acting as a gateway or proxy, received an invalid response from the upstream server.
* **503 Service Unavailable:** The server is temporarily overloaded or down for maintenance.
* **504 Gateway Timeout:** The server, acting as a proxy, did not receive a timely response from the upstream server.

## Exception handling inside the spring security filter chain

Handling exceptions inside the Spring Security Filter Chain can be tricky because standard Spring MVC annotations like @ControllerAdvice or @ExceptionHandler only catch exceptions thrown after the request reaches the DispatcherServlet. Filters execute much earlier in the request lifecycle, before the controller layer.

How you handle these exceptions depends on whether they are standard Spring Security core exceptions (e.g., authentication or authorization failures) or custom filter exceptions (e.g., an expired or malformed JWT token inside a custom filter)

### Method 1: Using Built-in Spring Security Handlers (Recommended for Security Core Exceptions)

Spring Security provides the ExceptionTranslationFilter by default. It catches security exceptions (AuthenticationException and AccessDeniedException) and delegates them to specific handlers
* **AuthenticationEntryPoint:** Handles 401 Unauthorized errors (e.g., unauthenticated, bad credentials).
* **AccessDeniedHandler:** Handles 403 Forbidden errors (e.g., authenticated but lacks required roles).

1. Define Custom Handlers

```java
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.access.AccessDeniedException;
import java.io.IOException;

public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, 
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"" + authException.getMessage() + "\"}");
    }
}

public class CustomAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, 
                       AccessDeniedException accessDeniedException) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"Forbidden\", \"message\": \"You do not have permission to access this resource.\"}");
    }
}
```

2.  Register inside SecurityFilterChain

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        // ... other configurations
        .exceptionHandling(exception -> exception
            .authenticationEntryPoint(new CustomAuthenticationEntryPoint())
            .accessDeniedHandler(new CustomAccessDeniedHandler())
        );
    return http.build();
}
```

### Method 2: Using a Dedicated ExceptionHandlerFilter (Recommended for Custom Filters / JWT Errors)

If you are writing a custom filter (like a JwtAuthenticationFilter) and it throws a custom runtime exception (e.g., JwtExpiredException), the ExceptionTranslationFilter won't handle it gracefully because it isn't an instance of a core Spring Security exception.

The cleanest way to forward these exceptions to your global @ControllerAdvice is by wrapping the filter chain execution in a try-catch block using HandlerExceptionResolver

1. Create the Exception Handler Filter

```java
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;
import java.io.IOException;

@Component
public class ExceptionHandlerFilter extends OncePerRequestFilter {

    @Autowired
    @Qualifier("handlerExceptionResolver")
    private HandlerExceptionResolver resolver;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws ServletException, IOException {
        try {
            // Forward down the chain. If any subsequent filter throws an exception, it is caught here.
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            // Hand over the exception to Spring MVC's global HandlerExceptionResolver (and your @ControllerAdvice)
            resolver.resolveException(request, response, null, e);
        }
    }
}
```

2. Place it First in the SecurityFilterChain

```java
@Autowired
private ExceptionHandlerFilter exceptionHandlerFilter;

@Autowired
private JwtAuthenticationFilter jwtAuthenticationFilter;

@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        // Add it at the very beginning of the chain
        .addFilterBefore(exceptionHandlerFilter, LogoutFilter.class) 
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
    return http.build();
}

```

3. Define the @RestControllerAdvice

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<Map<String, String>> handleExpiredJwt(ExpiredJwtException ex) {
        Map<String, String> error = Map.of("error", "Token Expired", "message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}

```

## How dispacherservelt and handlerexceptionresolver process controller exceptions?

In Spring MVC, the DispatcherServlet acts as the Front Controller, orchestrating the entire lifecycle of an HTTP request. When a controller method throws an unhandled exception during request processing, the DispatcherServlet catches it and delegates the resolution to a chain of HandlerExceptionResolver beans.

### 1. The Interception (DispatcherServlet)

When a request comes in, DispatcherServlet forwards it to the appropriate controller via a HandlerAdapter.

* The entire execution (including interceptors and the controller itself) is wrapped in a standard Java try-catch block inside the DispatcherServlet's core processing loop.
* If the controller throws an exception, the catch block intercepts it.
* Instead of letting the server crash or return a raw stack trace, DispatcherServlet invokes its internal processHandlerException() method.

### 2. The Chain of Command (HandlerExceptionResolverComposite)

The DispatcherServlet does not resolve the exception itself. Instead, it looks for beans implementing the HandlerExceptionResolver interface within the WebApplicationContext.

By default, Spring groups these resolvers inside a composite orchestrator called the HandlerExceptionResolverComposite. This composite component loops through a pre-ordered chain of specific resolvers one by one.

### 3. The Resolution Process (The Default Chain)

Each resolver in the chain attempts to handle the exception based on its specific rules. If a resolver successfully processes the exception, it returns a ModelAndView object (which may contain an error view or be empty but marked as "resolved"). If a resolver cannot handle it, it returns null, and the chain moves to the next resolver.

The default order of execution for these resolvers is:

| Resolver Class                    | What it does/Resolves                                                                                                                                                                          |
|-----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ExceptionHandlerExceptionResolver | Looks for @ExceptionHandler methods inside the throwing @Controller or within global @ControllerAdvice classes. This is the most common path for custom application errors.                    |
| ResponseStatusExceptionResolver   | Looks for custom exception classes annotated with @ResponseStatus or instances of ResponseStatusException. It extracts the configured HTTP status code and reason.                             |
| DefaultHandlerExceptionResolver   | Handles standard, internal Spring MVC exceptions (e.g., HttpRequestMethodNotSupportedException, MethodArgumentNotValidException). It maps them to standard HTTP status codes like 405 or 400.  |

### 4. Finalizing the Response

Once a resolver successfully maps the exception:

1. If a ModelAndView pointing to an error page/view is returned, DispatcherServlet renders that view back to the client.
2. If the exception was handled via a REST controller advice (using @ResponseBody or ResponseEntity), the ExceptionHandlerExceptionResolver uses message converters (like Jackson) to write the error payload directly to the response stream. The ModelAndView is marked as resolved to signal that no further rendering is needed.
3. If no resolver handles the exception (all return null), the exception bubbles up to the web container (like Tomcat). In Spring Boot applications, this triggers the fallback BasicErrorController via the standard /error path.
