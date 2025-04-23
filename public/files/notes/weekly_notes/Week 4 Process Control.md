#[Process Control]

### Process basics

A **program** is a file on disk containing executable code. A **process** is a program that is loaded in memory and executing on a CPU (or waiting to execute). Every process has a parent (the process who spawned it), so the set of running processes on a system is organized as a tree.

Processes are identified by an integer called a **PID**. A process's PID is unique while it is running, but may eventually be reused. Two syscalls, `getpid` and `getppid`, let you discover your own and your parent's PIDs. Unusually for syscalls, they cannot return an error.

`pid_t getpid(void); pid_t getppid(void);`

A process executes as a particular user (and group). In fact, it has both a **real UID** and an **effective UID** (and likewise for GIDs):

`uid_t getuid(void); gid_t getgid(void);  uid_t geteuid(void); gid_t getegid(void);`

The real UID is the "actual" user, while the effective user is the user for purposes of access control. Usually they are the same, but not always: if you run `sudo sleep 30 &` and then `ps -eo pid,euser,ruser`, you will see that the process's real UID is your UID, but its effective UID is root.

The way this works is that the file `/usr/bin/sudo` has a special bit set called the **set-uid bit**. When a program with the set-uid bit is executed, its effective UID is set to the owner of the file rather than the user who launched it. There's an analogous bit for GIDs called the **set-gid bit**.

### Launching processes

Spawning a child process is accomplished by a pair of syscalls: `fork` and `execve`.

`pid_t fork(void);`

`fork` is the syscall that creates a new child process.

It is a very ancient Unix syscall with a clever design: when it returns, it returns into _both_ processes. In the child process it returns 0, and in the parent process it returns the child's PID.

You can imagine that the original process has split and cloned itself: the child process is running the same program, with a complete copy of the variables, call stack, etc. of the original process.

Normally you'll see:

`pid_t pid = fork(); if (pid < 0) {     // error } else if (pid == 0) {     // child } else {     // parent }`

It's a little hard to wrap your head around.

A child process copies a lot of state from the parent. Notably:

- All open file descriptors
- Environment variables
- Signal handlers (covered in a later week)

Regardless of if the original process was multi-threaded, the forked process will have only one thread.

Most of the time, you fork because you want to run a different program (e.g., invoke a shell command) – if you actually want to run two copies of the same program, you're probably better off using multithreading, which we'll cover later in the course.

To execute a different program, call `execve` in the child process:

`int execve(const char* pathname, char* argv[], char* envp[]);`

`execve` replaces the current program with the one at `pathname`, passing it the arguments in `argv` and the environment variables in `envp`. It does _not_ create a new process – that's what `fork` did.

A few sharp edges:

- `pathname` must be the absolute path; `execve` won't do path look-up for you.
- `pathname` should be duplicated as the first element of `argv`.
- `argv` and `envp` must both have a null pointer as their last argument, to mark the end of the list.

So a full invocation looks like:

`char* pathname = "/usr/bin/echo"; char* argv[] = {pathname, "hello", "world", NULL}; execve(pathname, argv, environ);`

where `environ` is a C standard library variable that holds the current process's environment.

If `execve` succeeds, it will never return – the old program is "switched out" with the new one.

Usually, you'll want a way for the parent to communicate with its child. We'll cover a number of ways to do so next week; today, we'll just look at `waitpid`, which is how a parent waits for its child to finish.

`pid_t waitpid(pid_t pid, int* wstatus, int options);`

`pid` can be -1 to wait for any child, or a positive number to wait for a specific child. There are a few more possibilities documented in `man 2 waitpid`. The main useful value for the `options` parameter is `WNOHANG`, if you just want to check if a process has exited but don't want to block on waiting for it. Some information will be copied into `wstatus`, such as the child's exit status.

When a child exits, the kernel sends a `SIGCHLD` signal to the parent process – we'll talk more about signals later in the course.

