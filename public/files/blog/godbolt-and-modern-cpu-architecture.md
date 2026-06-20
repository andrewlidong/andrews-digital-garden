---
title: "Godbolt and Modern CPU Architecture"
date: "2025-12-26"
subtitle: "When writing C++ code or even assembly, we often imagine the CPU executing instructions one by one but the reality inside the silicon is far more chaotic."
slug: "godbolt-and-modern-cpu-architecture"
source: "https://andrewdong.substack.com/p/godbolt-and-modern-cpu-architecture"
---

When writing C++ code or even assembly, we often imagine the CPU executing instructions one by one but the reality inside the silicon is far more chaotic. In a recent [talk](https://www.youtube.com/watch?v=BVVNtG5dgks&t=3424s), Matt Godbolt explores modern CPU architecture (specifically the Intel Skylake architecture) and explains how it works to translate, rename, reorder and speculate upon code execution.

### The Secret Life of a CPU

Intel famously keeps the internal workings of its chips guarded to protect its intellectual property. Most of what we know about microarchitecture (the hardware implementation of an instruction set), comes from a dedicated community of reverse engineers such as [Agner Fog](https://en.wikipedia.org/wiki/Agner_Fog). Such researchers use tools such as hardware performance counters and meticulous timing experiments to map out the complex pipelines that exist in CPU microarchitectures.

#### The Front End:

The Front End’s job is to feed the CPU a steady stream of work units, called micro-operations (micro-ops). It works with the following steps:

-   Instruction Fetching: The CPU fetches machine code in 16-byte chunks. Because x86 instructions vary in length (1 to 15 bytes), the CPU needs to use complex heuristics to figure out where one instruction ends and the next begins.
    
-   The Micro-op Cache: Decoding x86 is expensive and slow, so to save time, the CPU stores successfully decoded micro-ops in a micro-op cache. When the CPU encounters a loop, it can stream directly from this cache, bypassing the legacy decoders entirely.
    
-   The Nightmare Bug: A unit called the Loop Stream Detector (LSD) is designed to identify small loops and stream them from a buffer to save power. However, in the Skylake generation, the LSD was disabled via a microcode patch because of a 'nightmare level bug’ found by the OCaml community that caused unpredictable behavior when using specific 16-bit registers.
    

#### The Renamer:

The Renamer is probably the most critical stage for performance. While programmers have access to a few architectural registers (like EAX or RDI), the physical chip actually has hundreds of physical registers.

-   Register Renaming: By mapping architectural registers to fresh physical ones, the CPU can break dependencies. This allows it to run multiple iterations of a loop simultaneously because each iteration is assigned different physical storage, preventing them from collding with one another.
    
-   Zero-Cost Operations: The Renamer is able to recognize the zeroing idiom XOR EAX instantly, and the CPU simply points EAX to a physical register already known to be zero, completing the work without using an execution unit.
    

#### The Back End:

Once instructions are renamed, they enter the Back End, a soup of operations waiting to be executed.

-   The Scheduler: Micro-ops sit in a reservation station until their data is ready and an execution port is free.
    
-   Speculative Execution: The CPU is constantly guessing which way branches will go ~ because of this it cannot write to real memory immediately.
    
-   The Memory Order Buffer (MOB): This unit manages the task of speculative memory access. It uses a store buffer to hold data until the CPU is 100% sure the instruction was supposed to happen.
    

#### Retirement:

The final stage is Retirement. This is a ledger (reorder buffer) that tracks every instruction in its original program order. Even if the CPU finished a future instruction early, it isn’t officially committed to the system’s permanent state until it reaches the head of this ledger and is proven safe (no mispredicted branches or errors occurred).
