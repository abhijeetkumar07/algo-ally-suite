import { CalendarDays, ChevronLeft, ChevronRight, CheckCircle2, Circle, Trash2, Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  tag?: string;
}

const WeeklyPlanner = ({ onTaskUpdate }: { onTaskUpdate?: () => void }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/tasks", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (e) {
      console.error("Failed to fetch tasks", e);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !token) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: newTask, completed: false })
      });

      if (response.ok) {
        const data = await response.json();
        setTasks([...tasks, data]);
        setNewTask("");
        toast({ title: "Task added" });
      }
    } catch (e) {
      toast({ title: "Failed to add task", variant: "destructive" });
    }
  };

  const toggleTask = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/tasks/${id}/toggle`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t.id === id ? updatedTask : t));
        if (onTaskUpdate) onTaskUpdate();
      }
    } catch (e) {
      console.error("Toggle failed", e);
    }
  };

  const deleteTask = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== id));
        toast({ title: "Task deleted" });
      }
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const days = [
    { name: "Mon", date: 23 },
    { name: "Tue", date: 24 },
    { name: "Wed", date: 25, current: true },
    { name: "Thu", date: 26 },
    { name: "Fri", date: 27 },
    { name: "Sat", date: 28 },
    { name: "Sun", date: 1 },
  ];

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border-white/5"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-lg text-white flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" /> Daily Planner
        </h3>
        <div className="flex items-center gap-4">
          <ChevronLeft className="h-4 w-4 text-slate-500 cursor-pointer hover:text-white" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Feb 23 — Mar 1</span>
          <ChevronRight className="h-4 w-4 text-slate-500 cursor-pointer hover:text-white" />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-8">
        {days.map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase text-slate-500 font-bold">{day.name}</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${day.current
              ? "bg-primary/20 text-primary border border-primary/30 shadow-glow"
              : "text-slate-400 hover:bg-white/5"
              }`}>
              {day.date}
            </div>
            {day.current && <div className="w-1 h-1 rounded-full bg-primary" />}
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-6 min-h-[50px]">
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
          </div>
        ) : (
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleTask(task.id)} className="transition-transform hover:scale-110">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-600" />
                    )}
                  </button>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${task.completed ? "text-slate-500 line-through" : "text-white"}`}>
                      {task.text}
                    </span>
                    {task.tag && (
                      <span className="px-2 py-0.5 rounded-full text-[8px] uppercase bg-primary/10 text-primary font-bold tracking-tighter">
                        {task.tag}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:text-rose-500 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <form onSubmit={addTask} className="relative">
        <Input
          placeholder="Add a high-priority task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="h-12 bg-black/20 border-white/10 focus:ring-primary/20 pr-14 text-white placeholder:text-slate-600 rounded-xl"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between px-1">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
          {completedCount}/{tasks.length} tasks completed
        </p>
      </div>
    </motion.div>
  );
};

export default WeeklyPlanner;
