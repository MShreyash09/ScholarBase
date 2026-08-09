import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { subjectsApi, yearLevelsApi } from "@/lib/api/academic";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function YearPage() {
  const { yearNumber } = useParams<{ yearNumber: string }>();

  const { data: yearLevels } = useQuery({
    queryKey: ["year-levels"],
    queryFn: yearLevelsApi.list,
  });

  const yearLevel = yearLevels?.find((y) => y.yearNumber === Number(yearNumber));

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["subjects", yearLevel?.id],
    queryFn: () => subjectsApi.listByYear(yearLevel!.id),
    enabled: Boolean(yearLevel),
  });

  return (
    <div>
      <h1 className="mb-2 text-3xl">{yearLevel?.label ?? `Year ${yearNumber}`}</h1>
      <p className="mb-8 text-foreground-muted">Choose a subject to view its question papers and notes.</p>

      {isLoading && <p className="text-foreground-muted">Loading...</p>}

      {!isLoading && yearLevel && (!subjects || subjects.length === 0) && (
        <p className="text-foreground-muted">No subjects added for this year yet.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects?.map((subject) => (
          <Link key={subject.id} to={`/years/${yearNumber}/${subject.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>{subject.name}</CardTitle>
                <CardDescription>{subject.code}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
