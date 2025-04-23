# 📘 [Building a Deep Tech Company]

## 🗓 Date
`2025-04-09`

## 🏷 Tags
#deeptech #startups #professional

https://review.firstround.com/building-a-deep-tech-company-most-startup-advice-doesnt-apply-read-this-instead/?utm_source=www.founderweekly.com&utm_medium=newsletter&utm_campaign=founder-weekly-issue-680-april-9-2025&_bhlid=96d455005e266097e91c0612acca1812e753e206

---

## 📚 Fleeting Notes
Quick observations, half-baked thoughts, questions, or ideas you had while reading.

- This article is really long
- I don't have patience reading long tech articles
- People love blogging

---

## 🧠 Literature Notes
Summarize what the source actually said in **your own words**. Pull in any code, math, or diagrams.

**Topic**: Challenges
- The playbook paradox
	- Lean on unexpected inspiration
	- Build a board that spans domains
- The delay domino effect
	- Open another decision-making door
	- Rigorously scenario plan for inevitable delays
- The fundraising slog
	- Give investors new mental models and reframe the conversation around probability of success
	- Expand your fundraising horizons
- The binary bind
	- Build in redundancies, big and small
	- Engineer learning opportunities
- The founder's emotional tightrope
	- Stay emotionally attached to mission, not method
- The hammer-nail hiring trap
	- Hire for thinking process over domain knowledge
- The technical translation gap
	- Radical transparency
	- Apply a consistent formula

**Topic**: Advantages
- The deep tech advantage: turning challenges into moats
- 

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
