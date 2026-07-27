export interface Recommendation {
  title: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
}

export function getRecommendations(
  dsaLevel: string,
  targetCompany: string
): Recommendation[] {
  const beginner: Recommendation[] = [
    { title: "Two Sum", topic: "Arrays", difficulty: "Easy", description: "HashMap-based pair finding" },
    { title: "Reverse Linked List", topic: "Linked List", difficulty: "Easy", description: "Iterative pointer reversal" },
    { title: "Valid Parentheses", topic: "Stacks", difficulty: "Easy", description: "Stack-based bracket matching" },
    { title: "Binary Search", topic: "Searching", difficulty: "Easy", description: "Classic divide and conquer" },
    { title: "BFS on Grid", topic: "Graphs", difficulty: "Medium", description: "Level-order grid traversal" },
    { title: "LRU Cache", topic: "Design", difficulty: "Medium", description: "HashMap + Doubly Linked List" },
  ];

  const intermediate: Recommendation[] = [
    { title: "LRU Cache", topic: "Design", difficulty: "Medium", description: "HashMap + Doubly Linked List" },
    { title: "Trie Implementation", topic: "Trees", difficulty: "Medium", description: "Prefix tree for autocomplete" },
    { title: "Course Schedule", topic: "Graphs", difficulty: "Medium", description: "Topological sort with BFS" },
    { title: "Longest Substring", topic: "Sliding Window", difficulty: "Medium", description: "Two-pointer technique" },
    { title: "Coin Change", topic: "DP", difficulty: "Medium", description: "Classic dynamic programming" },
    { title: "Merge Intervals", topic: "Arrays", difficulty: "Medium", description: "Sorting + greedy approach" },
  ];

  const advanced: Recommendation[] = [
    { title: "A* Pathfinding", topic: "Graphs", difficulty: "Hard", description: "Heuristic-based shortest path" },
    { title: "LFU Cache", topic: "Design", difficulty: "Hard", description: "Frequency-based eviction" },
    { title: "Word Break II", topic: "DP + Backtracking", difficulty: "Hard", description: "All valid segmentations" },
    { title: "Median Finder", topic: "Heaps", difficulty: "Hard", description: "Two-heap median stream" },
    { title: "Alien Dictionary", topic: "Graphs", difficulty: "Hard", description: "Topological sort from ordering" },
    { title: "Serialize Binary Tree", topic: "Trees", difficulty: "Hard", description: "BFS serialization/deserialization" },
  ];

  if (dsaLevel === "Advanced") return advanced;
  if (dsaLevel === "Intermediate") return intermediate;
  return beginner;
}

export function getTopicFocus(dsaLevel: string): string[] {
  if (dsaLevel === "Beginner") return ["Arrays", "Strings", "Linked Lists", "Stacks", "Binary Search"];
  if (dsaLevel === "Intermediate") return ["Trees", "Graphs", "Dynamic Programming", "Sliding Window", "Backtracking"];
  return ["Advanced DP", "Segment Trees", "Graph Algorithms", "System Design", "Bit Manipulation"];
}
