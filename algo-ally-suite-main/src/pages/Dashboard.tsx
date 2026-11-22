import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Code2, Target, TrendingUp, LogOut, BookOpen, Loader2,
  FileCode, ChevronRight, Sun, Moon, Flame, CheckCircle2,
  AlertTriangle, Bot, Sparkles, Route, Award, Calendar,
  BarChart2, Play, Users, Settings, UserCheck, RefreshCw,
  Bell, Info, ArrowRight, CheckSquare, Layers
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

// Modular Dashboard Components
import AiDsaTutorCard from "@/components/dashboard/AiDsaTutorCard";
import CodingJudgeCard from "@/components/dashboard/CodingJudgeCard";
import MockInterviewCard from "@/components/dashboard/MockInterviewCard";
import PersonalizedRoadmapCard from "@/components/dashboard/PersonalizedRoadmapCard";
import PlacementReadinessCard from "@/components/dashboard/PlacementReadinessCard";
import CodeReviewCard from "@/components/dashboard/CodeReviewCard";
import WeeklyPlanner from "@/components/dashboard/WeeklyPlanner";
import Logo from "@/components/brand/Logo";

interface Profile {
  id: number;
  fullName: string | null;
  college: string | null;
  degree: string | null;
  graduationYear: number | null;
  targetCompanyType: string | null;
  dsaLevel: string | null;
  preferredTechStack: string[] | null;
  leetcodeUsername: string | null;
  leetcodeEasy: number | null;
  leetcodeMedium: number | null;
  leetcodeHard: number | null;
  githubUsername: string | null;
  linkedinUsername: string | null;
  currentStreak?: number;
  longestStreak?: number;
  totalDaysActive?: number;
  lastActiveDate?: string | null;
}

// Data matching Image 6
const radarData = [
  { subject: "Arrays", value: 92, fullMark: 100 },
  { subject: "Strings", value: 88, fullMark: 100 },
  { subject: "Trees", value: 64, fullMark: 100 },
  { subject: "Graphs", value: 40, fullMark: 100 },
  { subject: "DP", value: 28, fullMark: 100 },
  { subject: "Linked Lists", value: 72, fullMark: 100 },
];

const weeklyActivityData = [
  { day: "Mon", solved: 18 },
  { day: "Tue", solved: 24 },
  { day: "Wed", solved: 20 },
  { day: "Thu", solved: 48 },
  { day: "Fri", solved: 22 },
  { day: "Sat", solved: 36 },
  { day: "Sun", solved: 28 },
];

