import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'student',
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
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setErrors({ general: [err.response?.data?.message || 'Registration failed. Please try again.'] })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">{'</>'}</span>
          <h1>Coding World</h1>
        </div>
        <p className="auth-subtitle">Create your account and start building.</p>

        {errors.general && <div className="alert alert-error">{errors.general[0]}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Full name
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Jane Doe" />
            {errors.name && <small className="field-error">{errors.name[0]}</small>}
          </label>

          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="you@example.com"
            />
            {errors.email && <small className="field-error">{errors.email[0]}</small>}
          </label>

          <label>
            I am a...
            <div className="role-toggle">
              <button
                type="button"
                className={form.role === 'student' ? 'active' : ''}
                onClick={() => update('role', 'student')}
              >
                🎓 Student
              </button>
              <button
                type="button"
                className={form.role === 'teacher' ? 'active' : ''}
                onClick={() => update('role', 'teacher')}
              >
                🧑‍🏫 Teacher
              </button>
            </div>
          </label>

          <label>
            Password
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="At least 8 characters"
            />
            {errors.password && <small className="field-error">{errors.password[0]}</small>}
          </label>

          <label>
            Confirm password
            <input
              type="password"
              required
              value={form.password_confirmation}
              onChange={(e) => update('password_confirmation', e.target.value)}
              placeholder="Re-enter your password"
            />
          </label>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
