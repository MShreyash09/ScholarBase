import { Link, Navigate, useParams } from "react-router-dom";
import { DEPARTMENTS } from "@scholarbase/shared-types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function DepartmentYearPage() {
  const { dept, yearNumber } = useParams<{ dept: string; yearNumber: string }>();
  const department = DEPARTMENTS.find((d) => d.code === dept);
  const year = Number(yearNumber);

  if (!department || !year || year < 1 || year > 4) {
    return <Navigate to="/" replace />;
  }

  const semesters = [year * 2 - 1, year * 2];

  return (
    <div>
      <h1 className="mb-2 text-3xl">
        {department.label} — Year {year}
      </h1>
      <p className="mb-8 text-neutral-500">Choose a semester.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {semesters.map((sem) => (
          <Link key={sem} to={`/departments/${department.code}/years/${year}/semesters/${sem}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>Semester {sem}</CardTitle>
                <CardDescription>Unit tests &amp; end term papers</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
