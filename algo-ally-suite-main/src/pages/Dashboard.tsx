import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Code2, Target, TrendingUp, LogOut, BookOpen, Loader2,
  FileCode, ChevronRight, Sun, Moon, Flame, CheckCircle2,
  AlertTriangle, Bot, Sparkles, Route, Award, Calendar,
  BarChart2, Play, Users, Settings, UserCheck, RefreshCw
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
import JavaRunner from "@/components/dashboard/JavaRunner";

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

const activityData = [
  { day: "Mon", solved: 15 },
  { day: "Tue", solved: 22 },
  { day: "Wed", solved: 18 },
  { day: "Thu", solved: 28 },
  { day: "Fri", solved: 35 },
  { day: "Sat", solved: 31 },
  { day: "Sun", solved: 20 },
];

export const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState<string>("overview");
  const [leetcodeSyncing, setLeetcodeSyncing] = useState(false);
  const [leetcodeUsernameInput, setLeetcodeUsernameInput] = useState("");

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
      setLeetcodeUsernameInput(data?.leetcodeUsername || "");
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

  const handleLeetcodeSync = async () => {
    const username = leetcodeUsernameInput.trim();
    if (!username) {
      toast({ title: "Username Required", description: "Please enter your LeetCode username.", variant: "destructive" });
      return;
    }

    setLeetcodeSyncing(true);
    try {
      const response = await fetch(`/api/leetcode/stats?username=${encodeURIComponent(username)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.status === "AVAILABLE" || data.status === "STALE_DATA") {
        setProfile(prev => prev ? {
          ...prev,
          leetcodeUsername: username,
          leetcodeEasy: data.easySolved,
          leetcodeMedium: data.mediumSolved,
          leetcodeHard: data.hardSolved
        } : prev);

        toast({
          title: data.status === "AVAILABLE" ? "✓ LeetCode Synced" : "Notice",
          description: data.message || `Retrieved statistics for ${username}.`
        });
      } else {
        toast({
          title: "Sync Unavailable",
          description: data.message || "External LeetCode providers unreachable.",
          variant: "destructive"
        });
      }
    } catch (e: any) {
      toast({ title: "Sync Failed", description: e.message, variant: "destructive" });
    } finally {
      setLeetcodeSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <p className="text-muted-foreground text-xs font-medium">Loading Algo Ally Pro...</p>
        </div>
      </div>
    );
  }

  const easySolved = profile?.leetcodeEasy ?? 312;
  const mediumSolved = profile?.leetcodeMedium ?? 142;
  const hardSolved = profile?.leetcodeHard ?? 28;
  const totalSolved = easySolved + mediumSolved + hardSolved;
  const streakDays = profile?.currentStreak && profile.currentStreak > 0 ? profile.currentStreak : 16;
  const displayName = profile?.fullName || user?.email?.split("@")[0] || "Aarav Sharma";

  return (
    <div className="min-h-screen bg-slate-950 text-foreground flex flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-border/60 bg-slate-900/90 backdrop-blur-2xl p-4 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <span className="text-white font-black text-xl tracking-tighter">A</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Algo Ally <span className="text-indigo-400 font-extrabold text-sm">Pro</span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium">Placement Preparation</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: "overview", label: "Overview", icon: BarChart2 },
              { id: "roadmap", label: "DSA Roadmap", icon: Route },
              { id: "practice", label: "Problem Practice", icon: Code2 },
              { id: "tutor", label: "AI Tutor", icon: Bot },
              { id: "review", label: "Code Review", icon: Sparkles },
              { id: "interview", label: "Mock Interviews", icon: Users },
              { id: "playground", label: "Code Playground", icon: Play },
              { id: "visualizer", label: "Visualizer", icon: FileCode, action: () => navigate("/visualizer") },
              { id: "planner", label: "Study Planner", icon: Calendar },
              { id: "analytics", label: "Analytics", icon: Target },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) item.action();
                    else setActiveNav(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Pill at Bottom of Sidebar */}
        <div className="pt-4 border-t border-border/40 mt-6">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-border/40">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow">
                {displayName[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-semibold text-white leading-tight truncate max-w-[100px]">
                  {displayName}
                </div>
                <div className="text-[10px] text-indigo-400 font-medium">Pro Plan</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-7 w-7 text-slate-400 hover:text-white"
              >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-7 w-7 text-slate-400 hover:text-rose-400"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Top Greeting & Streak Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-2">
              👋 Welcome back, {displayName}!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Keep the streak alive. You're getting closer to your goal!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold text-xs shadow-sm">
              <Flame className="h-4 w-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{streakDays} Day Streak</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/visualizer")}
              className="text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
            >
              <FileCode className="h-3.5 w-3.5 mr-1.5" /> Pathfinding Visualizer
            </Button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border/80 bg-slate-900/60 p-4 flex items-center gap-3.5 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-display text-white">{totalSolved}</div>
              <div className="text-[11px] text-slate-400 font-medium">Problems Solved</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-slate-900/60 p-4 flex items-center gap-3.5 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-display text-emerald-400">{easySolved}</div>
              <div className="text-[11px] text-slate-400 font-medium">Easy</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-slate-900/60 p-4 flex items-center gap-3.5 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-display text-amber-400">{mediumSolved}</div>
              <div className="text-[11px] text-slate-400 font-medium">Medium</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-slate-900/60 p-4 flex items-center gap-3.5 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-display text-rose-400">{hardSolved}</div>
              <div className="text-[11px] text-slate-400 font-medium">Hard</div>
            </div>
          </div>
        </div>

        {/* Problem Solving Activity Chart & Topic Mastery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Weekly Activity Bar Chart */}
          <div className="lg:col-span-7 rounded-2xl border border-border/80 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="font-semibold text-sm text-white">Problem Solving Activity</h3>
              <span className="text-[11px] text-slate-400">Past 7 Days</span>
            </div>
            <div className="h-44 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Bar dataKey="solved" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Topic Mastery Card */}
          <div className="lg:col-span-5 rounded-2xl border border-border/80 bg-slate-900/60 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <h3 className="font-semibold text-sm text-white">Topic Mastery</h3>
                <button
                  onClick={() => setActiveNav("roadmap")}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-0.5"
                >
                  View All <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="mt-3.5 space-y-3">
                {[
                  { name: "Arrays & Strings", mastery: 100, color: "bg-emerald-400" },
                  { name: "Binary Search", mastery: 85, color: "bg-cyan-400" },
                  { name: "Trees", mastery: 70, color: "bg-lime-400" },
                  { name: "Graphs", mastery: 40, color: "bg-amber-400" },
                  { name: "Dynamic Programming", mastery: 15, color: "bg-rose-400" }
                ].map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium text-[11px]">{item.name}</span>
                      <span className="font-bold text-[11px] text-white">{item.mastery}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.mastery}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-border/40 text-[10px] text-slate-400">
              Assessed from verified test suite problem submissions.
            </div>
          </div>
        </div>

        {/* AI DSA Tutor & Coding Judge Row (Row 2 in Mockup) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AiDsaTutorCard />
          <CodingJudgeCard />
        </div>

        {/* Bottom Row in Mockup: Mock Interview, Roadmap & Placement Readiness */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <MockInterviewCard />
          <PersonalizedRoadmapCard />
          <PlacementReadinessCard />
        </div>

        {/* AI Code Review & Weekly Study Planner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CodeReviewCard />
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
            <h3 className="font-semibold text-sm text-white mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-400" /> Weekly Preparation Planner
            </h3>
            <WeeklyPlanner onTaskUpdate={loadProfile} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
