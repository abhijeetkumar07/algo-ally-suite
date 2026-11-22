import React, { useState, useEffect } from "react";
import { Check, CheckCircle2, Lock, Route, Flag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface RoadmapNode {
  id: string;
  title: string;
  status: "COMPLETED" | "IN_PROGRESS" | "LOCKED";
  completedProblems: number;
  totalProblems: number;
  masteryPercentage: number;
  prerequisite?: string | null;
}

export const PersonalizedRoadmapCard: React.FC = () => {
  const [nodes, setNodes] = useState<RoadmapNode[]>([
    {
      id: "arrays-strings",
      title: "Arrays & Strings",
      status: "COMPLETED",
      completedProblems: 24,
      totalProblems: 24,
      masteryPercentage: 100
    },
    {
      id: "binary-search",
      title: "Binary Search",
      status: "COMPLETED",
      completedProblems: 18,
      totalProblems: 18,
      masteryPercentage: 85,
      prerequisite: "Arrays & Strings"
    },
    {
      id: "linked-lists",
      title: "Linked Lists",
      status: "IN_PROGRESS",
      completedProblems: 10,
      totalProblems: 14,
      masteryPercentage: 70,
      prerequisite: "Binary Search"
    },
    {
      id: "trees",
      title: "Trees",
      status: "LOCKED",
      completedProblems: 0,
      totalProblems: 20,
      masteryPercentage: 0,
      prerequisite: "Linked Lists"
    }
  ]);

  const { token } = useAuth();

  useEffect(() => {
    fetchRoadmap();
  }, [token]);

  const fetchRoadmap = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/roadmap", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.roadmap) {
          setNodes(data.roadmap.slice(0, 4));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between h-full relative overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
              <Route className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm tracking-tight text-white">
              Your Personalized DSA Roadmap
            </h3>
          </div>
        </div>

        {/* Roadmap Body with Path and Right Mountain Illustration */}
        <div className="mt-4 grid grid-cols-12 gap-2 items-center">
          {/* Milestone Nodes List */}
          <div className="col-span-8 relative pl-7 space-y-4">
            {/* Connecting line */}
            <div className="absolute left-[11px] top-2 bottom-3 w-0.5 bg-slate-800"></div>

            {nodes.map((node) => {
              const isCompleted = node.status === "COMPLETED";
              const isInProgress = node.status === "IN_PROGRESS";
              const isLocked = node.status === "LOCKED";

              return (
                <div key={node.id} className="relative flex items-center justify-between">
                  {/* Node Icon on the line */}
                  <div
                    className={`absolute -left-[27px] h-6 w-6 rounded-full flex items-center justify-center border transition-all ${
                      isCompleted
                        ? "bg-emerald-500 border-emerald-400 text-white shadow"
                        : isInProgress
                        ? "bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/30"
                        : "bg-slate-950 border-slate-700 text-slate-500"
                    }`}
                  >
                    {isCompleted && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                    {isInProgress && <span className="text-xs font-bold leading-none">+</span>}
                    {isLocked && <div className="h-2 w-2 rounded-full bg-slate-600" />}
                  </div>

                  {/* Text details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-white tracking-tight">
                        {node.title}
                      </h4>
                      {isInProgress && (
                        <span className="text-xs font-bold text-white mr-2">
                          {node.masteryPercentage}%
                        </span>
                      )}
                      {isLocked && (
                        <Lock className="h-3 w-3 text-slate-500 mr-2" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isCompleted && `Completed • ${node.completedProblems}/${node.totalProblems} problems`}
                      {isInProgress && (
                        <span>
                          <span className="text-purple-400 font-medium">In Progress</span> • {node.completedProblems}/{node.totalProblems} problems
                        </span>
                      )}
                      {isLocked && `Next • Prerequisite: ${node.prerequisite || "Linked Lists"}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Winding Mountain Path Graphic */}
          <div className="col-span-4 flex items-center justify-center relative h-36">
            <svg viewBox="0 0 120 140" className="w-full h-full">
              <defs>
                <linearGradient id="roadGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              {/* Mountain silhouette */}
              <path
                d="M10 130 Q 60 80, 70 30 Q 80 80, 115 130 Z"
                fill="#1e1b4b"
                opacity="0.5"
              />
              {/* Winding road path */}
              <path
                d="M 20 130 C 50 110, 30 80, 65 60 C 80 45, 68 35, 75 25"
                fill="none"
                stroke="url(#roadGradient)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Goal flag at the peak */}
              <circle cx="75" cy="22" r="6" fill="#c084fc" />
              <line x1="75" y1="22" x2="75" y2="8" stroke="#ffffff" strokeWidth="2" />
              <polygon points="75,8 90,13 75,18" fill="#ec4899" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedRoadmapCard;
