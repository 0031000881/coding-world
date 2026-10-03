import { useEffect, useState } from 'react'
import client from '../api/client'
import Loading from '../components/Loading.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PageHeader from '../components/PageHeader.jsx'

export default function Students() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    load()
  }, [])

  async function load(query = '') {
    setStatus('loading')
    try {
      const res = await client.get('/students', { params: query ? { search: query } : {} })
      setStudents(res.data.students)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    load(search)
  }

  if (status === 'loading') return <Loading label="Loading students..." />
  if (status === 'error') return <ErrorState onRetry={() => load(search)} message="Could not load students." />

  return (
    <div className="page">
      <PageHeader title="Students" subtitle="Everyone registered as a student on Coding World." />

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">Search</button>
      </form>

      {students.length === 0 ? (
        <EmptyState icon="🎓" title="No students found" message="Try a different search, or wait for students to register." />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Tasks assigned</th>
              <th>Submissions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.assigned_tasks_count}</td>
                <td>{s.submissions_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
