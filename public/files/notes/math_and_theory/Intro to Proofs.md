### **Introduction to Proofs: The Foundation of Mathematical Rigor**

Mathematical proofs are the **language of rigorous reasoning**. This course would have introduced **logic, set theory, number theory, real analysis, and proof techniques** to help you transition from computational math to abstract mathematics.

## **📌 1. Foundations of Logic and Proofs**

Mathematical logic forms the basis of **all proofs**. The key ideas include:

### **Propositional Logic**

- **Statements (Propositions)** are mathematical sentences that are either **true or false**.
- Logical connectives:
    - **Negation**: ¬P\neg P¬P ("not PPP")
    - **Conjunction**: P∧QP \wedge QP∧Q ("PPP and QQQ")
    - **Disjunction**: P∨QP \vee QP∨Q ("PPP or QQQ")
    - **Implication**: P⇒QP \Rightarrow QP⇒Q ("If PPP, then QQQ")
    - **Biconditional**: P⇔QP \Leftrightarrow QP⇔Q ("PPP if and only if QQQ")

### **Quantifiers**

- **Universal quantifier**: ∀x,P(x)\forall x, P(x)∀x,P(x) ("for all xxx, P(x)P(x)P(x) is true").
- **Existential quantifier**: ∃x,P(x)\exists x, P(x)∃x,P(x) ("there exists some xxx such that P(x)P(x)P(x) is true").

#### **Example of a Logical Statement**

> "For all real numbers xxx, if x2=1x^2 = 1x2=1, then x=1x = 1x=1 or x=−1x = -1x=−1."  
> This is written as:

∀x∈R,x2=1⇒(x=1∨x=−1)\forall x \in \mathbb{R}, \quad x^2 = 1 \Rightarrow (x = 1 \vee x = -1)∀x∈R,x2=1⇒(x=1∨x=−1)

## **📌 2. Proof Techniques**

There are several fundamental **ways to prove mathematical statements**:

### **Direct Proof**

- Start from the hypothesis and use logical steps to reach the conclusion.
- Example: Proving that the sum of two even numbers is even.
    - Let a=2ma = 2ma=2m and b=2nb = 2nb=2n for integers m,nm, nm,n.
    - Then a+b=2m+2n=2(m+n)a + b = 2m + 2n = 2(m+n)a+b=2m+2n=2(m+n), which is even.

### **Proof by Contradiction**

- Assume the **negation** of the statement is true and show that this leads to a contradiction.
- Example: **Proving 2\sqrt{2}2​ is irrational**.
    - Suppose 2=pq\sqrt{2} = \frac{p}{q}2​=qp​ with integers p,qp, qp,q (in lowest terms).
    - Squaring gives 2q2=p22q^2 = p^22q2=p2, meaning p2p^2p2 is even, so ppp is even.
    - Writing p=2kp = 2kp=2k and substituting, we get q2=2k2q^2 = 2k^2q2=2k2, so qqq is also even.
    - This contradicts our assumption that p/qp/qp/q was in **lowest terms**.

### **Proof by Induction**

- Used to prove statements about **all natural numbers**.
- Steps:
    1. **Base case**: Prove the statement for n=1n = 1n=1.
    2. **Inductive step**: Assume true for n=kn = kn=k, then prove for n=k+1n = k+1n=k+1.
    3. **Conclusion**: By induction, the statement is true for all nnn.

#### **Example: Proving the Sum of the First nnn Natural Numbers**

1+2+⋯+n=n(n+1)21 + 2 + \dots + n = \frac{n(n+1)}{2}1+2+⋯+n=2n(n+1)​

- **Base case**: For n=1n = 1n=1, we get 1=1(2)2=11 = \frac{1(2)}{2} = 11=21(2)​=1, which is true.
- **Inductive step**: Assume it holds for n=kn = kn=k, so:1+2+⋯+k=k(k+1)21 + 2 + \dots + k = \frac{k(k+1)}{2}1+2+⋯+k=2k(k+1)​Now, prove it for k+1k+1k+1:1+2+⋯+k+(k+1)=k(k+1)2+(k+1)1 + 2 + \dots + k + (k+1) = \frac{k(k+1)}{2} + (k+1)1+2+⋯+k+(k+1)=2k(k+1)​+(k+1)Factor:=k(k+1)+2(k+1)2=(k+1)(k+2)2= \frac{k(k+1) + 2(k+1)}{2} = \frac{(k+1)(k+2)}{2}=2k(k+1)+2(k+1)​=2(k+1)(k+2)​which matches the formula for n=k+1n = k+1n=k+1. Thus, the formula holds for all nnn.

## **📌 3. Set Theory**

Mathematics is built on **sets**, collections of objects with well-defined properties.

### **Basic Set Operations**

- **Union**: A∪B={x∣x∈A or x∈B}A \cup B = \{ x \mid x \in A \text{ or } x \in B \}A∪B={x∣x∈A or x∈B}
- **Intersection**: A∩B={x∣x∈A and x∈B}A \cap B = \{ x \mid x \in A \text{ and } x \in B \}A∩B={x∣x∈A and x∈B}
- **Difference**: A−B={x∣x∈A but x∉B}A - B = \{ x \mid x \in A \text{ but } x \notin B \}A−B={x∣x∈A but x∈/B}
- **Power Set**: P(A)\mathcal{P}(A)P(A) is the set of all subsets of AAA.
- **Cartesian Product**: A×B={(a,b)∣a∈A,b∈B}A \times B = \{ (a, b) \mid a \in A, b \in B \}A×B={(a,b)∣a∈A,b∈B} (used in defining relations and functions).

### **Functions and Mappings**

- A **function** f:A→Bf: A \to Bf:A→B maps elements from set AAA to set BBB.
- **Injective (One-to-One)**: Different inputs give different outputs.
- **Surjective (Onto)**: Every element of BBB has a preimage in AAA.
- **Bijective**: Both injective and surjective (implies an **inverse function** exists).
### **Equivalence Relations and Partitions**

- A relation ∼\sim∼ on a set AAA is an **equivalence relation** if it satisfies:
    1. **Reflexivity**: a∼aa \sim aa∼a for all a∈Aa \in Aa∈A.
    2. **Symmetry**: a∼b⇒b∼aa \sim b \Rightarrow b \sim aa∼b⇒b∼a.
    3. **Transitivity**: a∼b,b∼c⇒a∼ca \sim b, b \sim c \Rightarrow a \sim ca∼b,b∼c⇒a∼c.
- Equivalence relations **partition** a set into disjoint subsets.
## **📌 4. Real Analysis Foundations**

This course would have also introduced some **early real analysis concepts** that were expanded in later courses.

### **Epsilon-Delta Definition of Limits**

A function f(x)f(x)f(x) has a **limit LLL as x→ax \to ax→a** if:

∀ϵ>0,∃δ>0 such that 0<∣x−a∣<δ⇒∣f(x)−L∣<ϵ\forall \epsilon > 0, \exists \delta > 0 \text{ such that } 0 < |x - a| < \delta \Rightarrow |f(x) - L| < \epsilon∀ϵ>0,∃δ>0 such that 0<∣x−a∣<δ⇒∣f(x)−L∣<ϵ

This formalizes the **intuitive idea** that "as xxx gets closer to aaa, f(x)f(x)f(x) gets arbitrarily close to LLL."

### **Compactness and the Bolzano-Weierstrass Theorem**

- A subset of Rn\mathbb{R}^nRn is **compact** if it is **closed and bounded**.
- **Bolzano-Weierstrass Theorem**: Every bounded sequence in Rn\mathbb{R}^nRn has a **convergent subsequence**.

---