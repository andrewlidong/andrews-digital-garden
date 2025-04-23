**

- Meetup 026 - [Mastering Chess and Shogi by Self-Play with a General RL Algorithm (2017](https://arxiv.org/abs/1712.01815))
    

**

# AlphaZero: Mastering Chess, Shogi, and Go by Self-Play with a General Reinforcement Learning Algorithm

**Authors**: David Silver, Thomas Hubert, Julian Schrittwieser, Ioannis Antonoglou, Matthew Lai, Arthur Guez, Marc Lanctot, Laurent Sifre, et al.  
**Affiliation**: DeepMind

## Overview

- **Purpose**: AlphaZero is a **general reinforcement learning algorithm** that achieved superhuman performance in the games of Chess, Shogi, and Go without any domain-specific heuristics or handcrafted rules.
- **Core Achievement**: Demonstrated that a single algorithm can achieve **tabula rasa** (from scratch) mastery across different board games using self-play.

## Key Concepts

### Tabula Rasa Learning

- **Definition**: Learning from scratch with no prior domain knowledge, other than basic rules.
- **Contrast with Previous AI**: Traditional AI systems like **Stockfish** and **Deep Blue** used handcrafted features and evaluation functions specific to Chess.

### Domains Studied

1. **Chess**: One of the oldest benchmarks in artificial intelligence, characterized by highly tuned traditional engines such as Stockfish.
2. **Shogi (Japanese Chess)**: More computationally complex than Chess due to the ability to drop captured pieces.
3. **Go**: Requires evaluation of a large board, suited for **neural networks** and **convolutional architectures**.

---

## Architecture and Methods

### Deep Neural Network (DNN)

- The neural network in AlphaZero is represented as **fθ(s)**, which takes the board state **s** and outputs:
    - **p (Move Probabilities)**: The probability of each move being played.
    - **v (Value Estimate)**: Expected game outcome from the current position.

### Reinforcement Learning via Self-Play

- **Self-Play Games**: The model continuously played against itself to generate training data.
- **Monte Carlo Tree Search (MCTS)**:
    - Used to balance **exploration** (trying new moves) and **exploitation** (using moves known to be good).
    - Each simulation within the MCTS selected moves based on a combination of **visit count**, **move probabilities**, and **value estimates** from the neural network.

### Training Procedure

- **Random Initialization**: Training started with randomly initialized parameters.
- **Iterative Improvement**: Each version played against previous versions, improving progressively over time.
- **Training Resources**: Utilized **5,000 TPUs** to generate self-play games and **64 TPUs** to train the networks over **700,000 steps**.

---

## Evaluation and Results

### Performance Metrics

- AlphaZero was evaluated against top engines:
    1. **Stockfish** (Chess)
    2. **Elmo** (Shogi)
    3. **AlphaGo Zero** (Go)
- **Match Results**:
    - **Chess**: AlphaZero defeated Stockfish with no losses (25 wins, 25 draws as white; 3 wins, 47 draws as black).
    - **Shogi**: Convincing wins against Elmo.
    - **Go**: Outperformed AlphaGo Zero after only **8 hours** of training.

### Search Efficiency

- **Positions Per Second**:
    - **AlphaZero** searched only **80,000 positions per second** in Chess.
    - **Stockfish** searched **70 million positions per second**, showing AlphaZero's efficiency through **selective search** rather than exhaustive evaluation.

### Scalability and Elo Ratings

- Elo ratings were computed based on performance at different training stages:
    - In Chess, AlphaZero surpassed Stockfish in **4 hours**.
    - In Shogi, it outperformed Elmo in **2 hours**.
    - AlphaZero's Monte Carlo Tree Search (MCTS) scaled more effectively than traditional **alpha-beta pruning**.

---

## Innovations and Insights

### General-Purpose Algorithm

- Unlike traditional game engines that relied on **domain-specific adaptations** (e.g., handcrafted rules), AlphaZero’s **general-purpose neural network** was flexible enough to handle multiple games.

### Deep Neural Network vs. Traditional Search

- **Alpha-Beta Pruning vs. MCTS**:
    - Traditional engines like Stockfish used **alpha-beta search** to explore the game tree deeply.
    - AlphaZero used MCTS, which averages over subtrees, mitigating the impact of **approximation errors** introduced by the neural network.

### Neural Network Representation

- **Input Features**: The input features are structured as planes representing the board state, and include positional and game rule-specific information (e.g., castling rights, repetition count).
- **Output Features**: Encoded as spatial planes, each representing move probabilities across different game scenarios.

---

## Challenges and Limitations

- **Hyperparameter Tuning**: No domain-specific tuning, other than adjusting exploration noise proportional to the number of legal moves.
- **Draws in Chess**: High-level chess games often result in draws, which compresses Elo rating gains.

### Future Work

- **Additional Games**: AlphaZero could be extended to other complex domains.
- **Combining Techniques**: The addition of traditional domain-specific methods might further enhance AlphaZero’s performance.

---

## Conclusion

- **Significance**: AlphaZero’s general reinforcement learning framework demonstrated superhuman performance across three distinct board games, showing the power of self-play and neural networks to solve complex problems without the need for human domain knowledge.
- **Impact**: AlphaZero raises important questions regarding the utility of handcrafted rules versus learning from first principles in artificial intelligence, pointing towards **general-purpose AI** capable of adapting to a variety of tasks.