import React from "react";

export type ButtonVariant = "primary" | "secondary" | "subtle" | "destructive";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  children: React.ReactNode;
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-[#1B8366] text-[#FFFFFF] hover:bg-[#166B53] active:bg-[#125642] border border-transparent",
  secondary:
    "bg-[#FFFFFF] text-[#172B25] border border-[#C8D4CE] hover:bg-[#F8FAF9]",
  subtle:
    "bg-[#E8F4F0] text-[#1B8366] border border-[#B7DCCF] hover:bg-[#B7DCCF]",
  destructive:
    "bg-[#FDECEC] text-[#C62828] border border-[#C62828] hover:bg-[#C62828] hover:text-[#FFFFFF]",
};

export function Button({
  variant = "primary",
  isLoading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium leading-[1.5] transition-colors ${
        isDisabled
          ? "bg-[#EEF2F0] text-[#98A59E] border border-[#E1E8E4] cursor-not-allowed"
          : `${BUTTON_VARIANTS[variant]} cursor-pointer`
      } ${className}`}
      {...props}
    >
      {isLoading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}

