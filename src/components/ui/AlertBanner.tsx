import React from "react";
import Link from "next/link";

interface AlertBannerProps {
  variant: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onRetry?: () => void;
  actionHref?: string;
  actionLabel?: string;
}

const BANNER_STYLES = {
  success: "bg-[#E8F5EC] border-[#18794E] text-[#18794E]",
  error: "bg-[#FDECEC] border-[#C62828] text-[#C62828]",
  warning: "bg-[#FFF4D6] border-[#9A6700] text-[#9A6700]",
  info: "bg-[#EAF2FF] border-[#175CD3] text-[#175CD3]",
};

export function AlertBanner({
  variant,
  title,
  message,
  onRetry,
  actionHref,
  actionLabel,
}: AlertBannerProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-xl border p-4 ${BANNER_STYLES[variant]}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title && <p className="text-sm font-semibold">{title}</p>}
          <p className="text-sm leading-[1.5]">{message}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg border border-current px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[#FFFFFF] cursor-pointer"
            >
              Coba Lagi
            </button>
          )}
          {actionHref && actionLabel && (
            <Link
              href={actionHref}
              className="rounded-lg bg-[#1B8366] px-3 py-1.5 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#166B53]"
            >
              {actionLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-[#C8D4CE] bg-[#FFFFFF] p-8 text-center">
      <h3 className="text-lg font-bold text-[#172B25]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#52645D]">
        {description}
      </p>
      {actionLabel && actionHref && (
        <div className="mt-5">
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center rounded-lg bg-[#1B8366] px-4 py-2.5 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#166B53] active:bg-[#125642]"
          >
            {actionLabel}
          </Link>
        </div>
      )}
      {actionLabel && !actionHref && onAction && (
        <div className="mt-5">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center rounded-lg bg-[#1B8366] px-4 py-2.5 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#166B53] active:bg-[#125642] cursor-pointer"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}

