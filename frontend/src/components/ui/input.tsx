import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      // border-control (not border-muted): in dark, --muted sat almost on top
      // of --surface so the field had no visible edge at all, and the softer
      // --border used for card edges only reaches ~1.25:1 here — under the 3:1
      // WCAG wants for control boundaries. Placeholder moves off the fixed
      // neutral-400 (2.54:1 in light) onto the themed subtle token.
      "flex h-10 w-full rounded-lg border border-control bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-foreground-subtle hover:border-foreground-subtle focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
