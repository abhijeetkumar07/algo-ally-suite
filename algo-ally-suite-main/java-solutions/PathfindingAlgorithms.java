import java.util.*;

/**
 * High-performance Java implementations of common pathfinding algorithms
 * as featured in the PlacementGPT Visualizer.
 * 
 * Time Complexities:
 * - BFS: O(V + E)
 * - DFS: O(V + E)
 * - Dijkstra: O((V + E) log V)
 * - A*: O((V + E) log V)
 */
public class PathfindingAlgorithms {

    private static final int[][] DIRECTIONS = { { -1, 0 }, { 1, 0 }, { 0, -1 }, { 0, 1 } };
    private static final int WALL = 1;

    public static class Node {
        int r, c, dist, f;
        Node parent;

        public Node(int r, int c, int dist) {
            this.r = r;
            this.c = c;
            this.dist = dist;
        }

        public Node(int r, int c, int dist, int f) {
            this(r, c, dist);
            this.f = f;
        }
    }

    /**
     * Breadth-First Search (BFS)
     */
    public List<int[]> bfs(int[][] grid, int[] start, int[] end) {
        int rows = grid.length, cols = grid[0].length;
        Queue<int[]> queue = new LinkedList<>();
        Map<String, int[]> parentMap = new HashMap<>();
        Set<String> visited = new HashSet<>();

        queue.add(start);
        visited.add(start[0] + "," + start[1]);

        while (!queue.isEmpty()) {
            int[] curr = queue.poll();
            if (curr[0] == end[0] && curr[1] == end[1])
                return reconstructPath(parentMap, end);

            for (int[] d : DIRECTIONS) {
                int nr = curr[0] + d[0], nc = curr[1] + d[1];
                String key = nr + "," + nc;
                if (isValid(nr, nc, rows, cols) && grid[nr][nc] != WALL && !visited.contains(key)) {
                    visited.add(key);
                    parentMap.put(key, curr);
                    queue.add(new int[] { nr, nc });
                }
            }
        }
        return Collections.emptyList();
    }

    /**
     * Dijkstra's Algorithm
     */
    public List<int[]> dijkstra(int[][] grid, int[][] weights, int[] start, int[] end) {
        int rows = grid.length, cols = grid[0].length;
        PriorityQueue<Node> pq = new PriorityQueue<>(Comparator.comparingInt(n -> n.dist));
        int[][] dists = new int[rows][cols];
        for (int[] row : dists)
            Arrays.fill(row, Integer.MAX_VALUE);

        Map<String, int[]> parentMap = new HashMap<>();
        dists[start[0]][start[1]] = 0;
        pq.add(new Node(start[0], start[1], 0));

        while (!pq.isEmpty()) {
            Node curr = pq.poll();
            if (curr.dist > dists[curr.r][curr.c])
                continue;
            if (curr.r == end[0] && curr.c == end[1])
                return reconstructPath(parentMap, end);

            for (int[] d : DIRECTIONS) {
                int nr = curr.r + d[0], nc = curr.c + d[1];
                if (isValid(nr, nc, rows, cols) && grid[nr][nc] != WALL) {
                    int newDist = dists[curr.r][curr.c] + weights[nr][nc];
                    if (newDist < dists[nr][nc]) {
                        dists[nr][nc] = newDist;
                        parentMap.put(nr + "," + nc, new int[] { curr.r, curr.c });
                        pq.add(new Node(nr, nc, newDist));
                    }
                }
            }
        }
        return Collections.emptyList();
    }

    private boolean isValid(int r, int c, int rows, int cols) {
        return r >= 0 && r < rows && c >= 0 && c < cols;
    }

    private List<int[]> reconstructPath(Map<String, int[]> parentMap, int[] end) {
        List<int[]> path = new ArrayList<>();
        int[] curr = end;
        while (curr != null) {
            path.add(0, curr);
            curr = parentMap.get(curr[0] + "," + curr[1]);
        }
        return path;
    }
}
