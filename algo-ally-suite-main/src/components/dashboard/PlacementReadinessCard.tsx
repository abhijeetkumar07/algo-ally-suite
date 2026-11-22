import React, { useState, useEffect } from "react";
import { Trophy, CheckCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MetricItem {
  id: string;
  label: string;
  value: number;
}

export const PlacementReadinessCard: React.FC = () => {
  const [readinessScore, setReadinessScore] = useState<number>(78);
  const [metrics, setMetrics] = useState<MetricItem[]>([
    { id: "dsa", label: "DSA Mastery", value: 72 },
    { id: "problem_solving", label: "Problem Solving", value: 78 },
    { id: "mock_interview", label: "Mock Interview Performance", value: 80 },
    { id: "consistency", label: "Study Consistency", value: 85 }
  ]);

  const { token } = useAuth();

  useEffect(() => {
    fetchReadiness();
  }, [token]);

  const fetchReadiness = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/roadmap", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.readinessScore) setReadinessScore(data.readinessScore);
        if (data.breakdown) {
          setMetrics([
            { id: "dsa", label: "DSA Mastery", value: data.breakdown.dsaMastery ?? 72 },
            { id: "problem_solving", label: "Problem Solving", value: data.breakdown.problemSolving ?? 78 },
            { id: "mock_interview", label: "Mock Interview Performance", value: data.breakdown.mockInterview ?? 80 },
            { id: "consistency", label: "Study Consistency", value: data.breakdown.consistency ?? 85 }
          ]);
        }
      }
    } catch (e) {
      console.error("Readiness fetch error:", e);
    }
  };

  // Donut chart geometry
  const radius = 54;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-xl transition-all hover:shadow-2xl flex flex-col justify-between">
      <div>
        {/* Header matching Image 1 */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 shrink-0">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Placement Readiness
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Your overall preparation for technical interviews.
            </p>
          </div>
        </div>

        {/* Donut Chart & 4 Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Gauge */}
          <div className="md:col-span-5 flex flex-col items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                {/* Background Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Gradient Progress Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="url(#readiness_gradient)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="readiness_gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Centered Score */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight leading-none">
                  {readinessScore}%
                </span>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 mt-1">
                  Readiness Score
                </span>
              </div>
            </div>
          </div>

          {/* 4 Metric Pill Cards */}
          <div className="md:col-span-7 space-y-2.5">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="flex items-center justify-between px-4 py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-4 w-4 fill-emerald-500 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {metric.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                  {metric.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gold Alert Banner at Bottom matching Image 1 */}
      <div className="mt-5 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/50 dark:border-amber-500/30 flex items-center gap-3 shadow-sm">
        <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
        </div>
        <p className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
          You're on the right track! Focus on <strong className="font-semibold text-amber-950 dark:text-amber-100">Graphs</strong> and <strong className="font-semibold text-amber-950 dark:text-amber-100">Dynamic Programming</strong> to reach <strong className="font-semibold text-amber-950 dark:text-amber-100">90%+ readiness</strong>.
        </p>
      </div>
    </div>
  );
};

export default PlacementReadinessCard;
