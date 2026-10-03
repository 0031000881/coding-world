import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext.jsx'
import Loading from '../components/Loading.jsx'
import ErrorState from '../components/ErrorState.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Badge, { statusTone } from '../components/Badge.jsx'
import PreviewFrame from '../components/PreviewFrame.jsx'

const TABS = ['html', 'css', 'js']

export default function SubmissionDetails() {
  const { submissionId } = useParams()
  const { isTeacher } = useAuth()
  const [submission, setSubmission] = useState(null)
  const [status, setStatus] = useState('loading')
  const [activeTab, setActiveTab] = useState('html')
  const [grade, setGrade] = useState('')
  const [feedback, setFeedback] = useState('')
  const [grading, setGrading] = useState(false)
  const [gradeError, setGradeError] = useState('')

  useEffect(() => {
    load()
  }, [submissionId])

  async function load() {
    setStatus('loading')
    try {
      const res = await client.get(`/submissions/${submissionId}`)
      setSubmission(res.data.submission)
      setGrade(res.data.submission.grade ?? '')
      setFeedback(res.data.submission.feedback ?? '')
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  async function handleGrade(e) {
    e.preventDefault()
    setGradeError('')
    setGrading(true)
    try {
      const res = await client.post(`/submissions/${submissionId}/grade`, {
        grade: Number(grade),
        feedback,
      })
      setSubmission((prev) => ({ ...prev, ...res.data.submission }))
    } catch (err) {
      setGradeError(err.response?.data?.message || 'Could not save the grade. Please check the value and try again.')
    } finally {
      setGrading(false)
    }
  }

  if (status === 'loading') return <Loading label="Loading submission..." />
  if (status === 'error' || !submission) return <ErrorState onRetry={load} message="Could not load this submission." />

  const codeByTab = {
    html: submission.html_code,
    css: submission.css_code,
    js: submission.js_code,
  }

  return (
    <div className="page">
      <PageHeader
        title={submission.task?.title}
        subtitle={isTeacher ? `Submitted by ${submission.student?.name}` : `Submitted ${new Date(submission.submitted_at).toLocaleString()}`}
        actions={<Badge tone={statusTone(submission.status)}>{submission.status}</Badge>}
      />

      <div className="two-col">
        <section className="panel">
          <div className="editor-tabs">
            {TABS.map((tab) => (
              <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
          <pre className="code-readonly">{codeByTab[activeTab] || '(empty)'}</pre>
        </section>

        <section className="panel">
          <h2>Preview</h2>
          <div className="submission-preview">
            <PreviewFrame html={submission.html_code} css={submission.css_code} js={submission.js_code} />
          </div>
        </section>
      </div>

      {isTeacher ? (
        <section className="panel">
          <h2>Grade & Feedback</h2>
          {gradeError && <div className="alert alert-error">{gradeError}</div>}
          <form className="form" onSubmit={handleGrade}>
            <div className="form-row">
              <label>
                Grade (0–100)
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </label>
            </div>
            <label>
              Written feedback
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share what the student did well and what to improve..."
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={grading}>
              {grading ? 'Saving...' : submission.status === 'graded' ? 'Update Grade' : 'Submit Grade'}
            </button>
          </form>
        </section>
      ) : (
        <section className="panel">
          <h2>Teacher Feedback</h2>
          {submission.status === 'graded' ? (
            <>
              <p className="grade-chip large">Grade: {submission.grade}%</p>
              <p className="preformatted">{submission.feedback || 'No written feedback provided.'}</p>
            </>
          ) : (
            <p>Your teacher hasn't graded this submission yet.</p>
          )}
        </section>
      )}
    </div>
  )
}
