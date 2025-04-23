**- Meetup 032 - [Applied Machine Learning at Facebook: A Datacenter Infrastructure Perspective](https://research.facebook.com/publications/applied-machine-learning-at-facebook-a-datacenter-infrastructure-perspective/)**

# Applied Machine Learning at Facebook: Infrastructure Overview

## Key Insights

1. ML pervasively used across services, not just computer vision
2. Diverse ML approaches beyond neural networks
3. Massive data flow through ML pipelines creates unique challenges
4. Heavy reliance on CPUs for inference, CPUs+GPUs for training
5. Global scale enables unique distributed training opportunities

## Major ML Services & Models

### Core Services

1. **News Feed**
    - Ranking algorithms for content relevance
    - Real-time personalized content selection
    - Continuous model updates critical
2. **Ads**
    - Determines ad display based on user traits
    - Highly time-sensitive (hourly model updates)
    - Progressive ranking passes for efficiency
3. **Search**
    - Specialized vertical-specific searches
    - Classifier layer for vertical selection
    - Mix of offline/online stages
4. **Sigma**
    - Classification/anomaly detection framework
    - Used for site integrity, spam detection, etc
    - Hundreds of distinct production models
5. **Lumos**
    - Image attribute extraction
    - Generates embeddings for downstream use
    - GPU-based training
6. **Language Translation**
    - 45+ languages, 2000+ translation directions
    - 4.5B translated posts daily
    - Separate model per language pair

### Model Types Used

- Support Vector Machines (SVM)
- Gradient Boosted Decision Trees (GBDT)
- Multi-Layer Perceptron (MLP)
- Convolutional Neural Networks (CNN)
- Recurrent Neural Networks (RNN)

## Infrastructure Components

### ML Platform (FBLearner)

1. **Feature Store**
    - Catalog of feature generators
    - Shared feature marketplace
    - Used for training and prediction
2. **Flow**
    - Model training platform
    - Pipeline management system
    - Experiment tracking/management
3. **Predictor**
    - Real-time inference engine
    - Multi-tenant service or library
    - Low latency requirements

### Deep Learning Frameworks

1. **PyTorch**
    - Optimized for research
    - Flexible/debuggable
    - Dynamic neural networks
2. **Caffe2**
    - Production framework
    - Performance optimized
    - Cross-platform support
3. **ONNX**
    - Model exchange format
    - Framework interoperability
    - Research to production bridge

## Hardware Infrastructure

### CPU Servers

- Single-socket servers (1xCPU)
    - Power efficient
    - Used for web tier/throughput
    - 32GB RAM typical
- Dual-socket servers (2xCPU)
    - Higher compute/memory
    - Used for intensive workloads
    - Larger RAM configurations

### GPU Servers

1. **Big Basin (Current)**
    - 8 NVIDIA V100 GPUs
    - NVLink interconnect
    - 3U chassis design
2. **Big Sur (Previous)**
    - NVIDIA M40 GPUs
    - First widespread AI platform
    - Open Compute Project design

## Resource Management

### Training Resources

1. **Compute Platform Choice**
    - GPU Training: Lumos, Speech, Translation
    - CPU Training: News Feed, Sigma
    - Hybrid: Facer, Search
2. **Data Requirements**
    - Massive training datasets (100s TB)
    - Data locality important
    - Growing data needs
3. **Distributed Training**
    - Data parallelism across machines
    - Ethernet networking sufficient
    - Near-linear scaling possible

### Inference Resources

1. **Platform Usage**
    - Primarily CPU-based
    - Mix of 1xCPU and 2xCPU servers
    - Some mobile device inference
2. **Service Requirements**
    - Varied latency requirements
    - Different SLA needs
    - Resource isolation needed

## Scale Considerations

### Data Management

1. **Data Pipeline Optimization**
    - Decouple data and training workloads
    - Reader/trainer separation
    - Network usage optimization
2. **Global Scale Benefits**
    - Diurnal load patterns
    - Off-peak resource availability
    - Heterogeneous resource pool

### Disaster Recovery

1. **Impact of Training Loss**
    - Service degradation timelines
    - Critical services identified
    - Regional redundancy needed
2. **Infrastructure Requirements**
    - Geographic distribution
    - Compute redundancy
    - Data replication

## Future Directions

### Hardware/Software Co-Design

1. **Optimization Areas**
    - Model compression
    - Quantization
    - Distributed training
2. **System Design Considerations**
    - Network topology
    - Scheduling algorithms
    - Hardware acceleration
3. **Research Focus**
    - Batch size optimization
    - Training convergence
    - Scaling efficiency




---

# **Applied Machine Learning at Facebook: A Datacenter Infrastructure Perspective**

## **Abstract**

- **Focus:** Machine Learning (ML) underpins many Facebook services and requires scalable, efficient datacenter infrastructure.
- **Key Highlights:**
    - **Diverse ML workloads:** Wide range of models used, from SVMs to deep neural networks.
    - **Data challenges:** A significant fraction of Facebook's stored data is processed through ML pipelines.
    - **Hardware:** Utilizes both GPUs and CPUs extensively.
    - **Efficiency:** ML infrastructure leverages diurnal cycles for distributed training.
    - **Continuous innovation:** Balances hardware optimization with cutting-edge algorithm development.

---

## **Introduction**

- Facebook connects **2+ billion people**, utilizing ML across services like:
    - **News Feed ranking**
    - **Speech and text translation**
    - **Photo and video classification**
- **Challenges:** Supporting ML at this scale requires innovation across algorithms, software, and hardware.

---

## **Key Contributions**

1. **ML pervasiveness:** Extends beyond traditional domains like computer vision.
2. **Diverse ML techniques:** Includes linear models, decision trees, and neural networks.
3. **Data complexity:** Massive data demands drive efficiency challenges.
4. **CPU-centric inference:** While training often uses GPUs, CPUs dominate inference workloads.
5. **Global scale:** Exploits diurnal usage patterns for distributed training.

---

## **Machine Learning Workflow**

- **Training Phase:**
    - Offline; occurs over hours/days.
    - Builds predictive models using historical data.
- **Inference Phase:**
    - Online; real-time predictions.
    - Operates at massive scales (tens of trillions of inferences daily).

---

## **Major Services Leveraging ML**

1. **News Feed Ranking:**
    - Personalized ranking of posts and media.
    - Utilizes general models for real-time user-specific inference.
2. **Ads:**
    - Predicts click-through rates and purchases.
    - Models are retrained frequently to adapt to user behavior.
3. **Search:**
    - Specialized classifiers for vertical searches (e.g., videos, people).
4. **Sigma:**
    - Classification for internal applications like spam detection and site integrity.
5. **Lumos:**
    - Image understanding using CNNs for feature extraction.
6. **Facer:**
    - Face detection and recognition to suggest photo tagging.
7. **Language Translation:**
    - Handles 2,000+ language pairs for **4.5 billion translations daily**.
8. **Speech Recognition:**
    - Converts audio to text for video captions.

---

## **Machine Learning Models**

- **Algorithms Used:**
    - **Support Vector Machines (SVMs):** Efficient for small, structured data.
    - **Gradient Boosted Decision Trees (GBDT):** Balances accuracy and compute.
    - **Deep Neural Networks (DNNs):** Handles large, unstructured datasets.

### **DNN Types:**

1. **Multi-Layer Perceptrons (MLPs):** Structured input for ranking.
2. **Convolutional Neural Networks (CNNs):** Spatial data (e.g., images).
3. **Recurrent Neural Networks (RNNs):** Sequential data (e.g., text, speech).

---

## **ML-as-a-Service at Facebook**

- **FBLearner Platform:**
    
    - **Feature Store:** Centralized repository for reusable features.
    - **Flow:** Orchestrates model training workflows.
    - **Predictor:** Provides real-time predictions using trained models.
- **Frameworks:**
    
    - **PyTorch:** Research-focused, dynamic graph support.
    - **Caffe2:** Optimized for production, cross-platform support.
    - **ONNX:** Bridges PyTorch (research) and Caffe2 (production).

---

## **Hardware Overview**

- **CPU Servers:**
    - Single- and dual-socket configurations.
    - Used for web workloads and CPU-intensive ML tasks.
- **Big Basin GPU Servers:**
    - Latest GPUs (NVIDIA V100) enable faster model training with high throughput.
    - NVLink connectivity supports distributed training.

---

## **Resource Implications**

### **Offline Training:**

- **Key Services:**
    - **Lumos:** GPU-only, long training cycles.
    - **Sigma:** CPU-only, frequent retraining.
    - **Facer:** Hybrid; user-specific models use CPUs.
- **Challenges:**
    - Data locality impacts training performance.
    - Increasing data demands require efficient storage and network solutions.

### **Online Inference:**

- **Compute:**
    - Primarily single- or dual-socket CPU servers.
    - Migration efforts to optimize for power and cost efficiency.
- **Latency Sensitivity:**
    - Ads and News Feed have strict SLAs.
    - Some models run directly on mobile devices for reduced latency.

---

## **Datacenter Challenges**

### **Data Management:**

- Decouples data processing (readers) from training (trainers) for scalability.
- Addresses network burstiness via compression and placement optimization.

### **Leveraging Scale:**

- **Diurnal Cycles:** Off-peak hours provide idle compute for distributed training.
- **Scheduler Optimization:** Balances heterogeneous workloads and network constraints.

### **Disaster Recovery:**

- Regular drills ensure resilience against datacenter failures.
- Frequent model retraining prevents degradation of core services.

---

## **Key Lessons**

- **Hardware-software co-design:** Balancing flexibility for research with efficiency in production.
- **Decoupling components:** Enables faster iteration in research and production environments.
- **Global scale:** Requires careful alignment of resources, network, and storage.

---

## **Conclusion**

- Facebook’s ML infrastructure reflects the complexity of scaling cutting-edge AI applications.
- Future challenges include:
    - Supporting larger models and datasets.
    - Improving interoperability across frameworks and hardware.
    - Enhancing reliability in distributed training.

---

