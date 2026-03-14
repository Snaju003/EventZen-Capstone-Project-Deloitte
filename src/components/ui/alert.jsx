import * as React from "react";
import { cn } from "@/lib/utils";

const alertVariants = {
  default: "border-slate-200 bg-slate-50 text-slate-800",
  destructive: "border-red-200 bg-red-50 text-red-700",
};

function Alert({ className, variant = "default", ...props }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(
        "relative w-full rounded-lg border px-4 py-3 text-left text-sm",
        alertVariants[variant] || alertVariants.default,
        className,
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }) {
  return (
    <div
      data-slot="alert-title"
      className={cn("font-medium", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm leading-relaxed opacity-90", className)}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
