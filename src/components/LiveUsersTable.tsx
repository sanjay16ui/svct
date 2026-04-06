import { useEffect, useRef, useState } from 'react'
import api from '../api'
import type { User } from '../types'

export default function LiveUsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [newIds, setNewIds] = useState<number[]>([])
  const previousIds = useRef<number[]>([])

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/api/admin/users')
      const list = data.users || []
      const incomingIds = list.map((u: User) => u.id)
      const justAdded = incomingIds.filter((id: number) => !previousIds.current.includes(id))
      if (justAdded.length) {
        setNewIds(justAdded)
        setTimeout(() => setNewIds([]), 2000)
      }
      previousIds.current = incomingIds
      setUsers(list)
    }
    load()
    const timer = setInterval(load, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="liquid-glass rounded-2xl border border-white/10 p-3 overflow-auto">
      <p className="font-mono text-xs text-white/75 mb-2">SELECT * FROM users;</p>
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-white/15 text-white/90">
            <th>ID</th><th>Username</th><th>Email</th><th>Password (encrypted)</th><th>Role</th><th>Created At</th><th>Last Login</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.id} className={`${i % 2 === 0 ? 'bg-white/[0.03]' : ''} ${newIds.includes(u.id) ? 'bg-emerald-500/30' : ''} transition-colors`}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td className="font-mono text-xs">{u.password}</td>
              <td>{u.role}</td>
              <td>{u.created_at}</td>
              <td>{u.last_login || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
