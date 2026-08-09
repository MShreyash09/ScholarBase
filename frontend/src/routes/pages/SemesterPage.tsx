import { Link, Navigate, useParams } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import { DEPARTMENTS, type QuestionPaperDto, type SubjectDto } from "@scholarbase/shared-types";
import { subjectsApi } from "@/lib/api/academic";
import { examTypesApi } from "@/lib/api/exam-types";
import { papersApi } from "@/lib/api/papers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const EXAM_TYPE_LABELS = ["Unit Test", "End Term"];

function PaperRow({ subject, papers }: { subject: SubjectDto; papers: QuestionPaperDto[] }) {
  const download = async (id: string) => {
    const { url } = await papersApi.getDownloadUrl(id);
    window.location.href = url;
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0">
      <div>
        <p className="font-semibold text-foreground">{subject.name}</p>
        <p className="text-xs text-foreground-muted">{subject.code}</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-end">
        {papers.length > 0 ? (
          papers.map((p) => (
            <Button key={p.id} size="sm" onClick={() => download(p.id)}>
              {p.academicYear}
            </Button>
          ))
        ) : (
          <Badge variant="muted">Not uploaded yet</Badge>
        )}
      </div>
    </div>
  );
}

export function SemesterPage() {
  const { dept, yearNumber, semester } = useParams<{
    dept: string;
    yearNumber: string;
    semester: string;
  }>();
  const department = DEPARTMENTS.find((d) => d.code === dept);
  const year = Number(yearNumber);
  const semesterNumber = Number(semester);

  const { data: examTypes } = useQuery({ queryKey: ["exam-types"], queryFn: examTypesApi.list });

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["subjects", { department: dept, semester: semesterNumber }],
    queryFn: () => subjectsApi.list({ department: dept, semester: semesterNumber }),
    enabled: Boolean(department) && Boolean(semesterNumber),
  });

  const paperQueries = useQueries({
    queries: (subjects ?? []).map((s) => ({
      queryKey: ["papers", s.id],
      queryFn: () => papersApi.listBySubject(s.id),
    })),
  });

  const validSemester = semesterNumber === year * 2 - 1 || semesterNumber === year * 2;
  if (!department || !year || year < 1 || year > 4 || !validSemester) {
    return <Navigate to="/" replace />;
  }

  const papersBySubject = new Map<string, QuestionPaperDto[]>();
  (subjects ?? []).forEach((s, i) => {
    papersBySubject.set(s.id, paperQueries[i]?.data ?? []);
  });

  const examTypeIdByLabel = new Map((examTypes ?? []).map((t) => [t.name, t.id]));

  return (
    <div>
      <p className="mb-1 text-sm text-foreground-muted">
        <Link to={`/departments/${department.code}`} className="hover:underline">
          {department.label}
        </Link>{" "}
        /{" "}
        <Link to={`/departments/${department.code}/years/${year}`} className="hover:underline">
          Year {year}
        </Link>
      </p>
      <h1 className="mb-8 text-3xl">Semester {semesterNumber}</h1>

      {isLoading && <p className="text-foreground-muted">Loading...</p>}

      {!isLoading && (!subjects || subjects.length === 0) && (
        <p className="text-foreground-muted">No subjects added for this semester yet.</p>
      )}

      {subjects && subjects.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {EXAM_TYPE_LABELS.map((label) => {
            const examTypeId = examTypeIdByLabel.get(label);
            return (
              <Card key={label}>
                <CardHeader>
                  <CardTitle>{label} papers</CardTitle>
                </CardHeader>
                <CardContent>
                  {subjects.map((subject) => {
                    const allPapers = papersBySubject.get(subject.id) ?? [];
                    const papersForExam = examTypeId
                      ? allPapers.filter((p) => p.examTypeId === examTypeId)
                      : [];
                    return <PaperRow key={subject.id} subject={subject} papers={papersForExam} />;
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
