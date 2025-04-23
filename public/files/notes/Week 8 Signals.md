#[Signals]

## Signal basics

A **signal** is an asynchronous alert sent from one process to another (or from a process to itself). There is a fixed set of named signals, and they carry no data other than their signal number. Signals have a variety of uses:

- `SIGTERM` requests the process to terminate.
- `SIGKILL` forcibly kills the process.
- `SIGCHLD` is sent to a parent process when a child process exits.
- `SIGSEGV` is sent to a process when it triggers a segmentation fault via invalid memory access (normally this signal is not caught).
- `SIGWINCH` alerts a terminal program that the window has been resized.

In a process, each signal has a corresponding **disposition** that determines what happens when the signal is received. The possibilities are:

- Ignore the signal.
- Perform the default action, which depends on the signal. `SIGTERM` terminates the process, for instance, while `SIGWINCH` does nothing.
- Catch the signal and call a signal handler function.

Though the special signals `SIGKILL` and `SIGSTOP` cannot be ignored or caught.

A process can set a signal type to be **blocked** (also referred to as **masked**). If an incoming signal is blocked by the recipient process, the kernel will keep it _pending_ until the process unblocks it (or sets the disposition to "ignore"). Masking is usually temporary – otherwise you would just set the signal to be ignored.

## System calls

To send a signal, use the `kill` function, which despite its name can send any signal and does not necessarily terminate the target.

`int kill(pid_t pid, int sig);`

`pid` is normally positive, in which case the signal is sent to the process with that PID. If zero or negative, the behavior differs; read the man page for details.

`sigaction` is how you change the disposition of a signal.

`struct sigaction {     void (*sa_handler)(int);     sigset_t sa_mask;     int sa_flags;     // more fields };  int sigaction(int signum, struct sigaction* act, struct sigaction* oldact);`

You can use it like this:

`void handler(int signo) {     // ... }  struct sigaction act = { 0 }; act.sa_handler = handler; int r = sigaction(SIGTERM, &act, NULL);`

Set `sa_handler` to the special values `SIG_IGN` to ignore the signal or `SIG_DFL` to set it to the default disposition.

`sa_mask` in `struct sigaction` is the set of signals that will be temporarily masked while the signal handler is executing.

`sigprocmask` lets you query and set the process's signal mask:

`int sigprocmask(int how, sigset_t* set, sigset_t* oset);`

`how` can be one of:

- `SIG_BLOCK` – block all signals in `set`
- `SIG_UNBLOCK` – unblock all signals in `set`
- `SIG_SETMASK` – set the signal mask to `set` (all signals in the set are blocked; all signals not in the set are unblocked)

The first two only change the signals that are in `set`, while `SIG_SETMASK` changes every signal. If `oset` is not `NULL`, then it will be set to the process's current signal mask. If you just wish to query and not set the mask, then pass `NULL` as the second argument.

`sigprocmask` takes two signal set (`sigset_t`) arguments. There are some helper functions for manipulating signal sets: (`man 3 sigsetops`)

`int sigemptyset(sigset_t* set); int sigfillset(sigset_t* set); int sigaddset(sigset_t* set, int signo); int sigdelset(sigset_t* set, int signo); int sigismember(sigset_t* set, int signo);`

`sigfillset` selects all signals in the set; `sigemptyset` unselects them; `sigaddset` and `sigdelset` select or unselect, respectively, individual signals; `sigismember` tests if a signal is selected in the set.

We can wait for any signal to arrive with `pause`, or a particular signal (or set of signals) with `sigwait`:

`int pause(); int sigwait(sigset* set, int* sig);`

But we'll see in the next section that these functions are tricky to use safely.

## Signals are hard

Signals are one of the trickiest parts of Linux. Signals can arrive at any time, and signal handlers execute concurrently with the rest of the program, so they have all the drawbacks and difficulties of concurrency that we saw last week.

Because signals can arrive at random times, a program's data structures may be in an inconsistent state when a signal handler is invoked. Only a subset of C standard library functions are safe to call from a signal handler – see `man 7 signal-safety`. Example: It's not safe to call `malloc` from a signal handler, because the signal might have been received in the middle of a different call to `malloc`!

With that in mind, it's a good idea to do as little as possible in the signal handler. Ideally, you just set a flag and return, and test the flag in your program's main loop.

`pause` is perilous. Consider the following snippet:

`sigaction(SIGCONT, &(struct sigaction){.sa_handler=my_handler}, NULL); puts("Send me SIGCONT to continue!"); pause();`

Do you see the bug?

If `SIGCONT` is delivered after `puts` but before `pause`, then `pause` will block until it is sent a second time – unlikely in this toy example, perhaps, but a very easy mistake to make in real programs.

We can fix it with `sigsuspend`, which atomically sets the signal mask and then goes to sleep, restoring the old signal mask when woken up:

``sigaction(SIGCONT, &(struct sigaction){.sa_handler=my_handler}, NULL);  sigset_t set, oldset; sigemptyset(&set); sigaddset(&set, SIGCONT); sigprocmask(SIG_BLOCK, &set, &oldset); // SIGCONT is blocked.  puts("Send me SIGCONT to continue!"); sigsuspend(&oldset); // SIGCONT is unblocked until `sigsuspend` returns. sigprocmask(SIG_SETMASK, &oldset, NULL); // SIGCONT is unblocked.``

