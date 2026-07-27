import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Play, Pause, SkipForward, RotateCcw, MousePointer2, Flag, Target, Weight, Sun, Moon, FileCode, Info, Copy, Check, Maximize2, Minimize2 } from "lucide-react";

const defaultRows = 15;
const defaultCols = 25;

type CellType = "empty" | "wall" | "start" | "end" | "visited" | "path" | "current";
type Algorithm = "bfs" | "dfs" | "dijkstra" | "astar";
type PlaceMode = "wall" | "start" | "end" | "weight";
type Step = { row: number; col: number; type: "visited" | "path" | "current"; explanation: string };

const createGrid = (rows: number, cols: number): CellType[][] =>
  Array.from({ length: rows }, () => Array(cols).fill("empty"));

const createWeights = (rows: number, cols: number): number[][] =>
  Array.from({ length: rows }, () => Array(cols).fill(1));

const directions = [
  [-1, 0, "up"],
  [1, 0, "down"],
  [0, -1, "left"],
  [0, 1, "right"],
] as const;

// Min-heap for Dijkstra/A*
class MinHeap {
  data: { r: number; c: number; cost: number }[] = [];
  push(item: { r: number; c: number; cost: number }) {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) { this.data[0] = last; this._sinkDown(0); }
    return top;
  }
  get length() { return this.data.length; }
  _bubbleUp(i: number) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.data[p].cost <= this.data[i].cost) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  _sinkDown(i: number) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.data[l].cost < this.data[smallest].cost) smallest = l;
      if (r < n && this.data[r].cost < this.data[smallest].cost) smallest = r;
      if (smallest === i) break;
      [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
      i = smallest;
    }
  }
}

function heuristic(r: number, c: number, er: number, ec: number) {
  return Math.abs(r - er) + Math.abs(c - ec);
}

