#[Week 6 Networking]

This week will be discussing two forms of networking, both intermachine and intramachine. Actually, intermachine networking is better described as a form of IPC than networking, but we're covering them together because they both use the **socket API**.

The kernel doesn't expose the lowest level of networking – userspace programs cannot directly read Ethernet packets off the NIC, for instance. Nor does it implement the highest level of the network stack – there's not an in-kernel HTTP or SSH implementation. What it gives you is TCP and UDP – transport-level protocols that you can build your application protocols on top of.

Locations on a network are identified by a combination of **address** and **port**. At the IP level, an address is an IP address like 167.71.190.147, though you may use a domain name like iafisher.com instead of the raw numeric address. A port is an integer that identifies a particular _service_ at an address. Ports allow a single computer to offer multiple networked services. There are conventional ports for different services, for instance port 22 for SSH, port 80 for HTTP, and port 443 for HTTPS, but nothing stops you from using a different port, as long as the client and server agree.

It takes quite a few steps to set up a network connection. On the server side:

1. `socket` to get a file descriptor
2. `getaddrinfo` to create an address (e.g., IP address and port)
3. `bind` to bind the file descriptor to the address
4. `listen` to start listening for connections
5. Call `accept` in a loop to accept a single incoming connection, as a new file descriptor
6. Use `send` and `recv` (or `write` and `read`) on the new file descriptor
7. `shutdown` to close the connection

And on the client side:

1. `socket` to get a file descriptor
2. `getaddrinfo` to create an address (or resolve a domain name into an address)
3. `connect` to establish a connection to the server
4. `send` and `recv`

[`hello_conn.c`](https://github.com/iafisher/cs644/blob/master/week6/hello_conn.c) has an example of both sides of the connection.

The first argument to `socket` is the domain:

- `AF_INET` means IPv4
- `AF_INET6` means IPv6
- `AF_UNIX` means Unix sockets

IPv4 and IPv6 are the familiar network protocols. Unix sockets are for IPC – they copy data through the kernel and involve no actual networking.

The second argument to `socket` is the type:

- `SOCK_STREAM` for reliable data streams, i.e. TCP
- `SOCK_DATAGRAM` for unreliable data packets, i.e. UDP

Though note that for Unix sockets, delivery is always reliable regardless of the type.

Because the socket API returns file descriptors, we can use regular file APIs like `read` and `write` to work with them, though not all APIs (e.g., `lseek`) make sense for sockets. But the socket-specific APIs like `send` and `recv` expose some extra options.


## Homework exercises

_Note: The socket API may be exposed in a different library in your programming language, e.g. in Python it's in [`socket`](https://docs.python.org/3/library/socket.html), not `os`._

1. (★) What function does a DNS lookup to turn a domain name into an IP address?SolutionThe function is `getaddrinfo`. This is a standard library function, not a system call: the kernel does not implement DNS.
2. (★) What's the difference between `bind` and `listen`?Solution`bind` associates a socket file descriptor with an address and port, while `listen` starts actively listening for new connections on that socket.
3. (★) What flags do you pass to request a TCP/IP connection?Solution`AF_INET` or `AF_INET6` for the first argument, and `SOCK_STREAM` for the second argument.
4. (★★) **Final project (database):** Let's provide a proper client interface to the database. Have the main process listen for connections (you can decide whether you want to do TCP or local Unix) and allow querying the database. You can decide what the protocol looks like; a simple one might have commands like `get <key>\n` and `set <key> <value>\n`. Write a client program that provides a nice command-line interface to send commands to the database.
5. (★★) **Final project (web server):** It's finally time to make a proper web server! Use the socket API to listen for TCP connections. You can fork off a child process to handle each connection, or wait until next week when we learn about multithreading. You can make up a simple TCP-based protocol (e.g., client sends `hello server\n`, server sends `hello client\n` back) and test it with `telnet`, or if you're ambitious you can implement HTTP on the server side – either yourself or using an existing library.
6. (★★) How can a server access its client's network address?SolutionWhen a connection is initiated, `accept` fills in the second argument with the client address.
7. (★★) What happens if a client calls `connect` before the server has called `bind`? What about after the server has called `bind`, but before it has called `listen`? Write a program to find out.
8. (★★) If I open a socket with `SOCK_DATAGRAM`, will `recv` always return a single packet at a time? What happens if the buffer is too small to fit the packet? Write a program to demonstrate what happens.
9. (★★) What's the difference between `close` and `shutdown`? Can you write a program that shows them behaving differently?
10. (★★★) Use `epoll` to write a single-threaded server that can simultaneously handle multiple connections.
11. (★★★) You can pass an open file descriptor from one process to another via a socket. What syscall allows you to do this? When might this technique be useful?SolutionYou can transfer an open file descriptor using the `msghdr` parameter of the `sendmsg` syscall. See Section 17.4 of _Advanced Programming in the Unix Environment_ for details. You could use this technique to implement an "open server", a server program that implements access controls beyond what is possible in the Linux permissions models. For instance, it could enforce that a client can only open a file in append mode.

## Further reading

- [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/)

#systems-programming #recurse #cs644 

https://iafisher.com/cs644/spring2025/week6
