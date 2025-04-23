Meetup 015 - Snap: A Microkernel Approach to Host Networking (June 3, 2024)
- Snap proposes a microkernel-based approach to networking that offloads network functions from the OS kernel to user space, reducing latency and improving isolation.  The paper discusses how user-space network stacks can achieve performance comparable to kernel bypass techniques (e.g., DPDK, RDMA) while maintaining security and flexibility.  This is useful for high-performance cloud and data center networking.  

Meetup 016 - Ceph: A Scalable, High-Performance Distributed File System | USENIX
- Ceph is a fault-tolerant, distributed file system designed for massive-scale storage.  It employs CRUSH (Controlled Replication Under Scalable Hashing) for data distribution, eliminating single points of failure while balancing load dynamically.  Ceph supports block storage, object storage, and POSIX-compliant file access, making it a key player in cloud and HPC environments.  

Meetup 017 - Double Ratchet and Sesame
- Double Ratchet Algorithm (used in Signal Protocol) ensures forward secrecy and post-compromise security in end-to-end encrypted messaging.  It combines Diffie-Hellman key exchanges with symmetric ratcheting to generate new encryption keys for each message, mitigating replay and long-term compromise risks.  
- Sesame is an evolution of secure messaging protocols, likely focusing on improving efficiency and resistance against metadata leaks, though details would depend on the specific implementation.  

