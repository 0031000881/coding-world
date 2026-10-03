import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext.jsx'
import Loading from '../components/Loading.jsx'
import ErrorState from '../components/ErrorState.jsx'
import Badge, { difficultyTone, statusTone } from '../components/Badge.jsx'
import PageHeader from '../components/PageHeader.jsx'
import TaskFormModal from '../components/TaskFormModal.jsx'
import AssignStudentsModal from '../components/AssignStudentsModal.jsx'

export default function TaskDetails() {
  const { taskId } = useParams()
  const { isTeacher } = useAuth()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [status, setStatus] = useState('loading')
  const [showEdit, setShowEdit] = useState(false)
  const [showAssign, setShowAssign] = useState(false)

  useEffect(() => {
    load()
  }, [taskId])

  async function load() {
    setStatus('loading')
    try {
      const res = await client.get(`/tasks/${taskId}`)
      setTask(res.data.task)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this task? This cannot be undone.')) return
    try {
      await client.delete(`/tasks/${taskId}`)
      navigate('/tasks')
    } catch {
      alert('Could not delete this task.')
    }
  }

  if (status === 'loading') return <Loading label="Loading task..." />
  if (status === 'error' || !task) return <ErrorState onRetry={load} message="Could not load this task." />

  const isPastDeadline = task.deadline && new Date(task.deadline) < new Date()

  return (
    <div className="page">
      <PageHeader
        title={task.title}
        subtitle={isTeacher ? `Created by you` : `Assigned by ${task.teacher?.name}`}
        actions={
          isTeacher ? (
            <div className="header-actions">
              <button className="btn btn-secondary" onClick={() => setShowAssign(true)}>
                Assign Students
              </button>
              <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>
                Edit
              </button>
              <button className="btn btn-ghost" onClick={handleDelete}>
                Delete
              </button>
            </div>
          ) : (
            <Link to={`/tasks/${task.id}/workspace`} className="btn btn-primary">
              Open Workspace →
            </Link>
          )
        }
      />

      <div className="task-detail-meta">
        <Badge tone={difficultyTone(task.difficulty)}>{task.difficulty}</Badge>
        {task.deadline && (
          <span className={`deadline-chip ${isPastDeadline ? 'deadline-passed' : ''}`}>
            {isPastDeadline ? 'Deadline passed: ' : 'Due: '}
            {new Date(task.deadline).toLocaleString()}
          </span>
        )}
      </div>

      <div className="two-col">
        <section className="panel">
          <h2>Instructions</h2>
          <p className="preformatted">{task.instructions}</p>
        </section>

        {task.requirements && (
          <section className="panel">
            <h2>Requirements</h2>
            <p className="preformatted">{task.requirements}</p>
          </section>
        )}
      </div>

      {isTeacher ? (
        <section className="panel">
          <h2>Assigned Students ({task.assigned_students?.length || 0})</h2>
          {(!task.assigned_students || task.assigned_students.length === 0) ? (
            <p>No students assigned yet. Click "Assign Students" to get started.</p>
          ) : (
            <ul className="list">
              {task.assigned_students.map((s) => (
                <li key={s.id} className="list-row">
                  <span>{s.name}</span>
                  <small>{s.email}</small>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="panel">
          <h2>Your Progress</h2>
          {task.my_submission ? (
            <div className="progress-block">
              <Badge tone={statusTone(task.my_submission.status)}>{task.my_submission.status}</Badge>
              {task.my_submission.status === 'graded' && (
                <span className="grade-chip">Grade: {task.my_submission.grade}%</span>
              )}
              <Link to={`/submissions/${task.my_submission.id}`} className="btn btn-secondary btn-sm">
                View submission
              </Link>
            </div>
          ) : (
            <p>You haven't submitted this task yet.</p>
          )}
          <Link to={`/tasks/${task.id}/workspace`} className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
            {task.my_project ? 'Continue in Workspace' : 'Start Coding'} →
          </Link>
        </section>
      )}

      {showEdit && (
        <TaskFormModal
          initialTask={task}
          onClose={() => setShowEdit(false)}
          onCreated={(updated) => {
            setTask((prev) => ({ ...prev, ...updated }))
            setShowEdit(false)
          }}
        />
      )}

      {showAssign && (
        <AssignStudentsModal
          task={task}
          onClose={() => setShowAssign(false)}
          onAssigned={(updated) => {
            setTask((prev) => ({ ...prev, assigned_students: updated.assigned_students }))
            setShowAssign(false)
          }}
        />
      )}
    </div>
  )
}
