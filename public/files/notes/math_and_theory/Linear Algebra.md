# **📖 Linear Algebra Overview**

Linear algebra is the study of **vectors, vector spaces, and linear transformations**. It is fundamental in **computer science, physics, engineering, machine learning, and applied mathematics**.

## **📌 1. Vectors and Vector Spaces**

### **What is a Vector?**

A **vector** is an ordered list of numbers, usually written as:

v=[v1v2v3]\mathbf{v} = \begin{bmatrix} v_1 \\ v_2 \\ v_3 \end{bmatrix}v=​v1​v2​v3​​​

Vectors represent **quantities with magnitude and direction** in **geometry** and **solutions to equations** in **algebra**.

### **Vector Spaces**

A **vector space** is a collection of vectors that satisfies:

1. **Closure under addition**: If u,v\mathbf{u}, \mathbf{v}u,v are in the space, then u+v\mathbf{u} + \mathbf{v}u+v is also in the space.
2. **Closure under scalar multiplication**: If v\mathbf{v}v is in the space and ccc is a scalar, then cvc\mathbf{v}cv is in the space.
3. **Zero vector**: There exists a unique **zero vector** 0\mathbf{0}0 such that v+0=v\mathbf{v} + \mathbf{0} = \mathbf{v}v+0=v.
4. **Other properties**: Associativity, commutativity, distributivity, etc.

#### **Examples of Vector Spaces**

- Rn\mathbb{R}^nRn, the space of all nnn-dimensional vectors.
- **Polynomial space**: All polynomials of degree ≤n\leq n≤n.
- **Matrix space**: All m×nm \times nm×n matrices.

## **📌 2. Linear Transformations and Matrices**

### **What is a Linear Transformation?**

A **linear transformation** is a function between vector spaces that preserves addition and scalar multiplication:

T(au+bv)=aT(u)+bT(v)T(a\mathbf{u} + b\mathbf{v}) = aT(\mathbf{u}) + bT(\mathbf{v})T(au+bv)=aT(u)+bT(v)

Every linear transformation can be written as a **matrix multiplication**.

### **Matrices as Linear Maps**

A **matrix** represents a linear transformation. If:

A=[1234],v=[xy]A = \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix}, \quad \mathbf{v} = \begin{bmatrix} x \\ y \end{bmatrix}A=[13​24​],v=[xy​]

then multiplying AAA and v\mathbf{v}v gives a new vector:

Av=[1234][xy]=[x+2y3x+4y]A\mathbf{v} = \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} x + 2y \\ 3x + 4y \end{bmatrix}Av=[13​24​][xy​]=[x+2y3x+4y​]

This shows how AAA **transforms** v\mathbf{v}v.

## **📌 3. Matrix Operations**

### **Matrix Addition and Multiplication**

- **Addition**: Matrices of the same size are added **element-wise**.
- **Multiplication**: If AAA is m×nm \times nm×n and BBB is n×pn \times pn×p, the product ABABAB is **defined** and results in an m×pm \times pm×p matrix.

### **Identity and Inverse Matrices**

- **Identity Matrix III**: The matrix equivalent of **1** in multiplication:
    
    I=[1001]I = \begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix}I=[10​01​]
    
    For any matrix AAA, AI=AAI = AAI=A.
    
- **Inverse Matrix A−1A^{-1}A−1**: If AA−1=IAA^{-1} = IAA−1=I, then A−1A^{-1}A−1 **"undoes"** the transformation of AAA.
    

---

## **📌 4. Determinants and Eigenvalues**

### **Determinant**

The **determinant** of a square matrix measures **scaling and invertibility**:

det⁡(A)=ad−bc\det(A) = ad - bcdet(A)=ad−bc

For a matrix AAA:

- If det⁡(A)=0\det(A) = 0det(A)=0, the matrix is **singular** (not invertible).
- If det⁡(A)≠0\det(A) \neq 0det(A)=0, the matrix is **invertible**.

### **Eigenvalues and Eigenvectors**

For a square matrix AAA, an **eigenvector** v\mathbf{v}v satisfies:

Av=λvA\mathbf{v} = \lambda \mathbf{v}Av=λv

where λ\lambdaλ is an **eigenvalue**.

- Eigenvalues tell us **how much vectors are stretched or shrunk**.
- Eigenvectors remain in the **same direction** after transformation.

#### **Example: Eigenvalues of a 2×2 Matrix**

For A=[3102]A = \begin{bmatrix} 3 & 1 \\ 0 & 2 \end{bmatrix}A=[30​12​], solve:

det⁡(A−λI)=0\det(A - \lambda I) = 0det(A−λI)=0

to find λ\lambdaλ, the eigenvalues.

### **Why This Matters**

- Used in **PCA (Principal Component Analysis)** for data compression.
- Essential in **differential equations, physics, and computer graphics**.
## **📌 5. Basis and Dimension**

### **What is a Basis?**

A **basis** of a vector space is a **set of linearly independent vectors** that **span the entire space**.

- The number of basis vectors is the **dimension** of the space.
    
- Example: The standard basis of R3\mathbb{R}^3R3 is:
    
    e1=[100],e2=[010],e3=[001]\mathbf{e}_1 = \begin{bmatrix} 1 \\ 0 \\ 0 \end{bmatrix}, \quad \mathbf{e}_2 = \begin{bmatrix} 0 \\ 1 \\ 0 \end{bmatrix}, \quad \mathbf{e}_3 = \begin{bmatrix} 0 \\ 0 \\ 1 \end{bmatrix}e1​=​100​​,e2​=​010​​,e3​=​001​​

### **Linear Independence**

A set of vectors {v1,v2,…,vn}\{ \mathbf{v}_1, \mathbf{v}_2, \dots, \mathbf{v}_n \}{v1​,v2​,…,vn​} is **linearly independent** if:

c1v1+c2v2+⋯+cnvn=0c_1\mathbf{v}_1 + c_2\mathbf{v}_2 + \dots + c_n\mathbf{v}_n = 0c1​v1​+c2​v2​+⋯+cn​vn​=0

only when **all** ci=0c_i = 0ci​=0.

### **Why This Matters**

- Basis vectors let us **represent and analyze** vectors efficiently.
- Changing bases simplifies computations (e.g., diagonalization).

---

## **📌 6. Orthogonality and Inner Product Spaces**

### **Dot Product (Inner Product)**

The **dot product** of two vectors u,v\mathbf{u}, \mathbf{v}u,v is:

u⋅v=u1v1+u2v2+⋯+unvn\mathbf{u} \cdot \mathbf{v} = u_1 v_1 + u_2 v_2 + \dots + u_n v_nu⋅v=u1​v1​+u2​v2​+⋯+un​vn​

- If u⋅v=0\mathbf{u} \cdot \mathbf{v} = 0u⋅v=0, then u\mathbf{u}u and v\mathbf{v}v are **orthogonal** (perpendicular).

### **Orthogonal Projections**

Given a vector v\mathbf{v}v, its **projection** onto u\mathbf{u}u is:

projuv=u⋅vu⋅uu\text{proj}_{\mathbf{u}} \mathbf{v} = \frac{\mathbf{u} \cdot \mathbf{v}}{\mathbf{u} \cdot \mathbf{u}} \mathbf{u}proju​v=u⋅uu⋅v​u

This is useful in **least squares regression** and **computer graphics**.

### **Why This Matters**

- **Gram-Schmidt Process**: Converts any basis into an **orthonormal basis**.
- **QR Decomposition**: Factorizes matrices into simpler components.