import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import Loading from '../components/Loading.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Badge, { difficultyTone } from '../components/Badge.jsx'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setStatus('loading')
    try {
      const res = await client.get('/projects')
      setProjects(res.data.projects)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'loading') return <Loading label="Loading your projects..." />
  if (status === 'error') return <ErrorState onRetry={load} message="Could not load your projects." />

  return (
    <div className="page">
      <PageHeader title="My Projects" subtitle="Everything you've built inside the coding workspace." />

      {projects.length === 0 ? (
        <EmptyState icon="🗂️" title="No projects yet" message="Open a task and start coding to create your first project." />
      ) : (
        <div className="card-grid">
          {projects.map((p) => (
            <div className="task-card" key={p.id}>
              <Badge tone={difficultyTone(p.task?.difficulty)}>{p.task?.difficulty}</Badge>
              <h3>{p.task?.title}</h3>
              <p className="task-card-meta">
                Last saved: {p.last_saved_at ? new Date(p.last_saved_at).toLocaleString() : 'Never'}
              </p>
              <div className="task-card-actions">
                <Link to={`/tasks/${p.task_id}/workspace`} className="btn btn-secondary btn-sm">
                  Open in Workspace
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
