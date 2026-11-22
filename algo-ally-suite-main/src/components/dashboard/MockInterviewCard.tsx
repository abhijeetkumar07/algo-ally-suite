import React, { useState, useEffect } from "react";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Clock, Check,
  CheckCircle2, Sparkles, Send, Loader2, Bot, Play, RotateCcw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface StageItem {
  id: string;
  label: string;
  status: "completed" | "in_progress" | "pending";
}

export const MockInterviewCard: React.FC = () => {
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [isCalling, setIsCalling] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(1475); // 24:35 = 1475s
  const [candidateResponse, setCandidateResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const [stages, setStages] = useState<StageItem[]>([
    { id: "understanding", label: "Problem Understanding", status: "completed" },
    { id: "approach", label: "Approach & Solution", status: "in_progress" },
    { id: "complexity", label: "Complexity Analysis", status: "pending" },
    { id: "implementation", label: "Code Implementation", status: "pending" },
    { id: "followup", label: "Follow-up Discussion", status: "pending" }
  ]);

  const [aiFeedback, setAiFeedback] = useState<string>(
    "Good start! You've identified that we need to traverse from root to find nodes p and q. Can you now explain how you determine whether the current node is the LCA?"
  );

  const { token } = useAuth();
  const { toast } = useToast();

  // Timer simulation
  useEffect(() => {
    if (!isCalling) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isCalling]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendResponse = async () => {
    if (!candidateResponse.trim()) return;
    const answer = candidateResponse;
    setCandidateResponse("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/interview/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          message: answer,
          roundTitle: "Round 1: DSA (Medium) - Lowest Common Ancestor"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiFeedback(data.interviewerMessage || "Excellent explanation! Let's advance to time and space complexity.");
      } else {
        throw new Error("Fallback");
      }
    } catch {
      setAiFeedback(`Your approach to LCA using post-order recursion handles both left and right subtree matches. Since each node is visited at most once, the time complexity is O(N) with O(H) recursion stack space. Let's move to Code Implementation.`);
    } finally {
      setLoading(false);
      // Advance stages
      setStages(prev => {
        const next = [...prev];
        if (next[1].status === "in_progress") {
          next[1].status = "completed";
          next[2].status = "in_progress";
        } else if (next[2].status === "in_progress") {
          next[2].status = "completed";
          next[3].status = "in_progress";
        } else if (next[3].status === "in_progress") {
          next[3].status = "completed";
          next[4].status = "completed";
        }
        return next;
      });
    }
  };

  const toggleCall = () => {
    if (isCalling) {
      setIsCalling(false);
      toast({ title: "Interview Paused", description: "You can resume anytime." });
    } else {
      setIsCalling(true);
      toast({ title: "Interview Resumed", description: "AI Interviewer is listening." });
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-xl transition-all hover:shadow-2xl flex flex-col justify-between">
      <div>
        {/* Header matching Image 4 */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 shrink-0">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Mock Interview Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Practice real interview scenarios with an AI interviewer.
            </p>
          </div>
        </div>

        {/* 2-Column Body: Left Video Call, Right Question & Stages matching Image 4 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Pane: AI Interviewer Video Screen */}
          <div className="md:col-span-5 relative rounded-2xl bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-950 border border-indigo-950 p-4 min-h-[260px] flex flex-col items-center justify-center overflow-hidden shadow-inner">
            {/* Audio Wave Visualizer background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
              <div className="flex items-center gap-1.5 h-20">
                {[40, 65, 85, 30, 95, 60, 45, 75, 55, 35, 70, 90, 40].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-purple-500 rounded-full animate-pulse"
                    style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* 3D Friendly Robot Character with Glowing Blue Eyes */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative">
                {/* Robot Head */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-white to-slate-200 shadow-2xl flex items-center justify-center relative border-2 border-slate-100">
                  {/* Visor Screen */}
                  <div className="w-16 h-12 rounded-2xl bg-slate-950 flex items-center justify-center gap-3 px-2 shadow-inner">
                    {/* Glowing Blue Eyes */}
                    <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse"></div>
                  </div>
                  {/* Robot Headphone Cups */}
                  <div className="absolute -left-3 top-5 w-4 h-9 rounded-lg bg-slate-800 border border-slate-700"></div>
                  <div className="absolute -right-3 top-5 w-4 h-9 rounded-lg bg-slate-800 border border-slate-700"></div>
                  {/* Headphone Arch */}
                  <div className="absolute -top-3 w-16 h-4 border-t-4 border-slate-800 rounded-t-full"></div>
                </div>
                {/* Robot Neck & Torso */}
                <div className="w-14 h-6 rounded-t-2xl bg-slate-300 mx-auto mt-1 border-t border-slate-100"></div>
              </div>

              <div className="mt-2 text-center">
                <span className="text-[11px] font-semibold text-white/90 tracking-wide">
                  AI Technical Interviewer
                </span>
                <span className="block text-[9px] text-cyan-300 font-mono">
                  {isCalling ? "● LISTENING..." : "PAUSED"}
                </span>
              </div>
            </div>

            {/* Call Control Overlay Bar at Bottom matching Image 4 */}
            <div className="relative z-20 mt-4 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-700/60 shadow-lg">
              <button
                onClick={() => setMicMuted(!micMuted)}
                className={`p-2 rounded-full transition-colors ${
                  micMuted ? "bg-rose-500/20 text-rose-400" : "text-white hover:bg-white/10"
                }`}
                title={micMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {micMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <button
                onClick={toggleCall}
                className="p-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/40 transition-all hover:scale-105"
                title={isCalling ? "End / Pause Call" : "Resume Call"}
              >
                {isCalling ? <PhoneOff className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setVideoOff(!videoOff)}
                className={`p-2 rounded-full transition-colors ${
                  videoOff ? "bg-rose-500/20 text-rose-400" : "text-white hover:bg-white/10"
                }`}
                title={videoOff ? "Turn On Camera" : "Turn Off Camera"}
              >
                {videoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Right Pane: Question, Timer & Evaluation Tracker matching Image 4 */}
          <div className="md:col-span-7 space-y-4">
            {/* Header info with Timer */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Interview in Progress
                </span>
                <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold text-[10px] tracking-wide">
                  DSA • Medium
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono text-xs font-bold">
                <Clock className="h-3.5 w-3.5 text-purple-500" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>
            </div>

            {/* Question Text matching Image 4 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                Q1. Design an algorithm to find the lowest common ancestor (LCA) in a binary tree.
              </p>
            </div>

            {/* 5 Evaluation Criteria Stages matching Image 4 */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              {stages.map((stage) => {
                const isDone = stage.status === "completed";
                const isInProg = stage.status === "in_progress";

                return (
                  <div key={stage.id} className="flex items-center justify-between text-xs py-0.5">
                    <div className="flex items-center gap-2.5">
                      {isDone ? (
                        <Check className="h-4 w-4 text-emerald-500 stroke-[3]" />
                      ) : isInProg ? (
                        <div className="h-4 w-4 rounded-full border-2 border-purple-500 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping"></div>
                        </div>
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                      )}
                      <span className={`font-medium ${
                        isDone ? "text-slate-900 dark:text-white font-semibold" :
                        isInProg ? "text-purple-600 dark:text-purple-400 font-semibold" :
                        "text-slate-400 dark:text-slate-400"
                      }`}>
                        {stage.label}
                      </span>
                    </div>

                    <div className="text-right">
                      {isDone ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[2.5]" />
                      ) : (
                        <span className="font-mono text-slate-400 text-xs">...</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Answer Input Bar */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={candidateResponse}
                onChange={(e) => setCandidateResponse(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendResponse()}
                placeholder="Explain your approach to the interviewer..."
                className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/30"
              />
              <button
                onClick={handleSendResponse}
                disabled={loading}
                className="h-10 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-purple-600/20 disabled:opacity-50 shrink-0"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>Respond</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewCard;
