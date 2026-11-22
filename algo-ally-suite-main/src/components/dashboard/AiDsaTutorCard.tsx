import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, ChevronDown, ChevronUp, Lightbulb, Compass, Code, MessageSquare, Loader2, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TutorResponse {
  query: string;
  selectedLevel?: string;
  explanation: string;
  allLevels?: Record<string, string>;
  citations?: string[];
  suggestedQuestions?: string[];
  hintMode?: boolean;
  stage?: number;
  stageName?: string;
  hasMoreHints?: boolean;
  nextStage?: number;
}

export const AiDsaTutorCard: React.FC = () => {
  const [hintMode, setHintMode] = useState(false);
  const [hintStage, setHintStage] = useState(1);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    Beginner: false,
    Intermediate: false,
    Advanced: false,
    Interview: false
  });

  const { token } = useAuth();
  const { toast } = useToast();

  const [tutorData, setTutorData] = useState<TutorResponse>({
    query: "Explain binary search like I'm a beginner.",
    selectedLevel: "Beginner",
    explanation: "Imagine you have a sorted list of numbers and you want to find a specific number. Instead of checking every number one by one, you repeatedly check the middle element and eliminate half of the list each time.",
    allLevels: {
      Beginner: "Imagine flipping open a physical phone book directly to the midpoint. If the name starts with 'S' and you landed on 'M', you discard the entire first half [A-L] immediately! In just a few checks, a million entries shrinks to single digits.",
      Intermediate: "1. Define pointers: left = 0, right = n - 1.\n2. Loop while left <= right, evaluating mid = left + (right - left) / 2.\n3. Compare nums[mid] == target. If matched, return mid. If nums[mid] < target, left = mid + 1; otherwise right = mid - 1.\n4. If loop terminates without a match, return -1.",
      Advanced: "Complexity Analysis:\n- Worst/Average Time: O(log n)\n- Best Time: O(1)\n- Auxiliary Space: O(1) iterative\nOverflow Safety: Use left + ((right - left) >> 1) or left + (right - left) / 2 to avoid 32-bit signed integer overflow. Flat memory layout maximizes L1/L2 cache line hits.",
      Interview: "Key Steps for Whiteboard Interviews:\n1. Clarify preconditions: 'Is the array strictly monotonic? Can duplicates exist?'\n2. Pitch linear scan O(n), then state the O(log n) binary search optimization.\n3. Point out integer overflow safeguards proactively.\n4. Test boundaries: empty array, 1-element match, target smaller than min or greater than max."
    },
    suggestedQuestions: [
      "Compare BFS and DFS tree traversal.",
      "Why does recursive binary search use O(log n) space?",
      "Give me a hint for Two Sum."
    ]
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAsk = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;
    setLoading(true);

    try {
      const response = await fetch("/api/ai/tutor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          query: q,
          level: "Beginner",
          hintMode: hintMode,
          hintStage: hintMode ? hintStage : 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTutorData(data);
        if (queryText) setInputQuery("");
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Tutor Query",
        description: "Engaging local knowledge fallback."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextHint = () => {
    const next = Math.min((tutorData.stage || 1) + 1, 5);
    setHintStage(next);
    handleAsk(tutorData.query);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between h-full">
      <div>
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
              <Bot className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm tracking-tight text-white flex items-center gap-2">
              AI DSA Tutor
            </h3>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-400 font-medium">Hint Mode</span>
            <Switch
              checked={hintMode}
              onCheckedChange={(val) => {
                setHintMode(val);
                setHintStage(1);
              }}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
        </div>

        {/* User Question Bubble */}
        <div className="mt-4 flex justify-end">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-4 py-2 rounded-2xl rounded-tr-sm max-w-[85%] font-medium shadow-md">
            {tutorData.query}
          </div>
        </div>

        {/* AI Answer Bubble Card */}
        <div className="mt-3.5 bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 text-xs text-slate-200">
          <div className="flex items-center gap-2 text-indigo-400 font-medium mb-2">
            <div className="h-5 w-5 rounded-md bg-purple-600/20 flex items-center justify-center text-purple-400">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <span>Sure! Let's understand Binary Search in a simple way.</span>
          </div>

          {/* Intuition Header */}
          <div className="mt-2 text-slate-300 text-[11px] leading-relaxed">
            <strong className="text-amber-400 flex items-center gap-1 font-semibold mb-1">
              <Search className="h-3 w-3" /> Intuition
            </strong>
            <p className="text-slate-300">{tutorData.explanation}</p>
          </div>

          {/* Hint Mode Button */}
          {hintMode && tutorData.hasMoreHints && (
            <div className="mt-3">
              <Button
                size="sm"
                onClick={handleNextHint}
                className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] h-7 px-3 rounded-lg"
              >
                <Lightbulb className="h-3 w-3 mr-1" /> Next Progressive Hint (Stage {(tutorData.stage || 1) + 1}/5)
              </Button>
            </div>
          )}

          {/* Accordion Tabs */}
          {!hintMode && (
            <div className="space-y-1.5 mt-3 pt-2 border-t border-slate-800">
              {[
                { key: "Beginner", label: "Beginner Explanation", icon: Lightbulb },
                { key: "Intermediate", label: "Intermediate Explanation", icon: Compass },
                { key: "Advanced", label: "Advanced (Optimization & Complexity)", icon: Code },
                { key: "Interview", label: "Interview – How to Explain", icon: MessageSquare }
              ].map((tab) => {
                const Icon = tab.icon;
                const isOpen = openAccordions[tab.key];
                return (
                  <div key={tab.key} className="rounded-lg border border-slate-800/70 overflow-hidden bg-slate-900/40">
                    <button
                      onClick={() => toggleAccordion(tab.key)}
                      className="w-full flex items-center justify-between px-3 py-2 text-left text-[11px] font-medium text-slate-200 hover:bg-white/5 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-purple-400" />
                        {tab.label}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-3 py-2 text-[11px] text-slate-300 bg-slate-950/60 border-t border-slate-800/60 whitespace-pre-line leading-relaxed"
                        >
                          {tutorData.allLevels?.[tab.key] || "Detailed explanation available."}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Question Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="mt-4 flex items-center gap-2"
      >
        <Input
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a DSA question..."
          className="h-9 text-xs bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-purple-600 rounded-xl"
        />
        <Button
          type="submit"
          size="sm"
          disabled={loading || !inputQuery.trim()}
          className="h-9 w-9 p-0 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shrink-0 shadow-md shadow-purple-600/30"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
};

export default AiDsaTutorCard;
