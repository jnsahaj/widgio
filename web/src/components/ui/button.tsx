import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-all duration-100 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
        ghost:
          "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
        outline:
          "border border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-border-strong/70",
        destructive:
          "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
      },
      size: {
        default: "h-7 px-2.5 text-[11px]",
        sm: "h-6 px-2 text-[10.5px]",
        icon: "h-6 w-6 p-0",
        "icon-sm": "h-5 w-5 p-0",
      },
    },
    defaultVariants: { variant: "ghost", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

export { buttonVariants };
