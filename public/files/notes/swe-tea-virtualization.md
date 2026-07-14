---
title: "SWE Tea: Virtualization"
date: "2026-07-14"
subtitle: "Meetups 113–117 · from kvm to Firecracker"
---

Part of [[SWE Tea Paper Notes]].

- **Meetup 113** — [kvm: the Linux Virtual Machine Monitor (2007)](https://www.kernel.org/doc/ols/2007/ols2007v1-pages-225-230.pdf) — virtualization as a kernel module: guests are just Linux processes, so the hypervisor inherits the kernel's scheduler and memory management for free. It became *the* Linux hypervisor.
- **Meetup 114** — [A Comparison of Software and Hardware Techniques for x86 Virtualization (2006)](https://web.stanford.edu/class/cs240/readings/hwsw.pdf) — VMware shows their software binary translation often *beat* first-generation Intel VT-x, because the early hardware lacked MMU virtualization. A great lesson in not assuming hardware support wins.
- **Meetup 115** — [virtio: towards a de-facto standard for virtual I/O devices (2008)](https://dl.acm.org/doi/10.1145/1400097.1400108) — a standard paravirtualized I/O interface built on shared ring buffers, so every hypervisor stops inventing its own device drivers.
- **Meetup 116** — [Firecracker: Lightweight Virtualization for Serverless Applications (2020)](https://www.usenix.org/system/files/nsdi20-paper-agache.pdf) — AWS's minimal Rust VMM on KVM that boots microVMs in ~125ms and packs thousands per host: VM-grade isolation at near-container density, running Lambda underneath everyone.
- **Meetup 117** — [KVM/ARM: The Design and Implementation of the Linux ARM Hypervisor (2014)](https://www.cs.columbia.edu/~nieh/pubs/asplos2014_kvmarm.pdf) — porting KVM to ARM via split-mode virtualization, contorting across privilege levels because ARM's hypervisor mode wasn't designed to host a full kernel.
