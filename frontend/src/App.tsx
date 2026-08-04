import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/routes/AppLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { HomePage } from "@/routes/pages/HomePage";
import { DepartmentPage } from "@/routes/pages/DepartmentPage";
import { DepartmentYearPage } from "@/routes/pages/DepartmentYearPage";
import { SemesterPage } from "@/routes/pages/SemesterPage";
import { YearPage } from "@/routes/pages/YearPage";
import { SubjectPage } from "@/routes/pages/SubjectPage";
import { LoginPage } from "@/routes/pages/LoginPage";
import { SignupPage } from "@/routes/pages/SignupPage";
import { AdminPage } from "@/routes/pages/AdminPage";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="departments/:dept" element={<DepartmentPage />} />
              <Route path="departments/:dept/years/:yearNumber" element={<DepartmentYearPage />} />
              <Route
                path="departments/:dept/years/:yearNumber/semesters/:semester"
                element={<SemesterPage />}
              />
              <Route path="years/:yearNumber" element={<YearPage />} />
              <Route path="years/:yearNumber/:subjectId" element={<SubjectPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route element={<ProtectedRoute adminOnly />}>
                <Route path="admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
