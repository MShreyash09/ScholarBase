import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
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
import { GoogleCallbackPage } from "@/routes/pages/GoogleCallbackPage";
import { ForgotPasswordPage } from "@/routes/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/routes/pages/ResetPasswordPage";
import { VerifyEmailPage } from "@/routes/pages/VerifyEmailPage";
import { AdminPage } from "@/routes/pages/AdminPage";
import { InstructionsPage } from "@/routes/pages/InstructionsPage";
import { ContributePage } from "@/routes/pages/ContributePage";
import { NotFoundPage } from "@/routes/pages/NotFoundPage";
import { StudyRoomsPage } from "@/routes/pages/StudyRoomsPage";
import { StudyRoomPage } from "@/routes/pages/StudyRoomPage";
import { JoinStudyRoomPage } from "@/routes/pages/JoinStudyRoomPage";

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
              <Route path="instructions" element={<InstructionsPage />} />
              <Route path="contribute" element={<ContributePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route path="auth/google/callback" element={<GoogleCallbackPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route path="verify-email" element={<VerifyEmailPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="study-rooms" element={<StudyRoomsPage />} />
                {/* Must precede :roomId so "join" isn't swallowed as a room id. */}
                <Route path="study-rooms/join/:inviteCode" element={<JoinStudyRoomPage />} />
                <Route path="study-rooms/:roomId" element={<StudyRoomPage />} />
              </Route>
              <Route element={<ProtectedRoute adminOnly />}>
                <Route path="admin" element={<AdminPage />} />
              </Route>
              {/* Last, and inside the layout so a lost visitor still gets the
                  header and a way back. Without it nothing rendered at all. */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Analytics />
    </QueryClientProvider>
  );
}
