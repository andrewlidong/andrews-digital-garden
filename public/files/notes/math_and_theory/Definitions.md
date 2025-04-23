# **📖 Chapter 6: The Riemann-Stieltjes Integral**

### **What is the Riemann-Stieltjes Integral?**

The **Riemann integral** sums up function values over an interval, but the **Riemann-Stieltjes integral** generalizes this idea by introducing a **weighting function g(x)g(x)g(x)** that changes how the sum is accumulated:

∫abf(x) dg(x)\int_a^b f(x) \, dg(x)∫ab​f(x)dg(x)

This allows for **more flexible integration** by incorporating additional structure from g(x)g(x)g(x).

### **How is it Different from the Riemann Integral?**

- In the usual Riemann integral, we sum over intervals of equal size, treating all xxx-values equally:∫abf(x) dx\int_a^b f(x) \, dx∫ab​f(x)dx
- In the Riemann-Stieltjes integral, g(x)g(x)g(x) determines how weights are assigned to different parts of the function.

### **What does g(x)g(x)g(x) do?**

- If g(x)g(x)g(x) is increasing smoothly, it **stretches or compresses** how function values are counted.
- If g(x)g(x)g(x) has **jumps**, it allows integrating functions that change abruptly.
- This makes it useful in **probability and statistics** where g(x)g(x)g(x) can represent a **cumulative distribution function**.

### **Why It Matters**

- This integral is a stepping stone to **Lebesgue integration**, which fully generalizes the concept of integration.
- It’s used in **probability and finance** to integrate functions against **stochastic processes**.

---

# **📖 Chapter 7: Sequences and Series of Functions**

### **Pointwise vs. Uniform Convergence**

If we have a sequence of functions fn(x)f_n(x)fn​(x) that converges to a function f(x)f(x)f(x), there are different ways this can happen:

#### **Pointwise Convergence**

lim⁡n→∞fn(x)=f(x)\lim_{n\to\infty} f_n(x) = f(x)n→∞lim​fn​(x)=f(x)

for **each** fixed xxx.

- **Weak form of convergence**: Only ensures that for each individual xxx, the function values eventually settle down.
- **Danger**: The rate of convergence can be different at different points, which can cause issues when taking derivatives or integrals.

#### **Uniform Convergence**

sup⁡x∣fn(x)−f(x)∣→0 as n→∞\sup_{x} |f_n(x) - f(x)| \to 0 \text{ as } n \to \inftyxsup​∣fn​(x)−f(x)∣→0 as n→∞

- This means **all** function values converge at the **same rate**.
- This is stronger than pointwise convergence and ensures that:
    - Limits of continuous functions remain continuous.
    - You can safely **swap limits and integrals**.

### **Why It Matters**

- When dealing with **power series, Fourier series, and infinite function approximations**, uniform convergence is crucial.
- Ensures that differentiation and integration of the function sequence behave well.

---

# **📖 Chapter 8: Special Functions**

### **Power Series**

A **power series** is an infinite sum of the form:

∑n=0∞cn(x−a)n\sum_{n=0}^{\infty} c_n (x - a)^nn=0∑∞​cn​(x−a)n

- These series **represent functions** in a way that generalizes polynomials.
- The function is only **valid within a certain radius of convergence**.

### **Gamma Function**

Γ(n)=∫0∞xn−1e−xdx\Gamma(n) = \int_0^\infty x^{n-1} e^{-x} dxΓ(n)=∫0∞​xn−1e−xdx

- Generalizes the **factorial function**:
    - Γ(n+1)=n!\Gamma(n+1) = n!Γ(n+1)=n!.
- Appears in **probability, physics, and complex analysis**.

### **Why It Matters**

- Power series are used in **Taylor series, differential equations, and quantum mechanics**.
- The Gamma function is used in **probability distributions and combinatorial mathematics**.

---

# **📖 Chapter 9: Functions of Several Variables**

### **Partial Derivatives**

If f(x,y)f(x, y)f(x,y) is a function of two variables, its **partial derivatives** measure how it changes when **only one variable changes**:

