# 📘 [Note Title: e.g., Binary Search Trees]

## 🗓 Date
`YYYY-MM-DD`

## 🏷 Tags
#cs #algorithms #datastructures #review #💡project-ideas

---

## 📚 Fleeting Notes
Quick observations, half-baked thoughts, questions, or ideas you had while reading.

- Recursion trees remind me of divide-and-conquer.
- AVL and Red-Black Trees both rebalance, but how do they differ in complexity?
- This chapter mentioned "amortized analysis" — look into that.

---

## 🧠 Literature Notes
Summarize what the source actually said in **your own words**. Pull in any code, math, or diagrams.

**Topic**: Binary Search Trees  
- Standard BSTs can degrade to O(n) time if unbalanced.
- Self-balancing BSTs (e.g., AVL, Red-Black) keep height ~log n.
- In-order traversal = sorted output.
- Deletion is more complex than insertion.

```python
# Example BST insert
def insert(node, val):
    if not node:
        return TreeNode(val)
    if val < node.val:
        node.left = insert(node.left, val)
    else:
        node.right = insert(node.right, val)
    return node
