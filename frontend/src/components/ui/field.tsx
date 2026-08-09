import * as React from "react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "@/components/ui/input";

export interface FieldProps extends InputProps {
  label: string;
  /** Shown under the input; also wired up as the input's description. */
  hint?: string;
  error?: string;
}

/**
 * A labelled input.
 *
 * The forms previously used placeholders as their only labels, which is a
 * usability problem rather than a style one: the label vanishes as soon as the
 * user types, there is nothing to click to focus, and assistive tech has no
 * reliable accessible name. A real <label> fixes all three.
 */
const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-semibold text-foreground">
          {label}
        </label>
        <Input
          id={inputId}
          ref={ref}
          aria-describedby={cn(hintId, errorId) || undefined}
          aria-invalid={error ? true : undefined}
          className={cn(error && "border-danger focus-visible:border-danger", className)}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-foreground-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Field.displayName = "Field";

export { Field };