function generateSteps(
  grid: CellType[][],
  weights: number[][],
  start: [number, number],
  end: [number, number],
  algo: Algorithm,
  rows: number,
  cols: number
): Step[] {
  const steps: Step[] = [];
  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const key = (r: number, c: number) => `${r},${c}`;
  const algoName = ({ bfs: "BFS", dfs: "DFS", dijkstra: "Dijkstra", astar: "A*" } as const)[algo];

  if (algo === "bfs") {
    const queue: [number, number][] = [start];
    visited.add(key(start[0], start[1]));
    steps.push({ row: start[0], col: start[1], type: "current", explanation: `BFS starts at (${start[0]}, ${start[1]}). Adding to queue.` });
    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      steps.push({ row: r, col: c, type: "current", explanation: `Dequeue (${r}, ${c}). Exploring neighbors.` });
      if (r === end[0] && c === end[1]) { steps.push({ row: r, col: c, type: "current", explanation: `🎉 Found target!` }); break; }
      steps.push({ row: r, col: c, type: "visited", explanation: `Mark (${r}, ${c}) visited.` });
      for (const [dr, dc, dir] of directions) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(key(nr, nc)) && grid[nr][nc] !== "wall") {
          visited.add(key(nr, nc)); parent.set(key(nr, nc), key(r, c)); queue.push([nr, nc]);
          steps.push({ row: nr, col: nc, type: "visited", explanation: `Enqueue (${nr}, ${nc}) going ${dir}.` });
        }
      }
    }
  } else if (algo === "dfs") {
    const stack: [number, number][] = [start];
    steps.push({ row: start[0], col: start[1], type: "current", explanation: `DFS starts at (${start[0]}, ${start[1]}).` });
    while (stack.length > 0) {
      const [r, c] = stack.pop()!;
      if (visited.has(key(r, c))) continue;
      visited.add(key(r, c));
      steps.push({ row: r, col: c, type: "current", explanation: `Pop (${r}, ${c}) from stack.` });
      if (r === end[0] && c === end[1]) { steps.push({ row: r, col: c, type: "current", explanation: `🎉 Found target!` }); break; }
      steps.push({ row: r, col: c, type: "visited", explanation: `Mark (${r}, ${c}) visited.` });
      for (const [dr, dc, dir] of directions) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(key(nr, nc)) && grid[nr][nc] !== "wall") {
          parent.set(key(nr, nc), key(r, c)); stack.push([nr, nc]);
          steps.push({ row: nr, col: nc, type: "visited", explanation: `Push (${nr}, ${nc}) going ${dir}.` });
        }
      }
    }
  } else {
    // Dijkstra or A*
    const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    dist[start[0]][start[1]] = 0;
    const heap = new MinHeap();
    const isAStar = algo === "astar";
    const h = isAStar ? (r: number, c: number) => heuristic(r, c, end[0], end[1]) : () => 0;
    heap.push({ r: start[0], c: start[1], cost: h(start[0], start[1]) });
    steps.push({ row: start[0], col: start[1], type: "current", explanation: `${algoName} starts at (${start[0]}, ${start[1]}) with cost 0.` });

    while (heap.length > 0) {
      const { r, c } = heap.pop()!;
      if (visited.has(key(r, c))) continue;
      visited.add(key(r, c));
      steps.push({ row: r, col: c, type: "current", explanation: `${algoName}: Visit (${r}, ${c}), dist=${dist[r][c]}${isAStar ? `, f=${dist[r][c] + h(r, c)}` : ""}.` });
      if (r === end[0] && c === end[1]) { steps.push({ row: r, col: c, type: "current", explanation: `🎉 Found target! Total cost: ${dist[r][c]}.` }); break; }
      steps.push({ row: r, col: c, type: "visited", explanation: `Mark (${r}, ${c}) settled.` });

      for (const [dr, dc, dir] of directions) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(key(nr, nc)) && grid[nr][nc] !== "wall") {
          const newDist = dist[r][c] + weights[nr][nc];
          if (newDist < dist[nr][nc]) {
            dist[nr][nc] = newDist;
            parent.set(key(nr, nc), key(r, c));
            heap.push({ r: nr, c: nc, cost: newDist + h(nr, nc) });
            steps.push({ row: nr, col: nc, type: "visited", explanation: `Relax (${nr}, ${nc}) ${dir}, new dist=${newDist}, weight=${weights[nr][nc]}${isAStar ? `, h=${h(nr, nc)}` : ""}.` });
          }
        }
      }
    }
  }

  // Trace path
  const endKey = key(end[0], end[1]);
  if (visited.has(endKey)) {
    const path: [number, number][] = [];
    let curr: string | undefined = endKey;
    while (curr) { const [r, c] = curr.split(",").map(Number); path.unshift([r, c]); curr = parent.get(curr); }
    for (const [r, c] of path) steps.push({ row: r, col: c, type: "path", explanation: `Path through (${r}, ${c}).` });
  } else {
    steps.push({ row: end[0], col: end[1], type: "current", explanation: "❌ No path found to the target!" });
  }
  return steps;
}

const cellColors: Record<CellType, string> = {
  empty: "bg-muted/40", wall: "bg-foreground/80", start: "bg-primary", end: "bg-destructive",
  visited: "bg-primary/30", path: "bg-primary/70", current: "bg-accent",
};

const algoDescriptions: Record<Algorithm, { summary: string; ds: string }> = {
  bfs: { summary: "Breadth-First Search explores level by level using a queue. Guarantees shortest path in unweighted graphs. O(V+E) time.", ds: "Queue (FIFO) — first in, first out." },
  dfs: { summary: "Depth-First Search dives deep along each branch using a stack. Doesn't guarantee shortest path. O(V+E) time.", ds: "Stack (LIFO) — last in, first out." },
  dijkstra: { summary: "Dijkstra's algorithm finds shortest path in weighted graphs using a priority queue. Considers edge weights to always expand the cheapest node first. O((V+E)log V) time.", ds: "Min-Heap / Priority Queue — lowest cost node expanded first." },
  astar: { summary: "A* combines Dijkstra with a heuristic (Manhattan distance). It prioritizes nodes closer to the goal, making it faster than Dijkstra while still optimal with an admissible heuristic. O((V+E)log V) time.", ds: "Min-Heap with f(n) = g(n) + h(n). g = cost so far, h = heuristic estimate." },
};