export const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState<string>("overview");
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }
    loadProfile();
  }, [token]);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/profiles/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to load profile");
      const data = await response.json();
      setProfile(data);
    } catch (error: any) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" showText={false} />
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          <p className="text-slate-400 text-xs font-medium">Loading Algo Ally Pro...</p>
        </div>
      </div>
    );
  }

  // Values matching Image 6
  const totalSolved = profile?.leetcodeEasy !== undefined && profile?.leetcodeMedium !== undefined && profile?.leetcodeHard !== undefined
    ? ((profile.leetcodeEasy || 0) + (profile.leetcodeMedium || 0) + (profile.leetcodeHard || 0) || 426)
    : 426;
  const topicMastery = 62;
  const streakDays = profile?.currentStreak && profile.currentStreak > 0 ? profile.currentStreak : 21;
  const mockInterviewsCount = 3;
  const displayName = profile?.fullName || user?.email?.split("@")[0] || "Aarav Sharma";

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "roadmap", label: "DSA Roadmap", icon: Route },
    { id: "practice", label: "Practice", icon: Code2 },
    { id: "tutor", label: "AI Tutor", icon: Bot },
    { id: "review", label: "Code Review", icon: Sparkles },
    { id: "interview", label: "Mock Interview", icon: Users },
    { id: "visualizer", label: "Visualizer", icon: FileCode, action: () => navigate("/visualizer") },
    { id: "planner", label: "Study Planner", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#0B0914] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased transition-colors">
      {/* Left Sidebar Navigation matching Image 6 */}
      <aside className="w-full md:w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#120F24] p-4 flex flex-col justify-between shrink-0 shadow-sm z-20">
        <div>
          {/* Logo Header matching Image 5 & 6 */}
          <div className="px-2 py-3 mb-6">
            <Logo size="md" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) item.action();
                    else setActiveNav(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Pill at Bottom of Sidebar matching Image 6 */}
        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 mt-6">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-purple-600/20 shrink-0">
                {displayName[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[100px]">
                  {displayName}
                </div>
                <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                  Pro Plan
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Top Header Row matching Image 6 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeNav === "overview" && "Overview"}
              {activeNav === "roadmap" && "Adaptive DSA Roadmap"}
              {activeNav === "practice" && "Practice & Coding Judge"}
              {activeNav === "tutor" && "AI DSA Tutor"}
              {activeNav === "review" && "AI Code Review"}
              {activeNav === "interview" && "Mock Interview Simulator"}
              {activeNav === "planner" && "Weekly Study Planner"}
              {activeNav === "analytics" && "Placement Readiness"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Track your progress and get personalized recommendations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-purple-600 shadow-sm transition-colors"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  toast({
                    title: "Interview Reminder",
                    description: "Your mock interview on Graph Algorithms is scheduled."
                  });
                }}
                className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-purple-600 shadow-sm transition-colors relative"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-purple-600 ring-2 ring-white dark:ring-slate-900"></span>
              </button>
            </div>

            {/* Info Icon */}
            <button
              onClick={() => {
                toast({
                  title: "Algo Ally Pro System Status",
                  description: "Spring Boot, Sandboxed Judge, and AI Microservice are operational."
                });
              }}
              className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-purple-600 shadow-sm transition-colors"
              title="System Information"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* View Switcher based on Active Nav */}
        {activeNav === "overview" && (
          <div className="space-y-6">
            {/* 4 Stats Cards matching Image 6 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Problems Solved */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#120F24] p-4 flex items-center gap-3.5 shadow-sm">
                <div className="h-11 w-11 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                    {totalSolved}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Problems Solved
                  </div>
                </div>
              </div>

              {/* Card 2: Topic Mastery */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#120F24] p-4 flex items-center gap-3.5 shadow-sm">
                <div className="h-11 w-11 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                    {topicMastery}%
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Topic Mastery
                  </div>
                </div>
              </div>

              {/* Card 3: Current Streak */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#120F24] p-4 flex items-center gap-3.5 shadow-sm">
                <div className="h-11 w-11 rounded-2xl bg-orange-500/15 text-orange-500 flex items-center justify-center shrink-0">
                  <Flame className="h-5 w-5 fill-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                    {streakDays} Days
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Current Streak
                  </div>
                </div>
              </div>

              {/* Card 4: Mock Interviews */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#120F24] p-4 flex items-center gap-3.5 shadow-sm">
                <div className="h-11 w-11 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                    {mockInterviewsCount}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Mock Interviews
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row: Radar Chart for DSA Mastery + Weekly Activity Bar Chart matching Image 6 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Chart: DSA Mastery Radar Chart */}
              <div className="lg:col-span-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#120F24] p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    DSA Mastery
                  </h3>
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                    6 Core Dimensions
                  </span>
                </div>

                <div className="h-64 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#818cf8" strokeOpacity={0.2} />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        stroke="#64748b"
                        strokeOpacity={0.2}
                        tick={false}
                      />
                      <Radar
                        name="Mastery"
                        dataKey="value"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        fill="#8b5cf6"
                        fillOpacity={0.35}
                        dot={{ r: 4, fill: "#7c3aed", stroke: "#c4b5fd", strokeWidth: 1.5 }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right Chart: Weekly Activity Bar Chart */}
              <div className="lg:col-span-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#120F24] p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Weekly Activity
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Past 7 Days
                  </span>
                </div>

                <div className="h-64 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivityData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#818cf8" strokeOpacity={0.15} />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#18142e",
                          borderColor: "#312e81",
                          borderRadius: "12px",
                          fontSize: "11px",
                          color: "#fff"
                        }}
                      />
                      <Bar dataKey="solved" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Card: "Next Up for You" Banner matching Image 6 */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#120F24] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Graph Algorithms – Shortest Path
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Based on your progress, practice 3 medium problems.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setActiveNav("practice")}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl px-5 h-10 shadow-md shadow-purple-600/25 flex items-center gap-1.5 shrink-0"
              >
                <span>Practice Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Quick Grid Preview of the Core Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <AiDsaTutorCard />
              <CodingJudgeCard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MockInterviewCard />
              <PersonalizedRoadmapCard />
              <PlacementReadinessCard />
            </div>
          </div>
        )}

        {/* Dedicated Views for Sidebar Items */}
        {activeNav === "roadmap" && (
          <div className="space-y-6">
            <PersonalizedRoadmapCard />
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#120F24] p-6 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                Roadmap Milestones & Prerequisite Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Each node in the learning path automatically unlocks upon achieving verified 70%+ mastery in the prerequisite topic.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setActiveNav("practice")} className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                  Start Current Milestone Practice
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeNav === "practice" && (
          <div className="space-y-6">
            <CodingJudgeCard />
          </div>
        )}

        {activeNav === "tutor" && (
          <div className="space-y-6">
            <AiDsaTutorCard />
          </div>
        )}

        {activeNav === "review" && (
          <div className="space-y-6">
            <CodeReviewCard />
          </div>
        )}

        {activeNav === "interview" && (
          <div className="space-y-6">
            <MockInterviewCard />
          </div>
        )}

        {activeNav === "planner" && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#120F24] p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" /> Weekly Preparation Planner
            </h3>
            <WeeklyPlanner onTaskUpdate={loadProfile} />
          </div>
        )}

        {activeNav === "analytics" && (
          <div className="space-y-6">
            <PlacementReadinessCard />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
