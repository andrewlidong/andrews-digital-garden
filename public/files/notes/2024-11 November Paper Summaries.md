 Meetup 037 - Jupiter Rising: A Decade of Clos Topologies and Centralized Control in Google's Datacenter Network
 - Covers Google's datacenter network (Jupiter) and its decade-long shift to Clos topologies and centralized control
	 - Achieves petabit-scale bandwidth with multi-stage switching
	 - Implements software-defined controlp lanes for better traffic optimization
	 - Reduces complexity in network upgrades and fault recovery

Meetup 038 - Jupiter Evolving: Transforming Google's Datacenter Network via Optical Circuit Switches and SDN
- This paper describes Google's evolution of Jupiter, its datacenter network, by integrating:
	- Optical Circuit Switching (OCS) for dynamic bandwidth allocation
	- Software-defined networking (SDN) for flexible traffic engineering
	- Enhancements that improve scalability, performance, and energy efficiency.  

Meetup 039 - FBOSS: Building Switch Software at Scale - Meta Research
- FBOSS (Facebook Open Switching System) is Meta's software-defined networking (SDN) solution for its data centers
	- Decouples switch hardware from control software, enabling faster iteration
	- Supports BGP-based routing and fine-grained traffic engineering
	- Designed for large-scale deployments, high availability, and automation.  

Meetup 040 - Running BGP in Data Centers at Scale - Meta Research
- Meta's Border Gateway Protocol (BGP) for data centers describes how traditional internet-scale routing is adapted for hyperscale environments.  
	- Uses BGP as an SDN-like control plane to simplify network management.  
	- Enables high availability and fast convergence in large-scale networks
	- Addresses challenges like route propogation, fault tolerance, and automation.  

Meetup 041 - Fast Packet Processing with eBPF and XDP (2020)
- This paper explores how eBPF (Extended Berkeley Packet Filter) and XDP (eXpress Data Path) improve packet processing performance in Linux
	- eBPF allows sandboxed programs to run in the kernel without modifying it
	- XDP enables high-speed packet filtering, forwarding, and processing before packets reach the networking stack
	- These technologies are widely used in DDoS mitigation, observability, and high-performance networking.  

