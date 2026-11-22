package com.placementgpt.config;

import com.placementgpt.model.Problem;
import com.placementgpt.repository.ProblemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private ProblemRepository problemRepository;

    @Override
    public void run(String... args) throws Exception {
        if (problemRepository.count() > 0) {
            logger.info("Problems already populated. Skipping initialization.");
            return;
        }

        logger.info("Seeding curated DSA problems and test cases into database...");
        List<Problem> problems = new ArrayList<>();

        // 1. Two Sum
        Problem twoSum = new Problem();
        twoSum.setTitle("Two Sum");
        twoSum.setSlug("two-sum");
        twoSum.setDifficulty("EASY");
        twoSum.setTopic("Arrays & Strings");
        twoSum.setDescription("Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.");
        twoSum.setConstraints("2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.");
        twoSum.setExamples("Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].");
        twoSum.setStarterCodeJava("import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int target = sc.nextInt();\n        \n        // TODO: Find indices i, j such that nums[i] + nums[j] == target\n        for (int i = 0; i < n; i++) {\n            for (int j = i + 1; j < n; j++) {\n                if (nums[i] + nums[j] == target) {\n                    System.out.println(i + \" \" + j);\n                    return;\n                }\n            }\n        }\n    }\n}");
        twoSum.setStarterCodePython("import sys\n\ndef main():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:n+1]]\n    target = int(lines[n+1])\n    \n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            print(f\"{seen[complement]} {i}\")\n            return\n        seen[num] = i\n\nif __name__ == '__main__':\n    main()");
        twoSum.setStarterCodeCpp("#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    int target;\n    cin >> target;\n    \n    unordered_map<int, int> seen;\n    for (int i = 0; i < n; i++) {\n        int comp = target - nums[i];\n        if (seen.count(comp)) {\n            cout << seen[comp] << \" \" << i << endl;\n            return 0;\n        }\n        seen[nums[i]] = i;\n    }\n    return 0;\n}");
        twoSum.setStarterCodeC("#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int nums[10000];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &nums[i]);\n    int target;\n    scanf(\"%d\", &target);\n    \n    for (int i = 0; i < n; i++) {\n        for (int j = i + 1; j < n; j++) {\n            if (nums[i] + nums[j] == target) {\n                printf(\"%d %d\\n\", i, j);\n                return 0;\n            }\n        }\n    }\n    return 0;\n}");
        twoSum.setHiddenTestCasesJson("[{\"input\":\"4\\n2 7 11 15\\n9\", \"expectedOutput\":\"0 1\"}, {\"input\":\"3\\n3 2 4\\n6\", \"expectedOutput\":\"1 2\"}, {\"input\":\"2\\n3 3\\n6\", \"expectedOutput\":\"0 1\"}]");
        twoSum.setHintsJson("[\"Hint 1 (Intuition): A brute force approach checks all pairs in O(n^2). Can we do better?\", \"Hint 2 (Directional): As you iterate through the array, what information do you wish you had stored?\", \"Hint 3 (Algorithm): Use a Hash Map to store each number and its index. For each number x, check if (target - x) is in the map in O(1).\"]");
        problems.add(twoSum);

        // 2. Binary Search
        Problem binarySearch = new Problem();
        binarySearch.setTitle("Binary Search");
        binarySearch.setSlug("binary-search");
        binarySearch.setDifficulty("EASY");
        binarySearch.setTopic("Binary Search");
        binarySearch.setDescription("Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, return its index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.");
        binarySearch.setConstraints("1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll the integers in nums are unique.\nnums is sorted in ascending order.");
        binarySearch.setExamples("Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4\nExplanation: 9 exists in nums and its index is 4");
        binarySearch.setStarterCodeJava("import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int target = sc.nextInt();\n        \n        int left = 0, right = n - 1;\n        int ans = -1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) {\n                ans = mid;\n                break;\n            } else if (nums[mid] < target) {\n                left = mid + 1;\n            } else {\n                right = mid - 1;\n            }\n        }\n        System.out.println(ans);\n    }\n}");
        binarySearch.setStarterCodePython("import sys\n\ndef main():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:n+1]]\n    target = int(lines[n+1])\n    \n    left, right = 0, n - 1\n    ans = -1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            ans = mid\n            break\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    print(ans)\n\nif __name__ == '__main__':\n    main()");
        binarySearch.setStarterCodeCpp("#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    int target;\n    cin >> target;\n    \n    int left = 0, right = n - 1, ans = -1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (nums[mid] == target) { ans = mid; break; }\n        else if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    cout << ans << endl;\n    return 0;\n}");
        binarySearch.setStarterCodeC("#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int nums[10000];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &nums[i]);\n    int target;\n    scanf(\"%d\", &target);\n    int left = 0, right = n - 1, ans = -1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (nums[mid] == target) { ans = mid; break; }\n        else if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    printf(\"%d\\n\", ans);\n    return 0;\n}");
        binarySearch.setHiddenTestCasesJson("[{\"input\":\"6\\n-1 0 3 5 9 12\\n9\", \"expectedOutput\":\"4\"}, {\"input\":\"6\\n-1 0 3 5 9 12\\n2\", \"expectedOutput\":\"-1\"}, {\"input\":\"1\\n5\\n5\", \"expectedOutput\":\"0\"}]");
        binarySearch.setHintsJson("[\"Hint 1: Since the array is already sorted, you can divide the search interval in half with each comparison.\", \"Hint 2: Beware of integer overflow in other languages when calculating mid: use mid = left + (right - left) / 2.\"]");
        problems.add(binarySearch);

        // 3. Valid Parentheses
        Problem validParentheses = new Problem();
        validParentheses.setTitle("Valid Parentheses");
        validParentheses.setSlug("valid-parentheses");
        validParentheses.setDifficulty("EASY");
        validParentheses.setTopic("Arrays & Strings");
        validParentheses.setDescription("Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.");
        validParentheses.setConstraints("1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.");
        validParentheses.setExamples("Input: s = \"()[]{}\"\nOutput: true\n\nInput: s = \"(]\"\nOutput: false");
        validParentheses.setStarterCodeJava("import java.util.Scanner;\nimport java.util.Stack;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNext()) return;\n        String s = sc.next();\n        \n        Stack<Character> stack = new Stack<>();\n        boolean valid = true;\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) {\n                valid = false;\n                break;\n            }\n        }\n        if (!stack.isEmpty()) valid = false;\n        System.out.println(valid ? \"true\" : \"false\");\n    }\n}");
        validParentheses.setStarterCodePython("import sys\n\ndef main():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    s = lines[0]\n    mapping = {')': '(', '}': '{', ']': '['}\n    stack = []\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                print(\"false\")\n                return\n        else:\n            stack.append(char)\n    print(\"true\" if not stack else \"false\")\n\nif __name__ == '__main__':\n    main()");
        validParentheses.setStarterCodeCpp("#include <iostream>\n#include <string>\n#include <stack>\nusing namespace std;\n\nint main() {\n    string s;\n    if (!(cin >> s)) return 0;\n    stack<char> st;\n    for (char c : s) {\n        if (c == '(') st.push(')');\n        else if (c == '{') st.push('}');\n        else if (c == '[') st.push(']');\n        else if (st.empty() || st.top() != c) {\n            cout << \"false\" << endl;\n            return 0;\n        } else {\n            st.pop();\n        }\n    }\n    cout << (st.empty() ? \"true\" : \"false\") << endl;\n    return 0;\n}");
        validParentheses.setStarterCodeC("#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[10005];\n    if (scanf(\"%s\", s) != 1) return 0;\n    char stack[10005];\n    int top = -1;\n    int len = strlen(s);\n    for (int i = 0; i < len; i++) {\n        char c = s[i];\n        if (c == '(' || c == '{' || c == '[') stack[++top] = c;\n        else {\n            if (top == -1) { printf(\"false\\n\"); return 0; }\n            char open = stack[top--];\n            if ((c == ')' && open != '(') || (c == '}' && open != '{') || (c == ']' && open != '[')) {\n                printf(\"false\\n\"); return 0;\n            }\n        }\n    }\n    printf(\"%s\\n\", top == -1 ? \"true\" : \"false\");\n    return 0;\n}");
        validParentheses.setHiddenTestCasesJson("[{\"input\":\"()[]{}\", \"expectedOutput\":\"true\"}, {\"input\":\"(]\", \"expectedOutput\":\"false\"}, {\"input\":\"([)]\", \"expectedOutput\":\"false\"}, {\"input\":\"{[]}\", \"expectedOutput\":\"true\"}]");
        validParentheses.setHintsJson("[\"Hint 1: Use a stack! Last-in, first-out matches the nested nature of parentheses.\", \"Hint 2: Push matching expected closing brackets to the stack as you see opening brackets to simplify the comparison.\"]");
        problems.add(validParentheses);

        // 4. Maximum Subarray (Kadane's)
        Problem maxSubarray = new Problem();
        maxSubarray.setTitle("Maximum Subarray");
        maxSubarray.setSlug("maximum-subarray");
        maxSubarray.setDifficulty("MEDIUM");
        maxSubarray.setTopic("Dynamic Programming");
        maxSubarray.setDescription("Given an integer array `nums`, find the subarray with the largest sum, and return its sum.");
        maxSubarray.setConstraints("1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4");
        maxSubarray.setExamples("Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum 6.");
        maxSubarray.setStarterCodeJava("import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        \n        int currentSum = nums[0];\n        int maxSum = nums[0];\n        for (int i = 1; i < n; i++) {\n            currentSum = Math.max(nums[i], currentSum + nums[i]);\n            maxSum = Math.max(maxSum, currentSum);\n        }\n        System.out.println(maxSum);\n    }\n}");
        maxSubarray.setStarterCodePython("import sys\n\ndef main():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:n+1]]\n    cur = mx = nums[0]\n    for x in nums[1:]:\n        cur = max(x, cur + x)\n        mx = max(mx, cur)\n    print(mx)\n\nif __name__ == '__main__':\n    main()");
        maxSubarray.setStarterCodeCpp("#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    int cur = nums[0], mx = nums[0];\n    for (int i = 1; i < n; i++) {\n        cur = max(nums[i], cur + nums[i]);\n        mx = max(mx, cur);\n    }\n    cout << mx << endl;\n    return 0;\n}");
        maxSubarray.setStarterCodeC("#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int nums[100005];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &nums[i]);\n    int cur = nums[0], mx = nums[0];\n    for (int i = 1; i < n; i++) {\n        cur = (nums[i] > cur + nums[i]) ? nums[i] : cur + nums[i];\n        if (cur > mx) mx = cur;\n    }\n    printf(\"%d\\n\", mx);\n    return 0;\n}");
        maxSubarray.setHiddenTestCasesJson("[{\"input\":\"9\\n-2 1 -3 4 -1 2 1 -5 4\", \"expectedOutput\":\"6\"}, {\"input\":\"1\\n1\", \"expectedOutput\":\"1\"}, {\"input\":\"5\\n5 4 -1 7 8\", \"expectedOutput\":\"23\"}]");
        maxSubarray.setHintsJson("[\"Hint 1: Kadane's algorithm computes the maximum subarray sum in O(n) time and O(1) space.\", \"Hint 2: At each element, decide whether to append it to the current subarray or start a new subarray at this element.\"]");
        problems.add(maxSubarray);

        // 5. Climbing Stairs
        Problem climbingStairs = new Problem();
        climbingStairs.setTitle("Climbing Stairs");
        climbingStairs.setSlug("climbing-stairs");
        climbingStairs.setDifficulty("EASY");
        climbingStairs.setTopic("Dynamic Programming");
        climbingStairs.setDescription("You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?");
        climbingStairs.setConstraints("1 <= n <= 45");
        climbingStairs.setExamples("Input: n = 2\nOutput: 2\nExplanation: There are two ways to climb to the top:\n1. 1 step + 1 step\n2. 2 steps");
        climbingStairs.setStarterCodeJava("import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        if (n <= 2) {\n            System.out.println(n);\n            return;\n        }\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; i++) {\n            int temp = a + b;\n            a = b;\n            b = temp;\n        }\n        System.out.println(b);\n    }\n}");
        climbingStairs.setStarterCodePython("import sys\n\ndef main():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    if n <= 2:\n        print(n)\n        return\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    print(b)\n\nif __name__ == '__main__':\n    main()");
        climbingStairs.setStarterCodeCpp("#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    if (n <= 2) { cout << n << endl; return 0; }\n    int a = 1, b = 2;\n    for (int i = 3; i <= n; i++) {\n        int temp = a + b;\n        a = b;\n        b = temp;\n    }\n    cout << b << endl;\n    return 0;\n}");
        climbingStairs.setStarterCodeC("#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    if (n <= 2) { printf(\"%d\\n\", n); return 0; }\n    int a = 1, b = 2;\n    for (int i = 3; i <= n; i++) {\n        int temp = a + b;\n        a = b;\n        b = temp;\n    }\n    printf(\"%d\\n\", b);\n    return 0;\n}");
        climbingStairs.setHiddenTestCasesJson("[{\"input\":\"2\", \"expectedOutput\":\"2\"}, {\"input\":\"3\", \"expectedOutput\":\"3\"}, {\"input\":\"4\", \"expectedOutput\":\"5\"}, {\"input\":\"5\", \"expectedOutput\":\"8\"}]");
        climbingStairs.setHintsJson("[\"Hint 1: To reach step n, you could have either come from step n-1 or step n-2.\", \"Hint 2: Notice that ways(n) = ways(n-1) + ways(n-2), exactly like the Fibonacci sequence!\"]");
        problems.add(climbingStairs);

        problemRepository.saveAll(problems);
        logger.info("Successfully seeded {} curated DSA problems.", problems.size());
    }
}
