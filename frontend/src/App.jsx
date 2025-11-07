import { useState } from 'react'
import './App.css'

export default function App() {
  const [count, setCount] = useState(0)

  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !domain.trim()) return
    setLoading(true)
    setMsg('')
    const res = await fetch('api/brands', { // This is the endpoint in the backend
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), domain: domain.trim() }),
    })
    setLoading(false)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setMsg(err.error || 'create failed')
      return
    }
    setName('')
    setDomain('')
    setMsg('saved')
  }

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount(c => c + 1)}>count is {count}</button>
      </div>

      <div style={{ padding: 24 }}>
        <h2>brand add tester</h2>
        <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="Domain " value={domain} onChange={e => setDomain(e.target.value)} />
          <button type="submit" disabled={loading}>{loading ? 'saving…' : 'add'}</button>
        </form>
        {msg && <p>{msg}</p>}
      </div>
    </>
  )
}
