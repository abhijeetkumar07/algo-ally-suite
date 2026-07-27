import { motion } from "framer-motion";
import { Zap, Trophy, Calendar } from "lucide-react";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StreakBadgesProps {
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  earnedBadgeKeys: string[];
}

const StreakBadges = ({ currentStreak, longestStreak, totalDaysActive, earnedBadgeKeys }: StreakBadgesProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-2xl p-6"
    >
      <h3 className="font-display font-semibold text-lg mb-6 text-foreground flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary fill-primary/20" /> Streaks & Badges
      </h3>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="text-center p-4 rounded-2xl bg-primary/5 border border-primary/10 transition-colors hover:bg-primary/10">
          <div className="text-2xl font-display font-bold text-primary mb-1">{currentStreak}</div>
          <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">Current Streak</div>
        </div>
        <div className="text-center p-4 rounded-2xl bg-accent/5 border border-accent/10 transition-colors hover:bg-accent/10">
          <div className="text-2xl font-display font-bold text-accent mb-1">{longestStreak}</div>
          <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">Best Streak</div>
        </div>
        <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
          <div className="text-2xl font-display font-bold text-foreground mb-1">{totalDaysActive}</div>
          <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">Days Active</div>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {BADGE_DEFINITIONS.map((badge) => {
          const earned = earnedBadgeKeys.includes(badge.key);
          return (
            <Tooltip key={badge.key}>
              <TooltipTrigger>
                <div className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${earned
                    ? "bg-primary/10 border border-primary/20 shadow-glow"
                    : "bg-white/5 border border-white/5 opacity-20 grayscale scale-95"
                  }`}>
                  {badge.emoji}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="p-1">
                  <p className="font-bold text-xs">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </motion.div>
  );
};

export default StreakBadges;
