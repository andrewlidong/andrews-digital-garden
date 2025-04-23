Replace the expensive SMS.  
50B Messages from 450M DAU
32 Engineers

1. Single Responsibility Principle
	1. User needs
	2. Stakeholder needs
	3. Eliminate feature creep
2. Technology Stack
	1. Erlang for the servers for high scalability, supports hot loading.  Threads are a native feature.  
3. Why Reinvent the Wheel?  
	1. Ejaberd.  They built whatsapp on top of Ejaberd.  They rewrote some of the core components to meet their needs.  Google Push for push notifications.  
4. Cross-Cutting Concerns
	1. security
	2. logging
	3. alerting
	4. performance
	5. monitoring
	6. exception handling
5. Scalability
	1. Diagonal scaling.  
	2. FreeBSD operating system
6. Flywheel Effect
	1. measure
	2. test
	3. remove bottlenecks
7. Quality
	1. Load testing
		1. volume
		2. endurance
		3. performance
		4. scalability
		5. stress
8. Small Team Size