_This example was based on the blog post "[The perils of pause(2)](https://www.cipht.net/2023/11/30/perils-of-pause.html)" by Julian Squires._

Another problem is that signals can interrupt system calls – if certain syscalls are pending when a signal is delivered, the syscall will be cancelled and return `EINTR`. _Only system calls that can block forever can be interrupted by signals._ For instance, reading input from a terminal device, or waiting on a lock, or listening for a network connection. But not disk I/O. This design choice is the subject of [a famous essay](https://www.dreamsongs.com/RiseOfWorseIsBetter.html) from the 1990s.

There are two things you can do about interrupted syscalls:

- Include `SA_RESTART` in `act.sa_flags` when passed to `sigaction`. Syscall interrupted by the signal will be automatically restarted – though some syscalls can't be restarted (see `man 7 signal`).
- Wrap any potentially blocking syscalls with a loop that retries on `EINTR`. This can be annoying in practice because you don't always know whether a syscall can block – for instance, calling `read` on a file descriptor that may point to a file on disk (won't block) or to standard input (might block).

## Signals and multithreading

There are some nuances to how multithreading and signal handling interact:

- Disposition of a signal is per-process, not per-thread. However, signal masks are per-thread.
- Some signals are delivered to the entire process (in which case the signal handler, if one is registered, is run on an arbitrary thread), and some are delivered to a particular thread (for example, hardware exceptions triggered by that thread).

## Homework exercises

1. (★) What are the three possible dispositions for a signal?

The three possible dispositions for a signal in Unix-like operating systems are:

1. **Default (DFL)** – The default action associated with the signal is taken (e.g., terminate the process, ignore the signal, etc.).
    
2. **Ignore (SIG_IGN)** – The signal is ignored, and the process continues as if the signal was never received.
    
3. **Catch (Custom Handler)** – A user-defined signal handler (a function) is executed in response to the signal.
    

These dispositions can be set using the `signal()` or `sigaction()` system calls in C. Not all signals can be caught or ignored — for example, `SIGKILL` and `SIGSTOP` cannot be caught or ignored.

1. (★) What is the difference between "masked" and "pending" for a signal?

### **Masked Signal**

- A **masked** signal is one that is **blocked** from being delivered to a process.
    
- It doesn’t mean the signal won’t happen — just that if it does, it won’t be acted upon immediately.
    
- Signals can be masked using functions like `sigprocmask()` or `pthread_sigmask()`.
    
- While a signal is masked, it stays **pending** if it's generated.
    

> Think of it like a "do not disturb" mode — the signal is held off until unmasked.

---

### **Pending Signal**

- A **pending** signal is a signal that has been **sent to a process but hasn't been delivered yet**.
    
- This can happen if the signal is currently masked.
    
- You can check for pending signals with `sigpending()`.

1. (★) True or false: `SIGTERM` can be ignored.

`SIGTERM` (signal 15) **can be ignored** or caught by a custom handler.

- Unlike `SIGKILL` and `SIGSTOP`, which **cannot** be caught or ignored, `SIGTERM` is designed to allow a process to clean up before exiting.
    
- You can use `signal(SIGTERM, SIG_IGN)` to ignore it, or set a custom function with `signal(SIGTERM, handler_function)`.

1. (★★) **Final project (web server):** Your web server should shut down in an orderly fashion when it receives a `SIGTERM` signal. The first time it is received, it should stop accepting new connections, but continue to service existing connections. If received a second time, it should close the existing connections and exit.

2. (★★) Write a program that shows what happens when the same signal is delivered twice before the program can handle it. Is the signal handler invoked twice, or only once?

3. (★★) What happens when a signal handler is executing and the same signal is delivered? What if it's a different signal?

### 🔁 **1. Same Signal Delivered During Handler Execution**

- **By default**, the same signal is **blocked (masked)** during execution of its handler.
    
- This means if `SIGUSR1` is being handled and another `SIGUSR1` is delivered during that time, it is:
    
    - **Not delivered again**, because it's already blocked.
        
    - **Not queued**, because non-RT signals aren’t queued.
        
- ➤ **Result**: The signal is either lost or deferred — but the handler is **not invoked again**.
    

You can override this behavior by using `sigaction()` and _not blocking_ the signal in the handler's mask, but this is uncommon and risky.

---

### 🔀 **2. Different Signal Delivered During Handler Execution**

- Signals other than the one currently being handled **are not blocked by default**.
    
- So, if you're handling `SIGUSR1` and `SIGUSR2` is delivered:
    
    - `SIGUSR2`'s handler can **run immediately**, interrupting the current handler.
        
    - This is **reentrant** behavior and can lead to complex interactions if handlers aren’t written carefully.


1. (★★) If multiple pending signals are unblocked, what order are they delivered in?

2. (★★) What happens to signal dispositions, masks, and pending signals upon `fork`? What about `exec`?

3. (★★) What interface does your programming language provide for signal handling? Are you allowed to call arbitrary functions from the signal handler?


4. (★★★) Look up the "self-pipe trick". What is it? When would you use it?