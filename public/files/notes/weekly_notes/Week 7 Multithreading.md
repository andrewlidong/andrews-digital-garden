#[Multithreading]

## Concurrency and parallelism

The program we have written so far have been _sequential_: each line executes after the next. Sequential programs are easy to write and think about. But sometimes we want to do work non-sequentially:

- Respond to user input while doing work
- Handle multiple network requests at once
- Continue to do work while waiting for blocking I/O, like writing to a file

_Concurrency_ is when different tasks execute independently in overlapping periods of time. If the tasks execute at the same time (because you have two or more CPU cores), then we have _parallelism_, but concurrency is possible and useful even if you only have one CPU core.

In fact, we've seen concurrency already: when we used `fork` to create a child process, the child and the parent executed concurrently (and possibly in parallel). It's not just processes that can execute concurrently, though: Linux allows you to spawn multiple _threads_ of execution within the same process. And unlike processes, threads automatically share the same _address space_ of values in memory, so it's easier for threads to communicate with each other.

## Preemption and cooperation

Concurrent programming paradigms differ in whether or not the scheduler can forcibly interrupt a running task. **Cooperative** multitasking is when each task explicitly yields back to the scheduler. **Preemptive** multitasking is when tasks can be interrupted in the middle of doing work.

Multithreading on Linux (like process scheduling) is preemptive. If it weren't, then a buggy (or malicious) program with an infinite loop could freeze your system. But it makes it harder to write correct programs, because you must be prepared for your code to be interrupted at any point.

## pthreads

The syscall to start a thread is called `clone`:

`int clone(     int (*fn)(void*),     void* stack,     int flags,     void* arg,     ... );`

But unless you are writing your own language runtime or threading library, you probably shouldn't call `clone` yourself. So this week, we are going to depart from making raw syscalls and instead use the standard threading library on Linux: pthreads.

(Technically, pthreads is the name of the interface, and the actual implementation on Linux is called NPTL, but people tend to just call it pthreads.)

The equivalent to `clone` in pthreads is `pthread_create`:

`int pthread_create(     pthread_t* thread,     const pthread_attr_t* attr,     void* (*fn)(void*),     void* arg, );`

`thread` is an out parameter that will be filled in with the thread's ID (represented by an opaque `pthread_t` type). `attr` allows you to control some aspects of how the thread is created. `fn` is the function the thread executes when it starts. It takes in and returns a void pointer, which allows it to handle arbitrary data, since pthreads doesn't know ahead of time what data types your thread will use. `arg` is the argument passed to `fn`.

The thread begins executing immediately; unlike `fork`, `pthread_create` does not return into both threads: the main thread continues after `pthread_create`, while the spawned thread starts from `fn`.

Also unlike `fork`, there is not a hierarchy between the thread that was spawned and the thread that spawned it. All threads in a process are equals.

Use `pthread_join` to wait for a thread to finish:

`int pthread_join(pthread_t thread, void** retval);`

`pthread_join` will block until the thread exits. `retval` is an out parameter that is filled in with the `void*` return value of the thread.

`pthread_exit` is how you exit a thread (other than simply by returning from `fn`). Be careful not to call `exit()` in a multi-threading program unless you intend to exit the entire process!

`[[noreturn]] void pthread_exit(void* retval);`

pthreads has a function, `pthread_cancel`, to cancel a thread in the middle of execution. This is often a bad idea – if the thread is holding a lock, for instance, that lock will not be released, which could cause the whole program to deadlock.

## Synchronization

Whenever we have concurrent access to a shared resource, we need a way to synchronize.

We've seen this already with file locks (multiple processes accessing the filesystem) and semaphores (multiple processes accessing shared memory).

Multithreading is just the same, except that the shared resource is memory (and the data structures it contains) itself.

Suppose you were writing a subroutine to truncate a string. You might have code like:

`s->size = new_size; s->data[s->size] = '\0';`

What happens if the program is interrupted in between the two lines?

The string is in an inconsistent state – the size has been updated, but we haven't put a null terminator in the right place. If another thread starts running that has a reference to this string, it might behave incorrectly.

