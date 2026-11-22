import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  theme?: "light" | "dark" | "auto";
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
  showText = true,
  theme = "auto"
}) => {
  const sizeMap = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-xl"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
    xl: "h-9 w-9"
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Stylized Glowing Purple "A" Squircle */}
      <div
        className={`${sizeMap[size]} rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-violet-500 p-[1.5px] shadow-lg shadow-indigo-500/25 flex items-center justify-center relative overflow-hidden group shrink-0`}
      >
        <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex items-center justify-center relative">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-radial from-violet-500/30 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity"></div>
          {/* Custom SVG "A" Ribbon Symbol */}
          <svg
            className={`${iconSizes[size]} text-transparent drop-shadow-[0_2px_8px_rgba(168,85,247,0.8)]`}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 32C11 25 17 12 20 6C23 12 29 25 32 32C29 32 26 29 20 29C14 29 11 32 8 32Z"
              fill="url(#logo_grad)"
            />
            <path
              d="M14 22H26"
              stroke="#E0E7FF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="logo_grad" x1="8" y1="6" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#C084FC" />
                <stop offset="0.5" stopColor="#A855F7" />
                <stop offset="1" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-display font-black text-white tracking-tight text-base sm:text-lg flex items-center gap-1 leading-none">
            Algo Ally <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-extrabold">Pro</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
            AI Technical Interview Platform
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
