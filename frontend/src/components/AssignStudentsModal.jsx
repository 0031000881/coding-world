import { useEffect, useState } from 'react'
import client from '../api/client'

export default function AssignStudentsModal({ task, onClose, onAssigned }) {
  const [students, setStudents] = useState([])
  const [selected, setSelected] = useState(new Set(task.assigned_students?.map((s) => s.id) || []))
  const [status, setStatus] = useState('loading')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    client
      .get('/students')
      .then((res) => {
        setStudents(res.data.students)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (selected.size === 0) return
    setSubmitting(true)
    try {
      const res = await client.post(`/tasks/${task.id}/assign`, { student_ids: Array.from(selected) })
      onAssigned(res.data.task)
    } catch {
      alert('Could not assign students. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign "{task.title}"</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {status === 'loading' && <p>Loading students...</p>}
        {status === 'error' && <p className="alert alert-error">Could not load students.</p>}

        {status === 'ready' && (
          <form onSubmit={handleSubmit}>
            {students.length === 0 ? (
              <p>No students have registered yet.</p>
            ) : (
              <ul className="checklist">
                {students.map((s) => (
                  <li key={s.id}>
                    <label className="checklist-item">
                      <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
                      <span>
                        {s.name} <small>{s.email}</small>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting || selected.size === 0}>
                {submitting ? 'Assigning...' : 'Assign Task'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
