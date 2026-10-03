import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, isTeacher, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/dashboard" className="brand">
          <span className="brand-mark">{'</>'}</span> Coding World
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
            Dashboard
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => (isActive ? 'active' : '')}>
            Tasks
          </NavLink>
          {!isTeacher && (
            <NavLink to="/projects" className={({ isActive }) => (isActive ? 'active' : '')}>
              Projects
            </NavLink>
          )}
          {isTeacher && (
            <NavLink to="/students" className={({ isActive }) => (isActive ? 'active' : '')}>
              Students
            </NavLink>
          )}
          <NavLink to="/submissions" className={({ isActive }) => (isActive ? 'active' : '')}>
            Submissions
          </NavLink>
        </nav>

        <div className="navbar-user">
          <span className="user-chip">
            <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
            <span className="user-meta">
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </span>
          </span>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
