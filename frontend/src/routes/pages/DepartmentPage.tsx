import { Link, Navigate, useParams } from "react-router-dom";
import { DEPARTMENTS } from "@scholarbase/shared-types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const YEAR_NUMBERS = [1, 2, 3, 4];

export function DepartmentPage() {
  const { dept } = useParams<{ dept: string }>();
  const department = DEPARTMENTS.find((d) => d.code === dept);

  if (!department) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl">{department.label}</h1>
      <p className="mb-8 text-foreground-muted">Choose your year.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {YEAR_NUMBERS.map((year) => (
          <Link key={year} to={`/departments/${department.code}/years/${year}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>Year {year}</CardTitle>
                <CardDescription>
                  Sem {year * 2 - 1} &amp; Sem {year * 2}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
