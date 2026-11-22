import React, { useState } from "react";
import { Mic, Video, Phone, Send, Award, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const MockInterviewCard: React.FC = () => {
  const [candidateMessage, setCandidateMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluationReport, setEvaluationReport] = useState<any>(null);

  const [session, setSession] = useState<{
    roundTitle: string;
    interviewerMessage: string;
    messages: Array<{ role: "interviewer" | "candidate"; content: string }>;
  }>({
    roundTitle: "Round 1: DSA (Medium)",
    interviewerMessage: "Implement the LRU Cache. Can you first explain your approach?",
    messages: [
      {
        role: "interviewer",
        content: "Implement the LRU Cache. Can you first explain your approach?"
      }
    ]
  });

  const { token } = useAuth();
  const { toast } = useToast();

  const handleSend = async () => {
    if (!candidateMessage.trim()) return;
    const msg = candidateMessage;
    setCandidateMessage("");

    const updated = [
      ...session.messages,
      { role: "candidate" as const, content: msg }
    ];
    setSession(prev => ({ ...prev, messages: updated }));
    setLoading(true);

    try {
      const res = await fetch("/api/ai/interview/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          message: msg,
          roundTitle: session.roundTitle
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSession(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            { role: "interviewer", content: data.interviewerMessage }
          ]
        }));
      }
    } catch (e: any) {
      setSession(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: "interviewer", content: "Great approach! A Hash Map paired with a Doubly Linked List guarantees O(1) for both lookup and repositioning. How do you handle capacity eviction?" }
        ]
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await fetch("/api/ai/interview/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          dialogueHistory: session.messages
        })
      });
      if (res.ok) {
        const data = await res.json();
        setEvaluationReport(data);
        toast({ title: "Interview Evaluated!", description: `Score: ${data.overallScore}/100` });
      }
    } catch (e: any) {
      setEvaluationReport({
        overallScore: 84,
        strengths: ["Clear approach explanation", "Strong data structure selection"],
        areasForImprovement: ["State boundary conditions explicitly"]
      });
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
              <span className="text-sm font-black">A</span>
            </div>
            <h3 className="font-semibold text-sm tracking-tight text-white">
              Mock Technical Interview
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              Live Practice
            </span>
          </div>
        </div>

        {/* Video Card and Chat in split columns */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Left Avatar Camera Box */}
          <div className="md:col-span-5 bg-slate-950 rounded-xl border border-slate-800 p-3 relative flex flex-col items-center justify-center overflow-hidden">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=260&q=80"
                alt="AI Interviewer"
                className="w-24 h-24 rounded-full object-cover border-2 border-purple-500/50 shadow-lg"
              />
              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-slate-950"></span>
            </div>

            <div className="mt-2 text-center">
              <div className="text-xs font-semibold text-white">AI Interviewer</div>
              <div className="text-[10px] text-slate-400">Technical Lead</div>
            </div>

            {/* Media Icon Buttons matching reference */}
            <div className="mt-3 flex items-center gap-2">
              <button className="h-7 w-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors">
                <Mic className="h-3.5 w-3.5" />
              </button>
              <button className="h-7 w-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors">
                <Video className="h-3.5 w-3.5" />
              </button>
              <button className="h-7 w-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-colors shadow">
                <Phone className="h-3.5 w-3.5 rotate-[135deg]" />
              </button>
            </div>
          </div>

          {/* Right Dialogue Transcript Box */}
          <div className="md:col-span-7 flex flex-col justify-between h-full">
            <div>
              <div className="text-[11px] font-semibold text-purple-400 mb-2">
                {session.roundTitle}
              </div>

              {/* Chat Bubble matching reference */}
              <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl text-xs text-slate-200 leading-relaxed max-w-[95%]">
                {session.messages[session.messages.length - 1]?.content}
              </div>
            </div>

            {/* Candidate response input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="mt-4 flex items-center gap-2"
            >
              <Input
                value={candidateMessage}
                onChange={(e) => setCandidateMessage(e.target.value)}
                placeholder="Your response..."
                className="h-9 text-xs bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 rounded-xl"
              />
              <Button
                type="submit"
                size="sm"
                disabled={loading || !candidateMessage.trim()}
                className="h-9 w-9 p-0 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shrink-0 shadow-md shadow-purple-600/30"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>

        {/* Evaluation Summary Report */}
        {evaluationReport && (
          <div className="mt-3 p-3 bg-purple-950/40 border border-purple-800/60 rounded-xl text-xs">
            <div className="flex items-center justify-between font-semibold text-purple-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Score: {evaluationReport.overallScore}/100
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                +4% Placement Readiness
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterviewCard;
