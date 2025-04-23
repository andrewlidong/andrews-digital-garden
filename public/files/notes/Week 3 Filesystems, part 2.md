## Types of files

Linux distinguishes between several types of files:

- **Regular file**: A simple sequence of bytes. (Linux doesn't distinguish between binary and text files.)
- **Directory**: A listing of other files (which of course may themselves be directories).
- **Symbolic link**: A file that "points" to another file. Most syscalls follow symlinks by default, so if I create a symlink `dir1/a` that points to `dir2/b`, then calling `open("dir1/a")` will have the same effect as calling `open("dir2/b")`. If the original file is removed, then the symlink will be left dangling.
- **Hard link**: Another kind of filesystem link, with three major differences from symlinks:
    - The hard link and the original file are completely identical, and in fact there is no "original" – the two are indistinguishable.
    - Hard links can't be left dangling; the file contents will be kept alive until all links to it are removed.
    - Creating a hard link to a directory is a bad idea.

This list is not exhaustive, but these are the key file types we are concerned with now.

## The classic Unix permissions model

Linux has inherited the classic file permissions model from Unix. There are three permission bits, each of which has a different meaning for regular files versus directories:

- _Read_
    - Files: can read from file
    - Directories: can list directory contents
- _Write_
    - Files: can write to file
    - Directories: can create, delete, and move entries
- _Execute_
    - Files: can execute as program
    - Directories: can "traverse", i.e. access paths within the directory

### Execute for directories

The _execute_ permission is really a misnomer for directories: it has nothing to do with execution, they just appropriated an otherwise meaningless bit.

The _execute_ permission for directories is tricky. It really has nothing to do with execution; since the bit was meaningless for directories, they appropriated it for something unrelated. It seems similar to _read_, and indeed usually the _read_ and _execute_ bits for directories have the same value, but all four combinations of the two bits are possible:

- `r-x` – can both list the directory and access paths within in (this is the normal case)
- `r--` – can list the directory, but can't access any of the paths
- `--x` – can access paths within the directory, but can't get a list of all the paths
- `---` – no permission on the directory at all

### Owners and groups

Every file has an _owner_ and a _group_. The three permissions (read, write, execute) can be separately set for the owner, the group, and everyone else. We can write a file's permission as a nine-character string, such as `rwxr-xr-x`, where the first three bits are the owner's permissions, the next bits the group's, and the last bits everyone else's.

Example: Suppose I'm a professor teaching a CS course, and I have a file of homework solutions. I should have read and write access to the file. My TAs, who belong to the `teaching_assistants` group, should have read-only access. Everyone else should have no access at all. Therefore, my file permissions should look like:

`$ ls -l solutions.txt -rw-r----- ian teaching_assistants ... solutions.txt`

(The initial dash is how `ls` indicates the file is not a directory.)

### Octal notation

Instead of a nine-character string, we can represent permissions more concisely as a three-digit octal number, for example `755`. To break it down:

- `755` in octal is `111 101 101` in binary.
- So this is equivalent to `rwx r-x r-x`.
- Another way to remember is that `r = 4`, `w = 2`, and `x = 1`, so 7 = 4 + 2 + 1 = `rwx`.

Some common permissions are:

- `755` = `rwxr-xr-x` = only owner can write, but anyone can read or execute (directories and executable files)
- `644` = `rw-r--r--` = only owner can write, but anyone can read (non-executable files)
- `600` = `rw-------` = only owner can read and write, no one else can access
- `400` = `r--------` = only owner can read, no one can write (read-only files)

### Bonus: `chmod` abbreviations

The `chmod` shell command understands some abbreviations:

`# give the owner ('user') exec permission $ chmod u+x myfile.txt # remove the owner's exec permission $ chmod u-x myfile.txt`

Unfortunately they are easy to get confused:

- `u` stands for 'user'
- `g` stands for 'group', _not_ global
- `o` stands for 'other', _not_ owner
- `a` stands for 'all', meaning user and group and other, _not_ just other

## Syscalls: File metadata and permissions

`struct stat {   mode_t st_mode;   uid_t  st_uid;   gid_t  st_gid;   off_t  st_size;   /* other fields */ };  int stat(const char* pathname, struct stat* statbuf); int fstat(int fd, struct stat* statbuf);`

- `stat` returns metadata about a file. Notably:
    - the _mode_, which includes what type of file it is (regular file, directory, etc.) and its permissions
    - the owner and group
    - the size of the file in bytes
- `fstat` is like `stat` except it takes a file descriptor instead of a path name.

`int chmod(const char* pathname, mode_t mode); int fchmod(int fd, mode_t mode);`

- `chmod` and `fchmod` let you change a file's permissions.
- You must be the owner of the file (or root) to do this.

## Syscalls: Directories

`int mkdir(const char* pathname, mode_t mode);`

- `mkdir` creates a directory with the permissions specified in `mode`.
- Unlike `open`, it does not return a file descriptor.
- The new directory's owner will be set to the effective user ID of the process (same as for creating regular files with `open`).

`struct linux_dirent {     char d_name[];     char d_type;     /* other fields */ };  // raw syscall ssize_t getdents64(int fd, void* dirp, size_t count);  // libc wrapper DIR* opendir(const char* pathname); struct dirent* readdir(DIR* dirp);`

- `getdents64` is the raw syscall to get the entries of a directory.
- Quoting `man 2 getdents`: "These are not the interfaces you are interested in."
- You are supposed to use `opendir` and `readdir` from libc instead, and languages other than C may not provide a `getdents64` interface at all (Python only has `os.scandir`, for instance).
- Still, `getdents64` isn't hard to understand. You pass in a file descriptor, an array to hold the entries, and a count (of bytes, _not_ of array entries), and it fills the array and returns _the number of bytes read_.
    - This is because `struct linux_dirent` values are not fixed in size, so if it returned the number of entries read you wouldn't know where the end of your array is.
    - At any rate, 0 is returned at the end of the directory.
- The man page has a lot of gory details about struct layout, but these only apply to kernels older than Linux 2.4, which was released in 2001.
- `opendir` and `readdir` are less awkward than `getdents64`, but have the disadvantage of only returning one entry at a time.
    - `struct dirent` is similar to `struct linux_dirent`; read the man page if you're interested.

## Syscalls: Moving and deleting files

`int rename(const char* oldpath, const char* newpath);`

- `rename` is used both to rename and move files (from the kernel's standpoint these are the same thing).
- If `newpath` already exists, it will be replaced _atomically_, meaning that there is no interval where `newpath` temporarily ceases to exist, and if the rename fails then `newpath` will be untouched.
    - The move itself is not atomic, i.e. there will possibly be a time when both `oldpath` and `newpath` point to the file being renamed.
- Caveat: `oldpath` and `newpath` must be on the same filesystem. Otherwise, the kernel would not be able to do the rename atomically.

`int unlink(const char* pathname);`

- `unlink` removes a file.
- Why is it called `unlink` instead of `remove`? We'll find out in a minute when we talk about hard links and symlinks.

`int rmdir(const char* pathname);`

- `rmdir` deletes an empty directory. It will not work if the directory has any files in it.

## Syscalls: File locking

`const int LOCK_SH = /* */; const int LOCK_EX = /* */; const int LOCK_UN = /* */; const int LOCK_NB = /* */;  int flock(int fd, int op);`

- `flock` places or removes a lock on a file.
- A lock can be shared (`LOCK_SH`) or exclusive (`LOCK_EX`). A file can have either _N_ shared locks or 1 exclusive lock at a time.
    - Typically, shared locks are for readers and exclusive locks for writers.
- Pass `LOCK_UN` as the operation to release the lock.
- By default, `flock` will block until the lock is available. You can combine `LOCK_NB` with the lock options to make it _non-blocking_, in which case it will return immediately, with `EWOULDBLOCK` if the lock was already held.
- It is an _advisory_ lock, meaning that the kernel won't stop other processes from accessing the file unless they also try to acquire the lock.
    - It's good for groups of cooperating processes that all agree to use `flock`.
    - If you need to protect against uncooperative processes, use file permissions instead (or in addition).

## In-class exercises
1. What permissions are required to `rename` a file?
	1. 1. The basic permissions are `+x` on each directory in the source and destination paths, and `+w` on the ultimate source and destination directories. For a more comprehensive answer, see [my blog post](https://iafisher.com/blog/2024/11/mv-file-permissions).
2. Let's rewrite our program from last week to more efficiently find a file's size.
	1. 1. Use the `stat` syscall to retrieve `st_size`, instead of reading every byte of the file.

## Homework exercises

1. (★) Do syscalls follow hard links?
	1. 1. Yes, although to be pedantic it's misleading to speak of "following" hard links in the same way as symbolic links, since there's not really a link to be followed but a direct reference to the file's content and metadata.
2. (★) True or false: If I acquire an exclusive lock on a file, no other process will be able to write to it.
	1. 1. False. Locks are advisory, so another process that does not even attempt to acquire the lock will not be prevented from writing to it.
3. (★) How is the owner of a new file or directory set?
	1. 1. The owner of the new file is set to the _effective user ID_ of the process that created it. We'll learn in week 4 what exactly the "effective user ID" is.
4. (★★) **Final project (database):** Modify your program to create the database file with permissions locked down to the file's owner. Use file locking to ensure that `get` and `set` are synchronized. Test your solution by having the `set` command go to sleep for 5 seconds while holding the lock; in another terminal, ensure that `get` and `set` block until the first `set` command wakes up and releases the lock.
5. (★★) **Final project (web server):** A busy HTTP server can accumulate lots of logs. Add a `rotate` command which renames `http.log` to `http.1.log`, `http.1.log` to `http.2.log`, etc. Delete any log files older than `http.5.log`. Next, instead of running and exiting, modify the `run` command to loop forever and write a line to the log file each second, sleeping in between. Use file locking to ensure that `count` and `run` are synchronized, and make sure you can still run `count` while the server is running.
6. (★★) Write a simple version of `rm -rf`. If your language doesn't expose `getdents64` directly, you can use a higher-level API. **Warning:** Depending on your language, listing the directory may include the special `..` entry. **Make sure to filter this out!** Otherwise you might try to recursively delete the whole tree.Solution
7. (★★) Write a program that takes in a file path and prints its permissions in `rwxrwxrwx` format.Solution
8. (★★) We have syscalls to move and delete files, but not to copy them. Why not?
	1. 1. Copying can be accomplished using `open`, `read`, and `write`; a dedicated syscall is not necessary. However, this is inefficient because you have to copy every byte twice: once from the kernel into userspace on `read`, and once again from userspace into the kernel on `write`. So Linux has a `sendfile` syscall that lets you directly transfer bytes between two open files.
9. (★★) What happens if you rename a file while another process is writing to it? Make a prediction, then write a pair of programs to demonstrate what happens.
	1. 1. Two reasonable predictions are that (a) it will continue writing to the new path, or (b) it will start writing to the old path. If you are doing the web server final project, you can use the logging command along with `mv` to test this. It turns out that (a) is correct – but only if the writing process keeps the file open. If it closes and reopens each time, it will keep writing to the old path.
10. (★★) Is `getdents64` atomic? Write a pair of programs that demonstrates its behavior.Solution
11. (★★) Linux file permissions are a little more complicated than what was presented here. Research the concepts of the set-uid, set-gid, and sticky bits.
	1. 1. Normally, when an executable is run on Linux, it will run with the user ID and group ID of the user who started it. But if the set-uid or set-gid bit is set in the executable file's `st_mode`, then it will instead run as the file's owner or group, respectively. Usually this is when an executable needs root permissions but should be available to non-root users. Because they allow privilege escalation, set-uid executables are a potential security hole and must be written very carefully. See section 8.11 of _Advanced Programming in the Unix Environment_ for an example.  
      
    The sticky bit is another bit in `st_mode` that changes the interpretation of directory permissions: if set, then files in the directory can only be renamed or removed by the file's owner, the directory's owner, or the superuser (instead of anyone with `+w` permissions). Most commonly, the sticky bit is set on `/tmp` so that everyone can create files but not interfere with others' files. [Tony Finch's blog post](https://dotat.at/@/2024-10-22-tmp.html) goes into more detail.
12. (★★★) Is it possible to _atomically_ overwrite a file? First, write a pair of programs (a reader and a writer) that shows that simply overwriting with `write` isn't atomic. Then, find a way to do it atomically.
	1. 1. We demonstrated in class with [simultaneous.c](https://github.com/iafisher/cs644/blob/master/week2/solutions/simultaneous.c) that writes are not atomic. To overwrite atomically, create a temporary file, write to it, and then use `rename` to atomically replace the destination file. It's important to create the temporary file on the same filesystem as the destination file (e.g., in the same directory), because `rename` does not work across filesystems.
13. (★★★) `mv myfile.txt /tmp` requires an additional permission beyond what we discussed. (**NOTE:** _This turns out to not be true on the shared server, but if you have a macOS computer, you might be able to replicate it there._) What is it? Can you explain why it's necessary?
14. (★★★) Linux file permissions are _a lot_ more complicated than what was presented here. Research file ACLs and SELinux contexts. What syscalls do they use?

## Further reading

- `man 2 chown` – change a file's owner or group
- `man 2 link` – create a hard link
- `man 2 symlink` – create a symlink
- `man 2 readlink` – read what a symlink points to
- `man 2 lstat` – same as `stat` except does not follow symlinks