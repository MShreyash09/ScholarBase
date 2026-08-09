import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill text-sm font-semibold transition-colors duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-600 hover:shadow-md hover:shadow-primary/20",
        secondary: "bg-muted text-primary-700 hover:bg-primary/10 dark:text-primary-200",
        // The dark: overrides are not cosmetic. The brand maroon (#850013) on
        // the dark surface measures 1.8:1 — effectively invisible — so these
        // two variants (which include the header "Log in") were unreadable in
        // dark mode. primary-200/300 clear 4.5:1 against --surface.
        outline:
          "border border-primary text-primary hover:bg-primary/10 dark:border-primary-300 dark:text-primary-200 dark:hover:bg-primary-300/10",
        ghost: "text-primary hover:bg-primary/10 dark:text-primary-200 dark:hover:bg-primary-300/10",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
