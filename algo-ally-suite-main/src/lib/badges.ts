export interface BadgeDefinition {
  key: string;
  name: string;
  emoji: string;
  description: string;
  check: (stats: BadgeStats) => boolean;
}

export interface BadgeStats {
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  totalTasksCompleted: number;
  leetcodeTotal: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { key: "first_task", name: "First Step", emoji: "🌱", description: "Complete your first task", check: (s) => s.totalTasksCompleted >= 1 },
  { key: "ten_tasks", name: "Grinder", emoji: "⚡", description: "Complete 10 tasks", check: (s) => s.totalTasksCompleted >= 10 },
  { key: "fifty_tasks", name: "Machine", emoji: "🤖", description: "Complete 50 tasks", check: (s) => s.totalTasksCompleted >= 50 },
  { key: "streak_3", name: "On Fire", emoji: "🔥", description: "3-day streak", check: (s) => s.longestStreak >= 3 },
  { key: "streak_7", name: "Week Warrior", emoji: "⚔️", description: "7-day streak", check: (s) => s.longestStreak >= 7 },
  { key: "streak_30", name: "Unstoppable", emoji: "🏆", description: "30-day streak", check: (s) => s.longestStreak >= 30 },
  { key: "lc_50", name: "LeetCoder", emoji: "💻", description: "Solve 50 LeetCode problems", check: (s) => s.leetcodeTotal >= 50 },
  { key: "lc_200", name: "LC Master", emoji: "👑", description: "Solve 200 LeetCode problems", check: (s) => s.leetcodeTotal >= 200 },
  { key: "active_7", name: "Dedicated", emoji: "📚", description: "7 total active days", check: (s) => s.totalDaysActive >= 7 },
  { key: "active_30", name: "Committed", emoji: "💎", description: "30 total active days", check: (s) => s.totalDaysActive >= 30 },
];
