import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function Loading({ className, size = "md", ...props }: LoadingProps) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent",
          {
            "h-4 w-4": size === "sm",
            "h-6 w-6": size === "md",
            "h-8 w-8": size === "lg",
          },
        )}
      />
    </div>
  );
}
