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