What you need is a way to _synchronize_ access to the data structure – readers should not be able to read a data structure while a writer is writing to it.

Synchronization brings back a little sequential execution into concurrency. You don't want too much synchronization or else you lose the benefits of concurrency. But you may need some to protect the integrity of your data structures.

## Mutexes

**Mutexes** are a simple synchronization mechanism. A mutex is either in a _locked_ or _unlocked_ state, and has two operations: _acquire_ and _release_.

`int pthread_mutex_init(pthread_mutex_t* mutex, pthread_mutexattr_t* attr);`

Mutexes have three functions to lock and unlock. `pthread_mutex_lock` blocks until the mutex can be acquired, while `pthread_mutex_trylock` will return immediately with 0 if the mutex was acquired, or `EBUSY` otherwise. `pthread_mutex_unlock` releases the mutex and does not block.

`int pthread_mutex_lock(pthread_mutex_t* mutex); int pthread_mutex_trylock(pthread_mutex_t* mutex); int pthread_mutex_unlock(pthread_mutex_t* mutex);`

To clean up a mutex when you are done with it:

`int pthread_mutex_destroy(pthread_mutex_t* mutex);`

Returning to our example from the previous section, we could rewrite the string truncation operation safely as:

`pthread_mutex_lock(s->lock); s->size = new_size; s->data[s->size] = '\0'; pthread_mutex_unlock(s->lock);`

Beware: this only works if _every_ place that uses the string also acquires the lock first. The operating system has no idea that `s->lock` is meant to protect the other fields of `s`, and it won't stop code from accessing them without taking the lock – that's up to the discipline of the programmer.

To spell things out completely, what happens if the truncation function is interrupted in the middle, as before? Another thread starts running, and it tries to access the string. Assuming it was written correctly, it will have to take the lock first. But the lock is already acquired by the first thread, so the second thread will block. Eventually, the first thread will be scheduled again, finish truncating, and release the lock.

In this way, we have _sequenced_ the execution of the program: once the write starts, it must finish before any read happens. We've lost a bit of concurrency – but preserved the integrity of our data structures.

## Read-write locks

A downside of mutexes is that they allow exactly one thread to access the value at a time. This restriction may be overly conservative: often, you have both readers and writers, and it's safe for multiple readers to have access as long as no writer does. Enter **read-write locks**.

Read-write locks allow for unlimited readers, _or_ one writer (but not multiple writers, or a writer and a reader at the same time).

`int pthread_rwlock_init(pthread_rwlock_t* rwlock, pthread_rwlockattr_t* attr);`

There are separate functions to acquire the lock for reading and writing, with blocking and non-blocking variants:

`int pthread_rwlock_rdlock(pthread_rwlock_t* rwlock); int pthread_rwlock_tryrdlock(pthread_rwlock_t* rwlock);  int pthread_rwlock_wrlock(pthread_rwlock_t* rwlock); int pthread_rwlock_trywrlock(pthread_rwlock_t* rwlock);  int pthread_rwlock_unlock(pthread_rwlock_t* rwlock);`

And for clean-up:

`int pthread_rwlock_destroy(pthread_rwlock_t* rwlock);`

## Why is concurrency hard?

- **Nondeterminism** – Concurrency introduces nondeterminism into the program's execution – the program implicitly depends on when the operating system decides to schedule the different tasks. This in turn depends on how busy the system is, the time taken by outside events like network requests and file I/O, and the scheduling algorithm itself. The upshot is that you might get different results on different runs of your program, because of factors beyond your control.
- **Race conditions** – A race condition is a consequence of nondeterminism: it is when the program's behavior depends on the ordering of events. Like we saw with the string truncation example: if the scheduler interrupts the thread in the middle of the truncation and schedules another thread that accesses the string, the program's behavior will be different. That's a race condition.
- **Synchronization issues** – Synchronization is necessary to deal with the other two issues. But it comes with problems of its own.
    - _Deadlock_ is when two threads are mutually blocked on each other (or one thread is blocked on itself). Neither can make any progress, and the program is stalled. A common case of deadlock is when a thread tries to acquire a lock that it already holds.
    - _Reader/writer starvation_ is when a constant stream of new readers prevents a writer from ever getting access (or vice versa). With read-write locks, a writer can only acquire the lock when there are zero readers, but if there are never zero readers, the writer will never get it.

