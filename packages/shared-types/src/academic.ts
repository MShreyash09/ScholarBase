export interface YearLevelDto {
  id: string;
  yearNumber: number;
  label: string;
}

export interface SubjectDto {
  id: string;
  yearLevelId: string;
  code: string;
  name: string;
  department: string | null;
  semester: number | null;
  credits: number | null;
}

export interface ExamTypeDto {
  id: string;
  name: string;
}

/**
 * The exam types the UI renders a section for, in the order students sit them.
 *
 * Exam types are rows in the database, not an enum, so an admin can add one at
 * any time — but the pages that group papers by exam type need a fixed order
 * and cannot invent section headings from an unordered list. This constant is
 * that order, shared so the seed and the UI cannot drift apart: a name listed
 * here but missing from the database renders an empty section, and a name in
 * the database but missing here hides its papers entirely.
 *
 * RE-ETE is the re-examination of the end-term paper — the second attempt
 * offered so a failed subject does not become a back.
 */
export const EXAM_TYPE_LABELS = ["Unit Test", "End Term", "RE-ETE"] as const;

export interface CreateYearLevelDto {
  yearNumber: number;
  label: string;
}

export interface CreateSubjectDto {
  yearLevelId: string;
  code: string;
  name: string;
  department?: string | null;
  semester?: number | null;
  credits?: number | null;
}

export interface CreateExamTypeDto {
  name: string;
}
