
https://iafisher.com/cs644/spring2025/week2
## What is a syscall?

A **system call** or **syscall** is how your program communicates with the operating system. Syscalls look like function calls, but instead of jumping to another point in your program, they switch out of your program entirely and into the operating systems.

Usually programming languages wrap system calls with higher-level APIs, for portability (system calls are OS-specific) and convenience. However, in this course we will be making syscalls directly[1](https://iafisher.com/cs644/spring2025/week2#fn:directly) because we want to understand exactly what we are asking the OS to do.

## Syscall error handling

If the syscall fails (because of invalid arguments, because of inadequate permissions, etc.), a negative integer is returned that indicates the specific problem. Error codes have descriptive names like `EACCES`, `EINVAL`, and `EBUSY`, but the exact meaning depends on the syscall.

Some languages handle error results differently. C sets a per-thread global variable called `errno`. Python raises an `OSError`.

## Linux filesystem APIs

Today, we're going to learn the basic APIs for reading and writing files in Linux.

### Opening a file

`int open(const char* pathname, int flags, mode_t mode)`

- `pathname` is the path to the file you want to open (e.g., `/usr/share/cs644/bigfile.txt`).
- `flags` control how the file should be open.
    - `O_RDONLY` to open for reading only
    - `O_WRONLY` to open for writing only
    - `O_RDWR` to open for reading and writing
    - `O_CREAT` to create if it does not exist
    - `O_APPEND` to append writes to the end of the file
    - `O_TRUNC` to truncate the file's length to 0 if it already exists
- `mode` is used for setting permissions of newly-created files. It's optional unless `O_CREAT` is passed in `flags`. We'll talk more about it next week.
- `open` returns a _file descriptor_, an integer that identifies the open file to the OS. The file descriptor itself holds no information (they just count up from 0); all the bookkeeping is done by the OS.

### Reading from a file

`ssize_t read(int fd, char* buf, size_t count)`

- `fd` is the file descriptor to read from, as returned by `open`.
- `buf` is the pointer to the array to read into.
- `count` is the maximum number of bytes to read. Make sure that `buf` is at least this long!
- The return value is the number of bytes read, or -1 on error. If you are at the end of file, 0 is returned.

### Writing to a file

`ssize_t write(int fd, const char* buf, size_t count)`

- `fd` is the file descriptor to write to, as returned by `open`.
- `buf` is the pointer to the array to write from.
- `count` is the maximum number of bytes to write. Make sure that `buf` is at least this long!
- The return value is the number of bytes written, or -1 on error. Usually it will equal `count`, but not always, for instance if your disk runs out of space.


### Seeking in a file

`off_t lseek(int fd, off_t offset, int whence)`

- The kernel keeps track of "where you are" in the file, e.g., after you read 100 bytes, the next read will start 100 bytes into the file.
- `lseek` lets you explicitly control the position.
- You can probably guess what `fd` is by now.
- `offset` and `whence` together determine the behavior.
- If `whence` is `SEEK_SET`, then `offset` is a fixed offset to jump to.
- If `whence` is `SEEK_CUR`, then `offset` is relative to the current position.
- If `whence` is `SEEK_END`, then `offset` is relative to the end of the file.
- To jump to start of file: `lseek(fd, 0, SEEK_SET)`
- To jump to end of file: `lseek(fd, 0, SEEK_END)`
- The return value is either the new position, or -1 on error.



### Closing a file

`int close(int fd)`

- File descriptors are not an infinite resource: the kernel sets a maximum number of open files per process. So it's a good idea to clean them up when you're done.
- Note this important caveat from the man page: "Typically, filesystems do not flush buffers when a file is closed."
- `fd` is the file descriptor to be closed.
- There's no information to communicate back, so `close` just returns 0 on success and -1 on error.


#C #recurse #systems-programming

## In-class exercises


1. Let's take a look at the APIs that your programming languages of choice expose for making system calls on Linux.

## 🦀 **Rust: System Calls**

Rust gives you multiple layers of access to system calls:

### 1. **Standard Library (`std::fs`, `std::process`, `std::net`)**

These wrap syscalls in safe, ergonomic APIs.

Example:

rust

CopyEdit

`use std::fs;  fn main() {     let contents = fs::read_to_string("/etc/hostname").unwrap();     println!("Hostname file: {}", contents); }`

✅ This is internally using `open`, `read`, and `close` syscalls.

---

### 2. **`libc` crate**

This gives you raw, low-level access to system calls, similar to C.

Example:

rust

CopyEdit

`extern crate libc;  fn main() {     unsafe {         libc::write(1, b"Hello, world!\n".as_ptr() as *const _, 14);     } }`

---

### 3. **`nix` crate**

A safer and idiomatic wrapper over `libc` for Unix-like systems.

Example:

rust

CopyEdit

`use nix::unistd::write; use std::os::unix::io::RawFd;  fn main() {     let fd: RawFd = 1; // stdout     write(fd, b"Hello from nix!\n").unwrap(); }`


## 🐍 **Python: System Calls**

Python is higher level, but it provides both convenient wrappers and low-level access via the `os` and `subprocess` modules.

### 1. **`os` module**

Maps directly to many POSIX syscalls like `fork`, `exec`, `open`, etc.

Example:

python

CopyEdit

`import os  pid = os.fork() if pid == 0:     print("Child process") else:     print(f"Parent process with child PID {pid}")`

More:

python

CopyEdit

`os.open('/tmp/hello.txt', os.O_CREAT | os.O_WRONLY)`

---

### 2. **`subprocess` module**

Wraps `fork`, `exec`, and `pipe` to make it super easy to run external processes.

Example:

python

CopyEdit

`import subprocess  subprocess.run(["ls", "-l", "/usr"])`

---

### 3. **`ctypes` / `cffi`**

If you want to make raw syscalls or use shared libraries like `libc`, you can do this:

python

CopyEdit

`import ctypes  libc = ctypes.CDLL("libc.so.6") libc.write(1, b"Hello from Python libc!\n", 24)`

---

## 🧱 How system calls work in C

### ✅ 1. **Via the C standard library (`glibc`)**

Most of the time, you call functions like `open()`, `read()`, or `fork()`, which under the hood translate to system calls.

Example:

c

CopyEdit

`#include <unistd.h> #include <stdio.h>  int main() {     write(1, "Hello from C!\n", 14); // 1 is stdout     return 0; }`

This is a thin wrapper around the `write()` syscall.

You can compile it with:

bash

CopyEdit

`gcc hello.c -o hello ./hello`

---

### ✅ 2. **Using `syscall()` directly**

If you want to avoid glibc wrappers and invoke a syscall by number:

c

CopyEdit

`#include <unistd.h> #include <sys/syscall.h> #include <stdio.h>  int main() {     syscall(SYS_write, 1, "Hello via syscall\n", 18);     return 0; }`

This is literally issuing syscall number `SYS_write` directly to the kernel.

🧠 You can find syscall numbers in `/usr/include/asm/unistd_64.h` or by checking `man syscall`.

---

### ✅ 3. **Raw system calls via inline assembly**

This is what `syscall()` eventually boils down to:

c

CopyEdit

`#include <stdio.h>  int main() {     const char *msg = "Hello from inline asm!\n";     asm (         "mov $1, %%rax;"      // syscall number (write)         "mov $1, %%rdi;"      // file descriptor (stdout)         "mov %0, %%rsi;"      // message pointer         "mov $23, %%rdx;"     // message length         "syscall;"         :         : "r"(msg)         : "%rax", "%rdi", "%rsi", "%rdx"     );     return 0; }`

⚠️ Not for the faint of heart, but super cool when you want to see how the sausage is made.

---

1. Use `man 2 read` to view the manual page for the `read` syscall.

2. Write a program that reads a file in fixed-size chunks and prints the number of bytes in the file. (Next week we'll learn a more efficient way to do this.)

```c
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>

#define CHUNK_SIZE 1024

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <filename>\n", argv[0]);
        return 1;
    }

    int fd = open(argv[1], O_RDONLY);
    if (fd < 0) {
        perror("open");
        return 1;
    }

    char buffer[CHUNK_SIZE];
    ssize_t bytes_read;
    size_t total_bytes = 0;

    while ((bytes_read = read(fd, buffer, CHUNK_SIZE)) > 0) {
        total_bytes += bytes_read;
    }

    if (bytes_read < 0) {
        perror("read");
        close(fd);
        return 1;
    }

    close(fd);
    printf("Total bytes in %s: %zu\n", argv[1], total_bytes);
    return 0;
}

```

```python
CHUNK_SIZE = 1024

def count_bytes(filename):
    total_bytes = 0
    try:
        with open(filename, 'rb') as f:
            while True:
                chunk = f.read(CHUNK_SIZE)
                if not chunk:
                    break
                total_bytes += len(chunk)
        print(f"Total bytes in {filename}: {total_bytes}")
    except FileNotFoundError:
        print(f"File not found: {filename}")
    except IOError as e:
        print(f"I/O error: {e}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print(f"Usage: python {sys.argv[0]} <filename>")
        sys.exit(1)

    count_bytes(sys.argv[1])

```

1. Write a program that appends a line of text to a file, creating it if it does not already exist. Do it once with `O_APPEND` and once with `lseek`.

```rust
use std::fs::OpenOptions;
use std::io::Write;

fn main() -> std::io::Result<()> {
    let filename = "log.txt";
    let line = "This was appended with OpenOptions::append(true)\n";

    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(filename)?;

    file.write_all(line.as_bytes())?;
    Ok(())
}
```

```rust
use std::fs::OpenOptions;
use std::io::{Seek, SeekFrom, Write};

fn main() -> std::io::Result<()> {
    let filename = "log.txt";
    let line = "This was appended with seek\n";

    let mut file = OpenOptions::new()
        .create(true)
        .write(true)
        .open(filename)?;

    file.seek(SeekFrom::End(0))?; // Like lseek(fd, 0, SEEK_END)
    file.write_all(line.as_bytes())?;
    Ok(())
}

```

Homework exercises

1. (★) What's the difference between a syscall and a function call?
	1. Function calls jump between different points in your program; syscalls switch control to the operating system.
2. (★) How do you distinguish between an I/O error and reaching the end of the file with `read`?
	1. `read` returns 0 at end of file, and a negative number on an I/O error.
3. (★) What flags do I pass to `open` to open a file for writing at the end?
	1. `O_WRONLY` (or `O_RDWR`) and `O_APPEND`
4. (★★) **Final project (database):** The very first version of your database simply stores key-value pairs to disk. Your program should have two commands: `get` and `set`. The `set` command takes a key and a value and writes it to disk, and the `get` command takes a key and prints the value, if it exists. You should store all data in a single file (it's okay to hard-code the path – users shouldn't look at the file directly). Use whatever data format you want. It's okay to make assumptions about the data if it simplifies your program (e.g., doesn't contain the `|` character so you can use that as a delimiter).
5. (★★) **Final project (web server):** Web servers commonly log some details about incoming requests to a file. We're not ready to handle network requests, so this week we'll just do the logging. Your program should have two commands: `run` and `count`. The `run` command will append a line to a log file and exit. The `count` command should read the log file and print a count of the number of lines. You can format the log lines however you like, though generally they begin with a timestamp and include a descriptive message.
6. (★★) `EACCES`, `EEXIST`, and `ENOENT` are three common errors that `open` can return. Read the description of these errors in `man 2 open`, and write a program that demonstrates each of them.Solution
7. (★★) Modify your program from in-class exercise 3 to count the number of whitespace characters in the file. Try it out on `/usr/share/cs644/bigfile.txt`. Experiment with different chunk sizes. How does it affect the performance of your program? (Tip: Run `time ./myprogram` to measure the running time of your program.)Solution
8. (★★) Modify your program from exercise 3 to read a file line-by-line.Solution
9. (★★) Why does `read` return the number of bytes read? Why doesn't it just set `buf` to a null-terminated string, like other C functions?Solution
10. (★★) If you call `write`, use `lseek` to rewind, and call `read` again, are you guaranteed to see the data you just wrote? Find the place in the man pages that describes Linux's behavior. Write a program to demonstrate it.Solution
11. (★★★) Find the location in the Linux kernel source code where a process's table of file descriptors is declared.Solution
12. (★★★) What happens when one program is reading from a file while another program is writing? Formulate a hypothesis, then write a pair of programs to test it.Solution

---

1. OK, there's still going to be a wrapper function in between your Python/Rust/Go/whatever program and the actual syscall (this is true even for C). But we're going to be using the wrapper function with the same interface as the real syscall, instead of a higher-level API with a different interface. [↩](https://iafisher.com/cs644/spring2025/week2#fnref:directly "Jump back to footnote 1 in the text")


#systems-programming #C #💡learning #recurse 

https://iafisher.com/cs644/spring2025/week2

