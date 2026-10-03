import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext.jsx'
import Loading from '../components/Loading.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Badge, { statusTone } from '../components/Badge.jsx'

export default function Submissions() {
  const { isTeacher } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setStatus('loading')
    try {
      const res = await client.get('/submissions')
      setSubmissions(res.data.submissions)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'loading') return <Loading label="Loading submissions..." />
  if (status === 'error') return <ErrorState onRetry={load} message="Could not load submissions." />

  return (
    <div className="page">
      <PageHeader
        title="Submissions"
        subtitle={isTeacher ? 'Review your students’ submitted work.' : 'Your submission history and grades.'}
      />

      {submissions.length === 0 ? (
        <EmptyState
          icon="📨"
          title="No submissions yet"
          message={isTeacher ? 'Submissions will appear here once students submit tasks.' : 'Submit a task from the workspace to see it here.'}
        />
      ) : (
        <ul className="list">
          {submissions.map((s) => (
            <li key={s.id}>
              <Link to={`/submissions/${s.id}`} className="list-row submission-row">
                <div>
                  <strong>{s.task?.title}</strong>
                  {isTeacher && <small> — {s.student?.name}</small>}
                  <div className="submission-date">
                    Submitted {new Date(s.submitted_at).toLocaleString()}
                  </div>
                </div>
                <div className="submission-row-right">
                  {s.status === 'graded' && <span className="grade-chip">{s.grade}%</span>}
                  <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