const JAVA_CODE: Record<Algorithm, string> = {
  bfs: `/**
 * Breadth-First Search (BFS)
 * Logic: Explores neighbors layer by layer
 */
public void bfs(int[][] grid, int[] start, int[] end) {
    Queue<int[]> queue = new LinkedList<>();
    queue.add(start);
    
    Map<String, String> parent = new HashMap<>();
    Set<String> visited = new HashSet<>();
    visited.add(start[0] + "," + start[1]);

    while (!queue.isEmpty()) {
        int[] curr = queue.poll();
        if (curr[0] == end[0] && curr[1] == end[1]) break;

        for (int[] d : DIRECTIONS) {
            int nr = curr[0] + d[0], nc = curr[1] + d[1];
            String key = nr + "," + nc;
            if (isValid(nr, nc) && grid[nr][nc] != 1 && !visited.contains(key)) {
                visited.add(key);
                parent.put(key, curr[0] + "," + curr[1]);
                queue.add(new int[]{nr, nc});
            }
        }
    }
}`,
  dfs: `/**
 * Depth-First Search (DFS)
 * Logic: Explores deep into branches first
 */
public void dfs(int[][] grid, int[] start, int[] end) {
    Stack<int[]> stack = new Stack<>();
    stack.push(start);
    Set<String> visited = new HashSet<>();

    while (!stack.isEmpty()) {
        int[] curr = stack.pop();
        if (visited.contains(curr[0] + "," + curr[1])) continue;
        visited.add(curr[0] + "," + curr[1]);
        
        if (curr[0] == end[0] && curr[1] == end[1]) break;

        for (int[] d : DIRECTIONS) {
            int nr = curr[0] + d[0], nc = curr[1] + d[1];
            if (isValid(nr, nc) && grid[nr][nc] != 1) {
                stack.push(new int[]{nr, nc});
            }
        }
    }
}`,
  dijkstra: `/**
 * Dijkstra's Algorithm
 * Logic: Finds shortest path in weighted graphs
 */
public void dijkstra(int[][] grid, int[][] weights, int[] start, int[] end) {
    PriorityQueue<Node> pq = new PriorityQueue<>((a, b) -> a.dist - b.dist);
    pq.add(new Node(start[0], start[1], 0));
    dist[start[0]][start[1]] = 0;

    while (!pq.isEmpty()) {
        Node curr = pq.poll();
        if (curr.dist > dist[curr.r][curr.c]) continue;
        if (curr.r == end[0] && curr.c == end[1]) break;

        for (int[] d : DIRECTIONS) {
            int nr = curr.r + d[0], nc = curr.c + d[1];
            if (isValid(nr, nc) && grid[nr][nc] != 1) {
                int newDist = dist[curr.r][curr.c] + weights[nr][nc];
                if (newDist < dist[nr][nc]) {
                    dist[nr][nc] = newDist;
                    pq.add(new Node(nr, nc, newDist));
                }
            }
        }
    }
}`,
  astar: `/**
 * A* Search Algorithm
 * Logic: Dijkstra + Manhattan distance heuristic
 */
public void astar(int[][] grid, int[] start, int[] end) {
    PriorityQueue<Node> pq = new PriorityQueue<>((a, b) -> a.f - b.f);
    pq.add(new Node(start[0], start[1], 0, heuristic(start, end)));

    while (!pq.isEmpty()) {
        Node curr = pq.poll();
        if (curr.r == end[0] && curr.c == end[1]) break;

        for (int[] d : DIRECTIONS) {
            int nr = curr.r + d[0], nc = curr.c + d[1];
            if (isValid(nr, nc) && grid[nr][nc] != 1) {
                int g = dist[curr.r][curr.c] + 1;
                int h = Math.abs(nr - end[0]) + Math.abs(nc - end[1]);
                if (g < dist[nr][nc]) {
                    dist[nr][nc] = g;
                    pq.add(new Node(nr, nc, g, g + h));
                }
            }
        }
    }
}`
};