∂f∂x=lim⁡h→0f(x+h,y)−f(x,y)h\frac{\partial f}{\partial x} = \lim_{h \to 0} \frac{f(x+h, y) - f(x, y)}{h}∂x∂f​=h→0lim​hf(x+h,y)−f(x,y)​

### **Jacobian Matrix**

The **Jacobian matrix** of a function f:Rn→Rmf: \mathbb{R}^n \to \mathbb{R}^mf:Rn→Rm is a matrix of partial derivatives:

Jf=[∂f1∂x1∂f1∂x2…∂f1∂xn∂f2∂x1∂f2∂x2…∂f2∂xn⋮⋮⋱⋮∂fm∂x1∂fm∂x2…∂fm∂xn]J_f = \begin{bmatrix} \frac{\partial f_1}{\partial x_1} & \frac{\partial f_1}{\partial x_2} & \dots & \frac{\partial f_1}{\partial x_n} \\ \frac{\partial f_2}{\partial x_1} & \frac{\partial f_2}{\partial x_2} & \dots & \frac{\partial f_2}{\partial x_n} \\ \vdots & \vdots & \ddots & \vdots \\ \frac{\partial f_m}{\partial x_1} & \frac{\partial f_m}{\partial x_2} & \dots & \frac{\partial f_m}{\partial x_n} \end{bmatrix}Jf​=​∂x1​∂f1​​∂x1​∂f2​​⋮∂x1​∂fm​​​∂x2​∂f1​​∂x2​∂f2​​⋮∂x2​∂fm​​​……⋱…​∂xn​∂f1​​∂xn​∂f2​​⋮∂xn​∂fm​​​​

### **Why It Matters**

- The **Jacobian** tells us how **multivariable functions transform space**.
- Used in **machine learning, optimization, and physics**.

---

# **📖 Chapter 10: Integration of Differential Forms**

### **Differential Forms**

A **differential form** generalizes functions and vector fields for integration over different dimensions.

For example, a **1-form** is written as:

ω=f(x,y)dx+g(x,y)dy\omega = f(x, y) dx + g(x, y) dyω=f(x,y)dx+g(x,y)dy

which can be **integrated over curves**.

### **Stokes’ Theorem**

A **generalization of Green’s Theorem and the Fundamental Theorem of Calculus**:

∫Ωdω=∫∂Ωω\int_{\Omega} d\omega = \int_{\partial\Omega} \omega∫Ω​dω=∫∂Ω​ω

- This links the integral of a differential form over a **region Ω\OmegaΩ** to its integral over the **boundary ∂Ω\partial \Omega∂Ω**.

### **Why It Matters**

- Stokes’ Theorem is fundamental in **electromagnetism, fluid dynamics, and differential geometry**.
- It provides a unified way to handle **divergence, curl, and circulation**.

---

# **📖 Chapter 11: The Lebesgue Theory**

### **Why the Riemann Integral Fails**

- The Riemann integral struggles with functions that oscillate too much (e.g., the Dirichlet function, which is 111 on rationals and 000 on irrationals).

### **Lebesgue Measure and Integration**

Instead of summing over intervals, the **Lebesgue integral** sums over **measure-theoretic slices**:

∫f dμ\int f \, d\mu∫fdμ

where μ\muμ represents **measure**, a more flexible generalization of "length."

### **Dominated Convergence Theorem (DCT)**

Allows swapping limits and integration safely if functions are **dominated by an integrable function**:

lim⁡n→∞∫fn dμ=∫lim⁡n→∞fn dμ\lim_{n\to\infty} \int f_n \, d\mu = \int \lim_{n\to\infty} f_n \, d\mun→∞lim​∫fn​dμ=∫n→∞lim​fn​dμ

### **LpL^pLp-Spaces**

The set of functions where the **p-th power of the absolute value is integrable**:

Lp={f∣∫∣f∣pdμ<∞}L^p = \{ f \mid \int |f|^p d\mu < \infty \}Lp={f∣∫∣f∣pdμ<∞}

These are fundamental in **functional analysis, signal processing, and quantum mechanics**.

### **Why It Matters**

- The Lebesgue integral is **used everywhere in modern mathematics**.
- It underpins **probability, measure theory, and Fourier analysis**.