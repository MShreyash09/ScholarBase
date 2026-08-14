import { Link, Navigate, useParams } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import {
  DEPARTMENTS,
  EXAM_TYPE_LABELS,
  type QuestionPaperDto,
  type SubjectDto,
} from "@scholarbase/shared-types";
import { subjectsApi } from "@/lib/api/academic";
import { examTypesApi } from "@/lib/api/exam-types";
import { papersApi } from "@/lib/api/papers";
import { RE_ETE_DESCRIPTION } from "@/lib/exam-types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function PaperRow({
  subject,
  papers,
  yearNumber,
}: {
  subject: SubjectDto;
  papers: QuestionPaperDto[];
  yearNumber: number;
}) {
  const download = async (id: string) => {
    const { url } = await papersApi.getDownloadUrl(id);
    window.location.href = url;
  };

  return (
    <div className="group flex items-center justify-between gap-3 rounded-lg border-b border-border px-2 py-3 transition-colors last:border-b-0 hover:bg-muted/60">
      {/* Links into SubjectPage, the only place View (and Notes) live — this
          row used to be a dead end with no way to reach either. */}
      <Link to={`/years/${yearNumber}/${subject.id}`} className="min-w-0">
        <p className="truncate font-semibold text-foreground transition-colors group-hover:text-brand">
          {subject.name}
        </p>
        <p className="text-xs text-foreground-muted">{subject.code}</p>
      </Link>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {papers.length > 0 ? (
          papers.map((p) =>
            // A locked paper links to login instead of downloading. The button
            // is still rendered (rather than hidden) so the archive's depth is
            // visible — that is the reason to sign up.
            p.locked ? (
              // The pill swaps its label on hover: the year normally, "Log in"
              // when pointed at. Named group so it reacts to its own hover, not
              // the whole row's.
              <Button
                key={p.id}
                asChild
                size="sm"
                variant="outline"
                className="group/lock"
                title="Log in to view all papers"
              >
                <Link to="/login" aria-label={`Log in to view the ${p.academicYear} paper`}>
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="group-hover/lock:hidden">{p.academicYear}</span>
                  <span className="hidden group-hover/lock:inline">Log in</span>
                </Link>
              </Button>
            ) : (
              <Button key={p.id} size="sm" onClick={() => download(p.id)}>
                {p.academicYear}
              </Button>
            ),
          )
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
                  {/* Only RE-ETE gets a subtitle: "Unit Test" and "End Term"
                      explain themselves, the abbreviation does not. */}
                  {label === "RE-ETE" && <CardDescription>{RE_ETE_DESCRIPTION}</CardDescription>}
                </CardHeader>
                <CardContent>
                  {subjects.map((subject) => {
                    const allPapers = papersBySubject.get(subject.id) ?? [];
                    const papersForExam = examTypeId
                      ? allPapers.filter((p) => p.examTypeId === examTypeId)
                      : [];
                    return (
                      <PaperRow
                        key={subject.id}
                        subject={subject}
                        papers={papersForExam}
                        yearNumber={year}
                      />
                    );
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