If a parent exits before its child, the child process is reassigned to the process with PID 1 as its parent (a system service called [`init`](https://en.wikipedia.org/wiki/Init)). After a child exits but before its parent calls `waitpid`, the process is what's called a _zombie_ process. The OS still has to maintain some metadata about the process. So it's important to "reap" child processes to free up these resources.

The last part of a process's lifecycle is exiting:

`void _exit(int status);`

Calling `_exit` terminates the process immediately, and registers a status code that can later be retrieved by the parent process when it calls `waitpid`. Traditionally, an exit code of 0 indicates success and any non-zero value indicates failure.

You more likely want to use the C library function `exit()` (no leading underscore), which calls exit handlers, flushes output buffers, etc.


## In-class exercises
1. `fork` and `execve` can be confusing. Let's write an example program to understand how they work.Solution[https://github.com/iafisher/cs644/blob/master/week4/forkexec.c](https://github.com/iafisher/cs644/blob/master/week4/forkexec.c)

## Homework exercises

1. (★) What UID is used to check file permissions?
	1. 1. The effective UID. Usually it is the same as the real UID – unless the program is a set-uid file.
2. (★) How does the caller of `fork` know if they are the child or parent process?
	1. 1. `fork` returns 0 in the child process, and the child's PID (which must be greater than 0) in the parent process.
3. (★) What is a zombie process?
	1. 1. A zombie process is a process that has exited but whose parent has not yet called `waitpid`. While a zombie, the OS must keep some resources allocated to the dead process.
4. (★★) **Final project (database):** Implement a `delete` command for your database program that accepts one or more keys to delete. Fork off a child process for each key to delete. Make sure to use file locking to prevent the child processes from accessing the database simultaneously. If you're ambitious, try using record locking (`man 2 fcntl`) so that multiple processes can access different parts of the file at the same time. The parent should wait for its children to exit, and print the status of each.
5. (★★) **Final project (web server):** Eventually, we'll want our web server to fork itself into several processes to serve multiple requests concurrently. Let's lay the groundwork this week. Modify the `run` command to fork off 4 child processes when it starts. Have these children run for variable amounts of time – you can either call a `sleep()` function, or `execve` the `sleep` shell command. Either way, the parent process should wait for _all_ children to exit, and print their status codes. Rather than blocking, it should continue to run its main loop while waiting for the children.
6. (★★) How can a parent process view its child's resource usage (e.g., CPU time) after it exits? Find the relevant syscall, and use it to write your own version of the `time` command.
	1. The syscall you want is `wait4`
7. (★★) `fork` is the classic Unix system call, but Linux also offers something called `clone`. Read `man 2 clone`. What are the differences from `fork`?
	1. 1. `clone` gives many more operations controlling how the child is created, such as whether it shares the same address space with the parent. Notably, `clone` is the low-level syscall used to implement threads.
8. (★★) The C standard library offers several wrappers around `execve`. Read `man 3 exec` and implement the wrappers in your language of choice.Solution
9. (★★) Many programming languages have a high-level way to run a child process, such as Python's `subprocess.run`. Write a simple program to demonstrate it, then use `strace` to determine what syscalls it makes. (The `-f` flag lets you see syscalls in child processes as well.)
	1. 1. Running `strace` on the Python program `import subprocess; subprocess.run(["echo", "hello", "world"])` reveals that it does `vfork` and then `execve`. In fact, we can see that it tries `execve` with various paths before it finds `echo` at `/usr/bin/echo`.
10. (★★★) Think through what happens in terms of process relationships and UIDs when you make an SSH connection to a remote server. How does a process running on your laptop (`ssh`) "transform" itself into a process running on the remote server (`bash`)? How does it end up with the correct UID?
	1. 1. To begin with, there is an `sshd` process running on the server as root. When you start `ssh` on your laptop, it makes a network connection to the server. `sshd` authenticates, then forks a child process on the server and uses its root privileges to set its effective UID to whatever user was authenticated. This child process then forks its own child to run the user's login shell. It forwards all the output from the child process over the network to the `ssh` process on your laptop, which in turn sends over any input it receives. So, while it seems that the `bash` process on the server is running in your terminal, this is an illusion: what is running is the `ssh` process on your laptop.
11. (★★★) It's important to follow `execve` with a call to `_exit`. What could go wrong if you don't?
	1. 1. I was writing a little jobserver program in Python. It acquired a lockfile, then looped forever, spawning jobs with `fork` and `execve` according to its schedule. Python's `os.execve` raises an exception if it fails, which seems like the right thing to do... except that it means the _child process will run cleanup code from the parent program_. One of the cleanup functions was to remove the lockfile. So the bug manifested as the lockfile mysteriously disappearing when the jobserver was running. The fix was to catch any exceptions and call `os._exit` to exit immediately without doing any clean-up.
12. (★★★) Read [this post on `fork`](https://gist.github.com/nicowilliams/a8a07b0fc75df05f684c23c18d7db234). Do you agree with the author?

#C #recurse #systems-programming

https://iafisher.com/cs644/spring2025/week4