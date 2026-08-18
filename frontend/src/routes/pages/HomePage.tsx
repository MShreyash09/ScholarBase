import { Link } from "react-router-dom";
import { DEPARTMENTS } from "@scholarbase/shared-types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Monitor, Code, Brain, Radio, Settings, Zap, LucideIcon, BookOpen } from "lucide-react";

const getDepartmentIcon = (code: string): LucideIcon => {
  switch (code) {
    case "IT": return Monitor;
    case "CS": return Code;
    case "AIDS": return Brain;
    case "ENTC": return Radio;
    case "MECH": return Settings;
    case "ELEC": return Zap;
    default: return BookOpen;
  }
};

export function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="mb-16 mt-8 flex flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-brand">
          Welcome to your new academic hub
        </div>
        <h1 className="mb-4 bg-gradient-to-r from-primary-700 to-primary-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl dark:from-primary-400 dark:to-primary-200">
          Ace Your Exams <br /> with ScholarBase
        </h1>
        <p className="max-w-2xl text-lg text-foreground-muted sm:text-xl">
          Access previous year question papers, collaborate in live study rooms, and get instant answers to your doubts.
        </p>
      </section>

      {/* Departments Grid */}
      <div className="w-full">
        <h2 className="mb-6 text-2xl font-bold">Explore Departments</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {DEPARTMENTS.map((dept) => {
            const Icon = getDepartmentIcon(dept.code);
            return (
              <Link key={dept.code} to={`/departments/${dept.code}`}>
                <Card interactive className="group h-full text-center">
                  <CardHeader className="items-center">
                    <div className="mb-3 rounded-full bg-primary/10 p-3 text-brand transition-transform group-hover:scale-110 group-hover:bg-primary/20">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <CardTitle className="transition-colors group-hover:text-brand">
                      {dept.label}
                    </CardTitle>
                    <CardDescription>Department</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
