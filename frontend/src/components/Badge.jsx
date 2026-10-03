export default function Badge({ children, tone = 'default' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function difficultyTone(difficulty) {
  if (difficulty === 'beginner') return 'green'
  if (difficulty === 'intermediate') return 'orange'
  if (difficulty === 'advanced') return 'red'
  return 'default'
}

export function statusTone(status) {
  if (status === 'graded') return 'green'
  if (status === 'submitted') return 'blue'
  return 'default'
}
