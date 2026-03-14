import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[10px] border border-transparent text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2e4057] active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#2e4057] text-white hover:bg-[#253449]",
        outline:
          "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900",
        secondary:
          "bg-slate-100 text-[#2e4057] hover:bg-slate-200",
        ghost:
          "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300",
        link: "h-auto rounded-none p-0 text-[#2e4057] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1.5 rounded-lg px-2 text-xs",
        sm: "h-9 gap-1.5 px-3 text-sm",
        lg: "h-12 gap-2.5 px-5 text-[0.9375rem]",
        icon: "size-8",
        "icon-xs": "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
