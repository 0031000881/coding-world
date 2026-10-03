import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Loading from './components/Loading.jsx'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Tasks from './pages/Tasks.jsx'
import TaskDetails from './pages/TaskDetails.jsx'
import Workspace from './pages/Workspace.jsx'
import Projects from './pages/Projects.jsx'
import Students from './pages/Students.jsx'
import Submissions from './pages/Submissions.jsx'
import SubmissionDetails from './pages/SubmissionDetails.jsx'

function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <Loading label="Loading Coding World..." />
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}

export default function App() {
  const { user } = useAuth()

  return (
    <div className="app-shell">
      {user && <Navbar />}
      <main className={user ? 'app-main' : 'app-main app-main-auth'}>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:taskId"
            element={
              <ProtectedRoute>
                <TaskDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:taskId/workspace"
            element={
              <ProtectedRoute role="student">
                <Workspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute role="student">
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute role="teacher">
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submissions"
            element={
              <ProtectedRoute>
                <Submissions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submissions/:submissionId"
            element={
              <ProtectedRoute>
                <SubmissionDetails />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