## Multithreading tips

- **Use** language features to manage the lifecycle of locks if you can.
    - For instance, if you acquire a lock with a `with` statement in Python, then you are guaranteed that your lock will be released even if an exception occurs. Similarly with using `defer` to unlock a lock in Go.
- **Avoid** mutable shared state when possible.
    - Mutable shared state requires synchronization, which has runtime overhead and is tricky to get right. Immutable state can be shared without synchronization.
    - In Rust, it is actually disallowed to have multiple mutable references to the same value.
- **Always** acquire multiple locks in the same order.
    - If thread 1 acquires lock A and then tries lock B, while thread 2 acquires lock B and then tries lock A, then the two threads will wait on each other forever.
- **Use** higher-level primitives if you can.

Homework Exercises

_Note: In Python, you'll find threading primitives under the [`threading`](https://docs.python.org/3/library/threading.html) library._
1. (★) What is (a) the syscall and (b) the library function for starting a new thread?Solution`clone` is the syscall; `pthread_create` is the library function.
2. (★) What's the difference between `pthread_exit` and `exit`?Solution`pthread_exit` terminates a single thread, while `exit` terminates the entire process and every thread in it.
3. (★) What does it mean that multithreading is _preemptive_?Solution_Preemptive_ means that the kernel can interrupt a running thread and switch to a different one at arbitrary points in the program – unlike _cooperative_ multitasking, where a task must explicitly yield control.
4. (★★) **Final project (database):** It's time to make the database multithreaded! In week 4, you spun up multiple processes to do database operations. Convert these to use threads instead of processes. You can also convert it to use pthreads locks instead of file locks, but think about the pros and cons. Bonus: make the socket interface multithreaded, too.
5. (★★) **Final project (web server):** It's time to make the web server multithreaded! It's a good idea for a web server to have multiple threads so it can serve more than one request simultaneously. Instead of using multiple processes, use multiple threads. You can choose whether to start a new thread for every request, or have a fixed pool of threads created at start-up.
6. (★★) What happens if `main` returns (without calling `exit`) while other threads are still active?Solution[`main_returns.c`](https://github.com/iafisher/cs644/blob/master/week7/solutions/main_returns.c) shows that the program exits immediately without waiting for the other threads to finish.
7. (★★) What syscalls do pthreads locks use under the hood? Write a program and run it under `strace` to find out.Solution[`locks.c`](https://github.com/iafisher/cs644/blob/master/week7/solutions/locks.c) shows that they call `futex` – but because of the design of the API, a syscall is only necessary in the contended case ("futex" stands for "fast userspace mutex").
8. (★★) Write a program that demonstrates a deadlock due to acquiring locks in different orders.Solution[`deadlock.c`](https://github.com/iafisher/cs644/blob/master/week7/solutions/deadlock.c)
9. (★★★) Read the list of thread-unsafe functions in `man 7 pthreads`. Are there any surprises on the list? Why would a function not be thread-safe?SolutionIt seems to me that some of these functions _could_ be written in a thread-safe way, but the standard doesn't require it. Others, like `strtok`, have interfaces that are inherently thread-unsafe because they maintain implicit global state between calls. Surprising to me were `asctime`, `getenv`, and `rand`.
10. (★★★) Many higher-level languages have restrictions on multithreading (e.g., until very recently Python code could not execute in multiple threads simultaneously). Why is this? What makes multithreading in high-level languages hard?SolutionOne thing that is hard about multithreading in high-level languages is that garbage collection has to work properly with code running in multiple threads. Much of [PEP 703](https://peps.python.org/pep-0703/), the specification for multithreaded Python, is about how to change the garbage collector to make it work.

#multithreading #systems-programming #recurse #cs644 

https://iafisher.com/cs644/spring2025/week7
