import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext.jsx'
import Loading from '../components/Loading.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Badge, { difficultyTone } from '../components/Badge.jsx'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'

export default function Dashboard() {
  const { user, isTeacher } = useAuth()
  const [tasks, setTasks] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setStatus('loading')
    try {
      const [tasksRes, submissionsRes] = await Promise.all([
        client.get('/tasks'),
        client.get('/submissions'),
      ])
      setTasks(tasksRes.data.tasks)
      setSubmissions(submissionsRes.data.submissions)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'loading') return <Loading label="Loading your dashboard..." />
  if (status === 'error') return <ErrorState onRetry={loadData} message="Could not load your dashboard data." />

  if (isTeacher) {
    const totalAssignments = tasks.reduce((sum, t) => sum + (t.assigned_students_count || 0), 0)
    const pendingReview = submissions.filter((s) => s.status === 'submitted').length

    return (
      <div className="page">
        <PageHeader title={`Welcome back, ${user.name.split(' ')[0]}`} subtitle="Here's what's happening in your classroom." />

        <div className="stats-grid">
          <StatCard label="Tasks created" value={tasks.length} icon="📋" />
          <StatCard label="Assignments given" value={totalAssignments} icon="📌" />
          <StatCard label="Awaiting review" value={pendingReview} icon="🕒" />
        </div>

        <div className="two-col">
          <section className="panel">
            <div className="panel-header">
              <h2>Recent tasks</h2>
              <Link to="/tasks" className="btn btn-secondary btn-sm">Manage tasks</Link>
            </div>
            {tasks.length === 0 ? (
              <EmptyState icon="📋" title="No tasks yet" message="Create your first coding task to get started." />
            ) : (
              <ul className="list">
                {tasks.slice(0, 5).map((t) => (
                  <li key={t.id}>
                    <Link to={`/tasks/${t.id}`} className="list-row">
                      <span>{t.title}</span>
                      <Badge tone={difficultyTone(t.difficulty)}>{t.difficulty}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Submissions to review</h2>
              <Link to="/submissions" className="btn btn-secondary btn-sm">View all</Link>
            </div>
            {pendingReview === 0 ? (
              <EmptyState icon="✅" title="All caught up" message="No submissions are waiting for review." />
            ) : (
              <ul className="list">
                {submissions.filter((s) => s.status === 'submitted').slice(0, 5).map((s) => (
                  <li key={s.id}>
                    <Link to={`/submissions/${s.id}`} className="list-row">
                      <span>{s.task?.title} — {s.student?.name}</span>
                      <Badge tone="blue">submitted</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    )
  }

  // Student dashboard
  const graded = submissions.filter((s) => s.status === 'graded')
  const avgGrade = graded.length
    ? Math.round(graded.reduce((sum, s) => sum + (s.grade || 0), 0) / graded.length)
    : null

  return (
    <div className="page">
      <PageHeader title={`Welcome back, ${user.name.split(' ')[0]}`} subtitle="Ready to write some code today?" />

      <div className="stats-grid">
        <StatCard label="Assigned tasks" value={tasks.length} icon="📋" />
        <StatCard label="Submitted" value={submissions.length} icon="📨" />
        <StatCard label="Average grade" value={avgGrade !== null ? `${avgGrade}%` : '—'} icon="⭐" />
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Your tasks</h2>
          <Link to="/tasks" className="btn btn-secondary btn-sm">View all tasks</Link>
        </div>
        {tasks.length === 0 ? (
          <EmptyState icon="🎯" title="No tasks assigned yet" message="Your teacher hasn't assigned any tasks yet. Check back soon!" />
        ) : (
          <ul className="list">
            {tasks.slice(0, 5).map((t) => (
              <li key={t.id}>
                <Link to={`/tasks/${t.id}`} className="list-row">
                  <span>{t.title}</span>
                  <Badge tone={difficultyTone(t.difficulty)}>{t.difficulty}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

