import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/35 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-cyan-600 to-violet-600 text-white shadow-md shadow-black/25 hover:from-cyan-500 hover:to-violet-500 hover:shadow-lg hover:shadow-cyan-950/30 active:scale-[0.98]",
        destructive:
          "bg-red-600 text-white shadow-md shadow-black/20 hover:bg-red-500 active:scale-[0.98]",
        outline:
          "border border-white/15 bg-white/[0.05] text-slate-100 shadow-sm hover:border-white/22 hover:bg-white/[0.09] active:scale-[0.99]",
        secondary:
          "bg-white/[0.08] text-slate-100 shadow-sm hover:bg-white/[0.12] active:scale-[0.99]",
        ghost:
          "text-slate-300 hover:bg-white/[0.06] hover:text-slate-50",
        link:
          "text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
