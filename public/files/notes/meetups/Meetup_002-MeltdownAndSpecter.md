**

- Meetup 002 - Meltdown and Specter - on Meltdown and Spectre, Jan 31st 2024
    

- [Project Zero: Reading privileged memory with a side-channel (2018)](https://googleprojectzero.blogspot.com/2018/01/reading-privileged-memory-with-side.html) (Blog post)
    
- [Spectre Attacks: Exploiting Speculative Execution](https://spectreattack.com/spectre.pdf)
    
- [https://meltdownattack.com/meltdown](https://meltdownattack.com/meltdown.pdf)
    
- [The Intel 80x86 Processor Architecture: Pitfalls for Secure Systems (1995)](https://web.archive.org/web/20180107190128/https://pdfs.semanticscholar.org/2209/42809262c17b6631c0f6536c91aaf7756857.pdf)
    



**


# Meltdown: Reading Kernel Memory from User Space

**Authors**: Moritz Lipp, Michael Schwarz, Daniel Gruss, Thomas Prescher, Werner Haas, Anders Fogh, Jann Horn, Stefan Mangard, Paul Kocher, Daniel Genkin, Yuval Yarom, Mike Hamburg  
**Affiliation**: Graz University of Technology, Google Project Zero, etc.

## Overview

- **Meltdown** is an attack that allows reading kernel memory from user space by exploiting **out-of-order execution** in modern CPUs.
- The vulnerability affects most modern processors (e.g., Intel since 2010) and **breaks the memory isolation** enforced by OS kernels, including reading data from other processes or VMs.
- **Impact**: Meltdown affects millions of users by compromising personal data and passwords.

## Key Points

### Memory Isolation

- **Memory isolation** is a fundamental security feature in modern OS, ensuring that user programs cannot access kernel memory or each other's data.
- Meltdown exploits a flaw in out-of-order execution to bypass this isolation mechanism.

### Mechanism of Meltdown

1. **Out-of-Order Execution**: CPUs execute instructions out-of-order to maximize utilization. If an instruction depends on unavailable data, subsequent instructions can be executed.
2. **Vulnerability**: During out-of-order execution, **data from privileged memory** (kernel space) is temporarily accessed, and cached before privilege checks are fully executed.
3. **Side Channel Exploit**: Meltdown leverages cache side channels (e.g., **Flush+Reload**) to observe whether specific kernel data has been cached, allowing unprivileged user programs to infer sensitive data.

### Attack Methodology

- **Steps**:
    1. Load kernel memory address into a register.
    2. Use **cache timing attacks** (Flush+Reload) to determine the contents of that memory.
    3. Repeat for different memory addresses to read large sections of kernel memory.
- **KAISER Defense**: The **KAISER** patch (now called **KPTI**) for the Linux kernel was shown to mitigate Meltdown by preventing kernel memory from being mapped into user address space.

### Impact and Scope

- **Affected Systems**: Desktop machines, laptops, servers, and cloud systems. The attack works across major OS, including Linux, macOS, Windows, and even virtualized environments like Docker.
- **Performance Implications**: Mitigation such as KAISER has performance impacts since it separates user and kernel address spaces, requiring additional context switches.

### Technical Details

- **Privilege Escalation**: Out-of-order execution allows an unprivileged process to access and "cache" kernel memory, which can then be recovered using side-channel timing differences.
- **Exception Handling**: The attack relies on catching exceptions raised by illegal memory accesses to continue running without crashing.
- **Covert Channel**: The data retrieved via out-of-order execution is transmitted through a covert channel (timing via cache hits).

### Countermeasures

- **Hardware Fixes**: The root cause is a hardware issue related to speculative execution. Future processors need architectural changes to prevent similar attacks.
- **Software Workarounds**:
    - **KAISER/KPTI**: This software-based solution significantly reduces the kernel’s exposure to user space by isolating kernel address space.
    - **Performance Trade-off**: Separation adds overhead, as frequent transitions between user and kernel modes become more expensive.

## Contributions

- Identified and documented out-of-order execution as a **powerful side channel** vulnerability.
- Proposed an end-to-end attack that can read arbitrary memory from various environments, impacting OS, virtual machines, and mobile devices.

## Evaluation

- The attack was tested successfully on **Intel CPUs** across multiple environments, but **ARM and AMD** processors showed resistance due to different memory handling mechanisms.
- Evaluated mitigation performance and confirmed that **KAISER/KPTI** successfully mitigates the Meltdown vulnerability.



# Spectre: Exploiting Speculative Execution

**Authors**: Paul Kocher, Jann Horn, Anders Fogh, Daniel Genkin, Daniel Gruss, Werner Haas, Mike Hamburg, Moritz Lipp, Stefan Mangard, Thomas Prescher, Michael Schwarz, Yuval Yarom  
**Affiliations**: Independent researchers, Google Project Zero, G DATA Advanced Analytics, University of Pennsylvania, Graz University of Technology, Cyberus Technology, Rambus, University of Adelaide, Data61

## Overview

- **Purpose**: **Spectre** is an attack that exploits **speculative execution** in modern CPUs to read arbitrary memory locations from other processes, breaking process isolation.
- **Speculative Execution**: CPUs speculatively execute code paths to increase performance. If a branch is mispredicted, the speculative results are discarded, but changes to the microarchitectural state (e.g., cache) can leak sensitive data.
- **Main Impact**: It exposes vulnerabilities in speculative execution, found in processors from **Intel, AMD, and ARM**, impacting billions of devices.

## Key Concepts

### Speculative Execution

- **Speculative Execution**: A performance optimization where the CPU executes instructions before the actual result of a branch is known.
- **Side Channels**: Speculatively executed instructions leave traces in CPU microarchitectural components, like the **cache**, which can be exploited via side channels.

### Spectre Attack Variants

- **Variant 1: Conditional Branch Misprediction**
    - **Mechanism**: Attacker manipulates the CPU branch predictor to mispredict and execute speculative instructions that read from out-of-bounds memory locations.
    - **Example**: If a conditional branch depends on an attacker-controlled value, the branch predictor can be trained to speculate in favor of a specific branch. When the condition is checked incorrectly, sensitive data is speculatively accessed and leaked through cache side channels.
- **Variant 2: Indirect Branch Poisoning**
    - **Mechanism**: The attacker mistrains the **Branch Target Buffer (BTB)** to influence the target of an indirect branch, leading to the speculative execution of arbitrary code gadgets within the victim's address space.
    - **Usage**: Similar to **Return-Oriented Programming (ROP)**, where gadgets are used to achieve control over the victim's execution.

### Side Channels for Data Leakage

- **Flush+Reload**: Attacker flushes a cache line, waits for speculative execution to access it, and measures the time taken for memory reads to detect cache hits, indirectly revealing the data.
- **Evict+Reload**: Similar to Flush+Reload but relies on evicting cache lines through contention.

## Practical Demonstrations

- **JavaScript Implementation**: Proof-of-concept in **JavaScript** using mistraining techniques to bypass browser process isolation and read private memory data.
- **eBPF Attack**: Demonstrates the attack on Linux systems using **eBPF** (extended Berkeley Packet Filter), which can execute user-supplied code within the kernel context.

## Countermeasures

- **Speculative Execution Barriers**: Techniques like **lfence** can be used to stop speculative execution at certain points in the code.
- **Index Masking**: Replace array bounds checks with masking operations to ensure any out-of-bounds accesses remain within an acceptable range.
- **Retpolines**: A mitigation for indirect branch poisoning that replaces indirect jumps with a **return** that cannot be mispredicted.

## Broader Impact

- **Affected Systems**: The attack affects a wide range of hardware, including **Intel**, **AMD**, and **ARM** CPUs used in desktop, mobile, and cloud environments.
- **Threat to Virtualization**: Spectre can be used to break the isolation between different virtual machines on the same physical host, posing a significant threat to cloud computing.

## Conclusion

- **Fundamental Issue**: Spectre exposes a fundamental mismatch between CPU optimizations (speculative execution) and traditional software security guarantees (memory/process isolation).
- **Need for Architectural Change**: Long-term mitigation will require hardware-level changes, as short-term software fixes can only reduce the risk of exploitation.