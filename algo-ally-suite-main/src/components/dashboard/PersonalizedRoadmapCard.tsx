import React, { useState, useEffect } from "react";
import { Check, Route, Lock, Sparkles, ChevronRight, BarChart2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface RoadmapStep {
  id: string;
  title: string;
  status: "COMPLETED" | "IN_PROGRESS" | "LOCKED";
  percentage: number;
  color: string;
  problemsTotal: number;
  problemsSolved: number;
}

export const PersonalizedRoadmapCard: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>("linked-lists");
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>([
    {
      id: "arrays-strings",
      title: "Arrays & Strings",
      status: "COMPLETED",
      percentage: 100,
      color: "bg-emerald-500",
      problemsTotal: 24,
      problemsSolved: 24
    },
    {
      id: "binary-search",
      title: "Binary Search",
      status: "COMPLETED",
      percentage: 85,
      color: "bg-emerald-400",
      problemsTotal: 18,
      problemsSolved: 15
    },
    {
      id: "linked-lists",
      title: "Linked Lists",
      status: "IN_PROGRESS",
      percentage: 70,
      color: "bg-amber-400",
      problemsTotal: 14,
      problemsSolved: 10
    },
    {
      id: "trees",
      title: "Trees",
      status: "LOCKED",
      percentage: 40,
      color: "bg-purple-600",
      problemsTotal: 20,
      problemsSolved: 8
    },
    {
      id: "graphs",
      title: "Graphs",
      status: "LOCKED",
      percentage: 15,
      color: "bg-purple-400",
      problemsTotal: 16,
      problemsSolved: 2
    },
    {
      id: "dynamic-programming",
      title: "Dynamic Programming",
      status: "LOCKED",
      percentage: 0,
      color: "bg-slate-300 dark:bg-slate-700",
      problemsTotal: 22,
      problemsSolved: 0
    }
  ]);

  const { token } = useAuth();

  useEffect(() => {
    fetchRoadmapData();
  }, [token]);

  const fetchRoadmapData = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/roadmap", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.roadmap && Array.isArray(data.roadmap)) {
          // Keep the core 6 items with live updates
          setRoadmapSteps(prev => prev.map(step => {
            const match = data.roadmap.find((r: any) => r.id === step.id || r.title.toLowerCase().includes(step.title.toLowerCase()));
            if (match) {
              return {
                ...step,
                percentage: match.masteryPercentage ?? step.percentage,
                problemsSolved: match.completedProblems ?? step.problemsSolved,
                problemsTotal: match.totalProblems ?? step.problemsTotal
              };
            }
            return step;
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-xl transition-all hover:shadow-2xl flex flex-col justify-between">
      <div>
        {/* Header matching Image 3 */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 shrink-0">
            <BarChart2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Adaptive DSA Roadmap
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              A personalized learning path based on your performance.
            </p>
          </div>
        </div>

        {/* Vertical Timeline List matching Image 3 */}
        <div className="relative pl-7 space-y-4">
          {/* Connecting Vertical Line */}
          <div className="absolute left-[11px] top-3 bottom-4 w-0.5 bg-purple-600/30 dark:bg-purple-500/30"></div>

          {roadmapSteps.map((step) => {
            const isCompleted = step.status === "COMPLETED";
            const isInProgress = step.status === "IN_PROGRESS";
            const isSelected = selectedTopic === step.id;

            return (
              <div
                key={step.id}
                onClick={() => setSelectedTopic(step.id)}
                className={`relative flex items-center justify-between gap-4 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-purple-500/60 bg-purple-500/5 dark:bg-purple-900/20 shadow-sm"
                    : "border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                }`}
              >
                {/* Node icon on vertical timeline */}
                <div className="absolute -left-7 flex items-center justify-center">
                  {isCompleted ? (
                    <div className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  ) : isInProgress ? (
                    <div className="h-5 w-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 ring-4 ring-purple-600/20 animate-pulse">
                      <span className="text-[10px] font-bold">●</span>
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-white dark:bg-slate-900 border-2 border-purple-500/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-400/60"></div>
                    </div>
                  )}
                </div>

                {/* Topic Title */}
                <div className="w-44 shrink-0">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {step.title}
                  </span>
                  {isInProgress && (
                    <span className="ml-2 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                      • In Progress
                    </span>
                  )}
                </div>

                {/* Progress Bar matching Image 3 */}
                <div className="flex-1 max-w-xs">
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${step.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${step.percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Percentage */}
                <div className="w-12 text-right">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {step.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Detail Box at bottom */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Click any milestone to view problem recommendations.</span>
        <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1 cursor-pointer hover:underline">
          Practice Weak Areas <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
};

export default PersonalizedRoadmapCard;
