#C #systems-programming #recurse #cs644 

https://iafisher.com/cs644/spring2025/week1

## In-class exercises

1. Create a file called `hello.c` on the remote server. We'll write a small "Hello, world!" program, and compile and run it.
```bash
nano hello.c
```

```c
#include <stdio.h>

int main() {
	printf("Hello, world!\n");
	return 0;
}
```

```bash
gcc hello.c -o hello
./hello
```


2. Do `ls /usr/share/cs644/code` on the remote server to see the course's source code. Notice that each of you has a directory under `/home/shared`. (Try running `ls /home/shared` with `--color=never` if you can't read the output.) Pick one of your classmates and create a file with a greeting in it.
3. Linux commands and C library functions are documented in _man pages_. We'll take a look at `man puts` and `man gcc`.
4. `man` pages can be quite detailed and hard to read. Fortunately, we have a tool installed on the server called `tldr`
5. A brief run-down of some other useful tools: `bat`, `rg`, `fd`, `fzf`

### 🦇 `bat` – _a better `cat`_

bash

CopyEdit

`bat filename`

- Like `cat`, but with:
    
    - Syntax highlighting
        
    - Line numbers
        
    - Git integration (shows modified lines)
        
- Great for viewing code or config files.

### 🔍 `rg` – _ripgrep, a faster `grep`_

bash

CopyEdit

`rg "main"`

- Fast recursive search through files.
    
- Ignores `.gitignore` rules by default (but can be configured).
    
- Much faster than `grep`, especially on large codebases.

### 📁 `fd` – _a better `find`_

bash

CopyEdit

`fd filename`

- Simplified syntax for finding files/directories.
    
- Respects `.gitignore`.
    
- Color output and fast performance.

### 🧠 `fzf` – _fuzzy finder_

bash

CopyEdit

`fzf`

- Interactive fuzzy search in your terminal.
    
- Pipe any list into it to filter and select with autocomplete.

## Homework exercises

1. (★) What is the `size_t` type for in C?Solution`size_t` is for representing array indices and lengths. It is an unsigned integer type that is guaranteed to be large enough to hold the largest possible array index on your machine. Otherwise, it has no special properties. Older C code often uses `int` for array indices, but `size_t` is more portable and reliable.
	1. 1. `size_t` is for representing array indices and lengths. It is an unsigned integer type that is guaranteed to be large enough to hold the largest possible array index on your machine. Otherwise, it has no special properties. Older C code often uses `int` for array indices, but `size_t` is more portable and reliable.
2. (★) True or false: Semicolons are optional in C.
	1. 1. False. Statements and type definitions must end with semicolons in C.
3. (★★) Choose a language and think about what final project you'd like to do (see [syllabus](https://iafisher.com/cs644/spring2025) for details). Neither choice is binding for now.
4. (★★) Does [this program](https://github.com/iafisher/cs644/blob/master/week1/switch.c) have a bug? Why or why not?
	1. 1. The program _does not_ have a bug. The `LANG_RU` clause of the `switch`-`case` lacks a `break` statement, but this is intentional: the programmer meant for `LANG_RU` to fall through to `LANG_FR`, since `LANG_RU` has the same logic as `LANG_FR`. That being said, I would recommend (a) avoiding fall-through if possible, and (b) explicitly annotating it with a comment if you do decide to do it.
5. (★★) Take a look at [this C function](https://github.com/python/cpython/blob/3.13/Python/pystrcmp.c#L6-L19) from the Python source code. Try to understand what it does and how it works. (Bonus: Can you explain how the second function in the file works?)Solution
6. (★★) Write a C program, `redact.c`, that takes a string argument and prints out the string with all digits replaced by the character 'X'. (Hint: Some [standard library functions](https://en.cppreference.com/w/c/string/byte) might come in handy.)Solution
7. (★★★) Research the concept of the _stack_ and the _heap_ for memory allocation. (Not to be confused with the data structures of the same name.) When do you use one versus the other? How do I know if a value in a C program is allocated on the stack or the heap?
8. (★★★) What is the memory representation of strings (`char*`) in C? What is an alternate representation? What are the advantages and disadvantages of each?
	1. - A string is represented in C as an array of characters terminated by the null character (written as `'\0'`, equal to the integer zero). Such strings are referred to as _null-terminated strings_. One consequence of this representation is that finding the length of the string (`strlen(s)`) is a linear-time operation: you have to iterate over all the characters to find the null terminator. Another consequence is that if you forget to put a null terminator at the end, then any code that tries to read the string will run past the end and access unrelated memory. So be very careful when using functions like `strncpy`.
	- The most common alternative are _length-prefixed strings_, in which the length is stored as a separate field: `struct string { size_t len; const char* data }`.
	- Length-prefixed strings are generally superior: you can read the length in constant time, it's harder to accidentally access invalid memory, and they can be made backwards-compatible with null-terminated strings. The one advantage that traditional C strings have is that they have a slightly lower per-string memory overhead: 1 byte for the null terminator, versus 8 bytes for `size_t` in length-prefixed strings. This doesn't seem like a lot, but if your program allocates a lot of short strings, it can make a difference.