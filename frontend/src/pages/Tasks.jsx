import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext.jsx'
import Loading from '../components/Loading.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Badge, { difficultyTone } from '../components/Badge.jsx'
import PageHeader from '../components/PageHeader.jsx'
import TaskFormModal from '../components/TaskFormModal.jsx'

export default function Tasks() {
  const { isTeacher } = useAuth()
  const [tasks, setTasks] = useState([])
  const [status, setStatus] = useState('loading')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setStatus('loading')
    try {
      const res = await client.get('/tasks')
      setTasks(res.data.tasks)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return
    try {
      await client.delete(`/tasks/${task.id}`)
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
    } catch {
      alert('Could not delete this task. Please try again.')
    }
  }

  if (status === 'loading') return <Loading label="Loading tasks..." />
  if (status === 'error') return <ErrorState onRetry={load} message="Could not load tasks." />

  return (
    <div className="page">
      <PageHeader
        title={isTeacher ? 'Your Tasks' : 'Assigned Tasks'}
        subtitle={isTeacher ? 'Create, edit and assign coding tasks.' : 'Tasks your teacher has assigned to you.'}
        actions={
          isTeacher && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + New Task
            </button>
          )
        }
      />

      {tasks.length === 0 ? (
        <EmptyState
          icon="📋"
          title={isTeacher ? 'No tasks yet' : 'No tasks assigned'}
          message={
            isTeacher
              ? 'Create your first task and assign it to students.'
              : "Your teacher hasn't assigned any tasks to you yet."
          }
          action={
            isTeacher && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                Create a task
              </button>
            )
          }
        />
      ) : (
        <div className="card-grid">
          {tasks.map((task) => (
            <div className="task-card" key={task.id}>
              <div className="task-card-top">
                <Badge tone={difficultyTone(task.difficulty)}>{task.difficulty}</Badge>
                {task.deadline && (
                  <span className="deadline-chip">
                    Due {new Date(task.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h3>{task.title}</h3>
              <p className="task-card-instructions">{task.instructions}</p>
              {isTeacher && (
                <p className="task-card-meta">
                  {task.assigned_students_count ?? 0} student(s) assigned · {task.submissions_count ?? 0} submission(s)
                </p>
              )}
              <div className="task-card-actions">
                <Link to={`/tasks/${task.id}`} className="btn btn-secondary btn-sm">
                  View details
                </Link>
                {isTeacher && (
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(task)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TaskFormModal
          onClose={() => setShowForm(false)}
          onCreated={(task) => {
            setTasks((prev) => [task, ...prev])
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}