const Visualizer = () => {
  const navigate = useNavigate();
  const [gridRows, setGridRows] = useState(defaultRows);
  const [gridCols, setGridCols] = useState(defaultCols);

  const [grid, setGrid] = useState(() => createGrid(defaultRows, defaultCols));
  const [weights, setWeights] = useState(() => createWeights(defaultRows, defaultCols));
  const [startPos, setStartPos] = useState<[number, number]>([7, 3]);
  const [endPos, setEndPos] = useState<[number, number]>([7, 21]);
  const [algorithm, setAlgorithm] = useState<Algorithm>("bfs");
  const [placeMode, setPlaceMode] = useState<PlaceMode>("wall");
  const [speed, setSpeed] = useState([50]);
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [explanation, setExplanation] = useState("Place walls or weights on the grid, then hit Play.");
  const [activeTab, setActiveTab] = useState<"explanation" | "code">("explanation");
  const [isCopied, setIsCopied] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [displayGrid, setDisplayGrid] = useState(() => createGrid(defaultRows, defaultCols));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as 'light' | 'dark';
      if (saved) return saved;
      // Default to dark as per index.html
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const g = createGrid(gridRows, gridCols);
    // Ensure start/end are in bounds
    const sr = Math.min(startPos[0], gridRows - 1);
    const sc = Math.min(startPos[1], gridCols - 1);
    const er = Math.min(endPos[0], gridRows - 1);
    const ec = Math.min(endPos[1], gridCols - 1);

    setStartPos([sr, sc]);
    setEndPos([er, ec]);

    g[sr][sc] = "start";
    g[er][ec] = "end";
    setGrid(g);
    setDisplayGrid(g.map(r => [...r]));
    setWeights(createWeights(gridRows, gridCols));
  }, [gridRows, gridCols]);

  const handleCellInteraction = useCallback((r: number, c: number) => {
    if (isRunning) return;
    if (placeMode === "weight") {
      setWeights(prev => {
        const w = prev.map(row => [...row]);
        if (grid[r][c] === "start" || grid[r][c] === "end" || grid[r][c] === "wall") return prev;
        w[r][c] = w[r][c] >= 9 ? 1 : w[r][c] + 2; // cycle 1 → 3 → 5 → 7 → 9 → 1
        return w;
      });
      return;
    }
    setGrid(prev => {
      const g = prev.map(row => [...row]);
      if (placeMode === "start") {
        g[startPos[0]][startPos[1]] = "empty"; g[r][c] = "start"; setStartPos([r, c]);
      } else if (placeMode === "end") {
        g[endPos[0]][endPos[1]] = "empty"; g[r][c] = "end"; setEndPos([r, c]);
      } else {
        if (g[r][c] === "start" || g[r][c] === "end") return prev;
        g[r][c] = g[r][c] === "wall" ? "empty" : "wall";
        if (g[r][c] === "wall") setWeights(pw => { const w = pw.map(row => [...row]); w[r][c] = 1; return w; });
      }
      setDisplayGrid(g.map(row => [...row]));
      return g;
    });
  }, [isRunning, placeMode, startPos, endPos, grid]);

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsRunning(false); setStepIndex(0); setSteps([]);
    setExplanation("Grid reset. Place walls/weights and hit Play.");
    const g = createGrid(gridRows, gridCols);
    g[startPos[0]][startPos[1]] = "start"; g[endPos[0]][endPos[1]] = "end";
    grid.forEach((row, ri) => row.forEach((cell, ci) => {
      if (cell === "wall" && ri < gridRows && ci < gridCols) g[ri][ci] = "wall";
    }));
    setGrid(g); setDisplayGrid(g.map(r => [...r]));
  }, [startPos, endPos, grid, gridRows, gridCols]);

  const generateDFSMaze = () => {
    const newGrid = createGrid(gridRows, gridCols).map(row => row.fill("wall"));
    const stack: [number, number][] = [[1, 1]];
    newGrid[1][1] = "empty";

    while (stack.length > 0) {
      const [r, c] = stack[stack.length - 1];
      const neighbors: [number, number][] = [];
      const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]];

      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr > 0 && nr < gridRows - 1 && nc > 0 && nc < gridCols - 1 && newGrid[nr][nc] === "wall") {
          neighbors.push([nr, nc]);
        }
      }

      if (neighbors.length > 0) {
        const [nr, nc] = neighbors[Math.floor(Math.random() * neighbors.length)];
        newGrid[r + (nr - r) / 2][c + (nc - c) / 2] = "empty";
        newGrid[nr][nc] = "empty";
        stack.push([nr, nc]);
      } else {
        stack.pop();
      }
    }

    // Set start/end and update
    newGrid[startPos[0]][startPos[1]] = "start";
    newGrid[endPos[0]][endPos[1]] = "end";
    setGrid(newGrid);
    setDisplayGrid(newGrid.map(r => [...r]));
    setExplanation("DFS Recursive Backtracker Maze generated.");
  };

  const generateKruskalMaze = () => {
    const newGrid = createGrid(gridRows, gridCols).map(row => row.fill("wall"));
    const cells: [number, number][] = [];
    const sets: number[][] = Array.from({ length: gridRows }, () => Array(gridCols).fill(-1));
    let setCounter = 0;

    for (let r = 1; r < gridRows - 1; r += 2) {
      for (let c = 1; c < gridCols - 1; c += 2) {
        newGrid[r][c] = "empty";
        sets[r][c] = setCounter++;
        cells.push([r, c]);
      }
    }

    const find = (r: number, c: number) => {
      let currId = sets[r][c];
      return currId;
    };

    // Simplified Kruskal for maze
    const edges: [number, number, number, number][] = [];
    for (let r = 1; r < gridRows - 1; r += 2) {
      for (let c = 1; c < gridCols - 1; c += 2) {
        if (r + 2 < gridRows - 1) edges.push([r, c, r + 2, c]);
        if (c + 2 < gridCols - 1) edges.push([r, c, r, c + 2]);
      }
    }

    edges.sort(() => Math.random() - 0.5);

    const cellSets = new Array(setCounter).fill(0).map((_, i) => i);
    const getSet = (id: number): number => {
      if (cellSets[id] === id) return id;
      cellSets[id] = getSet(cellSets[id]);
      return cellSets[id];
    };

    for (const [r1, c1, r2, c2] of edges) {
      const set1 = getSet(sets[r1][c1]);
      const set2 = getSet(sets[r2][c2]);

      if (set1 !== set2) {
        newGrid[r1 + (r2 - r1) / 2][c1 + (c2 - c1) / 2] = "empty";
        cellSets[set1] = set2;
      }
    }

    newGrid[startPos[0]][startPos[1]] = "start";
    newGrid[endPos[0]][endPos[1]] = "end";
    setGrid(newGrid);
    setDisplayGrid(newGrid.map(r => [...r]));
    setExplanation("Kruskal's randomized algorithm maze generated.");
  };

  const clearAll = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsRunning(false); setStepIndex(0); setSteps([]);
    setExplanation("Place walls or weights on the grid, then hit Play.");
    const g = createGrid(gridRows, gridCols);
    const sp: [number, number] = [Math.floor(gridRows / 2), 3];
    const ep: [number, number] = [Math.floor(gridRows / 2), gridCols - 4];
    g[sp[0]][sp[1]] = "start"; g[ep[0]][ep[1]] = "end";
    setStartPos(sp); setEndPos(ep); setGrid(g); setDisplayGrid(g.map(r => [...r]));
    setWeights(createWeights(gridRows, gridCols));
  }, [gridRows, gridCols]);

  const runAlgorithm = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const cleanGrid = grid.map(row => row.map(c => (c === "visited" || c === "path" || c === "current") ? "empty" : c));
    cleanGrid[startPos[0]][startPos[1]] = "start"; cleanGrid[endPos[0]][endPos[1]] = "end";
    setGrid(cleanGrid);
    const generatedSteps = generateSteps(cleanGrid, weights, startPos, endPos, algorithm, gridRows, gridCols);
    setSteps(generatedSteps); setStepIndex(0); setIsRunning(true);
    setDisplayGrid(cleanGrid.map(r => [...r]));
  }, [grid, weights, startPos, endPos, algorithm, gridRows, gridCols]);

  useEffect(() => {
    if (!isRunning || stepIndex >= steps.length) {
      if (stepIndex >= steps.length && steps.length > 0) { setIsRunning(false); setExplanation(prev => prev + " — Complete!"); }
      return;
    }
    const delay = Math.max(10, 200 - speed[0] * 1.8);
    timeoutRef.current = setTimeout(() => {
      const step = steps[stepIndex];
      setDisplayGrid(prev => {
        const g = prev.map(r => [...r]);
        for (let r = 0; r < gridRows; r++) for (let c = 0; c < gridCols; c++) if (g[r][c] === "current") g[r][c] = "visited";
        if (g[step.row][step.col] !== "start" && g[step.row][step.col] !== "end") g[step.row][step.col] = step.type;
        return g;
      });
      setExplanation(step.explanation); setStepIndex(i => i + 1);
    }, delay);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [isRunning, stepIndex, steps, speed, gridRows, gridCols]);

  const stepForward = useCallback(() => {
    if (stepIndex >= steps.length) return;
    const step = steps[stepIndex];
    setDisplayGrid(prev => {
      const g = prev.map(r => [...r]);
      for (let r = 0; r < gridRows; r++) for (let c = 0; c < gridCols; c++) if (g[r][c] === "current") g[r][c] = "visited";
      if (g[step.row][step.col] !== "start" && g[step.row][step.col] !== "end") g[step.row][step.col] = step.type;
      return g;
    });
    setExplanation(step.explanation); setStepIndex(i => i + 1);
  }, [stepIndex, steps, gridRows, gridCols]);

  const togglePause = () => setIsRunning(prev => !prev);
  const algos: Algorithm[] = ["bfs", "dfs", "dijkstra", "astar"];
  const algoLabels: Record<Algorithm, string> = { bfs: "BFS", dfs: "DFS", dijkstra: "Dijkstra", astar: "A*" };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <nav className="flex items-center gap-4 px-6 py-4 max-w-7xl mx-auto border-b border-border/30">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="bg-background/50 hover:bg-accent hover:text-accent-foreground transition-all">
          <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
        </Button>
        <h1 className="text-xl font-display font-bold text-gradient">Pathfinding Visualizer</h1>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full w-9 h-9 border-border/50 bg-background/50 hover:bg-accent/20 transition-all duration-300"
          >
            {theme === 'dark' ? (
              <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem] text-blue-400" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <div className="flex flex-wrap items-center gap-3">
            {/* Algorithm toggle */}
            <div className="flex rounded-lg overflow-hidden border border-border/50 bg-background/30">
              {algos.map(a => (
                <button key={a} onClick={() => setAlgorithm(a)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${algorithm === a ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                  {algoLabels[a]}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-border/50" />

            {/* Place mode */}
            <div className="flex gap-1 flex-wrap">
              <Button variant={placeMode === "wall" ? "default" : "outline"} size="sm" onClick={() => setPlaceMode("wall")}>
                <MousePointer2 className="h-3 w-3 mr-1" /> Walls
              </Button>
              <Button variant={placeMode === "weight" ? "default" : "outline"} size="sm" onClick={() => setPlaceMode("weight")}>
                <Weight className="h-3 w-3 mr-1" /> Weights
              </Button>
              <Button variant={placeMode === "start" ? "default" : "outline"} size="sm" onClick={() => setPlaceMode("start")}>
                <Flag className="h-3 w-3 mr-1" /> Start
              </Button>
              <Button variant={placeMode === "end" ? "default" : "outline"} size="sm" onClick={() => setPlaceMode("end")}>
                <Target className="h-3 w-3 mr-1" /> End
              </Button>
            </div>

            <div className="h-6 w-px bg-border/50" />

            <Button size="sm" onClick={steps.length === 0 ? runAlgorithm : togglePause} className="gap-1">
              {steps.length === 0 ? <><Play className="h-3 w-3" /> Play</> :
                isRunning ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Resume</>}
            </Button>
            <Button variant="outline" size="sm" onClick={stepForward} disabled={stepIndex >= steps.length && steps.length > 0}>
              <SkipForward className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="h-3 w-3 mr-1" /> Reset</Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>Clear All</Button>

            <div className="h-6 w-px bg-border/50" />

            <div className="flex gap-1 flex-wrap">
              <Button variant="secondary" size="sm" onClick={generateDFSMaze}>DFS Maze</Button>
              <Button variant="secondary" size="sm" onClick={generateKruskalMaze}>Kruskal Maze</Button>
            </div>

            <div className="h-6 w-px bg-border/50" />

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">Grid Size</span>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] w-4">R:</span>
                    <Slider value={[gridRows]} onValueChange={([v]) => setGridRows(v)} min={5} max={25} step={2} className="w-20" />
                    <span className="text-[9px] w-4">{gridRows}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] w-4">C:</span>
                    <Slider value={[gridCols]} onValueChange={([v]) => setGridCols(v)} min={5} max={45} step={2} className="w-20" />
                    <span className="text-[9px] w-4">{gridCols}</span>
                  </div>
                </div>
              </div>

              <div className="h-6 w-px bg-border/50" />

              <div className="flex items-center gap-2 min-w-[100px]">
                <span className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">Speed</span>
                <Slider value={speed} onValueChange={setSpeed} min={1} max={100} step={1} className="w-20" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-4 overflow-auto scrollbar-hide">
            <div className="grid gap-px mx-auto w-fit select-none" style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
              onMouseLeave={() => setIsMouseDown(false)}>
              {displayGrid.map((row, ri) =>
                row.map((cell, ci) => (
                  <div key={`${ri}-${ci}`}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-sm transition-colors duration-150 cursor-pointer relative ${cellColors[cell]} ${cell === "current" ? "ring-2 ring-accent" : ""}`}
                    onMouseDown={() => { setIsMouseDown(true); handleCellInteraction(ri, ci); }}
                    onMouseEnter={() => { if (isMouseDown && (placeMode === "wall" || placeMode === "weight")) handleCellInteraction(ri, ci); }}
                    onMouseUp={() => setIsMouseDown(false)}>
                    {weights[ri][ci] > 1 && cell !== "wall" && cell !== "start" && cell !== "end" && (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground/60">{weights[ri][ci]}</span>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-4 justify-center text-xs text-muted-foreground">
              {([["Start", "bg-primary"], ["End", "bg-destructive"], ["Wall", "bg-foreground/80"], ["Visited", "bg-primary/30"], ["Path", "bg-primary/70"], ["Current", "bg-accent"]] as const).map(([label, color]) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-sm ${color}`} /> {label}
                </span>
              ))}
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-muted/30 border border-border/50 text-[7px] flex items-center justify-center font-bold text-foreground/60">5</span> Weight
              </span>
            </div>
          </motion.div>

          {/* Backdrop for Maximized Mode */}
          {isMaximized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMaximized(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] cursor-zoom-out"
            />
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              width: isMaximized ? "80%" : "100%",
              maxWidth: isMaximized ? "1200px" : "320px",
              height: isMaximized ? "80vh" : "600px",
              position: isMaximized ? "fixed" : "relative" as any,
              top: isMaximized ? "50%" : "auto",
              left: isMaximized ? "50%" : "auto",
              x: isMaximized ? "-50%" : "0%",
              y: isMaximized ? "-50%" : "0%",
              zIndex: isMaximized ? 100 : 1,
            }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`glass rounded-3xl p-6 flex flex-col shadow-2xl ${isMaximized ? "border-primary/20 bg-background/95 backdrop-blur-2xl" : "lg:h-auto border-white/5"}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex bg-background/30 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("explanation")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${activeTab === 'explanation' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Info className="h-4 w-4" /> Steps
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${activeTab === 'code' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <FileCode className="h-4 w-4" /> Java Code
                </button>
              </div>
              <div className="flex items-center gap-1">
                {activeTab === "code" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(JAVA_CODE[algorithm]);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                  >
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMaximized(!isMaximized)}
                >
                  {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              {activeTab === "explanation" ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-sm text-foreground leading-relaxed font-medium">{explanation}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20 px-2 py-1 rounded">
                      Step {Math.min(stepIndex, steps.length)} / {steps.length}
                    </div>
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {algoLabels[algorithm]} Summary
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed pl-3.5 border-l border-border/50 ml-0.5">
                        {algoDescriptions[algorithm].summary}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        Key Data Structure
                      </h4>
                      <p className="text-xs text-muted-foreground pl-3.5 border-l border-border/50 ml-0.5">
                        {algoDescriptions[algorithm].ds}
                      </p>
                    </div>
                    {(algorithm === "dijkstra" || algorithm === "astar") && (
                      <div className="p-3 rounded-lg bg-accent/5 border border-accent/10 mt-4">
                        <p className="text-[11px] text-foreground/80 italic leading-relaxed">
                          <strong>Pro Tip:</strong> Use Weights to add costs (2-9). {algorithm === "astar" ? "Notice how A* stays focused on the target!" : "Dijkstra will find the cheapest path even if it takes more steps."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative group h-full h-min-content">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                  <pre className="relative p-4 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] leading-relaxed text-blue-100/90 overflow-x-auto h-min-content">
                    <code className="block">
                      {JAVA_CODE[algorithm].split('\n').map((line, i) => (
                        <div key={i} className="flex gap-4">
                          <span className="text-muted-foreground/30 w-4 text-right select-none">{i + 1}</span>
                          <span className="whitespace-pre">{line}</span>
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Visualizer;
