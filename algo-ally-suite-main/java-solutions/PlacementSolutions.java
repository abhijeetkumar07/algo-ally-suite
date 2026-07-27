import java.util.*;

/**
 * PlacementGPT - Java DSA Master Suite
 * Contains high-performance implementations for common technical interview
 * problems.
 */
public class PlacementSolutions {

    // --- ARRAYS & HASHING ---

    /**
     * Two Sum - O(n)
     */
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }

    // --- LINKED LIST ---

    public static class ListNode {
        int val;
        ListNode next;

        ListNode(int x) {
            val = x;
        }
    }

    /**
     * Reverse Linked List - O(n)
     */
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }

    // --- STACKS ---

    /**
     * Valid Parentheses - O(n)
     */
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(')
                stack.push(')');
            else if (c == '{')
                stack.push('}');
            else if (c == '[')
                stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c)
                return false;
        }
        return stack.isEmpty();
    }

    // --- DESIGN ---

    /**
     * LRU Cache Implementation
     */
    class LRUCache {
        class Node {
            int key, value;
            Node prev, next;
        }

        private Map<Integer, Node> cache = new HashMap<>();
        private int size, capacity;
        private Node head, tail;

        public LRUCache(int capacity) {
            this.capacity = capacity;
            head = new Node();
            tail = new Node();
            head.next = tail;
            tail.prev = head;
        }

        public int get(int key) {
            Node node = cache.get(key);
            if (node == null)
                return -1;
            moveToHead(node);
            return node.value;
        }

        public void put(int key, int value) {
            Node node = cache.get(key);
            if (node == null) {
                Node newNode = new Node();
                newNode.key = key;
                newNode.value = value;
                cache.put(key, newNode);
                addNode(newNode);
                if (++size > capacity) {
                    Node tail = popTail();
                    cache.remove(tail.key);
                    --size;
                }
            } else {
                node.value = value;
                moveToHead(node);
            }
        }

        private void addNode(Node node) {
            node.prev = head;
            node.next = head.next;
            head.next.prev = node;
            head.next = node;
        }

        private void removeNode(Node node) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }

        private void moveToHead(Node node) {
            removeNode(node);
            addNode(node);
        }

        private Node popTail() {
            Node res = tail.prev;
            removeNode(res);
            return res;
        }
    }

    // --- DYNAMIC PROGRAMMING ---

    /**
     * Coin Change - O(amount * n)
     */
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (i >= coin)
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}
