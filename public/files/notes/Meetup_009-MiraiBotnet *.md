**- Meetup 009 - [Understanding the Mirai Botnet | USENIX](https://www.usenix.org/conference/usenixsecurity17/technical-sessions/presentation/antonakakis) - April 3rd, 2024
    

- [Inside the infamous Mirai IoT Botnet: A Retrospective Analysis](https://blog.cloudflare.com/inside-mirai-the-infamous-iot-botnet-a-retrospective-analysis)**


# Understanding the Mirai Botnet

**Authors**: Manos Antonakakis, Tim April, Michael Bailey, Matt Bernhard, Elie Bursztein, Jaime Cochran, Zakir Durumeric, J. Alex Halderman, Luca Invernizzi, Michalis Kallitsis, Deepak Kumar, Chaz Lever, Zane Ma, Joshua Mason, Damian Menscher, Chad Seaman, Nick Sullivan, Kurt Thomas, Yi Zhou  
**Conference**: 26th USENIX Security Symposium, 2017

## Overview

- **Purpose**: Analyze the Mirai botnet, which composed mainly of IoT devices, performed massive DDoS attacks in 2016. This paper provides a retrospective on Mirai's growth, affected devices, and its impact on the IoT ecosystem.
- **Main Idea**: Mirai exploited insecure default passwords in IoT devices and employed a simple yet highly effective strategy to compromise devices. The authors provide a seven-month analysis of its growth, impact, and evolution.

## Key Points

### Introduction

- **Mirai's Emergence**: Mirai emerged in September 2016, performing high-profile DDoS attacks on targets like **Krebs on Security**, **OVH**, and **Dyn**. The attack on Krebs surpassed 600 Gbps of traffic.
- **Infection Strategy**: Used **default credentials** for IoT devices like **DVRs**, **IP cameras**, and **routers**, making it easy to spread to vulnerable hosts.
- **Impact**: Mirai demonstrated how simple malware could use insecure IoT devices to create a powerful botnet capable of crippling high-profile targets.

### Timeline

- **Major Events**:
    - **August 1, 2016**: Mirai emerges and begins scanning the Internet for potential targets.
    - **September 18, 2016**: Attacks on OVH start.
    - **September 30, 2016**: Source code publicly released, leading to more Mirai variants.
    - **October 21, 2016**: Attack on Dyn, impacting major internet services across the U.S.

### Botnet Growth

- **Rapid Growth**: Mirai infected around **65,000 devices in the first 20 hours** and reached a steady state of **200,000 - 300,000** infected devices.
- **Geographic Concentration**: Infections concentrated in **Brazil, Columbia, and Vietnam**, accounting for 41.5% of all infections.
- **Device Types**: Mainly affected **DVRs, IP cameras, routers, and printers**, influenced by specific market shares of consumer electronics manufacturers.

### Propagation and Evolution

- **Propagation Mechanism**:
    - Mirai used **stateless TCP SYN scanning** to find open Telnet ports (TCP/23, TCP/2323).
    - Utilized a brute-force approach to log in with **62 default username-password pairs**.
    - The infected devices reported back to a **command-and-control (C2) server** to receive attack instructions.
- **Evolution and Variants**:
    - After the source code release, numerous Mirai variants emerged, targeting additional devices and incorporating new resilience tactics.
    - One notable variant added support for a **CWMP exploit**, allowing it to target routers.

### Attack Capabilities

- **DDoS Attack Patterns**: Mirai launched over **15,000 attacks** during the study period, targeting high-profile sites as well as smaller, seemingly unrelated entities.
- **Attack Types**:
    - Included **SYN floods**, **ACK floods**, and **HTTP GET floods**.
    - Attacks were distributed across game servers, telecoms, anti-DDoS providers, and other industries.
- **Victim Examples**: High-profile targets like Krebs on Security, OVH, and Dyn were attacked, but other victims included game servers and anti-DDoS services.

## Data Collection and Methodology

- **Data Sources**: The study drew data from **network telescope probes**, **IoT honeypots**, **DNS traces**, **C2 milking**, and **Internet-wide banner scans**.
- **Measurement Insights**:
    - Mirai scans were identified using unique TCP sequence numbers tied to the destination IP, providing a way to track its scanning activity.
    - Analysis revealed that infected devices were mostly from manufacturers with inadequate security practices for consumer electronics.

## Security Implications

- **IoT Security Gaps**: The widespread use of default credentials in IoT devices made them easy targets for Mirai.
- **Industry Challenges**:
    - The lack of automatic updates, consumer awareness, and weak end-of-life security protocols have made IoT devices a persistent weak link.
    - Without better security practices, IoT devices will continue to be used in large-scale botnet attacks.

## Future Work and Recommendations

- **Technical and Non-Technical Interventions**:
    - **Device Manufacturers**: Implement strong default credentials, enforce automatic security updates, and secure device firmware.
    - **Regulatory Actions**: Governments may need to regulate IoT devices to ensure compliance with security standards.
- **Future Research**: Suggested improvements in **automatic updates**, **secure device onboarding**, and **detection techniques** for better tracking and mitigating IoT-based threats.