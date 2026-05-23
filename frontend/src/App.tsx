import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import { Layout } from '@/components/Layout'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { MocksPage } from '@/pages/MocksPage'
import { MockTestPage } from '@/pages/MockTestPage'
import { ResultPage } from '@/pages/ResultPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { CommunityPage } from '@/pages/CommunityPage'
import { RevisionPage } from '@/pages/RevisionPage'
import { TcsNqtPage } from '@/pages/TcsNqtPage'
import { SyllabusPage } from '@/pages/SyllabusPage'
import { StudyHubShell } from '@/components/study/StudyHubShell'
import { StudyHubHomePage } from '@/pages/study/StudyHubHomePage'
import { StudySectionPage } from '@/pages/study/StudySectionPage'
import { StudyQuestionPage } from '@/pages/study/StudyQuestionPage'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminMockPage } from '@/pages/admin/AdminMockPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const redirect = encodeURIComponent(window.location.pathname + window.location.search)
  return isAuthenticated ? <>{children}</> : <Navigate to={`/login?redirect=${redirect}`} replace />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/admin" />
  if (user?.role !== 'ADMIN') return <Navigate to="/" />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/mocks" element={<MocksPage />} />
            <Route path="/tcs-nqt" element={<TcsNqtPage />} />
            <Route path="/syllabus" element={<SyllabusPage />} />
            <Route path="/study" element={<StudyHubShell />}>
              <Route index element={<StudyHubHomePage />} />
              <Route path=":sectionId" element={<StudySectionPage />} />
              <Route path=":sectionId/:subtopicSlug" element={<StudyQuestionPage />} />
            </Route>
            <Route path="/result/:attemptId" element={<PrivateRoute><ResultPage /></PrivateRoute>} />
            <Route path="/revision" element={<PrivateRoute><RevisionPage /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
            <Route path="/community" element={<PrivateRoute><CommunityPage /></PrivateRoute>} />
            <Route
              path="/mock/:mockId"
              element={
                <PrivateRoute>
                  <MockTestPage />
                </PrivateRoute>
              }
            />
          </Route>
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/mocks/:id" element={<AdminRoute><AdminMockPage /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
