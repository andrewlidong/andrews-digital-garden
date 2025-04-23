The **Honors Basic Algebra** sequence at UChicago is a rigorous, proof-based introduction to **abstract algebra**, covering **group theory, ring theory, module theory, and field theory**, culminating in **Galois theory**. These topics form the backbone of **modern algebra, cryptography, algebraic geometry, and number theory**.

# **📌 1. Group Theory (First Quarter)**

### **What is a Group?**

A **group** is a set GGG with an operation ∗*∗ satisfying:

1. **Closure**: If a,b∈Ga, b \in Ga,b∈G, then a∗b∈Ga * b \in Ga∗b∈G.
2. **Associativity**: (a∗b)∗c=a∗(b∗c)(a * b) * c = a * (b * c)(a∗b)∗c=a∗(b∗c) for all a,b,c∈Ga, b, c \in Ga,b,c∈G.
3. **Identity Element**: There exists e∈Ge \in Ge∈G such that e∗a=a∗e=ae * a = a * e = ae∗a=a∗e=a.
4. **Inverses**: Every element a∈Ga \in Ga∈G has an inverse a−1a^{-1}a−1 such that a∗a−1=ea * a^{-1} = ea∗a−1=e.

### **Examples of Groups**

- **Integers under addition**: (Z,+)(\mathbb{Z}, +)(Z,+) (identity = 0, inverse = negative numbers).
- **Nonzero real numbers under multiplication**: (R∗,⋅)(\mathbb{R}^*, \cdot)(R∗,⋅).
- **Symmetric group SnS_nSn​**: The set of all permutations of nnn elements.
- **Matrix groups**: GL(n,R)GL(n, \mathbb{R})GL(n,R) (invertible n×nn \times nn×n matrices).

### **Subgroups and Cosets**

- A **subgroup** is a subset of a group that is itself a group under the same operation.
- **Lagrange’s Theorem**: The order of a subgroup HHH divides the order of GGG.

### **Normal Subgroups and Quotients**

- A **normal subgroup** NNN satisfies gNg−1=NgNg^{-1} = NgNg−1=N for all g∈Gg \in Gg∈G.
- The **quotient group** G/NG/NG/N consists of cosets of NNN.

### **Group Homomorphisms**

A **homomorphism** is a structure-preserving function between groups:

ϕ:G→Hsuch thatϕ(a∗b)=ϕ(a)∗ϕ(b).\phi: G \to H \quad \text{such that} \quad \phi(a * b) = \phi(a) * \phi(b).ϕ:G→Hsuch thatϕ(a∗b)=ϕ(a)∗ϕ(b).

- The **kernel** of ϕ\phiϕ (elements mapped to the identity in HHH) determines whether ϕ\phiϕ is injective.
- The **image** of ϕ\phiϕ determines surjectivity.
# **📌 2. Ring Theory and Module Theory (Second Quarter)**

### **What is a Ring?**

A **ring** is a set RRR with two operations (addition and multiplication) satisfying:

1. (R,+)(R, +)(R,+) is an **abelian group**.
2. Multiplication is **associative**.
3. There is a **multiplicative identity** 1≠01 \neq 01=0 (in most cases).
4. **Distributive laws**: a(b+c)=ab+aca(b + c) = ab + aca(b+c)=ab+ac and (a+b)c=ac+bc(a + b)c = ac + bc(a+b)c=ac+bc.

### **Examples of Rings**

- **Integers** (Z,+,⋅)(\mathbb{Z}, +, \cdot)(Z,+,⋅).
- **Polynomials** R[x]\mathbb{R}[x]R[x].
- **Matrix rings** Mn(R)M_n(\mathbb{R})Mn​(R).

### **Ring Homomorphisms and Ideals**

- A **ring homomorphism** preserves both addition and multiplication.
- An **ideal** I⊂RI \subset RI⊂R is a subset where aI⊂IaI \subset IaI⊂I for all a∈Ra \in Ra∈R.
- **Quotient rings** R/IR/IR/I generalize the idea of modular arithmetic.

### **Modules**

A **module** over a ring RRR is a generalization of vector spaces where scalars come from RRR instead of a field.

- If R=FR = \mathbb{F}R=F (a field), then modules are just **vector spaces**.
# **📌 3. Field Theory and Galois Theory (Third Quarter)**

### **What is a Field?**

A **field** is a ring where every nonzero element has a multiplicative inverse.

- Examples: Q,R,C,Fp\mathbb{Q}, \mathbb{R}, \mathbb{C}, \mathbb{F}_pQ,R,C,Fp​ (finite fields).

### **Field Extensions**

A **field extension** K/FK/FK/F is when a field KKK contains FFF.

- Example: C/R\mathbb{C}/\mathbb{R}C/R because C\mathbb{C}C contains R\mathbb{R}R.

### **Splitting Fields and Algebraic Closures**

- A **splitting field** of a polynomial f(x)f(x)f(x) is the smallest field extension where f(x)f(x)f(x) factors completely.
- The **algebraic closure** of a field contains all roots of all polynomials in that field.

### **Galois Theory**

Galois theory connects field extensions to **group theory**.

- The **Galois group** Gal(K/F)\text{Gal}(K/F)Gal(K/F) consists of automorphisms of KKK that fix FFF.
- **Fundamental Theorem of Galois Theory**: There is a one-to-one correspondence between intermediate fields and subgroups of the Galois group.

### **Application: Solving Polynomials**

- A polynomial is **solvable by radicals** if its Galois group is **solvable**.
- **Galois’ Theorem**: The general quintic equation ax5+bx4+cx3+dx2+ex+f=0ax^5 + bx^4 + cx^3 + dx^2 + ex + f = 0ax5+bx4+cx3+dx2+ex+f=0 **cannot** be solved by radicals because its Galois group is not solvable.

---

# **📌 Why This Course Matters**

- **Group Theory**: The foundation of **symmetry, cryptography, and theoretical physics**.
- **Ring and Module Theory**: Used in **abstract algebra, algebraic geometry, and number theory**.
- **Field and Galois Theory**: The **backbone of modern algebra**, explaining why some polynomials have solutions and others don't.