import React, { useState } from "react";
import {
  User, Layers, Zap, Briefcase, BookOpen, Lightbulb, CheckSquare,
  Send, Paperclip, Loader2, ArrowDown, ChevronRight, Sparkles, RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type LevelType = "Beginner" | "Intermediate" | "Advanced" | "Interview";
type ModeType = "Explain" | "Hint-First" | "Code Review";

export const AiDsaTutorCard: React.FC = () => {
  const [level, setLevel] = useState<LevelType>("Intermediate");
  const [mode, setMode] = useState<ModeType>("Hint-First");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  // Binary search interactive widget state
  const array = [1, 3, 5, 7, 9, 11];
  const [target, setTarget] = useState<number>(7);
  const [activeStep, setActiveStep] = useState<number>(3); // 1: pointers, 2: mid, 3: target found

  const { token } = useAuth();
  const { toast } = useToast();

  const [chatHistory, setChatHistory] = useState<Array<{
    sender: "user" | "ai";
    message?: string;
    level?: LevelType;
    mode?: ModeType;
    steps?: string[];
    showVisualizer?: boolean;
  }>>([
    {
      sender: "user",
      message: "Explain binary search with an example."
    },
    {
      sender: "ai",
      message: "Binary Search is a search algorithm used on a sorted array. It repeatedly divides the search space in half to find the target element efficiently.",
      level: "Intermediate",
      mode: "Hint-First",
      steps: [
        "Start with two pointers: left and right.",
        "Find the middle element: mid = (left + right) / 2.",
        "Compare the middle element with the target:\n• If equal → return the index.\n• If smaller → search in the right half.\n• If larger → search in the left half."
      ],
      showVisualizer: true
    }
  ]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const query = inputText.trim();
    setInputText("");

    const newChat = [
      ...chatHistory,
      { sender: "user" as const, message: query }
    ];
    setChatHistory(newChat);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/tutor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          query,
          level,
          hintMode: mode === "Hint-First",
          hintStage: 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [
          ...prev,
          {
            sender: "ai",
            message: data.explanation || "Here is the breakdown based on your query.",
            level,
            mode,
            steps: data.allLevels ? [
              `Core Concept: ${data.allLevels.Beginner?.substring(0, 120)}...`,
              `Implementation: ${data.allLevels.Intermediate?.substring(0, 140)}...`,
              `Complexity: ${data.allLevels.Advanced?.substring(0, 120)}...`
            ] : undefined,
            showVisualizer: query.toLowerCase().includes("binary") || query.toLowerCase().includes("search")
          }
        ]);
      } else {
        throw new Error("Local fallback");
      }
    } catch {
      // Graceful instant fallback
      setChatHistory(prev => [
        ...prev,
        {
          sender: "ai",
          message: `Regarding "${query}": In ${level} level (${mode} mode), break the algorithmic state into invariant bounds. Maintain your pointers and check termination conditions carefully.`,
          level,
          mode
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAttachCode = () => {
    setInputText("Can you review this binary search implementation?\nint binarySearch(int[] nums, int target) { ... }");
    toast({
      title: "Code Template Attached",
      description: "Sample code snippet loaded into message box."
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-xl transition-all hover:shadow-2xl flex flex-col justify-between">
      <div>
        {/* Header matching Image 2 */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0 font-bold">
            <span className="font-display text-xl">A</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              AI DSA Tutor
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Get step-by-step explanations, hints, and coding guidance.
            </p>
          </div>
        </div>

        {/* 2-Column Body matching Image 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column Controls */}
          <div className="lg:col-span-3 space-y-5">
            {/* Explanation Level Section */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2.5">
                Explanation Level
              </label>
              <div className="space-y-1.5">
                {[
                  { id: "Beginner", label: "Beginner", icon: User },
                  { id: "Intermediate", label: "Intermediate", icon: Layers },
                  { id: "Advanced", label: "Advanced", icon: Zap },
                  { id: "Interview", label: "Interview", icon: Briefcase }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = level === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setLevel(item.id as LevelType)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25"
                          : "border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Section */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2.5">
                Mode
              </label>
              <div className="space-y-1.5">
                {[
                  { id: "Explain", label: "Explain", icon: BookOpen },
                  { id: "Hint-First", label: "Hint-First", icon: Lightbulb },
                  { id: "Code Review", label: "Code Review", icon: CheckSquare }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setMode(item.id as ModeType)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25"
                          : "border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Chat & Visualizer */}
          <div className="lg:col-span-9 space-y-4">
            {/* User Bubble on Right */}
            <div className="flex items-center justify-end gap-2.5">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-md shadow-indigo-600/20 max-w-md">
                Explain binary search with an example.
              </div>
              <div className="h-7 w-7 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs font-bold shrink-0">
                👤
              </div>
            </div>

            {/* AI Response Card on Left */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 relative">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                  A
                </div>
                <div className="space-y-3 flex-1">
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                    Binary Search is a search algorithm used on a sorted array. It repeatedly divides the search space in half to find the target element efficiently.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Steps list */}
                    <div className="md:col-span-7 space-y-2">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        How it works:
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-start gap-2">
                          <span className="h-4 w-4 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            1
                          </span>
                          <span>Start with two pointers: left and right.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="h-4 w-4 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            2
                          </span>
                          <span>Find the middle element: <code>mid = (left + right) / 2</code>.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="h-4 w-4 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            3
                          </span>
                          <div>
                            Compare the middle element with the target:
                            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <li>If equal → return the index.</li>
                              <li>If smaller → search in the <strong>right</strong> half.</li>
                              <li>If larger → search in the <strong>left</strong> half.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Binary Search Visualizer Box matching Image 2 */}
                    <div className="md:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm">
                      <div className="text-center font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">
                        Binary Search (target = {target})
                      </div>

                      {/* Arrow pointer */}
                      <div className="flex justify-center mb-1">
                        <div className="w-full grid grid-cols-6 text-center">
                          <div className="col-start-4 flex justify-center text-indigo-600 dark:text-indigo-400 font-extrabold animate-bounce">
                            ↓
                          </div>
                        </div>
                      </div>

                      {/* Array cells */}
                      <div className="grid grid-cols-6 gap-1 text-center font-mono font-bold text-xs">
                        {array.map((val, idx) => {
                          const isTarget = val === target;
                          return (
                            <button
                              key={idx}
                              onClick={() => setTarget(val)}
                              className={`py-2 rounded-lg border transition-all ${
                                isTarget
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30 scale-105"
                                  : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400"
                              }`}
                              title={`Click to set target = ${val}`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>

                      {/* Indices row */}
                      <div className="grid grid-cols-6 gap-1 text-center font-mono text-[10px] text-slate-400 mt-1">
                        {array.map((_, idx) => (
                          <span key={idx}>{idx}</span>
                        ))}
                      </div>

                      <div className="text-[10px] text-center text-slate-400 mt-2">
                        Element <strong>{target}</strong> found at index <strong>{array.indexOf(target)}</strong>.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Bar matching Image 2 */}
            <div className="flex items-center gap-2 pt-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask a DSA question, share code, or request a hint..."
                  className="w-full h-11 pl-4 pr-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/40"
                />
                <button
                  onClick={handleAttachCode}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Attach sample code"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleSend}
                disabled={loading}
                className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiDsaTutorCard;
