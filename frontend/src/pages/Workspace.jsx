import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import client from '../api/client'
import Loading from '../components/Loading.jsx'
import ErrorState from '../components/ErrorState.jsx'
import CodeEditorPanel from '../components/CodeEditorPanel.jsx'
import PreviewFrame from '../components/PreviewFrame.jsx'

const TABS = [
  { key: 'html', label: 'HTML' },
  { key: 'css', label: 'CSS' },
  { key: 'js', label: 'JavaScript' },
]

export default function Workspace() {
  const { taskId } = useParams()
  const [task, setTask] = useState(null)
  const [project, setProject] = useState(null)
  const [status, setStatus] = useState('loading')
  const [activeTab, setActiveTab] = useState('html')
  const [code, setCode] = useState({ html: '', css: '', js: '' })
  const [preview, setPreview] = useState({ html: '', css: '', js: '' })
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [runtimeError, setRuntimeError] = useState('')
  const [submitState, setSubmitState] = useState('idle')
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  useEffect(() => {
    load()
  }, [taskId])

  useEffect(() => {
    function handleMessage(e) {
      if (e.data?.type === 'cw-preview-error') {
        setRuntimeError(e.data.message)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  async function load() {
    setStatus('loading')
    try {
      const [taskRes, projectRes] = await Promise.all([
        client.get(`/tasks/${taskId}`),
        client.get(`/tasks/${taskId}/project`),
      ])
      setTask(taskRes.data.task)
      setProject(projectRes.data.project)
      const initial = {
        html: projectRes.data.project.html_code || '',
        css: projectRes.data.project.css_code || '',
        js: projectRes.data.project.js_code || '',
      }
      setCode(initial)
      setPreview(initial)
      setAlreadySubmitted(!!taskRes.data.task.my_submission)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  function updateCode(lang, value) {
    setCode((prev) => ({ ...prev, [lang]: value }))
  }

  function handleRun() {
    setRuntimeError('')
    setPreview(code)
  }

  function handleClear() {
    if (!window.confirm(`Clear the ${activeTab.toUpperCase()} editor? This cannot be undone.`)) return
    setCode((prev) => ({ ...prev, [activeTab]: '' }))
  }

  async function handleSave() {
    setSaveState('saving')
    try {
      const res = await client.put(`/projects/${project.id}`, {
        html_code: code.html,
        css_code: code.css,
        js_code: code.js,
      })
      setProject(res.data.project)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch {
      setSaveState('error')
    }
  }

  async function handleSubmitTask() {
    if (!window.confirm('Submit this task for grading? Make sure you have saved your latest changes.')) return
    setSubmitState('submitting')
    try {
      await client.post(`/projects/${project.id}/submit`)
      setSubmitState('submitted')
      setAlreadySubmitted(true)
    } catch {
      setSubmitState('error')
    }
  }

  if (status === 'loading') return <Loading label="Loading your workspace..." />
  if (status === 'error' || !task || !project) return <ErrorState onRetry={load} message="Could not load the workspace." />

  return (
    <div className="workspace-page">
      <div className="workspace-header">
        <div>
          <Link to={`/tasks/${task.id}`} className="back-link">← {task.title}</Link>
          {saveState === 'saved' && <span className="save-indicator save-ok">Saved ✓</span>}
          {saveState === 'saving' && <span className="save-indicator">Saving...</span>}
          {saveState === 'error' && <span className="save-indicator save-err">Could not save</span>}
        </div>
        <div className="workspace-actions">
          <button className="btn btn-ghost" onClick={handleClear}>
            Clear {activeTab.toUpperCase()}
          </button>
          <button className="btn btn-secondary" onClick={handleSave} disabled={saveState === 'saving'}>
            💾 Save
          </button>
          <button className="btn btn-primary" onClick={handleRun}>
            ▶ Run
          </button>
          {alreadySubmitted ? (
            <span className="badge badge-blue">Already submitted</span>
          ) : (
            <button className="btn btn-success" onClick={handleSubmitTask} disabled={submitState === 'submitting'}>
              {submitState === 'submitting' ? 'Submitting...' : 'Submit Task'}
            </button>
          )}
        </div>
      </div>

      <div className="workspace-body">
        <div className="editor-column">
          <div className="editor-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={activeTab === tab.key ? 'active' : ''}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <CodeEditorPanel language={activeTab} value={code[activeTab]} onChange={(v) => updateCode(activeTab, v)} />
        </div>

        <div className="preview-column">
          <div className="preview-header">
            <span>Live Preview</span>
            {runtimeError && <span className="preview-error">⚠ {runtimeError}</span>}
          </div>
          <PreviewFrame html={preview.html} css={preview.css} js={preview.js} />
        </div>
      </div>
    </div>
  )
}
