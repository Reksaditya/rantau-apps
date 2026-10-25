import React from "react";

export type BadgeVariant =
  | "primary"
  | "completed"
  | "in_progress"
  | "warning"
  | "error"
  | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  primary: "bg-[#E8F4F0] text-[#1B8366] border border-[#B7DCCF]",
  completed: "bg-[#E8F5EC] text-[#18794E]",
  in_progress: "bg-[#EAF2FF] text-[#175CD3]",
  warning: "bg-[#FFF4D6] text-[#9A6700]",
  error: "bg-[#FDECEC] text-[#C62828]",
  neutral: "bg-[#EEF2F0] text-[#52645D]",
};

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium leading-[1.4] ${VARIANT_STYLES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

