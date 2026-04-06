import { useState } from 'react'
import api from '../api'

const quickQueries = [
  { label: 'Show All Users', sql: 'SELECT * FROM users;' },
  { label: 'Show All Products', sql: 'SELECT * FROM products;' },
  { label: 'Show All Orders', sql: 'SELECT * FROM orders;' },
  { label: 'Count Users', sql: 'SELECT COUNT(*) FROM users;' },
  { label: 'Pending Orders', sql: "SELECT * FROM orders WHERE status='pending';" },
]

export default function SqlTerminal() {
  const [query, setQuery] = useState('SELECT * FROM users;')
  const [columns, setColumns] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [meta, setMeta] = useState('')
  const [error, setError] = useState('')
  const [history, setHistory] = useState<string[]>([])

  const runQuery = async (sql = query) => {
    setError('')
    setQuery(sql)
    try {
      const { data } = await api.post('/api/admin/query', { query: sql })
      if (!data.success) return setError(data.error || 'Query failed')
      setColumns(data.columns || [])
      setRows(data.rows || [])
      setMeta(`Query executed in ${data.executionTime} - ${data.rowCount} rows returned`)
      setHistory((prev) => [sql, ...prev.filter((q) => q !== sql)].slice(0, 10))
    } catch (e: any) {
      setMeta('')
      setRows([])
      setColumns([])
      setError(e.response?.data?.error || 'SQL error')
    }
  }

  return (
    <div className="liquid-glass rounded-2xl border border-white/10 p-4">
      <div className="flex flex-wrap gap-2 mb-3">
        {quickQueries.map((q) => (
          <button key={q.label} onClick={() => runQuery(q.sql)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full font-mono">
            {q.label}
          </button>
        ))}
      </div>
      <div className="bg-black border border-emerald-400/30 rounded-xl p-3 font-mono">
        <p className="text-emerald-300 text-sm mb-2">sqlite&gt; <span className="animate-pulse">_</span></p>
        <textarea value={query} onChange={(e) => setQuery(e.target.value)} className="w-full min-h-20 bg-black text-emerald-200 outline-none resize-y" />
        <button onClick={() => runQuery()} className="mt-3 bg-emerald-500 text-black px-4 py-2 rounded font-mono font-semibold">Run Query</button>
        {meta && <p className="mt-2 text-xs text-white/80">{meta}</p>}
        {error && <p className="mt-2 text-red-400">{error}</p>}
      </div>
      {!!history.length && (
        <div className="mt-4">
          <p className="text-xs text-white/60 mb-2">History (last 10)</p>
          <div className="flex flex-wrap gap-2">{history.map((h) => <button key={h} onClick={() => runQuery(h)} className="text-xs font-mono bg-white/10 px-2 py-1 rounded">{h}</button>)}</div>
        </div>
      )}
      {!!columns.length && (
        <div className="mt-4 overflow-auto">
          <table className="w-full text-sm border border-white/20">
            <thead>
              <tr>{columns.map((c) => <th key={c} className="border border-white/20 px-2 py-1 font-bold bg-white/10">{c}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white/[0.03]' : ''}>
                  {columns.map((c) => <td key={c} className="border border-white/10 px-2 py-1">{String(r[c] ?? '')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
