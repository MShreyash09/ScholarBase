import { Link } from "react-router-dom";
import { DEPARTMENTS } from "@scholarbase/shared-types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function HomePage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl">Previous Year Question Papers</h1>
      <p className="mb-8 text-neutral-500">Pick your department to get started.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {DEPARTMENTS.map((dept) => (
          <Link key={dept.code} to={`/departments/${dept.code}`}>
            <Card className="h-full text-center transition-shadow hover:shadow-md">
              <CardHeader className="items-center">
                <CardTitle>{dept.label}</CardTitle>
                <CardDescription>Department</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
