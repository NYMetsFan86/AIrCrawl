import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "high" | "medium" | "low";
}

export function Badge({ 
  className, 
  variant = "default", 
  ...props 
}: BadgeProps) {
  const variantClasses = {
    default: "bg-[#3f383b] text-white",
    outline: "border border-[#3f383b] text-[#3f383b]",
    high: "bg-[#860808] text-white",
    medium: "bg-[#c2b19c] text-[#3f383b]",
    low: "bg-[#f0f1f0] text-[#3f383b] border border-[#3f383b]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}