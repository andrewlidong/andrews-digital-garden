# [Week 5: Interprocess communication]

[Last week](https://iafisher.com/cs644/spring2025/week4) we learned how to create new processes. But we couldn't interact with them except to wait until they exited. This week, we'll learn some techniques for communicating between different processes – **interprocess communication**, or IPC. We'll cover **pipes** and **shared memory** with synchronization via **semaphores**. Later in the course, we'll also talk about Unix domain sockets and signals.

## Pipes

A pipe lets you pass data in a one-way stream from one process to another. A shell command like `ps aux | grep myprocess` uses a pipe under the hood.

You call `pipe2`:

`int pipe2(int pipefd[2], int flags);`

And you get back a file descriptor for the read end in `pipefd[0]`, and a file descriptor for the write end in `pipefd[1]`. Then you can use `read` and `write` as if it were an actual file.

You can use both ends of the pipe in the same process, and occasionally that is useful. But normally you want one end of the pipe in one process and the other end in another. Solution: call `pipe2`, then `fork`:

`int pipefd[2]; int r = pipe2(pipefd, 0); if (r < 0) { bail("pipe2"); }  pid_t pid = fork(); if (pid < 0) {     bail("fork"); } else if (pid == 0) {     // child     close(pipefd[0]);     // write to pipefd[1] } else {     // parent     close(pipefd[1]);     // read from pipefd[0] }`

When you fork, you end up with both file descriptors open in both processes. Each process only needs one (the read end or the write end), so it can close the one it doesn't need. File descriptors are per-process metadata, so closing one in the child process does _not_ close it in the parent process, or vice versa.

An important limitation of pipes is that they require the two processes to be related to each other, e.g. parent and child. But they are perfect for when you want to pass data from a child to a parent or vice versa.

## Shared memory and semaphores

**Shared memory** is an efficient form of IPC that avoids copying by mapping the same memory region into multiple processes' address spaces. This lets us transparently share in-memory data structures between unrelated processes, just as if they were threads of the same process. Of course, we'll need some way to synchronize access. For that, we can use a kernel synchronization primitive called **named semaphores**.

Creating a shared memory region is a three-step process. First, we need to open the shared memory object itself with `shm_open`, which looks very similar to `open`:

`int fd = shm_open("/my-program-mem", O_CREAT | O_EXCL | O_RDWR, 0600);`

The name is not a file path; shared memory objects have their own namespace. It should always begin with a slash and contain no other slashes.

The shared memory object starts out empty, so we must resize it:

`int r = ftruncate(fd, sizeof my_data_structure);`

Finally, we can map it into our process's address space:

`struct my_data_structure* s = mmap(     NULL, sizeof my_data_structure, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0, ); if (s == MAP_FAILED) {     // handle error }`

Now, we can use `s` normally, and any writes will be visible to any other process using it (and we will likewise see any other process's writes).

But we shouldn't start using it until we've set up a semaphore to synchronize access:

`sem_t* sem = sem_open("/my-program-sem", O_CREAT | O_EXCL, 0600, 1);`

Similar to `shm_open`, the name passed to `sem_open` is not a file path. The fourth argument is the initial value of the semaphore – setting it to 1 makes the semaphore effectively a lock that only one process can hold at a time.

We can then wait for the semaphore to be available:

`int r = sem_wait(&sem);`

And when we are done, release it:

`int r = sem_post(&sem);`

Finally, at the end of our program we should clean everything up:

`close(fd); shm_unlink("/my-program-mem"); sem_unlink("/my-program-sem");`

Putting it all together:

``const char* mem_pathname = "/my-program-mem"; const char* sem_pathname = "/my-program-sem";  void writer() {     // NOTE on error handling: At various points we bail without cleaning up, e.g.     // calling `shm_unlink`. A more robust program should still clean up resources     // even in case of error.      int fd = shm_open(mem_pathname, O_CREAT | O_EXCL | O_RDWR, 0600);     if (fd < 0) { bail("shm_open"); }     int r = ftruncate(fd, sizeof my_data_structure);     if (r < 0) { bail("ftruncate"); }      struct my_data_structure* s;     s = mmap(NULL, sizeof my_data_structure, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);     if (s == MAP_FAILED) { bail("mmap"); }      // After we `mmap`, we can close the shared-memory file descriptor.     r = close(fd);     if (r < 0) { bail("close"); }      sem_t* sem = sem_open(sem_pathname, O_CREAT | O_EXCL, 0600, 1);     if (sem == SEM_FAILED) { bail("sem_open"); }      r = sem_wait(&sem);     if (r < 0) { bail("sem_wait"); }     // ... use shared data structure ...     r = sem_post(&sem);     if (r < 0) { bail("sem_post"); }      r = sem_unlink(sem_pathname)     if (r < 0) { bail("sem_unlink"); }      r = shm_unlink(mem_pathname);     if (r < 0) { bail("shm_unlink"); } }  void reader() {     int fd = shm_open(pathname, O_RDONLY);     if (fd < 0) { bail("shm_open"); }      struct my_data_structure* s;     s = mmap(NULL, sizeof my_data_structure, PROT_READ, MAP_SHARED, fd, 0);     if (s == MAP_FAILED) { bail("mmap"); }      // After we `mmap`, we can close the shared-memory file descriptor.     int r = close(fd);     if (r < 0) { bail("close"); }      sem_t* sem = sem_open(sem_pathname, 0);     if (sem == SEM_FAILED) { bail("sem_open"); }      r = sem_wait(&sem);     if (r < 0) { bail("sem_wait"); }     // ... use shared data structure ...     r = sem_post(&sem);     if (r < 0) { bail("sem_post"); } }``

## Homework exercises

1. (★) List the key differences between pipes and shared memory as forms of IPC.SolutionPipes can only be used between related processes (parent and child), while shared memory can be used by unrelated processes. Pipes let you pass a stream of data in one direction, while shared memory lets you share a fixed-size chunk of memory bidirectionally. Shared memory generally requires synchronization for safe access, while pipes do not (unless the same pipe has multiple writers).
	1. 1. Pipes can only be used between related processes (parent and child), while shared memory can be used by unrelated processes. Pipes let you pass a stream of data in one direction, while shared memory lets you share a fixed-size chunk of memory bidirectionally. Shared memory generally requires synchronization for safe access, while pipes do not (unless the same pipe has multiple writers).
2. (★) What format should be used for the names of shared memory objects and semaphores?
	1. 1. They should begin with a slash and contain no other slashes, e.g. `/my-shared-memory-object`. Each has their own namespace which is separate from the filesystem, so don't worry about name collision with files.
3. (★) Explain how two different processes end up with opposite ends of a pipe.
	1. 1. When `pipe2` is called, it returns the two ends of the pipe to a single process. That process can then call `fork`, after which the parent and child processes will each have both ends of the pipe. The parent and child can then close the end they don't need.
4. (★★) **Final project (database):** Let's start turning our database into a proper long-running server instead of a collection of short-lived commands. Add a `serve` command that forks off a few child processes. The parent process should first create a shared memory object holding a cache of key-value pairs. The children should open this cache. Write `get_with_cache` and `set_with_cache` subroutines that use the cache; in a later week, we'll see how to use advanced IPC to send get and set requests to the child processes.
5. (★★) **Final project (web server):** Our web server currently spawns a few child processes to handle requests. We may want these worker processes to share config values, and to respond to updates to them live. Create a config data structure with whatever parameters you like, e.g. `int verbosity`. Have the parent process create a shared memory object that the child processes open. Add a separate `update-config` command that lets update the config while the server is running. The child processes should loop and detect updates to the config.
6. (★★) Do we get any atomicity guarantees when working with pipes? Read `man 7 pipe` to find out.
	1. 1. Writes up to the value `PIPE_BUF` (4096 bytes on Linux) are guaranteed to be atomic, i.e. not interleaved with writes from other writers. You can dynamically retrieve the value of `PIPE_BUF` with `fpathconf` for portability.
7. (★★) What could go wrong if we don't use semaphores to synchronize access to shared memory? Write an example program to demonstrate the problem.Solution[](https://github.com/iafisher/cs644/blob/master/week5/shm_example.c)
	1. 1. See [`shm_example.c`](https://github.com/iafisher/cs644/blob/master/week5/shm_example.c) from in class. Without synchronized access, you could read partially updated states or corrupt the data structure with multiple simultaneous writes.
8. (★★) Linux has a concept called FIFOs (first-in, first-out) that overcome some of the limitations of pipes. Research them (`man 7 pipe` and `man 7 fifo` may help). What system calls do they use? What are the differences from regular pipes?
	1. 1. FIFOs are very similar to pipes, except they have an entry on the filesystem so that unrelated processes can use them. They are thus often called _named pipes_. You use `mkfifo` to create the FIFO and `open` to open it – after that, they behave just like unnamed pipes. Note that `open` will block until the other end is opened by another process.
9. (★★) What is the buffering behavior of pipes? Pose a hypothesis, then write a test program to find out.Solution[](https://github.com/iafisher/cs644/blob/master/week5/solutions/pipebuffer.c)
	1. 1. Plausible hypotheses: (a) no buffering, writes will block until the child reads, (b) the kernel buffers up to N bytes, then writes block, or (c) the kernel will buffer as much as you write to it. [`pipebuffer.c`](https://github.com/iafisher/cs644/blob/master/week5/solutions/pipebuffer.c) shows that (b) is correct. On our shared server, the buffer has a size of 65,536 bytes.
10. (★★) We used `mmap` for shared memory, but the system call is more versatile than just that. Read the man page and find out what else it can be used for.
	1. 1. Another handy use of `mmap` is to map a file into your address space so you can access it like an array, which is sometimes easier to work with than `read` and `write`.
11. (★★★) Shared memory is often used for high-performance concurrent applications. Implement a [ring buffer](https://en.wikipedia.org/wiki/Circular_buffer) in shared memory with one producer process putting work into the buffer, and multiple consumer processes reading from it.Solution[](https://github.com/iafisher/cs644/blob/master/week5/solutions/ringbuffer.c)
12. (★★★) High-level languages have a way for a parent process to capture its child's stdout and stderr (e.g., `capture_output=True` in `subprocess.run` in Python). Use `pipe2`, `fork`, and `execve` to spawn an external program, e.g., `echo hello world`, and capture its output in a string in the parent program.HintSolution[](https://github.com/iafisher/cs644/blob/master/week5/solutions/pyfork.py)


https://iafisher.com/cs644/spring2025/week6

#systems-programming #recurse #cs644 