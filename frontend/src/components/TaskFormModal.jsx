import { useState } from 'react'
import client from '../api/client'

export default function TaskFormModal({ onClose, onCreated, initialTask = null }) {
  const isEdit = !!initialTask
  const [form, setForm] = useState({
    title: initialTask?.title || '',
    instructions: initialTask?.instructions || '',
    requirements: initialTask?.requirements || '',
    difficulty: initialTask?.difficulty || 'beginner',
    deadline: initialTask?.deadline ? initialTask.deadline.substring(0, 10) : '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setSubmitting(true)
    try {
      let res
      if (isEdit) {
        res = await client.put(`/tasks/${initialTask.id}`, form)
      } else {
        res = await client.post('/tasks', form)
      }
      onCreated(res.data.task)
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setErrors({ general: ['Something went wrong. Please try again.'] })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Task' : 'Create a New Task'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {errors.general && <div className="alert alert-error">{errors.general[0]}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Title
            <input
              required
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Build a Profile Card"
            />
            {errors.title && <small className="field-error">{errors.title[0]}</small>}
          </label>

          <label>
            Instructions
            <textarea
              required
              rows={4}
              value={form.instructions}
              onChange={(e) => update('instructions', e.target.value)}
              placeholder="Explain what the student needs to build..."
            />
            {errors.instructions && <small className="field-error">{errors.instructions[0]}</small>}
          </label>

          <label>
            Requirements (optional)
            <textarea
              rows={3}
              value={form.requirements}
              onChange={(e) => update('requirements', e.target.value)}
              placeholder="List specific requirements, one per line..."
            />
          </label>

          <div className="form-row">
            <label>
              Difficulty
              <select value={form.difficulty} onChange={(e) => update('difficulty', e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>

            <label>
              Deadline (optional)
              <input type="date" value={form.deadline} onChange={(e) => update('deadline', e.target.value)} />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
