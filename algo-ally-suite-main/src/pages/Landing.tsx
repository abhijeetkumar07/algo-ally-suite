import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Code2, Bot, Users, Route, ArrowRight, Play, CheckCircle2,
  Sparkles, Terminal, Flame, Target, Laptop, ChevronDown, Check
} from "lucide-react";
import Logo from "@/components/brand/Logo";

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0D091D] text-white selection:bg-purple-600 selection:text-white relative overflow-x-hidden">
      {/* Background Violet/Purple Radial Auras matching Image 7 */}
      <div className="absolute top-0 left-1/3 w-[650px] h-[650px] bg-purple-700/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-60 right-0 w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Top Navbar matching Image 7 */}
      <header className="border-b border-purple-500/10 bg-[#0D091D]/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#dsa-roadmap" className="hover:text-white transition-colors">DSA Roadmap</a>
            <a href="#mock-interview" className="hover:text-white transition-colors">Mock Interview</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white hover:bg-white/5">
                Log in
              </Button>
            </Link>
            <Link to="/auth?mode=register">
              <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl px-5 h-9 shadow-lg shadow-purple-600/30">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section matching Image 7 */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & CTA */}
          <div className="lg:col-span-5 space-y-6">
            {/* Pill: AI + DSA + Placement */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>AI + DSA + Placement</span>
            </motion.div>

            {/* 3-line Headline matching Image 7 */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.08]"
            >
              Learn Smarter. <br />
              Code Better. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-300">
                Get Placement Ready.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-300 text-sm md:text-base max-w-lg leading-relaxed font-normal"
            >
              Your all-in-one platform to master DSA, practice coding, get AI guidance, and ace technical interviews.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 pt-2"
            >
              <Link to="/auth?mode=register">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl px-6 h-12 shadow-xl shadow-purple-600/35 flex items-center gap-2">
                  <span>Start for Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-white text-xs font-semibold rounded-2xl px-5 h-12 flex items-center gap-2"
              >
                <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="h-3 w-3 fill-white text-white" />
                </div>
                <span>Watch Demo</span>
              </Button>
            </motion.div>
          </div>

          {/* Right Column: 3D Laptop Mockup + 4 Floating Glassmorphic Cards matching Image 7 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 relative flex items-center"
          >
            {/* 3D Laptop Container */}
            <div className="w-full max-w-2xl bg-gradient-to-b from-slate-800 to-slate-950 p-2.5 rounded-3xl border border-slate-700/80 shadow-[0_20px_60px_-15px_rgba(147,51,234,0.3)]">
              {/* Laptop Screen Bezel */}
              <div className="bg-[#120F24] rounded-2xl border border-slate-800/90 overflow-hidden text-xs">
                {/* Top Window Bar inside screen */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 bg-slate-950/60">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-purple-600 flex items-center justify-center text-[10px] font-bold">
                      A
                    </div>
                    <span className="font-semibold text-[11px] text-slate-300">Algo Tutor</span>
                    <span className="text-[10px] text-slate-500 ml-2">Submissions</span>
                    <span className="text-[10px] text-slate-500 ml-2">Discussion</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                      Java
                    </span>
                    <button className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold flex items-center gap-1">
                      <Play className="h-2.5 w-2.5 fill-slate-300" /> Run
                    </button>
                    <button className="px-2 py-0.5 rounded bg-purple-600 text-[10px] text-white font-semibold shadow-sm">
                      Submit
                    </button>
                  </div>
                </div>

                {/* Inside Screen Grid: Left Problem Statement, Right Code Editor */}
                <div className="grid grid-cols-12 min-h-[220px]">
                  {/* Problem Description Column */}
                  <div className="col-span-5 p-3.5 border-r border-slate-800/80 space-y-2 bg-[#120F24]/90">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white">Two Sum</h4>
                      <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-400/10">
                        Medium
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
                    </p>
                    <div className="bg-slate-900/80 p-2 rounded-lg text-[9px] font-mono text-slate-300 space-y-0.5 border border-slate-800">
                      <div className="text-slate-400">Example 1:</div>
                      <div>Input: nums = [2,7,11,15], target = 9</div>
                      <div>Output: [0,1]</div>
                    </div>
                  </div>

                  {/* Code Editor Column */}
                  <div className="col-span-7 p-3 font-mono text-[10px] text-slate-300 bg-[#0A0718] relative flex flex-col justify-between">
                    <div className="space-y-0.5 leading-relaxed">
                      <div className="text-slate-500">// O(N) Hash Map Lookup</div>
                      <div><span className="text-purple-400">class</span> <span className="text-cyan-300">Solution</span> &#123;</div>
                      <div className="pl-3"><span className="text-purple-400">public int</span>[] <span className="text-indigo-300">twoSum</span>(<span className="text-purple-400">int</span>[] nums, <span className="text-purple-400">int</span> target) &#123;</div>
                      <div className="pl-6 text-slate-400">Map&lt;Integer, Integer&gt; map = <span className="text-purple-400">new</span> HashMap&lt;&gt;();</div>
                      <div className="pl-6 text-slate-400"><span className="text-purple-400">for</span> (<span className="text-purple-400">int</span> i = 0; i &lt; nums.length; i++) &#123;</div>
                      <div className="pl-9 text-slate-400"><span className="text-purple-400">int</span> comp = target - nums[i];</div>
                      <div className="pl-9 text-slate-400"><span className="text-purple-400">if</span> (map.containsKey(comp)) &#123;</div>
                      <div className="pl-12 text-emerald-400"><span className="text-purple-400">return new int</span>[] &#123; map.get(comp), i &#125;;</div>
                      <div className="pl-9 text-slate-400">&#125;</div>
                      <div className="pl-9 text-slate-400">map.put(nums[i], i);</div>
                      <div className="pl-6 text-slate-400">&#125;</div>
                      <div className="pl-6 text-slate-400"><span className="text-purple-400">return new int</span>[]&#123;&#125;;</div>
                      <div className="pl-3">&#125;</div>
                      <div>&#125;</div>
                    </div>

                    {/* Green Accepted Pill matching Image 7 */}
                    <div className="mt-2 flex items-center justify-start">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-[10px]">
                        <Check className="h-3 w-3 stroke-[3]" />
                        <span>Accepted</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Floating Glassmorphic Cards Stacked on the Right matching Image 7 */}
            <div className="hidden sm:flex flex-col gap-2.5 -ml-8 z-20">
              {/* Card 1: AI DSA Tutor */}
              <motion.div
                whileHover={{ scale: 1.05, x: 5 }}
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1D1836]/90 backdrop-blur-xl border border-purple-500/30 shadow-xl cursor-pointer hover:border-purple-400 transition-all text-xs font-bold text-white"
              >
                <div className="h-7 w-7 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <span>AI DSA Tutor</span>
              </motion.div>

              {/* Card 2: Code Review */}
              <motion.div
                whileHover={{ scale: 1.05, x: 5 }}
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1D1836]/90 backdrop-blur-xl border border-purple-500/30 shadow-xl cursor-pointer hover:border-purple-400 transition-all text-xs font-bold text-white"
              >
                <div className="h-7 w-7 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center shrink-0">
                  <Code2 className="h-4 w-4" />
                </div>
                <span>Code Review</span>
              </motion.div>

              {/* Card 3: Mock Interview */}
              <motion.div
                whileHover={{ scale: 1.05, x: 5 }}
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1D1836]/90 backdrop-blur-xl border border-purple-500/30 shadow-xl cursor-pointer hover:border-purple-400 transition-all text-xs font-bold text-white"
              >
                <div className="h-7 w-7 rounded-xl bg-pink-600/30 text-pink-300 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <span>Mock Interview</span>
              </motion.div>

              {/* Card 4: Adaptive Roadmap */}
              <motion.div
                whileHover={{ scale: 1.05, x: 5 }}
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1D1836]/90 backdrop-blur-xl border border-purple-500/30 shadow-xl cursor-pointer hover:border-purple-400 transition-all text-xs font-bold text-white"
              >
                <div className="h-7 w-7 rounded-xl bg-emerald-600/30 text-emerald-300 flex items-center justify-center shrink-0">
                  <Route className="h-4 w-4" />
                </div>
                <span>Adaptive Roadmap</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
