"use client";

import clsx from "clsx";

interface RerunButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

export default function RerunButton({
  onClick,
  disabled = false,
  title,
  children,
  className,
  size = "md",
}: RerunButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "text-xs rounded transition-colors",
        {
          // Size variants
          "px-2 py-1": size === "sm",
          "px-3 py-1": size === "md",
          // State variants
          "bg-gray-200 text-gray-400 cursor-not-allowed": disabled,
          "bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300 cursor-pointer":
            !disabled,
        },
        className
      )}
      title={title}
    >
      {children}
    </button>
  );
}
