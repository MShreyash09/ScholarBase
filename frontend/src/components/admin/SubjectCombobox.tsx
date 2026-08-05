import { forwardRef, useId, useImperativeHandle, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { SubjectDto, YearLevelDto } from "@scholarbase/shared-types";
import { subjectsApi } from "@/lib/api/academic";
import { Input } from "@/components/ui/input";

export interface SubjectComboboxHandle {
  /** Returns a subjectId, creating the subject first if the admin typed a new one. */
  resolve: () => Promise<string>;
  reset: () => void;
}

interface SubjectComboboxProps {
  subjects: SubjectDto[];
  yearLevels: YearLevelDto[];
}

function labelFor(subject: SubjectDto): string {
  return `${subject.code} — ${subject.name}`;
}

/** Fallback code derived from the name when the admin doesn't supply one. */
function deriveCode(name: string): string {
  return name.replace(/[^A-Za-z0-9]/g, "").slice(0, 10).toUpperCase() || "SUBJECT";
}

/**
 * A type-to-search subject field. The admin can pick an existing subject from
 * the suggestions, or type a brand-new one — in which case it's created on the
 * fly (a subject needs a year level, so that + an optional code appear inline)
 * before the paper/note is attached to it. Uploads always end up with a real
 * subjectId, which is what the API requires.
 */
export const SubjectCombobox = forwardRef<SubjectComboboxHandle, SubjectComboboxProps>(
  ({ subjects, yearLevels }, ref) => {
    const queryClient = useQueryClient();
    const listId = `subjects-${useId().replace(/:/g, "")}`;

    const [text, setText] = useState("");
    const [yearLevelId, setYearLevelId] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);

    const match = useMemo(() => {
      const needle = text.trim().toLowerCase();
      if (!needle) return null;
      return (
        subjects.find((s) => labelFor(s).toLowerCase() === needle) ??
        subjects.find((s) => s.name.toLowerCase() === needle) ??
        subjects.find((s) => s.code.toLowerCase() === needle) ??
        null
      );
    }, [text, subjects]);

    const isNew = text.trim().length > 0 && !match;

    useImperativeHandle(ref, () => ({
      reset: () => {
        setText("");
        setYearLevelId("");
        setCode("");
        setError(null);
      },
      resolve: async () => {
        setError(null);
        const name = text.trim();
        if (!name) {
          const message = "Type or pick a subject.";
          setError(message);
          throw new Error(message);
        }
        if (match) return match.id;

        // New subject: a year level is required; the code falls back to a slug
        // of the name when the admin leaves it blank.
        if (!yearLevelId) {
          const message = "Pick a year level for the new subject.";
          setError(message);
          throw new Error(message);
        }
        const finalCode = (code.trim() || deriveCode(name)).toUpperCase();

        // Reuse an existing subject with the same code in that year rather than
        // hitting the unique [yearLevel, code] constraint.
        const existing = subjects.find(
          (s) => s.yearLevelId === yearLevelId && s.code.toLowerCase() === finalCode.toLowerCase(),
        );
        if (existing) return existing.id;

        try {
          const created = await subjectsApi.create({ yearLevelId, code: finalCode, name });
          await queryClient.invalidateQueries({ queryKey: ["subjects"] });
          return created.id;
        } catch {
          const message =
            "Could not create that subject — a subject with this code may already exist in that year.";
          setError(message);
          throw new Error(message);
        }
      },
    }));

    return (
      <div className="flex flex-col gap-2">
        <Input
          list={listId}
          placeholder="Type or pick a subject"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          required
          aria-label="Subject"
        />
        <datalist id={listId}>
          {subjects.map((s) => (
            <option key={s.id} value={labelFor(s)} />
          ))}
        </datalist>

        {isNew && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <span className="font-semibold">New subject — will be created:</span>
            <select
              className="h-8 rounded border border-muted bg-surface px-2 text-xs"
              value={yearLevelId}
              onChange={(e) => setYearLevelId(e.target.value)}
              aria-label="Year level for new subject"
            >
              <option value="">Year level</option>
              {yearLevels.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.label}
                </option>
              ))}
            </select>
            <input
              className="h-8 w-32 rounded border border-muted bg-surface px-2 text-xs"
              placeholder="Code (optional)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-label="Code for new subject"
            />
          </div>
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
SubjectCombobox.displayName = "SubjectCombobox";
