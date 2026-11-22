"""
Curated DSA Knowledge Base for Retrieval-Augmented Generation (RAG)
Covers core data structures, algorithms, space/time complexity, interview patterns, and common pitfalls.
"""

DSA_DOCUMENTS = [
    {
        "id": "binary-search",
        "topic": "Binary Search",
        "title": "Binary Search Algorithm and Pitfalls",
        "content": """Binary Search operates on sorted arrays in O(log n) time and O(1) space.
Key logic:
1. Initialize left = 0, right = n - 1.
2. Calculate mid = left + (right - left) // 2 to avoid integer overflow.
3. Compare nums[mid] with target:
   - If nums[mid] == target, return mid.
   - If nums[mid] < target, search right half: left = mid + 1.
   - If nums[mid] > target, search left half: right = mid - 1.
Common variations: Finding lower bound, upper bound, peak element, and searching in rotated sorted arrays.
Edge cases: Array length 1, element not present, duplicates."""
    },
    {
        "id": "two-pointers-arrays",
        "topic": "Arrays & Strings",
        "title": "Two Pointers Technique",
        "content": """The Two Pointers technique reduces O(n^2) time to O(n) for sorted array search, partitioning, or reversing.
Patterns:
1. Opposite ends: left = 0, right = n - 1 (e.g., Two Sum II, Container With Most Water, Palindrome check).
2. Fast and slow pointers: slow = 0, fast = 0 (e.g., Remove Duplicates, Linked List Cycle detection).
Space complexity is typically O(1).
Interview Tip: Mention why two pointers works (monotonicity of the sum or sorted condition)."""
    },
    {
        "id": "sliding-window",
        "topic": "Arrays & Strings",
        "title": "Sliding Window Technique",
        "content": """Sliding window is ideal for contiguous sub-array or substring problems.
Types:
1. Fixed window: Size k. Compute sum or property for first k elements, then slide by adding nums[r] and subtracting nums[l].
2. Dynamic window: Expand right pointer until condition is met or broken, then contract left pointer while maintaining or restoring the invariant.
Time Complexity: O(n) because each element enters and leaves the window at most once.
Space Complexity: O(k) or O(1) if auxiliary map or frequency array is used."""
    },
    {
        "id": "linked-list-reversal",
        "topic": "Linked Lists",
        "title": "Linked List In-Place Reversal",
        "content": """Reversing a singly linked list in-place requires three pointers: prev, current, and next.
Iterative procedure:
1. prev = null, current = head
2. While current is not null:
   - next_temp = current.next
   - current.next = prev
   - prev = current
   - current = next_temp
3. Return prev as the new head.
Complexity: Time O(n), Space O(1).
Edge cases: Empty list (head is null), single-node list."""
    },
    {
        "id": "bfs-vs-dfs",
        "topic": "Graphs & Trees",
        "title": "Breadth-First Search (BFS) vs Depth-First Search (DFS)",
        "content": """Breadth-First Search (BFS):
- Explores layer-by-layer using a FIFO Queue.
- Guarantees the shortest path in unweighted graphs.
- Space complexity: O(V) or O(width of tree/graph).
Depth-First Search (DFS):
- Explores as deep as possible along each branch before backtracking, using recursion or an explicit LIFO Stack.
- Ideal for topological sort, detecting cycles, path finding, and component counting.
- Space complexity: O(H) where H is maximum recursion depth.
Interview Communication: Explain the trade-off between stack depth and queue width."""
    },
    {
        "id": "dynamic-programming-kadane",
        "topic": "Dynamic Programming",
        "title": "Kadane's Algorithm & 1D DP",
        "content": """Kadane's Algorithm finds the maximum subarray sum in O(n) time and O(1) space.
State definition: dp[i] = maximum subarray sum ending at index i.
Recurrence relation: dp[i] = max(nums[i], dp[i-1] + nums[i]).
Since dp[i] depends only on dp[i-1], space optimizes to O(1) by maintaining current_sum and max_sum.
Edge case: All negative numbers (result is the single maximum negative value)."""
    },
    {
        "id": "dynamic-programming-knapsack",
        "topic": "Dynamic Programming",
        "title": "0/1 Knapsack & Subset Sum",
        "content": """0/1 Knapsack problem: Given weights and values, find maximum value fitting capacity W.
State: dp[i][w] = max value considering first i items with weight limit w.
Transition: dp[i][w] = max(dp[i-1][w], dp[i-1][w - weights[i]] + values[i]) if w >= weights[i], else dp[i-1][w].
Space optimization: Can be optimized from O(n * W) to O(W) by iterating capacity backwards from W down to weight[i]."""
    },
    {
        "id": "lru-cache-design",
        "topic": "Advanced Data Structures",
        "title": "LRU (Least Recently Used) Cache Design",
        "content": """LRU Cache requires O(1) get and put operations.
Data Structure Combination:
1. Hash Map: maps key to Doubly Linked List Node for O(1) lookup.
2. Doubly Linked List: maintains usage order (Head = Most Recently Used, Tail = Least Recently Used).
When get(key): Move node to head.
When put(key, val): If exists, update val and move to head. If new, insert at head; if capacity exceeded, remove node from tail and delete key from map."""
    }
]
