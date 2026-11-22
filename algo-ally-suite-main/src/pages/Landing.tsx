import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Code2, Bot, Users, Route, ArrowRight, Play, CheckCircle2,
  Sparkles, Terminal, Flame, Target, Laptop
} from "lucide-react";

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-foreground selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Gradient Blurs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation */}
      <header className="border-b border-border/40 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <span className="text-white font-black text-lg tracking-tighter">A</span>
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              Algo Ally <span className="text-indigo-400 font-extrabold text-sm">Pro</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#dsa" className="hover:text-white transition-colors">DSA</a>
            <a href="#mock-interview" className="hover:text-white transition-colors">Mock Interview</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#resources" className="hover:text-white transition-colors">Resources</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white">
                Log in
              </Button>
            </Link>
            <Link to="/auth?mode=register">
              <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-4 shadow-md shadow-indigo-600/30">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Technical Interview Ecosystem</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-display font-black tracking-tight text-white leading-tight"
          >
            Learn Smarter. <br />
            Code Better. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Get Placement Ready.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed"
          >
            An AI-powered platform to master DSA, practice coding in an isolated judge,
            receive multi-level AI explanations, practice live mock interviews, and track your
            true placement readiness — all in one ecosystem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <Link to="/auth?mode=register">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl px-6 h-11 shadow-lg shadow-indigo-600/30 flex items-center gap-2">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-sm rounded-xl px-5 h-11 flex items-center gap-2"
            >
              <Play className="h-3.5 w-3.5 text-indigo-400" /> Watch Demo
            </Button>
          </motion.div>

          {/* Feature Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-6 border-t border-border/40 text-xs text-slate-300 font-medium"
          >
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/40 border border-border/40">
              <Bot className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>AI DSA Tutor</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/40 border border-border/40">
              <Code2 className="h-4 w-4 text-purple-400 shrink-0" />
              <span>Coding Judge</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/40 border border-border/40">
              <Users className="h-4 w-4 text-pink-400 shrink-0" />
              <span>Mock Interviews</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/40 border border-border/40">
              <Route className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Personalized Roadmap</span>
            </div>
          </motion.div>
        </div>

        {/* Laptop Preview Graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-5 relative"
        >
          <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-3 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
            <div className="flex items-center gap-1.5 pb-2 px-1 border-b border-border/40">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80"></span>
              <span className="text-[10px] text-slate-500 font-mono ml-2">algoally-pro/workspace</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl mt-2 font-mono text-[11px] text-slate-300 space-y-1">
              <div className="text-indigo-400">// Ready for placement interview</div>
              <div><span className="text-purple-400">class</span> <span className="text-emerald-400">Candidate</span> &#123;</div>
              <div className="pl-4 text-slate-400">mastery: <span className="text-amber-400">"82% Placement Ready"</span>,</div>
              <div className="pl-4 text-slate-400">problemsSolved: <span className="text-indigo-300">482</span>,</div>
              <div className="pl-4 text-slate-400">streak: <span className="text-amber-300">16</span>,</div>
              <div className="pl-4 text-slate-400">interviewReady: <span className="text-emerald-400">true</span></div>
              <div>&#125;</div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
