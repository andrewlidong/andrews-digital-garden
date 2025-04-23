**- Meetup 025 - [Mastering the Game of Go with Deep Neural Networks and Tree Search (2016)](https://pinouchon.github.io/assets/deepmind-mastering-go.pdf)**


# AlphaGo: Mastering the Game of Go

## Overview & Significance

### Key Achievement
- First computer program to defeat professional Go player
- Won 5-0 against European Champion Fan Hui
- Previously thought to be at least a decade away
- 99.8% win rate against other Go programs

### Core Innovation
Novel combination of:
1. Deep neural networks
2. Tree search algorithms
3. Supervised and reinforcement learning

### Go Challenge
- Enormous search space (b≈250, d≈150)
- Complex position evaluation 
- Much larger than chess (b≈35, d≈80)

## Technical Architecture

### Neural Networks

#### Policy Networks
1. **SL Policy Network (pσ)**
   - Supervised learning from expert games
   - 57% move prediction accuracy
   - 13 layers of convolutional networks
   - Trained on 30M positions

2. **RL Policy Network (pρ)**
   - Initialized from SL network
   - Improved through self-play
   - Optimized for winning, not move prediction
   - Won 80% against SL network

3. **Fast Rollout Policy**
   - Simpler linear policy
   - 24.2% accuracy
   - 2μs vs 3ms for policy network
   - Used for Monte Carlo rollouts

#### Value Network (vθ)
- Predicts game outcome from positions
- Trained from RL policy network self-play
- More accurate than Monte Carlo rollouts
- 15,000x faster than rollouts

### Search Algorithm

#### Monte Carlo Tree Search
1. **Selection**
   - Traverse tree using UCT-like algorithm
   - Balances exploration/exploitation

2. **Expansion**
   - Add new nodes to tree
   - Initialize with policy network
   
3. **Evaluation**
   - Value network evaluation
   - Monte Carlo rollouts
   - Combined with mixing parameter λ

4. **Backup**
   - Update values up tree
   - Track visit counts

### Training Pipeline

1. **Supervised Learning**
   - Train policy network on expert games
   - 30M positions from KGS Go Server
   - Achieved 57% accuracy

2. **Reinforcement Learning**
   - Self-play to improve policy
   - Policy gradient optimization
   - Maximize winning probability

3. **Value Network Training**
   - Generated from self-play games
   - 30M distinct positions
   - Predict game outcomes

## Performance & Results

### Against Other Programs
- 99.8% win rate (494/495 games)
- Strong even with 4-stone handicap
- Distributed version even stronger

### Component Analysis
1. **Value Network vs Rollouts**
   - Value network alone beats other programs
   - Combined approach works best (λ=0.5)
   - Complementary strengths

2. **Hardware Scaling**
   - Scales well with more CPUs/GPUs
   - Distributed version won 77% vs single machine
   - Used 1202 CPUs, 176 GPUs in distributed version

### Match vs Fan Hui
- Won all 5 formal games
- Won 3 of 5 informal games
- First victory against pro without handicap
- Used longer time controls for formal games

## Technical Details

### Neural Network Architecture
1. **Input Features**
   - 19x19x48 image stack
   - Stone colors, liberties, captures
   - Simple tactical features

2. **Network Structure**
   - Multiple convolutional layers
   - ReLU nonlinearities
   - Softmax output for policy
   - Value head for value network

### Optimization Techniques
1. **Parallelization**
   - Asynchronous policy/value evaluation
   - Multi-threaded search
   - GPU/CPU load balancing

2. **Training Optimizations**
   - Data augmentation with rotations/reflections
   - Separate training phases
   - Position sampling strategies

## Impact & Significance

### Scientific Contributions
- Demonstrated deep learning + tree search synergy
- Showed value of combined SL/RL approach
- Scalable distributed architecture

### Historical Context
- Major AI milestone
- Solved challenge thought decades away
- Different approach from Deep Blue chess victory

### Future Implications
- Framework applicable to other domains
- Shows promise for human-level AI performance
- Balances knowledge and calculation

### Comparison to Prior Approaches
- More selective than traditional tree search
- More accurate than previous neural networks
- Better balanced than pure Monte Carlo methods