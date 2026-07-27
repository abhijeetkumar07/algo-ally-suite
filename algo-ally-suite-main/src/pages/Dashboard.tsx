import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Code2, Target, TrendingUp, LogOut, BookOpen, Loader2, Github, Linkedin, ExternalLink, FileCode, ChevronRight, Sun, Moon } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { getRecommendations } from "@/lib/recommendations";
import { useToast } from "@/hooks/use-toast";
import JavaRunner from "@/components/dashboard/JavaRunner";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

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

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [leetcodeSyncing, setLeetcodeSyncing] = useState(false);
  const [leetcodeUsernameInput, setLeetcodeUsernameInput] = useState("");

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
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to load profile");

      const data = await response.json();
      setProfile(data);
      setLeetcodeUsernameInput(data.leetcodeUsername || "");
    } catch (error: any) {
      console.error("Dashboard error:", error);
      toast({ title: "Error loading profile", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };




  const fetchLeetcodeStats = async (username: string): Promise<{ easySolved: number; mediumSolved: number; hardSolved: number; totalSolved: number } | null> => {
    try {
      const url = `/api/leetcode/stats?username=${encodeURIComponent(username.trim())}`;
      console.log("[LeetCode] Fetching from:", url);
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("[LeetCode] Backend sync successful:", data);
        return data;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("[LeetCode] Backend sync failed:", errorData.message || response.statusText);
      }
    } catch (error) {
      console.error("[LeetCode] Network error contacting backend for stats:", error);
    }
    return null;
  };

  const handleLeetcodeSync = async () => {
    const username = leetcodeUsernameInput.trim();
    console.log("[LeetCode] Triggering sync for user:", username);
    if (!username) {
      toast({ title: "Username Required", description: "Please enter your LeetCode username.", variant: "destructive" });
      return;
    }

    setLeetcodeSyncing(true);

    try {
      const apiData = await fetchLeetcodeStats(username);

      if (!apiData) {
        throw new Error("Could not fetch stats. Please verify your username and ensure your LeetCode profile is public.");
      }

      // Optimistic UI update
      setProfile(prev => prev ? {
        ...prev,
        leetcodeUsername: username,
        leetcodeEasy: apiData.easySolved,
        leetcodeMedium: apiData.mediumSolved,
        leetcodeHard: apiData.hardSolved
      } : prev);

      // Save to backend using the new DEDICATED sync endpoint
      const syncData = {
        leetcodeUsername: username,
        leetcodeEasy: apiData.easySolved,
        leetcodeMedium: apiData.mediumSolved,
        leetcodeHard: apiData.hardSolved
      };

      const saveRes = await fetch("/api/profiles/sync-leetcode", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(syncData)
      });

      if (saveRes.ok) {
        const savedData = await saveRes.json();
        setProfile(savedData);
        toast({
          title: "✓ Progress Synced",
          description: `Successfully updated solved counts for ${username}.`
        });
      } else {
        const errorDetail = await saveRes.text().catch(() => "");
        throw new Error(errorDetail || "Connected to LeetCode but failed to save progress to your profile.");
      }
    } catch (error: any) {
      console.error("[LeetCode Sync Error]", error);
      toast({
        title: "Sync Error",
        description: error.message || "An unexpected error occurred during sync.",
        variant: "destructive"
      });
    } finally {
      setLeetcodeSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-display">Preparing your workspace...</p>
        </div>
      </div>
    );
  }


  const easyCount = profile?.leetcodeEasy ?? 0;
  const mediumCount = profile?.leetcodeMedium ?? 0;
  const hardCount = profile?.leetcodeHard ?? 0;
  const totalCount = easyCount + mediumCount + hardCount;

  // Realistic proficiency metrics: Filling the chart now requires ~200-300+ problems across difficulties
  const chartData = [
    { subject: 'Trees', A: Math.min(100, Math.round((easyCount * 0.4) + (mediumCount * 0.6) + (hardCount * 0.8))), fullMark: 100 },
    { subject: 'Graphs', A: Math.min(100, Math.round((mediumCount * 0.5) + (hardCount * 1.5))), fullMark: 100 },
    { subject: 'DP', A: Math.min(100, Math.round((mediumCount * 0.3) + (hardCount * 2.2))), fullMark: 100 },
    { subject: 'Sliding Window', A: Math.min(100, Math.round((easyCount * 0.6) + (mediumCount * 0.4))), fullMark: 100 },
    { subject: 'Recursion', A: Math.min(100, Math.round((easyCount * 0.5) + (mediumCount * 0.5))), fullMark: 100 },
  ];

  const leetcodeBarData = [
    { name: 'Easy', count: easyCount, fill: '#10b981' },
    { name: 'Medium', count: mediumCount, fill: '#f59e0b' },
    { name: 'Hard', count: hardCount, fill: '#ef4444' },
  ];

  // Dynamic status bars based on actual solving percentages vs career goals (e.g. 500 problems target)
  const dsaProgress = Math.min(100, Math.round((totalCount / 400) * 100));
  const activityProgress = totalCount > 0 ? Math.min(100, 20 + Math.round((totalCount / 10))) : 0; // Baseline + activity
  const techStackProgress = profile?.preferredTechStack ? Math.min(100, profile.preferredTechStack.length * 20) : 0;

  return (
    <div className="min-h-screen bg-background pb-12 text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-display font-bold tracking-tight">PlacementGPT</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/visualizer")}
                className="h-8 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <FileCode className="h-3.5 w-3.5 mr-2" /> Visualizer
              </Button>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-foreground">{profile?.fullName || 'Developer Admin'}</p>
              </div>
              <div className="h-9 w-9 bg-primary/20 rounded-xl border border-primary/30 flex items-center justify-center text-primary font-bold">
                {profile?.fullName?.[0] || 'D'}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Toggle Theme"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'dark' ? 0 : 180, scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </motion.div>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 text-slate-400 hover:text-destructive">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 border-border relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Code2 className="h-32 w-32 rotate-12" />
          </div>

          <div className="h-24 w-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center relative">
            <div className="h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-4xl font-display font-bold"
              >
                {profile?.fullName?.[0] || 'D'}
              </motion.div>
            </div>
          </div>

          <div className="flex-1 space-y-2 text-center md:text-left">
            <div>
              <p className="text-primary font-display font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Welcome Back</p>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                {profile?.fullName || 'Developer Admin'}
              </h2>
            </div>
            <p className="text-slate-400 text-sm font-medium">
              {profile?.college || 'Ready to ace your next technical interview?'}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* LeetCode Sync Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass rounded-3xl p-8 border-border bg-card/40 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <Github className="h-40 w-40 -rotate-12" />
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground">LeetCode Sync</h3>
                  <p className="text-muted-foreground text-xs font-medium">Keep your progress across platforms up to date</p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLeetcodeSync();
                }}
                className="flex flex-col sm:flex-row gap-4 mb-10"
              >
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Code2 className="h-4 w-4 text-primary/50" />
                  </div>
                  <input
                    id="leetcode-username"
                    type="text"
                    placeholder="Enter LeetCode username"
                    value={leetcodeUsernameInput}
                    onChange={(e) => setLeetcodeUsernameInput(e.target.value)}
                    className="w-full h-14 bg-card/40 border border-border rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground font-medium"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={leetcodeSyncing}
                  className="h-14 px-10 bg-primary text-primary-foreground font-bold rounded-2xl hover:shadow-glow transition-all active:scale-95"
                >
                  {leetcodeSyncing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sync Now"}
                </Button>
              </form>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Easy", count: profile?.leetcodeEasy ?? 0, color: "text-emerald-500", icon: "🌱" },
                  { label: "Medium", count: profile?.leetcodeMedium ?? 0, color: "text-yellow-500", icon: "⚡" },
                  { label: "Hard", count: profile?.leetcodeHard ?? 0, color: "text-rose-500", icon: "🔥" },
                  { label: "Total", count: totalCount, color: "text-blue-400", icon: "🏆" }
                ].map((stat) => (
                  <div key={stat.label} className="bg-card/40 rounded-2xl p-4 border border-border hover:border-primary/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      <span className="text-xs">{stat.icon}</span>
                    </div>
                    <div className={`text-2xl font-display font-bold ${stat.color}`}>{stat.count}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-3xl p-6 border-border">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileCode className="h-4 w-4" />
                  </div>
                  <h3 className="font-display font-bold text-foreground tracking-tight">Topic Proficiency</h3>
                </div>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                      <PolarGrid stroke={theme === 'dark' ? "#ffffff05" : "#00000005"} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                      <Radar
                        name="Proficiency"
                        dataKey="A"
                        stroke="#0ea5e9"
                        fill="#0ea5e9"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: theme === 'dark' ? '#020810' : '#ffffff', border: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`, borderRadius: '16px', fontSize: '10px' }}
                        itemStyle={{ color: '#0ea5e9' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-3xl p-6 border-border">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <h3 className="font-display font-bold text-foreground tracking-tight">LeetCode Progress</h3>
                </div>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leetcodeBarData} barGap={0}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#ffffff03" : "#00000003"} vertical={false} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: 600 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme === 'dark' ? '#475569' : '#64748b', fontSize: 10 }}
                      />
                      <Tooltip
                        cursor={{ fill: theme === 'dark' ? '#ffffff03' : '#00000003' }}
                        contentStyle={{ backgroundColor: theme === 'dark' ? '#020810' : '#ffffff', border: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`, borderRadius: '16px' }}
                      />
                      <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-6 border-border bg-gradient-to-br from-primary/5 to-transparent h-full flex flex-col"
            >
              <h3 className="font-display font-bold text-lg text-foreground mb-6">Preparation Status</h3>

              <div className="space-y-6 flex-1">
                {[
                  { label: "DSA Concepts", progress: dsaProgress, color: "primary" },
                  { label: "Platform Activity", progress: activityProgress, color: "purple" },
                  { label: "Tech Stack", progress: techStackProgress, color: "emerald" }
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground">{item.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-border/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className={`h-full bg-${item.color === 'primary' ? 'primary' : item.color + '-500'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-white/5">
                <Button
                  onClick={() => navigate("/visualizer")}
                  variant="outline"
                  className="w-full h-12 rounded-2xl border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all font-bold text-xs uppercase tracking-widest gap-2"
                >
                  Explore Visualizer <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Java Playground at the bottom full width */}
        <div className="mt-8">
          <JavaRunner />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
