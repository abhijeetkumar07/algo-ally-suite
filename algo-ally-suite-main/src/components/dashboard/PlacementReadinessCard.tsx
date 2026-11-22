import React, { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const PlacementReadinessCard: React.FC = () => {
  const [readinessScore, setReadinessScore] = useState<number>(82);
  const [breakdown, setBreakdown] = useState<{
    dsaMastery: number;
    problemSolving: number;
    mockInterview: number;
    consistency: number;
  }>({
    dsaMastery: 78,
    problemSolving: 85,
    mockInterview: 80,
    consistency: 88
  });

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
        if (data.breakdown) setBreakdown(data.breakdown);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
              <Target className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm tracking-tight text-white">
              Placement Readiness
            </h3>
          </div>
        </div>

        {/* Circular Donut + 4 Metrics */}
        <div className="mt-4 flex items-center justify-between gap-4">
          {/* Donut Chart Gauge */}
          <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="text-slate-800 stroke-current"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="text-emerald-400 stroke-current transition-all duration-1000 ease-out"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-display text-white tracking-tight">
                {readinessScore}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Ready</span>
            </div>
          </div>

          {/* Metric Rows */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-300 font-medium text-[11px]">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span> DSA Mastery
              </span>
              <span className="font-bold text-[11px] text-white">{breakdown.dsaMastery}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-300 font-medium text-[11px]">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span> Problem Solving
              </span>
              <span className="font-bold text-[11px] text-white">{breakdown.problemSolving}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-300 font-medium text-[11px]">
                <span className="h-2 w-2 rounded-full bg-purple-400"></span> Mock Interview
              </span>
              <span className="font-bold text-[11px] text-white">{breakdown.mockInterview}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-300 font-medium text-[11px]">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Consistency
              </span>
              <span className="font-bold text-[11px] text-white">{breakdown.consistency}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Action Callout Card matching screenshot */}
      <div className="mt-4 p-3 bg-purple-950/40 border border-purple-800/60 rounded-xl flex items-center justify-between gap-3 text-xs group cursor-pointer hover:border-purple-600 transition-colors">
        <div className="flex items-start gap-2.5">
          <div className="h-6 w-6 rounded-md bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="font-semibold text-[11px] text-purple-200">Next Action</div>
            <p className="text-[10px] text-slate-300 leading-snug mt-0.5">
              Practice 3 Graph problems and take a mock interview this week to reach 85% readiness.
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-purple-400 shrink-0 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

export default PlacementReadinessCard;
